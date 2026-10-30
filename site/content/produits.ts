import type { GammeCle, Img, Ligne } from './commun'

export interface Similaire {
  titre: string
  description: string
  // Slug du produit visé ; son visuel de carte et sa fiche sont repris automatiquement.
  produit: string
}

export interface Produit {
  slug: string
  nom: string
  gamme: GammeCle
  categorie: 'modele' | 'espace'
  carte: { description: string; visuel: Img }
  // Espaces : fiche produit vers laquelle pointe la carte (ils n'ont pas de fiche propre).
  lienVers?: string
  fiche?: {
    titre: string
    sousTitre: string
    description: string
    galerie: Img[]
    caracteristiques: Ligne[]
    similaires: Similaire[]
  }
}

const v = (fichier: string): Img => ({ src: `/images/produits/${fichier}.jpg` })
const f = (fichier: string): Img => ({ src: `/images/fiches/${fichier}.jpg` })

// Repris des fiches techniques Abri Toi (octobre 2026)
const structure = { label: 'Structure', valeur: 'Tube aluminium 6060T6 thermolaqué, finition texture fine, coloris RAL sur demande' }
const toiture = { label: 'Toiture', valeur: 'Tôle d’aluminium perforée, brute et vibrée' }
const normes = { label: 'Normes', valeur: 'Conforme aux Eurocodes' }
const ancrage = { label: 'Fixation au sol', valeur: 'Chevilles d’ancrage, sur dalle ou longrine béton' }
const autostable = { label: 'Fixation au sol', valeur: 'Aucune : installation autostable, sur sol plan ou en pleine terre' }
const jardiniere = { label: 'Jardinière', valeur: 'Tôle d’aluminium thermolaquée ou brute vibrée' }
const eauxPluviales = { label: 'Option', valeur: 'Toile de récupération des eaux pluviales' }
const entretien = { label: 'Entretien', valeur: 'Bois : nettoyage doux ou brossage à sec une fois par mois' }
const entretienBrume = {
  label: 'Entretien',
  valeur: 'Bois : nettoyage doux ou brossage à sec une fois par mois. Brumisation : maintenance avant et après l’été',
}
const garanties = { label: 'Garanties', valeur: 'Bois Kebony 30 ans · structure aluminium 5 ans' }
const garantiesBrume = { label: 'Garanties', valeur: 'Bois Kebony 30 ans · structure aluminium 5 ans · brumisation 2 ans' }
const kebony = (pieces: string) => ({ label: pieces, valeur: 'Bois Kebony Clear FSC / PEFC (classe 4)' })

