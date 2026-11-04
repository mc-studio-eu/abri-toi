import type { Hero, Img, Ligne } from './commun'

export const pageProduits = {
  hero: {
    titre: 'Deux gammes de mobilier abrité pour valoriser vos extérieurs',
    ancres: [
      { label: 'Galiléo ↓', cible: '#galileo', point: 'orange' },
      { label: 'Fotos ↓', cible: '#fotos', point: 'sage' },
      { label: 'Comparer ↓', cible: '#comparatif' },
    ],
  } as Hero,
  collection: {
    titre: 'Combinaisons possibles',
    intro:
      'Un module seul, une variante équipée ou plusieurs modules combinés : choisissez votre espace de pause. Galiléo offre une ombre immédiate ; l’ombrage de Fotos se développe avec les plantes grimpantes.',
  },
  usages: {
    galileo: ['Places', 'Écoles', 'Campus', 'Centres commerciaux', 'Esplanades', 'EHPAD', 'Terrasses', 'Aires de jeux et de sport', 'Piscines', 'Parkings', 'Gares et aéroports'],
    fotos: ['Places', 'Écoles', 'Campus', 'Centres commerciaux', 'Esplanades', 'EHPAD', 'Terrasses', 'Aires de jeux et de sport', 'Piscines', 'Parkings', 'Gares et aéroports'],
  },
  surMesure: {
    label: 'Sur mesure',
    titre: 'Un projet d’ombrage spécifique ?',
    texte: 'Aucune combinaison ne répond exactement à votre besoin ? Nous étudions votre site et construisons une solution sur mesure. Parlons-en.',
    bouton: 'Prendre rendez-vous',
  },
  comparatif: {
    titre: 'Galiléo et Fotos, deux produits pour deux besoins bien différents.',
    colonnes: [
      {
        gamme: 'Galiléo',
        typeOmbre: 'Ombre immédiate',
        numero: '01',
        caracteristiques: [
          'Ombrage immédiat',
          'Installation fixe',
          'Installation combinable',
          'Végétalisation face arrière possible',
          'Brumisation possible',
          'Assise avec accoudoir possible',
        ],
        surface: '6 à 12 m²',
        capacite: '3 à 6',
      },
      {
        gamme: 'Fotos',
        typeOmbre: 'Ombre végétalisée',
        numero: '02',
        caracteristiques: [
          'Ombrage végétalisé',
          'Installation déplaçable',
          'Installation combinable et modulable',
          'Jardinière avec accès pleine terre possible',
          'Réservoir d’eau pluviale 60 à 120 L possible',
          'Assise avec accoudoirs possible',
        ],
        surface: '5 à 10 m²',
        capacite: '3 à 8',
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
    titre: 'Ils ont repris l’extérieur. Voici où',
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
      { src: '/images/figma-secondary/galileo-brume-au-repos.png', alt: 'Brume au repos' },
      { src: '/images/figma-secondary/galileo-premiers-usagers.png', alt: 'Premiers usagers' },
      { src: '/images/fiches/galileo-banc-plan.jpg', alt: 'Détail de l’assise' },
      { src: '/images/installe-usagers-a-lombre.jpg', alt: 'À l’ombre, 15 h' },
    ] as Img[],
  },
  liste: {
    titre: 'Chaque lieu, sa réponse.',
    intro:
      'Communes, écoles, entreprises ou particuliers : filtrez par gamme pour trouver un projet proche du vôtre.',
    boutonPlus: 'Voir plus de réalisations',
  },
}

export const pageAPropos = {
  hero: {
    titre: 'Rendre l’ombre aux villes qui ont chaud',
    chapo:
      'Abri Toi conçoit à Lyon des abris d’ombrage et de fraîcheur pour les places, les cours d’école et les parcs. Une idée simple : que chacun puisse s’asseoir dehors, même au cœur de l’été.',
  } as Hero,
  histoire: {
    portrait: { src: '/images/figma-secondary/paul-saraceno.png', alt: 'Paul Saraceno, fondateur d’Abri Toi' } as Img,
    titre: 'Tout est parti d’une envie simple : s’asseoir à l’ombre.',
    paragraphes: [
      'J’ai toujours aimé observer la ville : ce lieu que l’on pratique au quotidien, pour retrouver des amis au parc, faire quelques courses ou profiter d’une soirée au restaurant. Elle façonne nos modes de vie, nos rencontres et notre bien-être. Contribuer à son évolution me semble essentiel.',
      'Après cinq années dans le secteur de l’aménagement urbain chez Pro Urba, j’ai fondé Abri Toi à Lyon, en octobre 2025. Une entreprise portée par une volonté : rendre les espaces urbains plus confortables, plus vivants et plus durables.',
      'Aujourd’hui, notre bureau d’études conçoit deux gammes, Galiléo et Fotos, fabriquées en France avec des partenaires que nous avons choisis un à un. La ville nourrit mon travail ; les sports outdoor, en mer comme en montagne, sont deux autres lieux d’inspiration et une source de créativité inépuisable.',
    ],
    nom: 'Paul Saraceno',
    role: 'Fondateur d’Abri Toi',
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
        icone: { src: '/images/figma-secondary/odd-13.png', alt: 'ODD 13 : mesures relatives à la lutte contre les changements climatiques' } as Img,
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
        icone: { src: '/images/figma-secondary/odd-11.png', alt: 'ODD 11 : villes et communautés durables' } as Img,
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
        icone: { src: '/images/figma-secondary/odd-9.png', alt: 'ODD 9 : industrie, innovation et infrastructure' } as Img,
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
        logo: { src: '/images/figma-secondary/logo-bro-brumisation.png', alt: 'B.R.O Brumisation' } as Img,
        largeur: 112,
        hauteur: 58,
        categorie: 'Brumisation',
        nom: 'B.R.O Brumisation',
        texte: 'Le système haute pression (70 bars) qui rafraîchit les abris Galiléo.',
      },
      {
        logo: { src: '/images/figma-secondary/logo-kebony.png', alt: 'Kebony' } as Img,
        largeur: 46,
        hauteur: 76,
        categorie: 'Bois des assises',
        nom: 'Kebony',
        texte: 'Un pin de classe 4, conçu pour rester dehors toute l’année sans traitement.',
      },
      {
        logo: { src: '/images/figma-secondary/logo-filae.png', alt: 'Filae' } as Img,
        largeur: 164,
        hauteur: 44,
        categorie: 'Filets recyclés',
        nom: 'Filae',
        texte: 'Des filets de pêche du port de Saumaty, à Marseille, recyclés en filets de grimpe pour Fotos.',
      },
      {
        logo: { src: '/images/figma-secondary/logo-larbaletier.png', alt: 'Larbaletier' } as Img,
        largeur: 187,
        hauteur: 36,
        categorie: 'Fabrication de mobilier',
        nom: 'Larbaletier',
        texte: 'Concepteur-fabricant français depuis 1977, Larbaletier possède un savoir-faire dans le travail de l’aluminium et la réalisation de mobilier sur mesure, notamment pour les espaces urbains.',
      },
      {
        logo: { src: '/images/figma-secondary/logo-dargaisse.png', alt: 'Dargaisse' } as Img,
        largeur: 136,
        hauteur: 52,
        categorie: 'Tôlerie fine de précision',
        nom: 'Dargaisse',
        texte: 'Implantée à Vendôme, Dargaisse maîtrise la découpe, le pliage, la soudure et l’assemblage des métaux. Son savoir-faire industriel associe fabrication sur mesure et thermolaquage intégré.',
      },
    ],
  },
  terrain: {
    titre: 'Nos premiers abris, déjà adoptés.',
    bouton: 'Voir les réalisations',
    photos: [
      { image: { src: '/images/figma-secondary/fotos-une-pause-a-lombre.png' } as Img, legende: 'Une pause à l’ombre' },
      { image: { src: '/images/figma-secondary/fotos-grimpantes-et-fleurs.png' } as Img, legende: 'Grimpantes et fleurs · Fotos' },
      { image: { src: '/images/figma-secondary/fotos-pergola-vue-den-bas.png' } as Img, legende: 'La pergola, vue d’en bas' },
      { image: { src: '/images/figma-secondary/fotos-assise-bois-kebony.png' } as Img, legende: 'Assise en bois Kebony' },
    ],
  },
}

export const pageArticles = {
  hero: {
    titre: 'Comprendre l’enjeu de l’ombre en ville',
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
    titre: 'Parlons de votre projet d’ombrage',
    chapo: 'Une cour d’école, une place, le jardin d’un EHPAD ? Décrivez-nous le lieu : Paul vous recontacte sous 48 h.',
  } as Hero,
  formulaire: {
    titre: 'Votre demande',
    sousTitre: 'Les champs marqués * sont obligatoires.',
    typesClient: ['Collectivité', 'Architecte / paysagiste', 'Entreprise privée', 'Particulier', 'Autre'],
    gammes: ['Galiléo · brumisation', 'Fotos · végétation', 'Les deux', 'Je ne sais pas encore'],
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
    texte: '30 minutes en visio ou au téléphone pour parler du lieu, des usages et du calendrier.',
    bouton: 'Choisir un créneau',
    lien: '',
  },
  etapes: {
    titre: 'Et ensuite ?',
    items: [
      'Premier échange sous 48 h pour comprendre votre lieu et vos besoins.',
      'Étude d’ensoleillement et conception d’une implantation 3D.',
      'Environ 8 semaines après la commande, fabrication, livraison et pose comprises.',
    ],
  },
}
