import { createClient } from '@sanity/client'
import type { Article } from '../../content/articles'
import type { Produit } from '../../content/produits'
import { REQUETE_ARTICLES_COMPLETS, REQUETE_PRODUITS } from '../../utils/contenuPublic'
import { cheminsSitemap } from '../../utils/sitemap'
import { sitemapXml } from '../../utils/seo'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  let catalogue: Produit[] | undefined
  let articles: Article[] | undefined
  if (config.public.contentSource !== 'reference' && config.public.sanity.projectId) {
    const client = createClient({ ...config.public.sanity, perspective: 'published', useCdn: true, timeout: 8000 })
    // Chaque collection retrouve son propre secours, comme useAsyncData dans les pages.
    const resultats = await Promise.allSettled([
      client.fetch<Produit[]>(REQUETE_PRODUITS),
      client.fetch<Article[]>(REQUETE_ARTICLES_COMPLETS),
    ])
    if (resultats[0].status === 'fulfilled' && Array.isArray(resultats[0].value)) catalogue = resultats[0].value
    if (resultats[1].status === 'fulfilled' && Array.isArray(resultats[1].value)) articles = resultats[1].value
  }
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return sitemapXml(cheminsSitemap(catalogue, articles), config.public.seoSiteUrl)
})