export const produits: Produit[] = [
  {
    slug: 'banquette-galileo',
    nom: 'Banquette',
    gamme: 'galileo',
    categorie: 'modele',
    carte: {
      description: 'Une assise à l’ombre, brumisée en option, pour une pause dans l’espace public.',
      visuel: v('galileo-banquette'),
    },
    fiche: {
      titre: 'Banquette Galiléo',
      sousTitre: 'Brumisation et végétation en option',
      description:
        'Un abri-banquette inspiré des torii japonais, avec une brumisation qui rafraîchit l’espace alentour. Pensé pour une pause courte et spontanée dans l’espace public.',
      galerie: [v('espace-echange'), f('galileo-banquette-2'), f('galileo-banquette-3'), f('galileo-banquette-plan')],
      caracteristiques: [
        { label: 'Référence', valeur: 'AT_GAL10' },
        { label: 'Déclinaisons', valeur: 'AT_GAL10_VEGE (végétation) · AT_GAL10_BRO_VEGE (brumisation et végétation)' },
        { label: 'Emprise au sol', valeur: '175 × 89 cm' },
        { label: 'Hauteur', valeur: '240 cm' },
        { label: 'Masse', valeur: '130 kg' },
        { label: 'Capacité', valeur: '3 personnes' },
        { label: 'Surface d’ombrage', valeur: '6 m²' },
        kebony('Assise'),
        { label: 'Brumisation', valeur: 'Option · 6 buses sur les montants verticaux, raccord à l’eau et à l’électricité' },
        { label: 'Végétation', valeur: 'Option · filet de pêche recyclé Filae ou câbles inox' },
        structure,
        toiture,
        ancrage,
        normes,
        garantiesBrume,
        entretienBrume,
      ],
      similaires: [
        { titre: 'Table / Gradin', description: 'La version table d’appoint ou gradin, sous la même toiture.', produit: 'table-gradin-galileo' },
        {
          titre: 'Banc végétalisé',
          description: 'Le banc Galiléo avec brumisation et végétation grimpante à l’arrière.',
          produit: 'banc-galileo',
        },
        {
          titre: 'Espace Récréation',
          description: 'Deux modules en vis-à-vis : 12 m² d’ombre pour les cours d’école.',
          produit: 'espace-recreation',
        },
      ],
    },
  },
  {
    slug: 'banc-galileo',
    nom: 'Banc',
    gamme: 'galileo',
    categorie: 'modele',
    carte: {
      description: 'Un banc avec dossier sous ombrière, brumisée en option, pour les places et les cours d’école.',
      visuel: v('galileo-banc'),
    },
    fiche: {
      titre: 'Banc Galiléo',
      sousTitre: 'Végétalisé, avec brumisation',
      description:
        'Un banc en alcôve inspiré des torii japonais : une posture enveloppante, un dossier rassurant et une toiture qui fait de l’ombre aux heures les plus chaudes.',
      galerie: [v('espace-salon'), f('galileo-banc-2'), f('galileo-banc-3'), f('galileo-banc-plan')],
      caracteristiques: [
        { label: 'Référence', valeur: 'AT_GAL10_DOS' },
        {
          label: 'Déclinaisons',
          valeur: 'AT_GAL10_DOS_VEGE (végétation) · AT_GAL10_DOS_BRO_VEGE (brumisation et végétation)',
        },
        structure,
        kebony('Assise et dossier'),
        { label: 'Toiture', valeur: 'Tôle d’aluminium perforée, brute et vibrée, 6 m²' },
        { label: 'Brumisation', valeur: 'Option · 6 buses sur les montants verticaux, raccord à l’eau et à l’électricité' },
        { label: 'Végétation', valeur: 'Option · grimpantes à l’arrière de l’assise, filet de pêche recyclé Filae ou câbles inox' },
        ancrage,
        normes,
        garantiesBrume,
        entretienBrume,
      ],
      similaires: [
        {
          titre: 'Table / Gradin',
          description: 'Une table d’appoint ou un gradin à l’ombre, pour déjeuner ou faire classe dehors.',
          produit: 'table-gradin-galileo',
        },
        {
          titre: 'Banquette',
          description: 'La banquette Galiléo, sans dossier, brumisée en option.',
          produit: 'banquette-galileo',
        },
        {
          titre: 'Espace Récréation',
          description: 'Deux gradins en vis-à-vis : 12 m² d’ombre pour les cours d’école.',
          produit: 'espace-recreation',
        },
      ],
    },
  },
  {
    slug: 'table-gradin-galileo',
    nom: 'Table / Gradin',
    gamme: 'galileo',
    categorie: 'modele',
    carte: {
      description: 'Une table ou un gradin à l’ombre, pour déjeuner, travailler ou faire classe dehors.',
      visuel: v('galileo-table-gradin'),
    },
    fiche: {
      titre: 'Table / Gradin',
      sousTitre: 'Galiléo · table d’appoint ou gradin',
      description:
        'Une table d’appoint inspirée des torii japonais, qui sert aussi de gradin. Assez large pour un pique-nique à trois ou pour travailler dehors.',
      galerie: [
        v('galileo-table-gradin'),
        f('galileo-table-gradin-2'),
        f('galileo-table-gradin-3'),
        f('galileo-table-gradin-plan'),
      ],
      caracteristiques: [
        { label: 'Référence', valeur: 'AT_GAL10_TAB' },
        { label: 'Emprise au sol', valeur: '175 × 89 cm' },
        { label: 'Hauteur', valeur: '240 cm' },
        { label: 'Masse', valeur: '130 kg' },
        { label: 'Capacité', valeur: '3 personnes' },
        { label: 'Surface d’ombrage', valeur: '6 m²' },
        kebony('Assise et table'),
        structure,
        toiture,
        ancrage,
        normes,
        garanties,
        entretien,
      ],
      similaires: [
        { titre: 'Banc', description: 'Le banc Galiléo, pour les places et les cours d’école.', produit: 'banc-galileo' },
        {
          titre: 'Banquette',
          description: 'Une assise à l’ombre, brumisée en option.',
          produit: 'banquette-galileo',
        },
        {
          titre: 'Espace Banquet',
          description: 'Deux tables en vis-à-vis : 12 m² d’ombre pour déjeuner à six.',
          produit: 'espace-banquet',
        },
      ],
    },
  },
  {
    slug: 'espace-echange',
    nom: 'Échange',
    gamme: 'galileo',
    categorie: 'espace',
    lienVers: 'banquette-galileo',
    carte: {
      description: 'Deux banquettes en vis-à-vis : jusqu’à 8 personnes et 12 m² d’ombre brumisée pour se retrouver.',
      visuel: v('espace-echange'),
    },
  },
  {
    slug: 'espace-salon',
    nom: 'Salon',
    gamme: 'galileo',
    categorie: 'espace',
    lienVers: 'banc-galileo',
    carte: {
      description: 'Deux bancs face à face pour un coin salon à l’ombre, au cœur de la place.',
      visuel: v('espace-salon'),
    },
  },
  {
    slug: 'espace-banquet',
    nom: 'Banquet',
    gamme: 'galileo',
    categorie: 'espace',
    lienVers: 'table-gradin-galileo',
    carte: {
      description: 'Deux tables en vis-à-vis pour déjeuner à six, à l’ombre et au frais.',
      visuel: v('espace-banquet'),
    },
  },
  {
    slug: 'espace-recreation',
    nom: 'Récréation',
    gamme: 'galileo',
    categorie: 'espace',
    lienVers: 'table-gradin-galileo',
    carte: {
      description: 'Deux gradins en vis-à-vis : 12 m² d’ombre pour les cours d’école.',
      visuel: v('espace-recreation'),
    },
  },
  {
    slug: 'banc-fotos',
    nom: 'Banc',
    gamme: 'fotos',
    categorie: 'modele',
    carte: {
      description: 'Un banc sous une arche végétale, avec son bac de terre et sa réserve d’eau de pluie.',
      visuel: v('fotos-banc'),
    },
    fiche: {
      titre: 'Banc Fotos',
      sousTitre: 'Un îlot de verdure, sans ancrage',
      description:
        'Une assise inspirée des pergolas méditerranéennes, pensée comme un îlot de verdure dans l’espace public : pour une pause, un échange ou un moment de détente.',
      galerie: [v('fotos-banc'), f('fotos-banc-2'), f('fotos-banc-3'), f('fotos-banc-plan')],
      caracteristiques: [
        { label: 'Référence', valeur: 'AT_FOT10_D (déplaçable)' },
        { label: 'Déclinaison', valeur: 'AT_FOT10_D_ACC (avec accoudoirs en aluminium thermolaqué)' },
        { label: 'Emprise au sol', valeur: '95 × 159 cm' },
        { label: 'Hauteur', valeur: '250 cm' },
        { label: 'Masse', valeur: '180 kg (sans terre)' },
        { label: 'Surface d’ombrage', valeur: '6 m²' },
        structure,
        jardiniere,
        kebony('Assise et dossier'),
        { label: 'Toiture', valeur: 'Végétalisée, charpente ajourée pour plantes grimpantes' },
        eauxPluviales,
        autostable,
        garanties,
        entretien,
      ],
      similaires: [
        { titre: 'Table', description: 'La table d’appoint Fotos, sous la même pergola végétale.', produit: 'table-fotos' },
        {
          titre: 'Espace Séquoia',
          description: 'Deux modules Fotos en vis-à-vis : un îlot de verdure.',
          produit: 'espace-sequoia',
        },
        {
          titre: 'Espace Babylone',
          description: 'Une arche végétale formée par deux modules Fotos.',
          produit: 'espace-babylone',
        },
      ],
    },
  },
  {
    slug: 'table-fotos',
    nom: 'Table',
    gamme: 'fotos',
    categorie: 'modele',
    carte: {
      description: 'Une table à l’ombre des grimpantes, déplaçable au chariot élévateur.',
      visuel: v('fotos-table'),
    },
    fiche: {
      titre: 'Table Fotos',
      sousTitre: 'Une table de jardin sous pergola végétale',
      description:
        'Une table de jardin ombragée, inspirée des pergolas méditerranéennes : un point de repos vert dans l’espace public.',
      galerie: [v('fotos-table'), f('fotos-table-2'), f('fotos-table-3'), f('fotos-table-plan')],
      caracteristiques: [
        { label: 'Référence', valeur: 'AT_FOT10_D_TAB (déplaçable)' },
        { label: 'Emprise au sol', valeur: '160 × 159 cm' },
        { label: 'Hauteur', valeur: '250 cm' },
        { label: 'Masse', valeur: '220 kg (sans terre)' },
        { label: 'Surface d’ombrage', valeur: '6 m²' },
        structure,
        jardiniere,
        kebony('Assise, dossier et table'),
        { label: 'Toiture', valeur: 'Végétalisée, charpente ajourée pour plantes grimpantes' },
        eauxPluviales,
        autostable,
        garanties,
        entretien,
      ],
      similaires: [
        { titre: 'Banc', description: 'Le banc Fotos, un îlot de verdure pour faire une pause.', produit: 'banc-fotos' },
        {
          titre: 'Espace Pique-nique',
          description: 'Deux tables Fotos en vis-à-vis : une table de 6 places à l’ombre.',
          produit: 'espace-pique-nique',
        },
        {
          titre: 'Table / Gradin',
          description: 'La version Galiléo, ancrée au sol, avec une toiture perforée.',
          produit: 'table-gradin-galileo',
        },
      ],
    },
  },
  {
    slug: 'espace-sequoia',
    nom: 'Séquoia',
    gamme: 'fotos',
    categorie: 'espace',
    lienVers: 'banc-fotos',
    carte: { description: 'Un îlot de verdure où l’on s’assoit à l’ombre des grimpantes.', visuel: v('espace-sequoia') },
  },
  {
    slug: 'espace-babylone',
    nom: 'Babylone',
    gamme: 'fotos',
    categorie: 'espace',
    lienVers: 'banc-fotos',
    carte: {
      description: 'Une arche végétale qui relie deux modules et crée un passage ombragé.',
      visuel: v('espace-babylone'),
    },
  },
  {
    slug: 'espace-pique-nique',
    nom: 'Pique-nique',
    gamme: 'fotos',
    categorie: 'espace',
    lienVers: 'table-fotos',
    carte: {
      description: 'Une table de 6 places sous la végétation, pour manger dehors à l’ombre.',
      visuel: v('espace-pique-nique'),
    },
  },
]
