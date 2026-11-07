import type { Article } from '../content/articles'
import type { Produit } from '../content/produits'
import { slugProduitPublic } from './routesPubliques'

export const SLUG_ARTICLE_EXCLU = 'financer-ombrage-espaces-publics'
export const FILTRE_ARTICLES = `_type == "article" && !(_id in path("drafts.**")) && defined(slug.current) && slug.current != "${SLUG_ARTICLE_EXCLU}"`
export const CHAMPS_ARTICLE = `"slug": slug.current, titre, categorie, tempsLecture, date, extrait, couverture, couvertureFond, couvertureInset`
export const CHAMPS_ARTICLE_COMPLET = `${CHAMPS_ARTICLE}, illustration, legendeIllustration, auteur, intro, corps`
// Le serveur contrôle le corps avant de renvoyer les cartes, puis retire ces champs.
export const REQUETE_ARTICLES = `*[${FILTRE_ARTICLES}] | order(date desc){ ${CHAMPS_ARTICLE_COMPLET} }`
export const REQUETE_ARTICLES_COMPLETS = `*[${FILTRE_ARTICLES}] | order(date desc){ ${CHAMPS_ARTICLE_COMPLET} }`
export const REQUETE_ARTICLE = `*[${FILTRE_ARTICLES} && slug.current == $slug][0]{ ${CHAMPS_ARTICLE_COMPLET} }`
export const REQUETE_PRODUITS = `*[_type == "produit" && !(_id in path("drafts.**"))] | order(ordre asc){
  "slug": slug.current, nom, gamme, categorie,
  "carte": { description, visuel }, "lienVers": lienVers->slug.current,
  fiche{ titre, sousTitre, description, galerie, caracteristiques,
    similaires[]{ titre, description, visuel, variante, "produit": produit->slug.current } }
}`

// Même complément des documents partiels dans le rendu et dans le sitemap.
// Une chaîne vide ou un tableau vide publié reste un choix éditorial explicite.
export function completerContenu<T>(contenu: T | null | undefined, defaut: T): T {
  if (contenu === undefined || contenu === null) return defaut
  if (Array.isArray(defaut)) return (Array.isArray(contenu) ? contenu : defaut) as T
  if (typeof defaut === 'object' && defaut !== null && typeof contenu === 'object' && !Array.isArray(contenu)) {
    const resultat = { ...contenu } as Record<string, unknown>
    for (const [cle, valeur] of Object.entries(defaut)) {
      // Une image CMS doit garder sa source Sanity : ajouter le src local
      // de secours masquerait l’asset HD et empêcherait le srcset.
      if (cle === 'src' && (resultat.asset as { _ref?: string } | undefined)?._ref) continue
      resultat[cle] = completerContenu(resultat[cle], valeur)
    }
    return resultat as T
  }
  return contenu
}

// Ne jamais élargir une collection publiée avec des références locales.
export function cataloguePublic(catalogue: Produit[] = []): Produit[] {
  const slugs = new Set<string>()
  return catalogue.filter((produit) => {
    const slug = slugProduitPublic(produit.slug || '')
    if (!slug || !produit.fiche || !produit.carte?.visuel || slugs.has(slug)) return false
    slugs.add(slug)
    return true
  }).map((produit) => ({
    ...produit,
    slug: slugProduitPublic(produit.slug),
    ...(produit.lienVers ? { lienVers: slugProduitPublic(produit.lienVers) } : {}),
    fiche: produit.fiche && {
      ...produit.fiche,
      similaires: (produit.fiche.similaires || []).map((similaire) => ({ ...similaire, produit: slugProduitPublic(similaire.produit) })),
    },
  }))
}

export function articlePublic(slug: string, publie?: Article | null): Article | null {
  if (slug === SLUG_ARTICLE_EXCLU || !publie || publie.slug !== slug) return null
  return publie
}

// Toute copie provisoire doit rester accessible, mais hors index et hors balisage Article.
export function texteArticle(article: Pick<Article, 'corps'> | null | undefined): string {
  if (!Array.isArray(article?.corps)) return ''
  return article.corps.flatMap((bloc) => {
    if (bloc._type === 'block') return (bloc.children ?? []).map((span) => span.text ?? '')
    if ('texte' in bloc) return [bloc.texte ?? '']
    return []
  }).join(' ').trim()
}

export function articleComplet(article: Pick<Article, 'titre' | 'corps'> | null | undefined): boolean {
  if (!article?.titre?.trim()) return false
  const textes = texteArticle(article)
  return Boolean(textes) && !/en cours de r[ée]daction|article [àa] venir|contenu [àa] venir/i.test(textes)
}

export function articlesPublicsIndexables(publies: Article[] = []): Article[] {
  const slugs = new Set<string>()
  return publies.filter((article) => {
    if (!article.slug || article.slug === SLUG_ARTICLE_EXCLU || slugs.has(article.slug) || !articleComplet(article)) return false
    slugs.add(article.slug)
    return true
  })
}

export function carteArticle({ corps, intro, auteur, ...carte }: Article): Omit<Article, 'corps' | 'intro' | 'auteur'> {
  return carte
}
