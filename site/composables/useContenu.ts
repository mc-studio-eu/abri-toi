// Lit un contenu dans Sanity. Tant que Sanity n'est pas configuré, ou si le document n'existe pas
// encore, le contenu de référence (dossier content/) est affiché à la place.
export async function useContenu<T>(cle: string, requete: string, secours: T, params: Record<string, unknown> = {}) {
  // `false` plutôt que null : useAsyncData attend une valeur pour ne pas refaire la requête côté navigateur.
  const { data } = await useAsyncData<T | false>(cle, async () => {
    const client = sanityClient()
    if (!client) return false
    return (await client.fetch<T | null>(requete, params)) ?? false
  })
  return computed<T>(() => {
    const valeur = data.value
    if (!valeur) return secours

    // Les documents Sanity peuvent être partiels (ex. pageProduits ne contient pas
    // encore `usages`). Compléter récursivement avec le contenu livré évite qu'une
    // publication incomplète casse le rendu de toute une route.
    if (
      typeof valeur === 'object' && !Array.isArray(valeur) &&
      typeof secours === 'object' && secours !== null && !Array.isArray(secours)
    ) {
      const completer = (contenu: unknown, defaut: unknown): unknown => {
        if (contenu === undefined || contenu === null) return defaut
        if (Array.isArray(defaut)) return Array.isArray(contenu) ? contenu : defaut
        if (
          typeof defaut === 'object' && defaut !== null &&
          typeof contenu === 'object' && contenu !== null &&
          !Array.isArray(defaut) && !Array.isArray(contenu)
        ) {
          const resultat: Record<string, unknown> = { ...(contenu as Record<string, unknown>) }
          for (const [clef, valeurDefaut] of Object.entries(defaut as Record<string, unknown>)) {
            resultat[clef] = completer(resultat[clef], valeurDefaut)
          }
          return resultat
        }
        return contenu
      }
      return completer(valeur, secours) as T
    }

    return valeur as T
  })
}
