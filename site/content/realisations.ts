import type { GammeCle, Img } from './commun'

export type TypeLieu = 'collectivite' | 'ecole' | 'entreprise' | 'particulier'

export interface Realisation {
  nom: string
  gamme: GammeCle
  typeLieu: TypeLieu
  description: string
  photo: Img
}

export const typesLieu: { cle: TypeLieu; label: string }[] = [
  { cle: 'collectivite', label: 'Collectivités' },
  { cle: 'ecole', label: 'Écoles' },
  { cle: 'entreprise', label: 'Entreprises' },
  { cle: 'particulier', label: 'Particuliers' },
]

// Projets fictifs de la maquette : à remplacer dans Sanity par les vraies réalisations.
export const realisations: Realisation[] = [
  {
    nom: 'Square des Tilleuls',
    gamme: 'galileo',
    typeLieu: 'collectivite',
    description: 'Deux Banquettes brumisées face à l’aire de jeux.',
    photo: { src: '/images/fiches/galileo-banquette-3.jpg' },
  },
  {
    nom: 'Cour de l’école des Platanes',
    gamme: 'fotos',
    typeLieu: 'ecole',
    description: 'Un Banc Fotos végétalisé, à l’ombre de la glycine.',
    photo: { src: '/images/photo-structure-aluminium-brun.jpg' },
  },
  {
    nom: 'Campus Les Érables',
    gamme: 'galileo',
    typeLieu: 'entreprise',
    description: 'Une Table / Gradin pour déjeuner dehors en équipe.',
    photo: { src: '/images/image-pill2.jpg' },
  },
  {
    nom: 'Place du Marché',
    gamme: 'galileo',
    typeLieu: 'collectivite',
    description: 'Un salon brumisé au cœur du marché du samedi.',
    photo: { src: '/images/image-pill1.jpg' },
  },
  {
    nom: 'Jardin partagé du Rondeau',
    gamme: 'fotos',
    typeLieu: 'collectivite',
    description: 'Une pergola Fotos où grimpent jasmin et houblon.',
    photo: { src: '/images/photo-grimpantes-et-fleurs.jpg' },
  },
  {
    nom: 'Résidence Les Charmilles',
    gamme: 'fotos',
    typeLieu: 'collectivite',
    description: 'Un banc à l’ombre pour la promenade des résidents.',
    photo: { src: '/images/bandeau-hover-fotos-premier-banc-installe.jpg' },
  },
  {
    nom: 'Terrasse Le Comptoir',
    gamme: 'galileo',
    typeLieu: 'entreprise',
    description: 'Une banquette brumisée pour la terrasse d’été.',
    photo: { src: '/images/fiches/galileo-banquette-plan.jpg' },
  },
  {
    nom: 'Base de loisirs',
    gamme: 'fotos',
    typeLieu: 'collectivite',
    description: 'Trois Tables Fotos en pique-nique au bord du lac.',
    photo: { src: '/images/photo-la-pergola-vue-den-bas.jpg' },
  },
  {
    nom: 'Jardin privé',
    gamme: 'fotos',
    typeLieu: 'particulier',
    description: 'Un Banc Fotos en fond de jardin, à l’abri des regards.',
    photo: { src: '/images/installe-usagers-a-lombre.jpg' },
  },
]
