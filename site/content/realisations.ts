import type { GammeCle, Img } from './commun'

export interface Realisation {
  nom: string
  gamme: GammeCle
  description: string
  photo: Img
}

const r = (gamme: GammeCle, nom: string, description: string, src: string): Realisation => ({
  nom,
  gamme,
  description,
  photo: { src: `/images/${src}`, alt: nom },
})

// Photos réelles des prototypes Galiléo et Fotos (pas de rendus 3D), en attendant les premières poses.
export const realisations: Realisation[] = [
  r('galileo', 'Galiléo · Banquette brumisée', 'Structure blanche, assise en bois et brumisation sous la toiture.', 'realisations/square-des-tilleuls.jpg'),
  r('fotos', 'Fotos · Banc végétalisé', 'Pergola en aluminium brun, jardinière et assise en bois.', 'bandeau-hover-fotos-premier-banc-installe.jpg'),
  r('galileo', 'Galiléo · Banc brumisé', 'La toiture perforée filtre le soleil, la brume rafraîchit l’air.', 'bandeau-galileo-blanc-banc-brumise.jpg'),
  r('fotos', 'Fotos · Banc et jardinière', 'Les grimpantes montent le long de la pergola.', 'photo-structure-aluminium-brun.jpg'),
  r('galileo', 'Galiléo · Pause à l’ombre', 'Trois places assises sous la toiture, à l’abri du soleil.', 'bandeau-galileo-premiers-usagers.jpg'),
  r('fotos', 'Fotos · Assise en bois', 'Une assise en Kebony adossée à la jardinière.', 'installe-usagers-a-lombre.jpg'),
  r('fotos', 'Fotos · Vue de la pergola', 'La pergola vue d’en bas, avant que la végétation la couvre.', 'photo-la-pergola-vue-den-bas.jpg'),
  r('fotos', 'Fotos · Grimpantes et fleurs', 'La jardinière accueille fleurs et plantes grimpantes.', 'photo-grimpantes-et-fleurs.jpg'),
  r('fotos', 'Fotos · Bois Kebony', 'Assise en bois Kebony et jardinière en aluminium.', 'photo-assise-en-bois-kebony.jpg'),
  r('galileo', 'Galiléo · Détail', 'Assemblage de la structure et de l’assise en bois.', 'fiches/galileo-banc-plan.jpg'),
  r('fotos', 'Fotos · Vue de face', 'Le banc Fotos et sa pergola, de face.', 'image-pill.jpg'),
]
