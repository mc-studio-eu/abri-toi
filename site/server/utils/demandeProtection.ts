import { Buffer } from 'node:buffer'
import type { IncomingMessage } from 'node:http'
import { limitesDemande } from '../../utils/demande'

export const MAX_BODY_BYTES = 32 * 1024
export class DemandeError extends Error {
  statusCode: number
  retryAfter?: number
  constructor(statusCode: number, message: string, retryAfter?: number) {
    super(message)
    this.statusCode = statusCode
    this.retryAfter = retryAfter
  }
}

// Compte les octets reçus, y compris sans Content-Length. On draine un corps refusé
// sans le conserver pour laisser le serveur répondre (pas de destruction du socket).
export function lireJsonDemande(req: IncomingMessage): Promise<unknown> {
  const contentType = req.headers['content-type']?.split(';')[0]?.trim().toLowerCase()
  if (contentType !== 'application/json') {
    req.resume()
    return Promise.reject(new DemandeError(415, 'Le formulaire doit être envoyé en JSON.'))
  }
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks: Buffer[] = []
    const cleanup = () => {
      req.off('data', data); req.off('end', end); req.off('aborted', aborted); req.off('error', failed)
    }
    const fail = (error: DemandeError) => {
      cleanup()
      // Un socket interrompu peut encore émettre ECONNRESET après « aborted ».
      req.once('error', () => {})
      req.resume()
      reject(error)
    }
    const data = (chunk: Buffer | string) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      size += buffer.length
      if (size > MAX_BODY_BYTES) return fail(new DemandeError(413, 'La demande dépasse 32 Kio.'))
      chunks.push(buffer)
    }
    const end = () => {
      cleanup()
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))) }
      catch { reject(new DemandeError(400, 'Le formulaire JSON est invalide.')) }
    }
    const aborted = () => fail(new DemandeError(400, 'Envoi du formulaire interrompu.'))
    const failed = () => fail(new DemandeError(400, 'Lecture du formulaire impossible.'))
    if (req.aborted || req.destroyed) return aborted()
    req.on('data', data); req.on('end', end); req.on('aborted', aborted); req.on('error', failed)
  })
}

export type DemandeValidee = Record<string, string> & { type: 'contact' | 'documentation'; email: string }
export function validerDemande(body: unknown): DemandeValidee {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new DemandeError(400, 'Le formulaire doit être un objet JSON.')
  const input = body as Record<string, unknown>
  if (input.type !== 'contact' && input.type !== 'documentation') throw new DemandeError(400, 'Type de demande invalide.')
  const doc: Record<string, string> = { type: input.type }
  for (const [field, max] of Object.entries(limitesDemande)) {
    const value = input[field]
    if (value === undefined) continue
    if (typeof value !== 'string') throw new DemandeError(400, `Le champ ${field} doit être du texte.`)
    if (value.length > max) throw new DemandeError(400, `Le champ ${field} dépasse ${max} caractères.`)
    // Les retours à la ligne sont réservés au message ; aucun caractère de contrôle caché.
    const controls = field === 'message' ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/ : /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/
    if (controls.test(value)) throw new DemandeError(400, `Le champ ${field} contient un caractère interdit.`)
    if (field === 'website') {
      if (value !== '') throw new DemandeError(400, 'Le formulaire a été refusé.')
    } else doc[field] = value.trim()
  }
  // Une adresse nue uniquement : les enveloppes « nom<adresse> » et commentaires
  // peuvent désigner le même destinataire chez le fournisseur malgré des clés distinctes.
  const emailParts = doc.email?.split('@')
  const local = emailParts?.[0] ?? ''
  const domain = emailParts?.[1] ?? ''
  const localAtom = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/i
  const domainLabels = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i
  if (emailParts?.length !== 2 || local.length > 64 || !localAtom.test(local) || !domainLabels.test(domain)) {
    throw new DemandeError(400, 'E-mail invalide.')
  }
  if (input.type === 'contact') {
    for (const field of ['profil', 'prenom', 'nom', 'organisation', 'message']) {
      if (!doc[field]) throw new DemandeError(400, `Le champ ${field} est obligatoire.`)
    }
    if (input.consentement !== true) throw new DemandeError(400, 'Votre consentement est obligatoire.')
  } else if (doc.gamme !== 'galileo' && doc.gamme !== 'fotos') throw new DemandeError(400, 'Gamme invalide.')
  return doc as DemandeValidee
}

type Bucket = { count: number; expires: number }
export function creerLimiteurDemandes(now = () => Date.now(), capacity = 5000) {
  const ips = new Map<string, Bucket>()
  const recipients = new Map<string, Bucket>()
  const global = new Map<string, Bucket>()
  function reserve(map: Map<string, Bucket>, key: string, limit: number, duration: number) {
    const time = now()
    for (const [entry, bucket] of map) if (bucket.expires <= time) map.delete(entry)
    const bucket = map.get(key)
    if (bucket && bucket.count >= limit) throw new DemandeError(429, 'Trop de demandes.', Math.max(1, Math.ceil((bucket.expires - time) / 1000)))
    if (!bucket && map.size >= capacity) throw new DemandeError(429, 'Trop de demandes.', 60)
    if (bucket) bucket.count++
    else map.set(key, { count: 1, expires: time + duration })
  }
  return {
    // Réservations synchrones avant toute attente : les requêtes concurrentes comptent aussi.
    requete(socketIp?: string) {
      const ip = socketIp?.toLowerCase().replace(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/, '$1') || 'unknown'
      reserve(ips, ip, 10, 10 * 60_000)
      reserve(global, 'all', 100, 60 * 60_000)
    },
    destinataire(email: string) { reserve(recipients, email.trim().toLowerCase(), 5, 60 * 60_000) },
  }
}

export const limiteurDemandes = creerLimiteurDemandes()
