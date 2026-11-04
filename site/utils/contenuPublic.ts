import { articles, type Article } from '../content/articles'
import { produits, type Produit } from '../content/produits'

export const SLUG_ARTICLE_EXCLU = 'financer-ombrage-espaces-publics'
export const FILTRE_ARTICLES = `_type == "article" && !(_id in path("drafts.**")) && defined(slug.current) && slug.current != "${SLUG_ARTICLE_EXCLU}"`
export const CHAMPS_ARTICLE = `"slug": slug.current, titre, categorie, tempsLecture, date, extrait, couverture, couvertureFond, couvertureInset`
export const CHAMPS_ARTICLE_COMPLET = `${CHAMPS_ARTICLE}, illustration, legendeIllustration, auteur, intro, corps`
export const REQUETE_ARTICLES = `*[${FILTRE_ARTICLES}] | order(date desc){ ${CHAMPS_ARTICLE} }`
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
    for (const [cle, valeur] of Object.entries(defaut)) resultat[cle] = completerContenu(resultat[cle], valeur)
    return resultat as T
  }
  return contenu
}

export function cataloguePublic(catalogue: Produit[] = produits): Produit[] {
  // Les anciennes données liaient les espaces à un modèle et mélangeaient leurs variantes.
  const ancienCatalogue = catalogue.some((p) => Boolean(p.lienVers))
  const references = produits.map((reference) => {
    const publie = catalogue.find((p) => p.slug === reference.slug)
    return ancienCatalogue || !publie?.fiche || !publie.carte?.visuel ? reference : publie
  })
  return [...references, ...catalogue.filter((p) => !produits.some((r) => r.slug === p.slug) && p.fiche && p.carte?.visuel)]
}

export function articlePublic(slug: string, publie?: Article | null): Article | null {
  if (slug === SLUG_ARTICLE_EXCLU) return null
  return completerContenu(publie, articles.find((a) => a.slug === slug) ?? null)
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
  // Une fiche locale reste effectivement servie lorsque le document Sanity est absent.
  const slugs = new Set([...articles.map((a) => a.slug), ...publies.map((a) => a.slug)])
  return [...slugs].flatMap((slug) => {
    const article = articlePublic(slug, publies.find((a) => a.slug === slug))
    return article && articleComplet(article) ? [article] : []
  })
}
