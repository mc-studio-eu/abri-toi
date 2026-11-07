import type { Article } from '../../content/articles'
import type { Produit } from '../../content/produits'
import type { Realisation } from '../../content/realisations'
import { lireContenu } from '../utils/contenu'
import { SLUGS_PAGES_LEGALES } from '../../utils/requetesContenu'
import { cheminsSitemap } from '../../utils/sitemap'
import { sitemapXml } from '../../utils/seo'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  const config = useRuntimeConfig(event)
  try {
    // Même autorité et mêmes dernières collections valides que les pages.
    // Une collection inaccessible sans cache valide rend le sitemap indisponible.
    const [catalogue, articles, realisations, ...legales] = await Promise.all([
      lireContenu(config.public, 'produits'),
      lireContenu(config.public, 'articles'),
      lireContenu(config.public, 'realisations'),
      ...SLUGS_PAGES_LEGALES.map((slug) => lireContenu(config.public, 'pageLegale', slug)),
    ])
    setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
    return sitemapXml(cheminsSitemap(catalogue as Produit[], articles as Article[], realisations as Realisation[], SLUGS_PAGES_LEGALES.filter((_, index) => legales[index] !== null)), config.public.seoSiteUrl)
  } catch (cause) {
    if ((cause as { statusCode?: number }).statusCode === 503) setHeader(event, 'Retry-After', '60')
    throw cause
  }
})
