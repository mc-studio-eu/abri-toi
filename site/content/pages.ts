import type { Hero, Img, Ligne } from './commun'

export const pageProduits = {
  hero: {
    titre: 'Deux abris pour reconquérir l’extérieur.',
    chapo:
      'Galiléo rafraîchit dès la pose grâce à la brumisation. Fotos fait pousser son ombre avec l’eau de pluie. Même structure, deux réponses à la chaleur.',
    ancres: [
      { label: 'Galiléo ↓', cible: '#galileo', point: 'orange' },
      { label: 'Fotos ↓', cible: '#fotos', point: 'sage' },
      { label: 'Comparer ↓', cible: '#comparatif' },
    ],
  } as Hero,
  collection: {
    titre: 'Cinq modèles, sept espaces, à combiner selon vos lieux.',
    intro:
      'Chaque modèle est un module de 3 places. Placés en vis-à-vis, deux modules forment un espace de 6 places et 12 m² d’ombre.',
  },
  surMesure: {
    label: 'Sur mesure',
    titre: 'Un espace particulier à équiper ?',
    texte: 'Nous étudions l’ensoleillement de votre site et composons la bonne combinaison de modules.',
    bouton: 'Prendre rendez-vous',
  },
  comparatif: {
    titre: 'Galiléo ou Fotos, en un coup d’œil.',
    lignes: [
      {
        label: 'Promesse',
        galileo: 'Ombrage et fraîcheur immédiats, efficaces dès la pose',
        fotos: 'Ombrage durable et écoresponsable, qui grandit avec les plantes',
      },
      {
        label: 'Fraîcheur',
        galileo: 'Brumisation haute pression (70 bars)',
        fotos: 'Végétation grimpante sur filet en filets de pêche recyclés',
      },
      {
        label: 'Eau',
        galileo: 'Réseau d’eau potable, canalisations par le sol',
        fotos: 'Eau de pluie : réservoir de 120 L, arrosage par capillarité',
      },
      { label: 'Pose', galileo: 'Ancré sur dalle béton', fotos: 'Sans ancrage : 1 m³ de terre (≈ 900 kg) sert de lest' },
      {
        label: 'Déplaçable',
        galileo: 'Non, installation pérenne',
        fotos: 'Oui, au chariot élévateur (ou version pleine terre, fixe)',
      },
      { label: 'Modèles', galileo: 'Banquette, Banc, Table / Gradin', fotos: 'Banc, Table' },
      { label: 'Teintes', galileo: 'Blanc, olive, orange, bleu', fotos: 'Brun' },
      {
        label: 'Entretien',
        galileo: 'Brumisation : maintenance deux fois par an',
        fotos: 'Plantes : filet en fibre de coco le temps de la pousse',
      },
    ],
  },
}

export const ficheProduit = {
  boutonDevis: 'Demander un devis',
  titreCaracteristiques: 'Caractéristiques',
  documentation: {
    titre: 'Recevez la fiche technique complète.',
    texte: 'Plans, matériaux et raccordements : de quoi monter votre dossier ou votre marché public.',
    champ: 'E-mail professionnel *',
    placeholder: 'prenom.nom@mairie.fr',
    bouton: 'Recevoir la documentation',
  },
  titreSimilaires: 'Dans la même gamme',
}

export const pageRealisations = {
  hero: {
    titre: 'Ils ont repris l’extérieur. Voici où.',
    chapo:
      'Places de village, cours d’école, parcs d’entreprise : nos abris Galiléo et Fotos en situation, et ce qu’ils ont changé pour ceux qui s’y assoient.',
    ancres: [
      { label: 'À la une ↓', cible: '#a-la-une', point: 'orange' },
      { label: 'Les projets ↓', cible: '#projets' },
    ],
  } as Hero,
  aLaUne: {
    titre: 'Un jardin public rafraîchi dès le premier été.',
    photo: { src: '/images/realisations/square-des-tilleuls.jpg' } as Img,
    label: 'Fiche projet',
    nomProjet: 'Square des Tilleuls',
    infos: [
      { label: 'Gamme', valeur: 'Galiléo blanc, brumisation' },
      { label: 'Configuration', valeur: '2 Banquettes + 1 Table / Gradin en vis-à-vis' },
    ] as Ligne[],
    lien: { label: 'Lire l’étude de cas', url: '' },
    galerie: [
      { src: '/images/image-pill1.jpg', alt: 'Brume au repos' },
      { src: '/images/image-pill2.jpg', alt: 'Premiers usagers' },
      { src: '/images/fiches/galileo-banquette-plan.jpg', alt: 'Vue depuis l’allée' },
      { src: '/images/installe-usagers-a-lombre.jpg', alt: 'À l’ombre, 15 h' },
    ] as Img[],
  },
  liste: {
    titre: 'Chaque lieu, sa réponse.',
    intro:
      'Communes, écoles, entreprises ou particuliers : filtrez par gamme ou par type de lieu pour trouver un projet proche du vôtre.',
    boutonPlus: 'Voir plus de réalisations',
  },
}

