import { createClient } from '@sanity/client'
import { pageAccueil } from '../../content/accueil'
import { articles, type Article } from '../../content/articles'
import { gammes, parametres } from '../../content/commun'
import { pagesLegales } from '../../content/legal'
import * as pages from '../../content/pages'
import { produits, type Produit } from '../../content/produits'
import { realisations } from '../../content/realisations'
import { articlePublic, articlesPublicsIndexables, carteArticle, cataloguePublic, completerContenu } from '../../utils/contenuPublic'
import { normaliserAccueil } from '../../utils/normaliserAccueil'
import { DELAI_CONTENU, requeteContenu, type NomContenu } from '../../utils/requetesContenu'
import { realisationsPubliques } from '../../utils/realisationsPublic'
import { lireAvecCache } from './cacheContenu'

interface ConfigurationContenu {
  contentSource?: string
  sanity: { projectId?: string; dataset?: string; apiVersion?: string }
}

function reference(nom: NomContenu, slug?: string): unknown {
  switch (nom) {
    case 'parametres': return parametres
    case 'gammes': return Object.values(gammes)
    case 'produits': return produits
    case 'realisations': return realisations
    case 'realisation': return realisations.find((item) => item.slug === slug) ?? null
    case 'articles': return articles
    case 'article': return articlePublic(slug!, articles.find((item) => item.slug === slug))
    case 'pageAccueil': return pageAccueil
    case 'pageLegale': return pagesLegales.find((item) => item.slug === slug) ?? null
    default: return pages[nom]
  }
}

function normaliser(nom: NomContenu, valeur: unknown) {
  if (nom === 'produits') return cataloguePublic(valeur as Produit[])
  if (nom === 'realisations') return realisationsPubliques(valeur as typeof realisations)
  if (nom === 'articles') return articlesPublicsIndexables(valeur as Article[])
  return valeur
}

// Seul ce module serveur importe les corps de référence. Ni Contact ni le chunk
// commun du navigateur ne doivent embarquer le catalogue éditorial complet.
export async function lireContenu(config: ConfigurationContenu, nom: NomContenu, slug?: string): Promise<unknown> {
  const lecture = requeteContenu(nom, slug)
  if (!lecture) throw createError({ statusCode: 404, statusMessage: 'Contenu introuvable' })
  const defaut = reference(nom, slug)
  if (config.contentSource === 'reference' || !config.sanity.projectId) return normaliser(nom, defaut)

  const cle = JSON.stringify([config.sanity, lecture.groq, lecture.params])
  let valeur: unknown
  try {
    valeur = await lireAvecCache(cle, async () => {
      // Le cache applicatif fixe la fraîcheur ; pas de seconde fenêtre CDN.
      const client = createClient({ ...config.sanity, projectId: config.sanity.projectId!, perspective: 'published', useCdn: false })
      const resultat = await client.fetch<unknown>(lecture.groq, lecture.params ?? {}, { signal: AbortSignal.timeout(DELAI_CONTENU) })
      const collection = ['gammes', 'produits', 'realisations', 'articles'].includes(nom)
      if (collection ? !Array.isArray(resultat) || resultat.some((item) => !item || typeof item !== 'object' || Array.isArray(item)) : resultat !== null && (typeof resultat !== 'object' || Array.isArray(resultat))) {
        throw new Error('Réponse CMS invalide')
      }
      return resultat
    })
  } catch (cause) {
    throw createError({ statusCode: 503, statusMessage: 'Contenu temporairement indisponible', cause })
  }
  // Un document absent n'est pas une panne : ne jamais lui substituer une fiche locale.
  if (valeur === null) return null
  if (nom === 'produits' || nom === 'articles' || nom === 'realisations') return normaliser(nom, valeur)
  if (nom === 'article') return articlePublic(slug!, valeur as Article)
  if (nom === 'realisation') return valeur
  if (nom === 'gammes') return (valeur as typeof gammes.galileo[]).map((gamme) => {
    const initiale = gammes[gamme.cle]
    return initiale ? { ...gamme, documentation: gamme.documentation || initiale.documentation, ficheTechnique: gamme.ficheTechnique || initiale.ficheTechnique } : gamme
  })
  const complete = completerContenu(valeur, defaut)
  return nom === 'pageAccueil' ? normaliserAccueil(complete as typeof pageAccueil, pageAccueil) : complete
}

export function contenuPourNavigateur(nom: NomContenu, valeur: unknown) {
  return nom === 'articles' ? (valeur as Article[]).map(carteArticle) : valeur
}
