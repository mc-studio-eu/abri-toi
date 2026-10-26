// Enregistre une demande (contact ou documentation) dans Sanity : visible dans « Demandes reçues ».
import { createClient } from '@sanity/client'

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, string>>(event)
  if (!body?.email || !/^\S+@\S+\.\S+$/.test(body.email)) {
    throw createError({ statusCode: 400, statusMessage: 'E-mail invalide' })
  }
  const config = useRuntimeConfig()
  const { projectId, dataset, apiVersion } = config.public.sanity
  if (!projectId || !config.sanityWriteToken) {
    throw createError({ statusCode: 503, statusMessage: 'Enregistrement des demandes non configuré' })
  }
  const client = createClient({ projectId, dataset, apiVersion, token: config.sanityWriteToken, useCdn: false })
  const champs = ['type', 'email', 'prenom', 'nom', 'organisation', 'fonction', 'telephone', 'profil', 'gamme', 'codePostal', 'echeance', 'message', 'produit']
  const doc = Object.fromEntries(champs.filter((c) => body[c]).map((c) => [c, String(body[c]).slice(0, 4000)]))
  await client.create({ _type: 'demande', recueLe: new Date().toISOString(), ...doc })

  let documentation: string | undefined
  if (body.type === 'documentation' && body.gamme) {
    documentation = await client.fetch(`*[_id == $id][0].documentation.asset->url`, { id: `gamme-${body.gamme}` })
  }
  return { ok: true, documentation }
})
