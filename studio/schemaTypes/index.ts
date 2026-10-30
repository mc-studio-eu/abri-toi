import { article, demande, gamme, pageLegale, parametres, produit, realisation } from './documents/collections'
import {
  ficheProduit,
  pageAccueil,
  pageAPropos,
  pageArticles,
  pageContact,
  pageProduits,
  pageRealisations,
} from './pages/pages'

export const schemaTypes = [
  parametres,
  pageAccueil,
  pageProduits,
  ficheProduit,
  pageRealisations,
  pageAPropos,
  pageArticles,
  pageContact,
  gamme,
  produit,
  realisation,
  article,
  pageLegale,
  demande,
]

// Documents uniques : une seule instance, ouverte directement depuis le menu
export const SINGLETONS = [
  'parametres',
  'pageAccueil',
  'pageProduits',
  'ficheProduit',
  'pageRealisations',
  'pageAPropos',
  'pageArticles',
  'pageContact',
]
