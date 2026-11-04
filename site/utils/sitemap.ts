import type { Article } from '../content/articles'
import { pagesLegales } from '../content/legal'
import type { Produit } from '../content/produits'
import { articlesPublicsIndexables, cataloguePublic } from './contenuPublic'

export function cheminsSitemap(catalogue?: Produit[], articles?: Article[]): string[] {
  return [
    '/', '/produits', '/realisations', '/a-propos', '/articles', '/contact',
    ...pagesLegales.map((page) => `/${page.slug}`),
    ...cataloguePublic(catalogue).filter((produit) => produit.fiche && produit.slug).map((produit) => `/produits/${encodeURIComponent(produit.slug)}`),
    ...articlesPublicsIndexables(articles).map((article) => `/articles/${encodeURIComponent(article.slug)}`),
  ]
}
