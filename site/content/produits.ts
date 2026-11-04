import type { GammeCle, Img, Ligne } from './commun'

export interface Similaire {
  titre: string
  description: string
  visuel?: Img
  variante?: 'sans-brumisation'
  produit: string
}

export interface Produit {
  slug: string
  nom: string
  gamme: GammeCle
  categorie: 'modele' | 'espace'
  carte: { description: string; visuel: Img }
  // Ancien lien Sanity : conservé pour reconnaître les espaces à migrer.
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

// Une image est affectée à la configuration qu’elle représente réellement.
const v = (fichier: string, alt: string): Img => ({ src: `/images/figma-products/${fichier}.png`, alt })
const structure: Ligne = { label: 'Structure', valeur: 'Tube aluminium 6060T6 thermolaqué, finition texture fine, coloris RAL sur demande' }
const toiture: Ligne = { label: 'Toiture', valeur: 'Tôle d’aluminium perforée, brute et vibrée' }
const normes: Ligne = { label: 'Normes', valeur: 'Conforme aux Eurocodes' }
const ancrage: Ligne = { label: 'Fixation au sol', valeur: 'Chevilles d’ancrage, sur dalle ou longrine béton' }
const autostable: Ligne = { label: 'Fixation au sol', valeur: 'Sans ancrage, jardinière remplie de terre. Installation sur sol plan, selon la configuration choisie' }
const jardiniere: Ligne = { label: 'Jardinière', valeur: 'Tôle d’aluminium thermolaquée ou brute vibrée' }
const eauxPluviales: Ligne = { label: 'Gestion de l’eau', valeur: 'Réservoir intégré à la jardinière de la version déplaçable ; toile de récupération des eaux pluviales en option. Version pleine terre adaptée au sol naturel' }
const entretien: Ligne = { label: 'Entretien', valeur: 'Bois : nettoyage doux ou brossage à sec mensuel' }
const entretienBrume: Ligne = { label: 'Entretien', valeur: 'Bois : nettoyage doux ou brossage à sec mensuel. Brumisation : maintenance avant et après l’été' }
const garanties: Ligne = { label: 'Garanties', valeur: 'Bois Kebony : 30 ans contre champignons et pourriture ; structure aluminium : 5 ans, selon les conditions de garantie' }
const garantiesOption: Ligne = { label: 'Garantie de l’option brumisation', valeur: '2 ans si le système est installé, selon les conditions de garantie' }
const brumeOption: Ligne = { label: 'Brumisation', valeur: 'En option, avec raccordement à l’eau et à l’électricité' }
const vegetationOption: Ligne = { label: 'Végétation', valeur: 'En option, avec support en filet de pêche recyclé Filae ou câbles inox' }
const kebony = (pieces: string): Ligne => ({ label: pieces, valeur: 'Bois Kebony Clear FSC / PEFC (classe 4)' })
// Dimensions lues sur les plans des fiches techniques livrées avec le site.
const dimensionsGalileo: Ligne[] = [
  { label: 'Structure au sol', valeur: '174 × 89 cm (largeur × profondeur)' },
  { label: 'Toiture', valeur: '286,2 × 197,8 cm (largeur × profondeur), aluminium perforé brut et vibré' },
  { label: 'Hauteur totale', valeur: '243,2 cm' },
  { label: 'Surface d’ombrage', valeur: '6 m² par module ; implantation à définir par l’étude d’ensoleillement' },
]
const baseGalileo = (pieces: string): Ligne[] => [structure, kebony(pieces), ancrage, normes, garanties]
const optionsGalileo: Ligne[] = [brumeOption, vegetationOption, garantiesOption, { label: 'Entretien', valeur: 'Bois : nettoyage doux ou brossage à sec mensuel. Si brumisation : maintenance avant et après l’été' }]
const baseFotos = (pieces: string): Ligne[] => [
  structure, jardiniere, kebony(pieces),
  { label: 'Ombrage', valeur: 'Plantes grimpantes sur la charpente ; densité d’ombre selon la croissance et l’implantation' },
  eauxPluviales, autostable,
  { label: 'Implantation', valeur: 'Version déplaçable sur sol artificiel ; version fixe en pleine terre. Déplacement au chariot élévateur pour la version déplaçable' },
  garanties, entretien,
]
const implantation: Ligne = { label: 'Dimensions de l’ensemble', valeur: 'À définir selon l’écartement des modules et le site d’implantation' }
const similaire = (produit: string, titre: string, description: string): Similaire => ({ produit, titre, description })

export const produits: Produit[] = [
  {
    slug: 'banquette-galileo', nom: 'Banquette', gamme: 'galileo', categorie: 'modele',
    carte: {
      description: 'Une banquette sans dossier sous une toiture d’ombrage. Brumisation et végétation en option.',
      visuel: v('cfb10', 'Banquette Galiléo sans dossier, structure verte, sans brumisation'),
    },
    fiche: {
      titre: 'Banquette Galiléo', sousTitre: 'Une assise sans dossier à l’ombre',
      description: 'Une banquette sans dossier sous une toiture en aluminium perforé, pour une pause dans l’espace public. Le modèle présenté est sans brumisation et sans végétation ; ces équipements sont disponibles en option.',
      galerie: [v('cfb10', 'Banquette Galiléo sans dossier, structure verte, sans brumisation')],
      caracteristiques: [{ label: 'Référence', valeur: 'AT_GAL10' }, ...dimensionsGalileo, ...baseGalileo('Assise'), ...optionsGalileo],
      similaires: [
        similaire('espace-echange', 'Échange', 'La configuration avec brumisation, sur une banquette sans dossier.'),
        similaire('banc-galileo', 'Banc', 'Une assise avec dossier sous une toiture Galiléo.'),
        similaire('table-gradin-galileo', 'Table / Gradin', 'Un module avec table pour déjeuner ou travailler dehors.'),
      ],
    },
  },
  {
    slug: 'banc-galileo', nom: 'Banc', gamme: 'galileo', categorie: 'modele',
    carte: {
      description: 'Un banc avec dossier sous une toiture d’ombrage. Brumisation et végétation en option.',
      visuel: v('46842', 'Banc Galiléo avec dossier, structure orange, sans brumisation ni végétation'),
    },
    fiche: {
      titre: 'Banc Galiléo', sousTitre: 'Une assise avec dossier à l’ombre',
      description: 'Un banc avec dossier et une toiture en aluminium perforé pour s’installer à l’ombre. Le modèle présenté est sans brumisation et sans végétation ; ces équipements sont disponibles en option.',
      galerie: [
        v('46842', 'Banc Galiléo avec dossier, structure orange, sans brumisation ni végétation'),
        v('7150e', 'Banc Galiléo avec dossier dans une autre teinte, sans brumisation ni végétation'),
        v('d40d8', 'Détail de l’assise en bois et de la structure du banc Galiléo'),
      ],
      caracteristiques: [{ label: 'Référence', valeur: 'AT_GAL10_DOS' }, ...dimensionsGalileo, ...baseGalileo('Assise et dossier'), ...optionsGalileo],
      similaires: [
        similaire('espace-salon', 'Salon', 'Le banc avec végétation et brumisation.'),
        similaire('banquette-galileo', 'Banquette', 'Une assise sans dossier sous une toiture Galiléo.'),
        similaire('espace-recreation', 'Récréation', 'Deux modules table / gradin en vis-à-vis.'),
      ],
    },
  },
  {
    slug: 'table-gradin-galileo', nom: 'Table / Gradin', gamme: 'galileo', categorie: 'modele',
    carte: {
      description: 'Une assise et une table sous une toiture d’ombrage, pour déjeuner, travailler ou faire classe dehors.',
      visuel: v('2838e', 'Table / Gradin Galiléo, un module bleu avec assise et table'),
    },
    fiche: {
      titre: 'Table / Gradin Galiléo', sousTitre: 'Une assise et une table à l’ombre',
      description: 'Un module Galiléo associant une assise et une table sous une toiture en aluminium perforé. Il permet de déjeuner, de travailler dehors ou de former un gradin selon l’usage choisi.',
      galerie: [
        v('2838e', 'Table / Gradin Galiléo, un module bleu avec assise et table'),
        v('971d0', 'Table / Gradin Galiléo bleu vu de face'),
        v('16a08', 'Table / Gradin Galiléo bleu vu de côté'),
        v('a2fce', 'Table / Gradin Galiléo bleu vu du dessus'),
      ],
      caracteristiques: [{ label: 'Référence', valeur: 'AT_GAL10_TAB' }, ...dimensionsGalileo, ...baseGalileo('Assise et table'), brumeOption, garantiesOption, { label: 'Entretien', valeur: 'Bois : nettoyage doux ou brossage à sec mensuel. Si brumisation : maintenance avant et après l’été' }],
      similaires: [
        similaire('espace-banquet', 'Banquet', 'Deux modules table / gradin en vis-à-vis pour partager un repas.'),
        similaire('espace-recreation', 'Récréation', 'Deux modules table / gradin pour se réunir dehors.'),
        similaire('banquette-galileo', 'Banquette', 'Une assise sans dossier, sans table, à l’ombre.'),
      ],
    },
  },
  {
    slug: 'espace-echange', nom: 'Échange', gamme: 'galileo', categorie: 'espace',
    carte: {
      description: 'Une banquette sans dossier avec brumisation, pour une pause à l’ombre et au frais.',
      visuel: v('659dd', 'Échange : une banquette Galiléo rouge sans dossier avec brumisation'),
    },
    fiche: {
      titre: 'Échange Galiléo', sousTitre: 'Une banquette avec brumisation',
      description: 'La configuration Échange associe une banquette Galiléo sans dossier et une brumisation. Un seul module est présenté : une assise ouverte pour faire une pause à l’ombre et profiter de la fraîcheur de la brume. La végétation peut compléter l’installation.',
      galerie: [v('659dd', 'Échange : une banquette Galiléo rouge sans dossier avec brumisation'), v('15185', 'Banquette Galiléo rouge brumisée vue de face')],
      caracteristiques: [
        { label: 'Composition', valeur: 'Une banquette Galiléo sans dossier, avec brumisation' },
        ...dimensionsGalileo, ...baseGalileo('Assise'),
        { label: 'Brumisation', valeur: 'Présente sur le modèle illustré ; raccordement à l’eau et à l’électricité nécessaire' },
        vegetationOption, { label: 'Garantie brumisation', valeur: '2 ans, selon les conditions de garantie' }, entretienBrume,
      ],
      similaires: [similaire('banquette-galileo', 'Banquette', 'La banquette sans brumisation.'), similaire('espace-salon', 'Salon', 'Un banc avec dossier, végétation et brumisation.'), similaire('espace-banquet', 'Banquet', 'Deux tables / gradins en vis-à-vis.')],
    },
  },
  {
    slug: 'espace-salon', nom: 'Salon', gamme: 'galileo', categorie: 'espace',
    carte: {
      description: 'Un banc avec dossier, végétation et brumisation, pour se reposer à l’ombre.',
      visuel: v('26d66', 'Salon : un banc Galiléo blanc avec dossier, plantes grimpantes et brumisation'),
    },
    fiche: {
      titre: 'Salon Galiléo', sousTitre: 'Un banc végétalisé avec brumisation',
      description: 'La configuration Salon réunit un banc Galiléo avec dossier, des plantes grimpantes à l’arrière et une brumisation. Le visuel présente un seul module, pour s’installer confortablement à l’ombre.',
      galerie: [v('26d66', 'Salon : un banc Galiléo blanc avec dossier, plantes grimpantes et brumisation'), v('a2f37', 'Banc Galiléo blanc végétalisé et brumisé vu de face')],
      caracteristiques: [
        { label: 'Référence', valeur: 'AT_GAL10_DOS_BRO_VEGE' },
        { label: 'Composition', valeur: 'Un banc Galiléo avec dossier, végétation et brumisation' },
        ...dimensionsGalileo, ...baseGalileo('Assise et dossier'),
        { label: 'Brumisation', valeur: 'Présente sur le modèle illustré ; raccordement à l’eau et à l’électricité nécessaire' },
        { label: 'Support des plantes', valeur: 'Filet de pêche recyclé Filae ou câbles inox' },
        { label: 'Garantie brumisation', valeur: '2 ans, selon les conditions de garantie' }, entretienBrume,
      ],
      similaires: [similaire('banc-galileo', 'Banc', 'Le banc sans végétation ni brumisation.'), similaire('espace-echange', 'Échange', 'Une banquette sans dossier avec brumisation.'), similaire('banc-fotos', 'Banc Fotos', 'Un banc sous pergola végétale, avec jardinière.')],
    },
  },
  {
    slug: 'espace-banquet', nom: 'Banquet', gamme: 'galileo', categorie: 'espace',
    carte: { description: 'Deux modules table / gradin Galiléo en vis-à-vis, pour partager un repas à l’ombre.', visuel: v('0d8dc', 'Banquet : deux tables / gradins Galiléo bleus en vis-à-vis') },
    fiche: {
      titre: 'Banquet Galiléo', sousTitre: 'Deux tables / gradins en vis-à-vis',
      description: 'Deux modules table / gradin Galiléo se font face pour former un espace de repas partagé sous leurs toitures en aluminium perforé. La configuration présentée est sans brumisation.',
      galerie: [v('0d8dc', 'Banquet : deux tables / gradins Galiléo bleus en vis-à-vis')],
      caracteristiques: [{ label: 'Composition', valeur: 'Deux modules AT_GAL10_TAB en vis-à-vis' }, { label: 'Surface d’ombrage', valeur: '12 m² pour deux modules, selon implantation' }, implantation, ...baseGalileo('Assises et tables'), toiture, brumeOption, garantiesOption, entretien],
      similaires: [similaire('table-gradin-galileo', 'Table / Gradin', 'Le module individuel avec assise et table.'), similaire('espace-recreation', 'Récréation', 'Une autre configuration de deux tables / gradins.'), similaire('espace-pique-nique', 'Pique-nique', 'Deux tables Fotos en vis-à-vis sous la végétation.')],
    },
  },
  {
    slug: 'espace-recreation', nom: 'Récréation', gamme: 'galileo', categorie: 'espace',
    carte: { description: 'Deux modules table / gradin en vis-à-vis pour se réunir, apprendre ou faire une pause dehors.', visuel: v('c0ff2', 'Récréation : deux tables / gradins Galiléo blancs en vis-à-vis') },
    fiche: {
      titre: 'Récréation Galiléo', sousTitre: 'Un espace de rencontre pour les cours d’école',
      description: 'Deux modules table / gradin Galiléo en vis-à-vis créent un lieu pour faire classe dehors, échanger ou se reposer à l’ombre. La configuration présentée est sans brumisation.',
      galerie: [v('c0ff2', 'Récréation : deux tables / gradins Galiléo blancs en vis-à-vis')],
      caracteristiques: [{ label: 'Composition', valeur: 'Deux modules AT_GAL10_TAB en vis-à-vis' }, { label: 'Surface d’ombrage', valeur: '12 m² pour deux modules, selon implantation' }, implantation, ...baseGalileo('Assises et tables'), toiture, brumeOption, garantiesOption, entretien],
      similaires: [similaire('table-gradin-galileo', 'Table / Gradin', 'Un module pour déjeuner ou travailler à l’ombre.'), similaire('espace-banquet', 'Banquet', 'Deux tables / gradins réunis pour le repas.'), similaire('espace-salon', 'Salon', 'Un banc végétalisé et brumisé avec dossier.')],
    },
  },
  {
    slug: 'banc-fotos', nom: 'Banc', gamme: 'fotos', categorie: 'modele',
    carte: { description: 'Un banc avec dossier sous une pergola végétale, avec jardinière et gestion de l’eau selon la version.', visuel: v('0f928', 'Banc Fotos, un module avec dossier et jardinière végétalisée') },
    fiche: {
      titre: 'Banc Fotos', sousTitre: 'Un banc sous pergola végétale, sans ancrage',
      description: 'Un banc avec dossier et jardinière, sous une charpente qui accueille les plantes grimpantes. La terre de la jardinière stabilise le mobilier. L’ombre se densifie avec la croissance de la végétation.',
      galerie: [v('0f928', 'Banc Fotos, un module avec dossier et jardinière végétalisée'), v('a38a3', 'Banc Fotos vu de face'), v('3c5dc', 'Banc Fotos vu du dessus'), v('1875a', 'Jardinière et structure arrière du banc Fotos')],
      caracteristiques: [
        { label: 'Référence déplaçable', valeur: 'AT_FOT10_D ; AT_FOT10_D_ACC avec accoudoirs' },
        { label: 'Jardinière au sol', valeur: '180 × 83,4 cm (largeur × profondeur, hors débords)' },
        { label: 'Charpente en toiture', valeur: '295,8 × 160,3 cm (largeur × profondeur)' },
        { label: 'Hauteur totale', valeur: '237,3 cm' }, ...baseFotos('Assise et dossier'),
      ],
      similaires: [similaire('table-fotos', 'Table', 'Le module Fotos avec table.'), similaire('espace-sequoia', 'Séquoia', 'Deux bancs Fotos dos à dos.'), similaire('espace-babylone', 'Babylone', 'Deux bancs Fotos face à face.')],
    },
  },
  {
    slug: 'table-fotos', nom: 'Table', gamme: 'fotos', categorie: 'modele',
    carte: { description: 'Une assise avec dossier et une table sous une pergola végétale, avec jardinière et gestion de l’eau selon la version.', visuel: v('f0cf0', 'Table Fotos, un module avec assise, dossier, table et jardinière végétalisée') },
    fiche: {
      titre: 'Table Fotos', sousTitre: 'Une table et son assise sous pergola végétale',
      description: 'Un module Fotos qui associe une assise avec dossier et une table, sous une charpente pour plantes grimpantes. La jardinière stabilise le mobilier et participe à la gestion de l’eau. L’ombre dépend du développement des plantes.',
      galerie: [v('f0cf0', 'Table Fotos, un module avec assise, dossier, table et jardinière végétalisée'), v('f4f61', 'Table Fotos vue du dessus'), v('3f6a7', 'Table Fotos vue de face'), v('adfa4', 'Jardinière et structure arrière de la table Fotos')],
      caracteristiques: [
        { label: 'Référence déplaçable', valeur: 'AT_FOT10_D_TAB' },
        { label: 'Largeur de jardinière', valeur: '180 cm' },
        { label: 'Profondeur au sol avec table', valeur: '148,4 cm' },
        { label: 'Charpente en toiture', valeur: '295,8 × 160,3 cm (largeur × profondeur)' },
        { label: 'Hauteur totale', valeur: '237,3 cm' }, ...baseFotos('Assise, dossier et table'),
      ],
      similaires: [similaire('banc-fotos', 'Banc', 'Le module Fotos sans table.'), similaire('espace-pique-nique', 'Pique-nique', 'Deux tables Fotos face à face.'), similaire('table-gradin-galileo', 'Table / Gradin', 'Une assise et une table sous une toiture perforée.')],
    },
  },
  {
    slug: 'espace-sequoia', nom: 'Séquoia', gamme: 'fotos', categorie: 'espace',
    carte: { description: 'Deux bancs Fotos dos à dos, pour s’asseoir de chaque côté d’un îlot végétal.', visuel: v('6fbcb', 'Séquoia : deux bancs Fotos dos à dos, jardinières au centre') },
    fiche: {
      titre: 'Séquoia Fotos', sousTitre: 'Deux bancs dos à dos',
      description: 'Deux bancs Fotos sont disposés dos à dos, avec leurs jardinières réunies au centre. Les assises s’ouvrent de part et d’autre de l’îlot végétal. La densité d’ombre évolue avec les plantes grimpantes.',
      galerie: [v('6fbcb', 'Séquoia : deux bancs Fotos dos à dos, jardinières au centre')],
      caracteristiques: [{ label: 'Composition', valeur: 'Deux bancs Fotos avec dossier, en dos à dos' }, implantation, ...baseFotos('Assises et dossiers')],
      similaires: [similaire('banc-fotos', 'Banc', 'Un banc Fotos individuel.'), similaire('espace-babylone', 'Babylone', 'Deux bancs Fotos en face à face.'), similaire('espace-pique-nique', 'Pique-nique', 'Deux modules avec table pour manger dehors.')],
    },
  },
  {
    slug: 'espace-babylone', nom: 'Babylone', gamme: 'fotos', categorie: 'espace',
    carte: { description: 'Deux bancs Fotos en face à face, sous une arche de plantes grimpantes.', visuel: v('761bd', 'Babylone : deux bancs Fotos face à face sous leurs charpentes végétalisées') },
    fiche: {
      titre: 'Babylone Fotos', sousTitre: 'Deux bancs face à face',
      description: 'Deux bancs Fotos se font face et leurs charpentes composent une arche végétale au-dessus de l’espace de rencontre. Les jardinières sont placées à l’arrière des dossiers. L’ombre se densifie au fil de la croissance des plantes.',
      galerie: [v('761bd', 'Babylone : deux bancs Fotos face à face sous leurs charpentes végétalisées')],
      caracteristiques: [{ label: 'Composition', valeur: 'Deux bancs Fotos avec dossier, en face à face' }, implantation, ...baseFotos('Assises et dossiers')],
      similaires: [similaire('banc-fotos', 'Banc', 'Un banc Fotos individuel.'), similaire('espace-sequoia', 'Séquoia', 'Deux bancs Fotos en dos à dos.'), similaire('espace-pique-nique', 'Pique-nique', 'La configuration face à face avec tables.')],
    },
  },
  {
    slug: 'espace-pique-nique', nom: 'Pique-nique', gamme: 'fotos', categorie: 'espace',
    carte: { description: 'Deux tables Fotos en face à face pour partager un repas sous les plantes grimpantes.', visuel: v('a149b', 'Pique-nique : deux tables Fotos face à face sous une arche végétale') },
    fiche: {
      titre: 'Pique-nique Fotos', sousTitre: 'Deux tables face à face',
      description: 'Deux modules Fotos avec assise, dossier et table se font face pour partager un repas dehors. Les charpentes accueillent les plantes grimpantes, qui apportent une ombre croissante au fil des saisons.',
      galerie: [v('a149b', 'Pique-nique : deux tables Fotos face à face sous une arche végétale')],
      caracteristiques: [{ label: 'Composition', valeur: 'Deux modules Fotos avec assise, dossier et table, en face à face' }, implantation, ...baseFotos('Assises, dossiers et tables')],
      similaires: [similaire('table-fotos', 'Table', 'Une table Fotos individuelle.'), similaire('espace-babylone', 'Babylone', 'Deux bancs en face à face sans table.'), similaire('espace-banquet', 'Banquet', 'Deux tables / gradins sous des toitures perforées.')],
    },
  },
]
