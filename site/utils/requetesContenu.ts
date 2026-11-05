import { pagesLegales } from '../content/legal'
import { REQUETE_ARTICLE, REQUETE_ARTICLES, REQUETE_PRODUITS } from './contenuPublic'

export const DELAI_CONTENU = 8000

const document = (id: string, projection = '...') => `*[_id == "${id}"][0]{${projection}}`
const requetes = {
  parametres: document('parametres'),
  gammes: `*[_type == "gamme"]{ ..., "documentation": documentation.asset->url, "ficheTechnique": ficheTechnique.asset->url }`,
  produits: REQUETE_PRODUITS,
  realisations: `*[_type == "realisation"] | order(ordre asc){ nom, gamme, description, photo }`,
  articles: REQUETE_ARTICLES,
  pageAccueil: document('pageAccueil', `...,
    installations{ ..., bandeaux[]{ ..., "produit": produit->slug.current } },
    articles{ ..., "selection": selection[]->slug.current }`),
  pageProduits: document('pageProduits'),
  ficheProduit: document('ficheProduit'),
  pageRealisations: document('pageRealisations'),
  pageAPropos: document('pageAPropos'),
  pageArticles: document('pageArticles', `..., "aLaUne": aLaUne->slug.current`),
  pageContact: document('pageContact'),
}

export type NomContenu = keyof typeof requetes | 'article' | 'pageLegale'

export function requeteContenu(nom: string | undefined, slug: unknown): { groq: string; params?: Record<string, string> } | undefined {
  if (nom === 'article' && typeof slug === 'string' && slug) {
    return { groq: REQUETE_ARTICLE, params: { slug } }
  }
  if (nom === 'pageLegale' && typeof slug === 'string' && pagesLegales.some((page) => page.slug === slug)) {
    return { groq: `*[_id == $id][0]{..., "slug": slug.current}`, params: { id: `legal-${slug}` } }
  }
  if (nom && slug === undefined && Object.hasOwn(requetes, nom)) {
    return { groq: requetes[nom as keyof typeof requetes] }
  }
}
