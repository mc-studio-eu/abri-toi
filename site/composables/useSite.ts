// Requêtes GROQ du site. Chaque requête renvoie la même forme que le contenu de référence (content/).
import { pageAccueil } from '~/content/accueil'
import { articles, type Article } from '~/content/articles'
import { gammes, parametres, type GammeCle } from '~/content/commun'
import { pagesLegales } from '~/content/legal'
import { ficheProduit, pageAPropos, pageArticles, pageContact, pageProduits, pageRealisations } from '~/content/pages'
import { produits, type Produit } from '~/content/produits'
import { realisations } from '~/content/realisations'
import { normaliserAccueil } from '~/utils/normaliserAccueil'
import { cataloguePublic, SLUG_ARTICLE_EXCLU } from '~/utils/contenuPublic'

export const useParametres = () => useContenu('parametres', parametres)

export async function useGammes() {
  const data = await useContenu('gammes', [] as (typeof gammes.galileo)[])
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

export async function useProduits() {
  const data = await useContenu('produits', produits)
  return computed<Produit[]>(() => cataloguePublic(data.value))
}

// Chaque carte ouvre la fiche de la configuration qu’elle présente.
export const lienProduit = (p?: Pick<Produit, 'slug'>) =>
  p ? `/produits/${p.slug}` : '/produits'

export const useRealisations = () => useContenu('realisations', realisations)

export const useArticles = () =>
  useContenu('articles', articles as Omit<Article, 'corps' | 'intro' | 'auteur'>[])

export const useArticle = (slug: string) =>
  useContenu(
    'article',
    (slug === SLUG_ARTICLE_EXCLU ? null : articles.find((a) => a.slug === slug) ?? null) as Article | null,
    slug,
  )

export async function usePageAccueil() {
  const contenu = await useContenu('pageAccueil', pageAccueil)
  return computed(() => normaliserAccueil(contenu.value, pageAccueil))
}
export const usePageProduits = () => useContenu('pageProduits', pageProduits)
export const useFicheProduit = () => useContenu('ficheProduit', ficheProduit)
export const usePageRealisations = () => useContenu('pageRealisations', pageRealisations)
export const usePageAPropos = () => useContenu('pageAPropos', pageAPropos)
export const usePageArticles = () => useContenu('pageArticles', pageArticles)
export const usePageContact = () => useContenu('pageContact', pageContact)

// Mentions légales, confidentialité, cookies (document « legal-<adresse> »)
export const usePageLegale = (slug: string) =>
  useContenu('pageLegale', pagesLegales.find((l) => l.slug === slug) ?? null, slug)

// Libellés
export const labelCategorie = (cle: string) =>
  ({ collectivites: 'Collectivités', sante: 'Santé', conception: 'Conception', vegetation: 'Végétation' })[cle] ?? cle

export const dateLongue = (iso: string) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
