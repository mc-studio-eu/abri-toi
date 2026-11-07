import { cheminPublic } from './routesPubliques'

export const ORIGINE_SITE = 'https://abritoi.com'
export const IMAGE_PARTAGE = '/images/hero-v5-photo-plein-fond.png'
export const TITRE_ACCUEIL = 'Abris d’ombrage pour espaces publics | Abri Toi'
export const DESCRIPTION_ACCUEIL = 'Découvrez Galiléo et Fotos, nos gammes de mobilier abrité conçues à Lyon et fabriquées en France. Parlons de votre projet d’ombrage.'

// Origine explicitement configurée ; ne jamais déduire le domaine depuis Host ou Forwarded.
export function origineSeo(configuration?: unknown): string {
  try {
    if (typeof configuration !== 'string') return ORIGINE_SITE
    const url = new URL(configuration)
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) return ORIGINE_SITE
    return url.origin
  } catch { return ORIGINE_SITE }
}

export function urlCanonique(chemin: string, origine?: unknown): string {
  const propre = chemin.split(/[?#]/, 1)[0] || '/'
  const url = new URL(propre.startsWith('/') && !propre.startsWith('//') ? propre : '/', origineSeo(origine))
  const path = cheminPublic(url.pathname)
  const query = new URL(`https://pagination.invalid/?${chemin.split('?')[1]?.split('#')[0] || ''}`).searchParams
  const page = query.get('page') || ''
  const pagination = ['/articles', '/realisations'].includes(path) && /^[1-9]\d*$/.test(page) && Number.isSafeInteger(Number(page)) && Number(page) > 1
    ? `?page=${Number(page)}` : ''
  return `${url.origin}${path}${pagination}`
}

export function imageAbsolue(image: string | undefined, origine?: unknown): string {
  const base = origineSeo(origine)
  try {
    const url = new URL(image || IMAGE_PARTAGE, base)
    if (['https:', 'http:'].includes(url.protocol)) return url.href
  } catch { /* Une image invalide ne doit pas supprimer la carte de partage. */ }
  return new URL(IMAGE_PARTAGE, base).href
}

export function descriptionCourte(texte: string | undefined, secours: string): string {
  const propre = (texte || secours).replace(/\s+/g, ' ').trim()
  return propre.length > 200 ? `${propre.slice(0, 197).trimEnd()}…` : propre
}

export function serialiserJsonLd(donnees: unknown): string {
  return JSON.stringify(donnees).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
}

export function echapperXml(texte: string): string {
  return texte.replace(/[<>&"']/g, (caractere) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[caractere]!)
}

export function sitemapXml(chemins: string[], origine?: unknown): string {
  const urls = [...new Set(chemins.map((chemin) => urlCanonique(chemin, origine)))]
  // Aucune date de modification n'est inventée à partir de la date de génération.
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `\n  <url><loc>${echapperXml(url)}</loc></url>`).join('')}\n</urlset>\n`
}
