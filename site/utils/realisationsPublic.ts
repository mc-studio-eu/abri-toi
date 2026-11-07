import type { Realisation } from '../content/realisations'

export const FILTRE_REALISATIONS = `_type == "realisation" && !(_id in path("drafts.**")) && defined(slug.current) && slug.current != ""`
export const CHAMPS_REALISATION = `_id, "slug": slug.current, nom, gamme, description, photo, titre, nomProjet, infos[]{ _key, label, valeur }, galerie, contenu`
export const REQUETE_REALISATIONS = `*[${FILTRE_REALISATIONS}] | order(ordre asc, nom asc){ ${CHAMPS_REALISATION} }`
export const REQUETE_REALISATION = `*[${FILTRE_REALISATIONS} && slug.current == $slug][0]{ ${CHAMPS_REALISATION} }`

// Une collection publiée vide reste vide ; le secours sert uniquement si le CMS ne répond pas.
export function realisationsPubliques(collection: Realisation[] = []): Realisation[] {
  const slugs = new Set<string>()
  return collection.filter((realisation) => {
    if (!realisation.slug || realisation._id?.startsWith('drafts.') || slugs.has(realisation.slug)) return false
    slugs.add(realisation.slug)
    return true
  })
}
