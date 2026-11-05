import { completerContenu } from '~/utils/contenuPublic'
import { DELAI_CONTENU, requeteContenu, type NomContenu } from '~/utils/requetesContenu'

// Lit un contenu dans Sanity. Tant que Sanity n'est pas configuré, ou si le document n'existe pas
// encore, le contenu de référence (dossier content/) est affiché à la place.
export async function useContenu<T>(nom: NomContenu, secours: T, slug?: string) {
  const { contentSource, sanity } = useRuntimeConfig().public
  const cle = nom === 'article' ? `article-${slug}` : nom === 'pageLegale' ? `legal-${slug}` : nom
  // `false` plutôt que null : useAsyncData attend une valeur pour ne pas refaire la requête côté navigateur.
  const { data } = await useAsyncData<T | false>(cle, async (nuxtApp, { signal }) => {
    if (contentSource === 'reference' || !sanity.projectId) return false
    if (import.meta.client) {
      return $fetch<T | false>(`/api/contenu/${nom}`, { query: slug === undefined ? undefined : { slug }, signal, retry: 0 })
    }
    const lecture = requeteContenu(nom, slug)
    if (!lecture) return false
    const client = await nuxtApp.runWithContext(sanityClient)
    if (!client) return false
    return (await client.fetch<T | null>(lecture.groq, lecture.params ?? {}, { signal })) ?? false
  }, {
    // Réutiliser les contenus déjà lus (y compris pendant le rendu serveur).
    // Une navigation ne doit pas relancer les mêmes requêtes ni invalider la page sortante.
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
    dedupe: 'defer',
    timeout: DELAI_CONTENU,
  })
  return computed<T>(() => {
    const valeur = data.value
    if (!valeur) return secours

    return completerContenu(valeur, secours)
  })
}
