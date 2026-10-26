// Lit un contenu dans Sanity. Tant que Sanity n'est pas configuré, ou si le document n'existe pas
// encore, le contenu de référence (dossier content/) est affiché à la place.
export async function useContenu<T>(cle: string, requete: string, secours: T, params: Record<string, unknown> = {}) {
  // `false` plutôt que null : useAsyncData attend une valeur pour ne pas refaire la requête côté navigateur.
  const { data } = await useAsyncData<T | false>(cle, async () => {
    const client = sanityClient()
    if (!client) return false
    return (await client.fetch<T | null>(requete, params)) ?? false
  })
  return computed<T>(() => data.value || secours)
}
