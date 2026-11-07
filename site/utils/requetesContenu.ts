import { REQUETE_REALISATION, REQUETE_REALISATIONS } from './realisationsPublic'
import { REQUETE_ARTICLE, REQUETE_ARTICLES, REQUETE_PRODUITS } from './contenuPublic'

export const DELAI_CONTENU = 8000
export const SLUGS_PAGES_LEGALES = ['mentions-legales', 'politique-de-confidentialite', 'politique-de-cookies']

const document = (id: string, projection = '...') => `*[_id == "${id}"][0]{${projection}}`
const requetes = {
  parametres: document('parametres'),
  gammes: `*[_type == "gamme"]{ ..., "documentation": documentation.asset->url, "ficheTechnique": ficheTechnique.asset->url }`,
  produits: REQUETE_PRODUITS,
  realisations: REQUETE_REALISATIONS,
  articles: REQUETE_ARTICLES,
  pageAccueil: document('pageAccueil', `...,
    installations{ ..., bandeaux[]{ ..., "produit": produit->slug.current, "realisation": realisation->slug.current } },
    articles{ ..., "selection": selection[]->slug.current }`),
  pageProduits: document('pageProduits'),
  ficheProduit: document('ficheProduit'),
  pageRealisations: document('pageRealisations'),
  pageAPropos: document('pageAPropos'),
  pageArticles: document('pageArticles', `..., "aLaUne": aLaUne->slug.current`),
  pageContact: document('pageContact'),
}

export type NomContenu = keyof typeof requetes | 'realisation' | 'article' | 'pageLegale'

export function requeteContenu(nom: string | undefined, slug: unknown): { groq: string; params?: Record<string, string> } | undefined {
  if (nom === 'realisation' && typeof slug === 'string' && slug) {
    return { groq: REQUETE_REALISATION, params: { slug } }
  }
  if (nom === 'article' && typeof slug === 'string' && slug) {
    return { groq: REQUETE_ARTICLE, params: { slug } }
  }
  if (nom === 'pageLegale' && typeof slug === 'string' && SLUGS_PAGES_LEGALES.includes(slug)) {
    return { groq: `*[_id == $id][0]{..., "slug": slug.current}`, params: { id: `legal-${slug}` } }
  }
  if (nom && slug === undefined && Object.hasOwn(requetes, nom)) {
    return { groq: requetes[nom as keyof typeof requetes] }
  }
}
