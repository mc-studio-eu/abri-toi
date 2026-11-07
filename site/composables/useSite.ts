// Les références éditoriales sont résolues côté serveur ; ici seuls leurs types
// sont importés pour ne pas embarquer tous les corps dans le JS commun.
import type { pageAccueil } from '~/content/accueil'
import type { Article } from '~/content/articles'
import type { gammes, parametres } from '~/content/commun'
import type { PageLegale } from '~/content/legal'
import type { ficheProduit, pageAPropos, pageArticles, pageContact, pageProduits, pageRealisations } from '~/content/pages'
import type { Produit } from '~/content/produits'
import type { Realisation } from '~/content/realisations'

export const useParametres = () => useContenu<typeof parametres>('parametres')

export async function useGammes() {
  const data = await useContenu<(typeof gammes.galileo)[]>('gammes')
  return computed(() => Object.fromEntries(data.value.filter((gamme) => ['galileo', 'fotos'].includes(gamme.cle)).map((gamme) => [gamme.cle, gamme])) as Partial<typeof gammes>)
}

export const useProduits = () => useContenu<Produit[]>('produits')
export const lienProduit = (p?: Pick<Produit, 'slug'>) => p ? `/produits/${p.slug}` : '/produits'
export const useRealisations = () => useContenu<Realisation[]>('realisations')
export const useRealisation = (slug: string) => useContenu<Realisation | null>('realisation', slug)
export const lienRealisation = (realisation?: Pick<Realisation, 'slug'>) =>
  realisation?.slug ? `/realisations/${encodeURIComponent(realisation.slug)}` : '/realisations'
export const useArticles = () => useContenu<Omit<Article, 'corps' | 'intro' | 'auteur'>[]>('articles')
export const useArticle = (slug: string) => useContenu<Article | null>('article', slug)
export const usePageAccueil = () => useContenu<typeof pageAccueil>('pageAccueil')
export const usePageProduits = () => useContenu<typeof pageProduits>('pageProduits')
export const useFicheProduit = () => useContenu<typeof ficheProduit>('ficheProduit')
export const usePageRealisations = () => useContenu<typeof pageRealisations>('pageRealisations')
export const usePageAPropos = () => useContenu<typeof pageAPropos>('pageAPropos')
export const usePageArticles = () => useContenu<typeof pageArticles>('pageArticles')
export const usePageContact = () => useContenu<typeof pageContact>('pageContact')
export const usePageLegale = (slug: string) => useContenu<PageLegale | null>('pageLegale', slug)
export const labelCategorie = (cle: string) =>
  ({ collectivites: 'Collectivités', sante: 'Santé', conception: 'Conception', vegetation: 'Végétation' })[cle] ?? cle
export const dateLongue = (iso: string) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
