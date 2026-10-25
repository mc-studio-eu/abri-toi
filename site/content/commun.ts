// Contenu de référence, repris des maquettes Figma.
// Il sert de secours tant que Sanity n'est pas configuré (ou qu'un champ y est vide),
// et le script studio/scripts/seed.ts l'importe dans Sanity au premier lancement.

export interface Img {
  src: string
  alt?: string
}

export interface Ancre {
  label: string
  cible: string
  point?: 'orange' | 'sage'
}

export interface Hero {
  titre: string
  chapo?: string
  ancres?: Ancre[]
}

export interface Ligne {
  label: string
  valeur: string
}

export type GammeCle = 'galileo' | 'fotos'

export const parametres = {
  boutonNav: 'Prendre rendez-vous',
  telephone: '06 48 20 52 38',
  email: 'collaborer@abritoi.com',
  adresse: '16 rue Fénelon, 69006 Lyon',
  pitch: 'Des espaces d’ombrage et de fraîcheur qui rassemblent. Conçus à Lyon, fabriqués en France.',
  linkedin: '',
  youtube: '',
  mentions: '© 2026 ABRI TOI SAS · SIREN 992 306 621',
  partenaires: [
    { nom: 'Dargaisse', logo: { src: '/images/logo-dargaisse.png' } as Img, largeur: 136, hauteur: 52 },
    { nom: 'Kebony', logo: { src: '/images/logo-kebony.png' } as Img, largeur: 46, hauteur: 76 },
    { nom: 'Larbaletier', logo: { src: '/images/logo-larbaletier.png' } as Img, largeur: 187, hauteur: 36 },
    { nom: 'B.R.O Brumisation', logo: { src: '/images/logo-bro-brumisation.png' } as Img, largeur: 112, hauteur: 58 },
    { nom: 'Filae', logo: { src: '/images/logo-filae.png' } as Img, largeur: 164, hauteur: 44 },
  ],
  // Bloc orange « Un projet d'ombrage… » en bas de la plupart des pages
  contact: {
    titre: 'Un projet d’ombrage pour votre commune ?',
    texte: 'Parlons de votre site. Nous revenons vers vous sous 48 h avec une première orientation.',
    bouton: 'Prendre rendez-vous',
  },
}

export type Parametres = typeof parametres

export const gammes = {
  galileo: {
    cle: 'galileo' as GammeCle,
    nom: 'Galiléo',
    tag: 'Ombrage et brumisation · 4 teintes',
    labelEspaces: 'Espaces en vis-à-vis · 6 places, 12 m² d’ombre',
    documentation: '',
    reassurance: [
      {
        icone: { src: '/images/icones/eurocodes.svg' } as Img,
        titre: 'Conforme aux Eurocodes',
        texte: 'Les abris Galiléo sont conçus avec une haute exigence et sont tous conformes aux Eurocodes en vigueur.',
      },
      {
        icone: { src: '/images/icones/ombrage.svg' } as Img,
        titre: 'Ombrage effectif pendant +6 heures',
        texte: 'Une large surface d’ombre sur le mobilier pendant une grande partie des journées chaudes d’été.',
      },
      {
        icone: { src: '/images/icones/aluminium-kebony.svg' } as Img,
        titre: 'Aluminium et bois de Kebony',
        texte: 'Un aluminium insensible à la corrosion et un bois à faible impact carbone, alternative au bois exotique.',
      },
    ],
  },
  fotos: {
    cle: 'fotos' as GammeCle,
    nom: 'Fotos',
    tag: 'Ombrage et végétation · teinte brun',
    labelEspaces: 'Espaces en vis-à-vis',
    documentation: '',
    reassurance: [
      {
        icone: { src: '/images/icones/reservoir.svg' } as Img,
        titre: 'Réservoir d’eau pluviale',
        texte: 'Un réservoir de récupération des eaux de pluie peut être intégré en bas de la jardinière.',
      },
      {
        icone: { src: '/images/icones/autostable.svg' } as Img,
        titre: 'Mobilier totalement autostable',
        texte: 'Pas d’ancrage au sol : la masse de la terre suffit à rendre le mobilier stable.',
      },
      {
        icone: { src: '/images/icones/aluminium-kebony.svg' } as Img,
        titre: 'Aluminium et bois de Kebony',
        texte: 'Un aluminium insensible à la corrosion et un bois à faible impact carbone, alternative au bois exotique.',
      },
    ],
  },
}

export type Gamme = (typeof gammes)['galileo']
