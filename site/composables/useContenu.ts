import { completerContenu } from '~/utils/contenuPublic'

// Lit un contenu dans Sanity. Tant que Sanity n'est pas configuré, ou si le document n'existe pas
// encore, le contenu de référence (dossier content/) est affiché à la place.
export async function useContenu<T>(cle: string, requete: string, secours: T, params: Record<string, unknown> = {}) {
  // `false` plutôt que null : useAsyncData attend une valeur pour ne pas refaire la requête côté navigateur.
  const { data } = await useAsyncData<T | false>(cle, async () => {
    if (useRuntimeConfig().public.contentSource === 'reference') return false
    const client = sanityClient()
    if (!client) return false
    return (await client.fetch<T | null>(requete, params)) ?? false
  }, {
    // Réutiliser les contenus déjà lus (y compris pendant le rendu serveur).
    // Une navigation ne doit pas relancer les mêmes requêtes ni invalider la page sortante.
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
    dedupe: 'defer',
  })
  return computed<T>(() => {
    const valeur = data.value
    if (!valeur) return secours

    return completerContenu(valeur, secours)
  })
}
