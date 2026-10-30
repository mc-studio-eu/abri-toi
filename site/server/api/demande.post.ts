// Enregistre une demande (contact ou documentation) dans Sanity : visible dans « Demandes reçues ».
import { createClient } from '@sanity/client'
import { Resend } from 'resend'

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
  const body = await readBody<Record<string, string>>(event)
  if (!body?.email || !/^\S+@\S+\.\S+$/.test(body.email)) {
    throw createError({ statusCode: 400, statusMessage: 'E-mail invalide' })
  }
  const config = useRuntimeConfig()
  const type = body.type === 'documentation' ? 'documentation' : 'contact'
  const champs = ['type', 'email', 'prenom', 'nom', 'organisation', 'fonction', 'telephone', 'profil', 'gamme', 'codePostal', 'echeance', 'message', 'produit']
  const doc = Object.fromEntries(champs.filter((c) => body[c]).map((c) => [c, String(body[c]).slice(0, 4000)]))
  const { projectId, dataset, apiVersion } = config.public.sanity

  let documentation: string | undefined
  if (projectId && config.sanityWriteToken) {
    const client = createClient({ projectId, dataset, apiVersion, token: config.sanityWriteToken, useCdn: false })
    await client.create({ _type: 'demande', recueLe: new Date().toISOString(), ...doc })
    if (type === 'documentation' && body.gamme) {
      documentation = await client.fetch(`*[_id == $id][0].documentation.asset->url`, { id: `gamme-${body.gamme}` })
    }
  }

  if (config.resendApiKey && config.emailFrom) {
    const resend = new Resend(config.resendApiKey)
    const subject = type === 'documentation'
      ? `Demande de documentation — ${String(body.produit || body.gamme || 'Abri Toi').slice(0, 120)}`
      : `Nouvelle demande de contact — ${String(body.organisation || `${body.prenom || ''} ${body.nom || ''}`).slice(0, 120)}`
    const rows = Object.entries(doc)
      .filter(([key]) => libelles[key])
      .map(([key, value]) => `<tr><th align="left" style="padding:8px;border-bottom:1px solid #ddd">${htmlSafe(libelles[key])}</th><td style="padding:8px;border-bottom:1px solid #ddd;white-space:pre-wrap">${htmlSafe(value)}</td></tr>`)
      .join('')
    const { error } = await resend.emails.send({
      from: config.emailFrom,
      to: config.contactEmail,
      replyTo: body.email,
      subject,
      html: `<h1>Nouvelle demande depuis abri-toi.com</h1><table style="border-collapse:collapse">${rows}</table>`,
      text: Object.entries(doc).filter(([key]) => libelles[key]).map(([key, value]) => `${libelles[key]} :\n${value}`).join('\n\n'),
    })
    if (error) {
      console.error('Échec envoi e-mail demande:', error.message)
      throw createError({ statusCode: 502, statusMessage: 'Envoi de la demande impossible' })
    }
  } else if (!(projectId && config.sanityWriteToken)) {
    throw createError({ statusCode: 503, statusMessage: 'Envoi des demandes non configuré' })
  }

  return { ok: true, documentation }
})
