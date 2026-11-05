import { createClient } from '@sanity/client'
import { DELAI_CONTENU, requeteContenu } from '../../../utils/requetesContenu'

export default defineEventHandler(async (event) => {
  const lecture = requeteContenu(getRouterParam(event, 'nom'), getQuery(event).slug)
  if (!lecture) throw createError({ statusCode: 404, statusMessage: 'Contenu introuvable' })

  const { contentSource, sanity } = useRuntimeConfig(event).public
  if (contentSource === 'reference' || !sanity.projectId) return false

  const client = createClient({ ...sanity, perspective: 'published', useCdn: false })
  try {
    return (await client.fetch<unknown>(lecture.groq, lecture.params ?? {}, { signal: AbortSignal.timeout(DELAI_CONTENU) })) ?? false
  } catch (cause) {
    throw createError({ statusCode: 502, statusMessage: 'Contenu indisponible', cause })
  }
})
