// Requêtes GROQ du site. Chaque requête renvoie la même forme que le contenu de référence (content/).
import { pageAccueil } from '~/content/accueil'
import { articles, type Article } from '~/content/articles'
import { gammes, parametres, type GammeCle } from '~/content/commun'
import { pagesLegales } from '~/content/legal'
import { ficheProduit, pageAPropos, pageArticles, pageContact, pageProduits, pageRealisations } from '~/content/pages'
import { produits, type Produit } from '~/content/produits'
import { realisations } from '~/content/realisations'

const page = <T>(id: string, secours: T, projection = '...') =>
  useContenu(id, `*[_id == "${id}"][0]{${projection}}`, secours)

export const useParametres = () => page('parametres', parametres)

export async function useGammes() {
  const data = await useContenu(
    'gammes',
    `*[_type == "gamme"]{ ..., "documentation": documentation.asset->url, "ficheTechnique": ficheTechnique.asset->url }`,
    [] as (typeof gammes.galileo)[],
  )
  // Sans PDF dans Sanity, on garde ceux livrés avec le site (public/docs).
  // Retourner le record directement permet aux templates de l'utiliser uniformément.
  const avecSecours = (cle: GammeCle) => {
    const g = data.value.find((d) => d.cle === cle)
    if (!g) return gammes[cle]
    return {
      ...g,
      documentation: g.documentation || gammes[cle].documentation,
      ficheTechnique: g.ficheTechnique || gammes[cle].ficheTechnique,
    }
  }
  return computed(() => ({ galileo: avecSecours('galileo'), fotos: avecSecours('fotos') }))
}

export const useProduits = () =>
  useContenu(
    'produits',
    `*[_type == "produit"] | order(ordre asc){
      "slug": slug.current, nom, gamme, categorie,
      "carte": { description, visuel },
      "lienVers": lienVers->slug.current,
      fiche{ titre, sousTitre, description, galerie, caracteristiques,
        similaires[]{ titre, description, "produit": produit->slug.current } }
    }`,
    produits,
  )

// Adresse de la fiche à ouvrir depuis une carte (un espace renvoie vers la fiche de son modèle).
export const lienProduit = (p?: Pick<Produit, 'slug' | 'lienVers'>) =>
  p ? `/produits/${p.lienVers || p.slug}` : '/produits'

export const useRealisations = () =>
  useContenu(
    'realisations',
    `*[_type == "realisation"] | order(ordre asc){ nom, gamme, description, photo }`,
    realisations,
  )

const champsArticle = `"slug": slug.current, titre, categorie, tempsLecture, date, extrait, couverture, couvertureFond, couvertureInset`

export const useArticles = () =>
  useContenu(
    'articles',
    `*[_type == "article" && defined(slug.current)] | order(date desc){ ${champsArticle} }`,
    articles as Omit<Article, 'corps' | 'intro' | 'auteur'>[],
  )

export const useArticle = (slug: string) =>
  useContenu(
    `article-${slug}`,
    `*[_type == "article" && slug.current == $slug][0]{ ..., ${champsArticle} }`,
    (articles.find((a) => a.slug === slug) ?? null) as Article | null,
    { slug },
  )

export const usePageAccueil = () =>
  page(
    'pageAccueil',
    pageAccueil,
    `...,
    installations{ ..., bandeaux[]{ ..., "produit": produit->slug.current } },
    articles{ ..., "selection": selection[]->slug.current }`,
  )
export const usePageProduits = () => page('pageProduits', pageProduits)
export const useFicheProduit = () => page('ficheProduit', ficheProduit)
export const usePageRealisations = () => page('pageRealisations', pageRealisations)
export const usePageAPropos = () => page('pageAPropos', pageAPropos)
export const usePageArticles = () => page('pageArticles', pageArticles, `..., "aLaUne": aLaUne->slug.current`)
export const usePageContact = () => page('pageContact', pageContact)

// Mentions légales, confidentialité, cookies (document « legal-<adresse> »)
export const usePageLegale = (slug: string) =>
  page(`legal-${slug}`, pagesLegales.find((l) => l.slug === slug) ?? null, `..., "slug": slug.current`)

// Libellés
export const labelCategorie = (cle: string) =>
  ({ collectivites: 'Collectivités', sante: 'Santé', conception: 'Conception', vegetation: 'Végétation' })[cle] ?? cle

export const dateLongue = (iso: string) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