export const pageAPropos = {
  hero: {
    titre: 'Rendre l’ombre aux villes qui ont chaud.',
    chapo:
      'Abri Toi conçoit à Lyon des abris d’ombrage et de fraîcheur pour les places, les cours d’école et les parcs. Une idée simple : que chacun puisse s’asseoir dehors, même au cœur de l’été.',
  } as Hero,
  histoire: {
    portrait: { src: '/images/process-visuel01-contact.png', alt: 'Paul Saraceno, fondateur d’Abri Toi' } as Img,
    titre: 'Tout est parti d’un banc brûlant.',
    paragraphes: [
      'Designer industriel, Paul Saraceno a passé plus de cinq ans à concevoir du mobilier urbain. Chaque été, il retrouvait les mêmes bancs brûlants et les mêmes places désertes dès la fin de matinée.',
      'En 2025, il fonde Abri Toi à Lyon avec une conviction : l’ombre est un équipement public à part entière. Pas un parasol ni un voile tendu, mais un abri pensé pour durer, où l’on s’assoit et où l’on se retrouve.',
      'Aujourd’hui, notre bureau d’études conçoit deux gammes, Galiléo et Fotos, fabriquées en France avec des partenaires que nous avons choisis un à un.',
    ],
    nom: 'Paul Saraceno',
    role: 'Fondateur & designer industriel',
  },
  chiffres: {
    titre: 'Une jeune entreprise, des engagements mesurables.',
    items: [
      { valeur: '2025', texte: 'Création d’Abri Toi à Lyon, avec un bureau d’études intégré.' },
      { valeur: '–8 °C', texte: 'Sur l’air ambiant, grâce à la brumisation des abris Galiléo.' },
      { valeur: '40 %', texte: 'D’aluminium recyclé, au minimum, dans chaque structure.' },
      { valeur: '8 semaines', texte: 'De la commande à l’abri installé, pose comprise.' },
    ],
  },
  engagements: {
    titre: 'Trois engagements, tenus abri après abri.',
    intro:
      'Trois Objectifs de Développement Durable de l’ONU guident chacun de nos abris, de la conception à l’installation.',
    items: [
      {
        numero: '13',
        label: 'ODD 13 · Lutte contre le changement climatique',
        titre: 'Innovation & durabilité',
        texte: 'Des matériaux choisis pour leur faible impact et leur longévité, et l’eau de pluie mise à profit.',
        preuves: [
          'Aluminium recyclé à 40 % minimum',
          'Bois Kebony, pin de classe 4',
          'Filets de pêche recyclés par Filae',
          'Réservoir d’eau de pluie de 120 L (Fotos)',
        ],
      },
      {
        numero: '11',
        label: 'ODD 11 · Villes et communautés durables',
        titre: 'Convivialité & lien social',
        texte: 'Des abris pensés comme des lieux de rencontre, où l’on s’assoit face à face plutôt que côte à côte.',
        preuves: [
          'Jusqu’à 8 usagers à l’ombre',
          'Configurations en face à face ou dos à dos',
          '12 m² d’ombre en vis-à-vis',
        ],
      },
      {
        numero: '9',
        label: 'ODD 9 · Industrie, innovation et infrastructure',
        titre: 'Savoir-faire français',
        texte: 'Conçus par notre bureau d’études à Lyon, fabriqués avec nos partenaires industriels français.',
        preuves: ['Bureau d’études à Lyon', 'Label Fabriqué en France', 'Pose comprise, en 8 semaines environ'],
      },
    ],
  },
  partenaires: {
    titre: 'Fabriqué avec ceux qui savent faire.',
    intro:
      'Chaque composant de nos abris est confié à un spécialiste, choisi pour son savoir-faire et son exigence environnementale.',
    items: [
      {
        logo: { src: '/images/logo-bro-brumisation.png', alt: 'B.R.O Brumisation' } as Img,
        largeur: 112,
        hauteur: 58,
        categorie: 'Brumisation',
        nom: 'B.R.O Brumisation',
        texte: 'Le système haute pression (70 bars) qui rafraîchit les abris Galiléo.',
      },
      {
        logo: { src: '/images/logo-kebony.png', alt: 'Kebony' } as Img,
        largeur: 46,
        hauteur: 76,
        categorie: 'Bois des assises',
        nom: 'Kebony',
        texte: 'Un pin de classe 4, conçu pour rester dehors toute l’année sans traitement.',
      },
      {
        logo: { src: '/images/logo-filae.png', alt: 'Filae' } as Img,
        largeur: 164,
        hauteur: 44,
        categorie: 'Filets recyclés',
        nom: 'Filae',
        texte: 'Des filets de pêche du port de Saumaty, à Marseille, recyclés en filets de grimpe pour Fotos.',
      },
      {
        logo: { src: '/images/logo-larbaletier.png', alt: 'L’Arbaletier' } as Img,
        largeur: 187,
        hauteur: 36,
        categorie: 'Rôle à confirmer',
        nom: 'L’Arbaletier',
        texte: '[À compléter avec Paul : rôle dans la fabrication des abris.]',
      },
      {
        logo: { src: '/images/logo-dargaisse.png', alt: 'Dargaisse' } as Img,
        largeur: 136,
        hauteur: 52,
        categorie: 'Rôle à confirmer',
        nom: 'Dargaisse',
        texte: '[À compléter avec Paul : rôle dans la fabrication des abris.]',
      },
    ],
  },
  terrain: {
    titre: 'Nos premiers abris, déjà adoptés.',
    bouton: 'Voir les réalisations',
    photos: [
      { image: { src: '/images/photo-une-pause-a-lombre.jpg' } as Img, legende: 'Une pause à l’ombre' },
      { image: { src: '/images/photo-grimpantes-et-fleurs.jpg' } as Img, legende: 'Grimpantes et fleurs · Fotos' },
      { image: { src: '/images/photo-la-pergola-vue-den-bas.jpg' } as Img, legende: 'La pergola, vue d’en bas' },
      { image: { src: '/images/photo-assise-en-bois-kebony.jpg' } as Img, legende: 'Assise en bois Kebony' },
    ],
  },
}

