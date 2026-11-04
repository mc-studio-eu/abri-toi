import type { pageAccueil } from '../content/accueil'

type Accueil = typeof pageAccueil

// Compatibilité avec la version publiée avant le retour Figma du 4 novembre.
// Seules ces anciennes valeurs exactes sont remplacées : les prochaines éditions
// du CMS restent prioritaires, sans écriture distante ni remplacement de page.
const anciennesImages = new Map([
  ['image-b4a8d31b5b6231af0731ea5540c51d418448492a-2000x2000-jpg', '/images/image-pill.jpg'],
  ['image-b29e8a949967c27445cf7d5cddbdcc0bb6a99158-2000x1422-jpg', '/images/image-pill1.jpg'],
  ['image-8f3909e54e4ce77d2b593096e679c12d5bb3ee72-2000x1444-jpg', '/images/image-pill2.jpg'],
])

const ancienManifeste: Accueil['manifeste']['morceaux'] = [
  { texte: 'Chaque été,' },
  { image: { src: '/images/image-pill.jpg' }, largeur: 132 },
  { texte: 'nos villes et espaces extérieurs' },
  { texte: 'sont désertés', accent: true },
  { texte: 'à cause de la canicule.' },
  { image: { src: '/images/image-pill1.jpg' }, largeur: 112 },
  { texte: 'Notre objectif' },
  { image: { src: '/images/image-pill2.jpg' }, largeur: 150 },
  { texte: 'leur' },
  { texte: 'redonner vie.', accent: true },
]

function signatureMorceau(valeur: Accueil['manifeste']['morceaux'][number]): string | undefined {
  const morceau = valeur as typeof valeur & { _type?: string }
  // Les anciens objets Sanity ont parfois gardé les champs de l’autre type.
  if ((morceau._type ? morceau._type === 'morceauTexte' : 'texte' in morceau) && 'texte' in morceau) {
    return JSON.stringify(['texte', morceau.texte, Boolean(morceau.accent)])
  }
  if (!('image' in morceau)) return undefined
  const image = morceau.image as { src?: string; asset?: { _ref: string }; alt?: string; crop?: unknown; hotspot?: unknown } | null
  if (!image) return undefined
  const source = image.src || anciennesImages.get(image.asset?._ref || '')
  if (!source) return undefined
  return JSON.stringify(['image', source, morceau.largeur, image.alt || '', image.crop ?? null, image.hotspot ?? null])
}

export function normaliserAccueil(contenu: Accueil, reference: Accueil): Accueil {
  const morceaux = contenu.manifeste.morceaux
  const manifesteAncien = morceaux.length === ancienManifeste.length &&
    morceaux.every((morceau, index) => signatureMorceau(morceau) === signatureMorceau(ancienManifeste[index]!))
  const ancienTexteChaleur = 'La chaleur accroît la sédentarité en intérieur, la fréquentation des espaces climatisés et réduit le lien social.'
  const ancienTexteAncrage = 'Fixé sur une dalle béton ou longrine. Option brumisation nécessitant un raccord à l’eau potable.'

  return {
    ...contenu,
    manifeste: manifesteAncien
      ? { ...contenu.manifeste, morceaux: reference.manifeste.morceaux }
      : contenu.manifeste,
    probleme: contenu.probleme.texte === ancienTexteChaleur
      ? { ...contenu.probleme, texte: reference.probleme.texte }
      : contenu.probleme,
    solution: {
      ...contenu.solution,
      galileo: {
        ...contenu.solution.galileo,
        etapes: contenu.solution.galileo.etapes.map((etape) =>
          etape.titre === 'Installation fixe. Ancrage au sol.' && etape.texte === ancienTexteAncrage
            ? { ...etape, texte: reference.solution.galileo.etapes[1]!.texte }
            : etape,
        ),
      },
    },
  }
}
