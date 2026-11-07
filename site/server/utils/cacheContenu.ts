// Cache mémoire partagé par les routes API, le SSR et le sitemap d'une même instance.
// Une dépublication réussie (null/[]) remplace immédiatement la dernière valeur.
export const FRAICHEUR_CONTENU = 60_000
export const AGE_MAX_SECOURS = 15 * 60_000
const DELAI_REESSAI = 5_000
const MAX_ENTREES = 500

export function erreurTransitoire(cause: unknown): boolean {
  const erreur = cause as { statusCode?: number; status?: number; response?: { statusCode?: number; status?: number } }
  const status = erreur?.statusCode ?? erreur?.status ?? erreur?.response?.statusCode ?? erreur?.response?.status
  return status === undefined || status === 408 || status === 429 || status >= 500
}

export function creerCacheContenu(maintenant = Date.now) {
  type Entree = { valeur: unknown; date: number; reessai?: number }
  const entrees = new Map<string, Entree>()
  const enCours = new Map<string, Promise<unknown>>()
  return async function lire<T>(cle: string, charger: () => Promise<T>): Promise<T> {
    const entree = entrees.get(cle)
    const age = entree ? maintenant() - entree.date : Infinity
    if (entree && (age < FRAICHEUR_CONTENU || (age < AGE_MAX_SECOURS && maintenant() < (entree.reessai ?? 0)))) {
      return entree.valeur as T
    }
    const existante = enCours.get(cle)
    if (existante) return existante as Promise<T>
    const lecture = (async () => {
      try {
        const valeur = await charger()
        // Borner le nombre de slugs conservés sur une instance longue durée.
        if (!entrees.has(cle) && entrees.size >= MAX_ENTREES) entrees.delete(entrees.keys().next().value!)
        entrees.set(cle, { valeur, date: maintenant() })
        return valeur
      } catch (cause) {
        if (entree && maintenant() - entree.date < AGE_MAX_SECOURS && erreurTransitoire(cause)) {
          entree.reessai = maintenant() + DELAI_REESSAI
          return entree.valeur as T
        }
        throw cause
      } finally {
        enCours.delete(cle)
      }
    })()
    enCours.set(cle, lecture)
    return lecture
  }
}

export const lireAvecCache = creerCacheContenu()
