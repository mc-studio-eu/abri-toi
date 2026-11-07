import { DELAI_CONTENU, type NomContenu } from '~/utils/requetesContenu'

// SSR et navigations lisent le même résolveur serveur et son cache partagé.
// Aucune référence éditoriale ni gestion silencieuse des pannes dans le navigateur.
export async function useContenu<T>(nom: NomContenu, slug?: string) {
  const cle = slug === undefined ? nom : `${nom === 'pageLegale' ? 'legal' : nom}-${slug}`
  const fetchContenu = useRequestFetch()
  const { data, error } = await useAsyncData<{ contenu: T }>(cle, (_nuxtApp, { signal }) =>
    fetchContenu<{ contenu: T }>(`/api/contenu/${nom}`, { query: slug === undefined ? undefined : { slug }, signal, retry: 0 }), {
    // Réutiliser le résultat SSR à l'hydratation, relire ensuite pour respecter
    // la fraîcheur et les dépublications, même dans une longue session SPA.
    getCachedData: (key, nuxtApp) => nuxtApp.isHydrating ? nuxtApp.payload.data[key] : undefined,
    dedupe: 'defer',
    timeout: DELAI_CONTENU + 1000,
  })
  if (error.value) throw createError({
    statusCode: error.value.statusCode || 503,
    statusMessage: error.value.statusCode === 404 ? 'Contenu introuvable' : 'Contenu temporairement indisponible',
    fatal: true,
  })
  if (!data.value) throw createError({ statusCode: 503, statusMessage: 'Contenu temporairement indisponible', fatal: true })
  if (data.value.contenu === null && !['article', 'realisation', 'pageLegale'].includes(nom)) {
    throw createError({ statusCode: 404, statusMessage: 'Contenu introuvable', fatal: true })
  }
  return computed<T>(() => data.value!.contenu)
}
