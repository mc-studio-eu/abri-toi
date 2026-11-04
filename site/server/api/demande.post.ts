// Envoie les demandes par e-mail et les archive dans Sanity si configuré.
import { createClient } from '@sanity/client'
import { Resend } from 'resend'
import { gammes } from '../../content/commun'
import { DemandeError, lireJsonDemande, validerDemande, limiteurDemandes } from '../utils/demandeProtection'

const libelles: Record<string, string> = {
  type: 'Type de demande',
  email: 'E-mail',
  prenom: 'Prénom',
  nom: 'Nom',
  organisation: 'Collectivité ou organisation',
  fonction: 'Fonction',
  telephone: 'Téléphone',
  profil: 'Profil',
  gamme: 'Gamme souhaitée',
  codePostal: 'Code postal du site',
  echeance: 'Échéance souhaitée',
  message: 'Projet',
  produit: 'Produit concerné',
}

function htmlSafe(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)
}

export default defineEventHandler(async (event) => {
  let doc: ReturnType<typeof validerDemande>
  try {
    // Seule l'adresse du socket est fiable par défaut ; ne pas lire X-Forwarded-For.
    limiteurDemandes.requete(event.node.req.socket?.remoteAddress)
    doc = validerDemande(await lireJsonDemande(event.node.req))
    limiteurDemandes.destinataire(doc.email)
  } catch (error) {
    if (!(error instanceof DemandeError)) throw error
    if (error.retryAfter) setResponseHeader(event, 'Retry-After', String(error.retryAfter))
    throw createError({ statusCode: error.statusCode, statusMessage: 'Demande refusee', data: { message: error.message } })
  }
  const config = useRuntimeConfig()
  const type = doc.type
  const { projectId, dataset, apiVersion } = config.public.sanity
  const emailConfigure = Boolean(config.resendApiKey && config.emailFrom && config.contactEmail)
  const sanityConfigure = Boolean(projectId && config.sanityWriteToken)
  // Un enregistrement dans le CMS ne suffit pas à confirmer l'envoi d'un contact.
  if (!emailConfigure && type === 'contact') {
    throw createError({ statusCode: 503, statusMessage: 'Envoi des demandes non configuré' })
  }

  const client = projectId ? createClient({ projectId, dataset, apiVersion, token: config.sanityWriteToken || undefined, useCdn: false }) : undefined
  const documents: { label: string; url: string }[] = []
  if (type === 'documentation') {
    const gamme = gammes[doc.gamme as 'galileo' | 'fotos']
    let fichiers: { documentation?: string; ficheTechnique?: string } | null = null
    if (client && config.public.contentSource !== 'reference') {
      try {
        fichiers = await client.fetch(/* groq */ `*[_type == "gamme" && cle == $gamme][0]{
          "documentation": documentation.asset->url,
          "ficheTechnique": ficheTechnique.asset->url
        }`, { gamme: doc.gamme })
      } catch {
        console.error('Échec lecture des PDF dans Sanity')
      }
    }
    documents.push(
      { label: `Documentation ${gamme.nom}`, url: publicFileUrl(fichiers?.documentation) || gamme.documentation },
      { label: `Fiches techniques ${gamme.nom}`, url: publicFileUrl(fichiers?.ficheTechnique) || gamme.ficheTechnique },
    )
  }

  const resend = emailConfigure ? new Resend(config.resendApiKey) : undefined
  let delivery: 'emailed' | 'download-only' = 'download-only'
  // Une origine explicitement configurée évite de reprendre un Host fourni par le visiteur.
  const origin = siteOrigin(config.siteUrl)
  if (type === 'documentation' && resend && origin) {
    const liens = documents.map((document) => ({ ...document, url: new URL(document.url, origin).href }))
    try {
      const { error } = await resend.emails.send({
        from: config.emailFrom,
        to: doc.email,
        replyTo: config.contactEmail,
        subject: `Votre documentation ${gammes[doc.gamme as 'galileo' | 'fotos'].nom} — Abri Toi`,
        html: `<p>Bonjour,</p><p>Voici les documents demandés :</p><ul>${liens.map((document) => `<li><a href="${htmlSafe(document.url)}">${htmlSafe(document.label)} (PDF)</a></li>`).join('')}</ul><p>Pour échanger sur votre projet, répondez simplement à cet e-mail.</p>`,
        text: `Bonjour,\n\nVoici les documents demandés :\n\n${liens.map((document) => `${document.label} (PDF) : ${document.url}`).join('\n')}\n\nPour échanger sur votre projet, répondez simplement à cet e-mail.`,
      })
      if (error) console.error('Échec envoi documentation au visiteur')
      else delivery = 'emailed'
    } catch {
      console.error('Échec envoi documentation au visiteur')
    }
  }

  if (resend) {
    const subject = type === 'documentation'
      ? `Demande de documentation — ${doc.produit || doc.gamme || 'Abri Toi'}`
      : `Nouvelle demande de contact — ${doc.organisation}`
    const rows = Object.entries(doc)
      .filter(([key]) => libelles[key])
      .map(([key, value]) => `<tr><th align="left" style="padding:8px;border-bottom:1px solid #ddd">${htmlSafe(libelles[key])}</th><td style="padding:8px;border-bottom:1px solid #ddd;white-space:pre-wrap">${htmlSafe(value)}</td></tr>`)
      .join('')
    try {
      const { error } = await resend.emails.send({
        from: config.emailFrom,
        to: config.contactEmail,
        replyTo: doc.email,
        subject,
        html: `<h1>Nouvelle demande depuis abritoi.com</h1><table style="border-collapse:collapse">${rows}</table>`,
        text: Object.entries(doc).filter(([key]) => libelles[key]).map(([key, value]) => `${libelles[key]} :\n${value}`).join('\n\n'),
      })
      if (error) throw new Error('Envoi refusé')
    } catch {
      console.error('Échec envoi e-mail demande')
      if (type === 'contact') throw createError({ statusCode: 502, statusMessage: 'Envoi de la demande impossible' })
    }
  }

  if (sanityConfigure && client) {
    try {
      await client.create({ _type: 'demande', recueLe: new Date().toISOString(), ...doc })
    } catch {
      console.error('Échec archivage demande dans Sanity')
    }
  }

  return type === 'documentation' ? { ok: true, delivery, documents } : { ok: true }
})

// Les fichiers CMS sont des URL HTTPS ; les chemins de secours restent sur le site.
function publicFileUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  try {
    const url = new URL(value)
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href
  } catch { /* champ absent ou mal formé : PDF local */ }
}

function siteOrigin(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  try {
    const url = new URL(value)
    if (url.protocol === 'https:' && !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash &&
      url.hostname !== 'localhost' && !url.hostname.endsWith('.localhost') && url.hostname !== '127.0.0.1' && url.hostname !== '[::1]') return url.origin
  } catch { /* origine non configurée : téléchargement direct */ }
}
