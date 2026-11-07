import type { Article } from '../content/articles'
import type { Produit } from '../content/produits'
import type { Realisation } from '../content/realisations'
import { realisationsPubliques } from './realisationsPublic'
import { articlesPublicsIndexables, cataloguePublic } from './contenuPublic'

export function cheminsSitemap(catalogue?: Produit[], articles?: Article[], realisations?: Realisation[], pagesLegales: string[] = []): string[] {
  return [
    '/', '/produits', '/realisations', '/a-propos', '/articles', '/contact',
    ...pagesLegales.map((slug) => `/${slug}`),
    ...cataloguePublic(catalogue).filter((produit) => produit.fiche && produit.slug).map((produit) => `/produits/${encodeURIComponent(produit.slug)}`),
    ...realisationsPubliques(realisations).map((realisation) => `/realisations/${encodeURIComponent(realisation.slug)}`),
    ...articlesPublicsIndexables(articles).map((article) => `/articles/${encodeURIComponent(article.slug)}`),
  ]
}
