import { requeteContenu, type NomContenu } from '../../../utils/requetesContenu'
import { contenuPourNavigateur, lireContenu } from '../../utils/contenu'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  const nom = getRouterParam(event, 'nom')
  const slug = getQuery(event).slug
  if (!requeteContenu(nom, slug)) throw createError({ statusCode: 404, statusMessage: 'Contenu introuvable' })
  try {
    const valeur = await lireContenu(useRuntimeConfig(event).public, nom as NomContenu, slug as string | undefined)
    // Envelopper null évite une deuxième lecture Nuxt lors de l'hydratation.
    return { contenu: contenuPourNavigateur(nom as NomContenu, valeur) }
  } catch (cause) {
    if ((cause as { statusCode?: number }).statusCode === 503) setHeader(event, 'Retry-After', '60')
    throw cause
  }
})