export const pageArticles = {
  hero: {
    titre: 'Comprendre l’enjeu de l’ombre en ville.',
    chapo:
      'Canicules, îlots de fraîcheur, financement, entretien : des articles courts pour aider les collectivités à préparer l’été.',
  } as Hero,
  // Slug de l'article mis en avant (une référence dans Sanity)
  aLaUne: 'vegetation-barriere-pollution',
  labelALaUne: 'À la une',
  lienALaUne: 'Lire l’article',
  titreListe: 'Tous les articles',
  boutonPlus: 'Voir plus d’articles ↓',
  titreALireAussi: 'À lire aussi',
}

export const pageContact = {
  hero: {
    titre: 'Parlons de votre projet d’ombrage.',
    chapo: 'Une cour d’école, une place, le jardin d’un EHPAD ? Décrivez-nous le lieu : Paul vous recontacte sous 48 h.',
  } as Hero,
  formulaire: {
    titre: 'Votre demande',
    sousTitre: 'Les champs marqués * sont obligatoires.',
    typesClient: ['Collectivité', 'Entreprise', 'EHPAD', 'Syndic de copropriété', 'Autre'],
    gammes: ['Galiléo · brumisation', 'Fotos · végétation', 'Je ne sais pas encore'],
    echeances: ['Avant l’été 2027', 'Dans l’année', 'Pas de date précise'],
    consentement:
      'J’accepte qu’Abri Toi utilise ces informations pour me recontacter. Aucune donnée n’est transmise à des tiers.',
    bouton: 'Envoyer ma demande',
    delai: 'Réponse sous 48 h ouvrées.',
    confirmation: 'Merci ! Votre demande est bien partie. Paul vous recontacte sous 48 h.',
  },
  rendezVous: {
    label: 'Plutôt en direct ?',
    titre: 'Prenez rendez-vous avec Paul.',
    texte: '30 minutes en visio ou au téléphone pour parler de votre site, de vos délais et de votre budget.',
    bouton: 'Choisir un créneau',
    lien: '',
  },
  etapes: {
    titre: 'Et ensuite ?',
    items: [
      'Paul vous rappelle sous 48 h pour comprendre votre lieu.',
      'Nous réalisons une étude d’ensoleillement de votre site.',
      'Vous recevez une proposition. Comptez environ 8 semaines de la commande à la pose.',
    ],
  },
}
