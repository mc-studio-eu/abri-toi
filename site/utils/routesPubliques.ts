// Alias conservé à la frontière publique : le document CMS et ses références restent intacts.
export const ANCIEN_SLUG_BANQUETTE = 'Une assise sans dossier à l’ombre avec brumisation et végétation'
export const SLUG_BANQUETTE = 'banquette-galileo-brumisation-vegetation'
export function slugProduitPublic(slug: string): string {
  return slug === ANCIEN_SLUG_BANQUETTE ? SLUG_BANQUETTE : slug
}

const routesStatiques = new Set([
  '/', '/produits', '/articles', '/realisations', '/contact', '/a-propos',
  '/mentions-legales', '/politique-de-confidentialite', '/politique-de-cookies',
])
export function cheminPublic(path: string): string {
  const propre = path.replace(/\/+$/, '') || '/'
  const minuscule = propre.toLowerCase()
  if (routesStatiques.has(minuscule)) return minuscule
  if (minuscule === '/politique-de-cookies-ue') return '/politique-de-cookies'
  const segments = propre.split('/')
  if (segments.length === 3 && segments[1].toLowerCase() === 'produits') {
    try {
      if (decodeURIComponent(segments[2]) === ANCIEN_SLUG_BANQUETTE) return `/produits/${SLUG_BANQUETTE}`
    } catch { /* Une URL mal encodée reste gérée par le routeur. */ }
  }
  // Ne pas altérer la casse des slugs CMS arbitraires.
  return propre
}
