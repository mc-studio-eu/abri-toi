import type { Img } from './commun'

type MorceauManifeste = { texte: string; accent?: boolean } | { image: Img; largeur: number }

export const pageAccueil = {
  hero: {
    photo: { src: '/images/hero-v5-photo-plein-fond.png', alt: 'Des habitants assis à l’ombre d’un abri Galiléo' } as Img,
    surtitre: 'Bureau d’études à Lyon · Fabrication en France',
    titre: 'Reconquérir l’extérieur,',
    titreSuite: 'même en pleine',
    // Mot animé (reflet orange) en fin de titre
    titreAccent: 'canicule.',
    texte:
      'Des solutions d’ombrage et de fraîcheur durables, conçues pour améliorer le confort en extérieur par forte chaleur et créer des espaces conviviaux toute l’année.',
    boutonProduits: 'Découvrez nos produits',
  },
  manifeste: {
    morceaux: [
      { texte: 'Chaque été,' },
      { image: { src: '/images/image-pill.jpg' }, largeur: 132 },
      { texte: 'nos places' },
      { texte: 'se vident.', accent: true },
      { texte: 'Alors nous dessinons' },
      { image: { src: '/images/image-pill1.jpg' }, largeur: 112 },
      { texte: 'des abris' },
      { texte: 'où l’on reste' },
      { image: { src: '/images/image-pill2.jpg' }, largeur: 150 },
      { texte: 'dehors,' },
      { texte: 'ensemble.', accent: true },
    ] as MorceauManifeste[],
    signatureNom: 'Paul Saraceno',
    signatureRole: 'Fondateur & designer industriel · Lyon',
  },
  probleme: {
    titre: 'L’année de tous les records.',
    titreSuite: 'Vos places, cours et parcs deviennent invivables.',
    texte:
      'Sédentarité dans intérieurs climatisés, liens sociaux s’effilochent, parcs désertés au soleil. Seniors et enfants, publics fragiles, sont les premiers touchés.',
    chiffres: [
      { valeur: '24,9 °C', texte: 'Température moyenne record du mois de juillet 2026.' },
      { valeur: '53 jours', texte: 'De canicule en France entre le 1er juin et le 31 août 2026.' },
      { valeur: '7 824', texte: 'Décès liés à la canicule entre juin et août 2026.' },
    ],
  },
  solution: {
    titre: 'L’ombre à échelle humaine,',
    titreSuite: 'vraiment efficace.',
    intro:
      'Deux choix s’offrent à vous. Deux gammes conçues à Lyon et fabriquées en France, pour deux façons de rafraîchir vos espaces.',
    communes: [
      {
        titre: 'Structure. Aluminium thermolaqué, fabriqué en France.',
        texte:
          'Légère, très résistante et composée d’au moins 40 % de matière recyclée. Thermolaquée, elle ne s’oxyde pas, même en bord de mer.',
      },
      {
        titre: 'Toiture. L’ombre là où il faut, quand il faut.',
        texte:
          'Nous vous accompagnons avec une étude d’ensoleillement pour orienter la toiture et maximiser l’ombre sous l’abri, aux heures où vous en avez besoin.',
      },
    ],
    galileo: {
      tags: 'Ombrage immédiat · Brumisation',
      legende: 'Ancré au sol et relié au réseau d’eau, Galiléo brumise l’air pour rafraîchir dès la pose.',
      etapes: [
        {
          titre: 'Brumisation. Jusqu’à –8 °C sous l’abri.',
          texte:
            'Brumisation haute pression à 70 bars avec BRO Brumisation : eau potable filtrée et traitée aux UV, temporisation pilotée pour maîtriser chaque litre.',
        },
        {
          titre: 'Ancré au sol. Efficace dès la pose.',
          texte:
            'Fixé sur une dalle béton et raccordé au réseau d’eau par le sol : une installation pérenne, rafraîchissante dès le premier jour.',
        },
      ],
      etiquettes: ['Structure aluminium', 'Toiture perforée', 'Brumisation 70 bars', 'Platines ancrées au sol'],
      badge: 'Ancré sur dalle béton · Eau par le sol',
    },
    fotos: {
      tags: 'Végétal · Déplaçable · Eau de pluie',
      legende: 'Sans ancrage et déplaçable, Fotos récupère l’eau de pluie pour faire pousser son ombre végétale.',
      etapes: [
        {
          titre: 'Végétation. L’ombre prend vie.',
          texte:
            'Plantes grimpantes sur un filet issu de filets de pêche recyclés, plantées dans un bac de 1 m³ de terre. Un filet en fibre de coco les guide le temps qu’elles poussent.',
        },
        {
          titre: 'Autonome et déplaçable.',
          texte:
            'Un réservoir de 120 L recueille l’eau de pluie et arrose les plantes par capillarité. Les 900 kg de terre servent de lest : pas de béton, l’abri se déplace au chariot élévateur.',
        },
      ],
      etiquettes: ['Structure aluminium', 'Toiture perforée', 'Filet de grimpe recyclé', 'Bac 1 m³ & réservoir 120 L'],
      badge: 'Sans ancrage · Déplaçable au chariot · Réservoir 120 L',
    },
  },
  modulaire: {
    titre: 'Assemblez vos abris comme des briques.',
    texte:
      'Chaque gamme se combine avec elle-même. Deux modules de 3 places forment un espace de 6 places et 12 m² d’ombre : banquettes, bancs, tables ou gradins chez Galiléo, bancs et tables sous une arche végétale chez Fotos.',
  },
  process: {
    titre: 'De votre premier appel',
    titreSuite: 'à l’inauguration.',
    duree: '8 semaines',
    note: 'au total*',
    etapes: [
      {
        titre: 'Prise de contact',
        texte: 'On échange sur votre site, vos usages et vos contraintes : budget, calendrier, marché public.',
      },
      {
        titre: 'Étude d’ensoleillement',
        texte: 'Nous analysons la course du soleil et les flux pour placer l’ombre au bon endroit, aux bonnes heures.',
      },
      {
        titre: 'Proposition sur-mesure',
        texte: 'Configuration, implantation 3D, chiffrage et fiches techniques prêtes pour vos instances.',
      },
      {
        titre: 'Fabrication, pose… et fraîcheur',
        texte:
          'Fabrication chez nos partenaires industriels en France, installation sur site. Vos habitants retrouvent l’ombre et l’extérieur.',
      },
    ],
    photoContact: { src: '/images/process-visuel01-contact.png' } as Img,
    photoPose: { src: '/images/installe-usagers-a-lombre.jpg' } as Img,
  },
  installations: {
    titre: 'Nos premières installations.',
    texte:
      'Abri Toi est une jeune entreprise : Voici nos prototypes, tests et projets en cours. Les premières installations en usage arrivent.',
    bandeaux: [
      {
        titre: 'Fotos — premier banc installé',
        gamme: 'fotos',
        image: { src: '/images/bandeau-hover-fotos-premier-banc-installe.jpg' } as Img,
        produit: 'banc-fotos',
      },
      {
        titre: 'Galiléo blanc — banc brumisé',
        gamme: 'galileo',
        image: { src: '/images/bandeau-galileo-blanc-banc-brumise.jpg' } as Img,
        produit: 'banc-galileo',
      },
      {
        titre: 'Galiléo — premiers usagers',
        gamme: 'galileo',
        image: { src: '/images/bandeau-galileo-premiers-usagers.jpg' } as Img,
        produit: 'banquette-galileo',
      },
      {
        titre: 'Fotos — vue de face',
        gamme: 'fotos',
        image: { src: '/images/bandeau-fotos-vue-de-face.png' } as Img,
        produit: 'table-fotos',
      },
    ],
    labelGalerie: 'Fotos · en détail',
    galerie: [
      { image: { src: '/images/photo-structure-aluminium-brun.jpg' } as Img, legende: 'Structure aluminium brun' },
      { image: { src: '/images/photo-une-pause-a-lombre.jpg' } as Img, legende: 'Une pause à l’ombre' },
      { image: { src: '/images/photo-grimpantes-et-fleurs.jpg' } as Img, legende: 'Grimpantes et fleurs' },
      { image: { src: '/images/photo-la-pergola-vue-den-bas.jpg' } as Img, legende: 'La pergola, vue d’en bas' },
      { image: { src: '/images/photo-assise-en-bois-kebony.jpg' } as Img, legende: 'Assise en bois Kebony' },
    ],
  },
  faq: {
    titre: 'Les questions de vos services techniques.',
    intro: 'Tout ce qu’il faut pour défendre le projet en interne et en conseil municipal.',
    questions: [
      {
        question: 'Quelle consommation d’eau ? Et en cas d’arrêté sécheresse ?',
        reponse:
          'La brumisation fonctionne à haute pression (70 bars) avec une temporisation pilotée : les périodes de pulvérisation s’adaptent à l’usage de l’espace et la consommation se maîtrise au litre près. Elle peut être coupée en cas de restriction : l’abri continue de fournir de l’ombre. La gamme Fotos récupère jusqu’à 120 L d’eau de pluie. [Consommation horaire à compléter.]',
      },
      {
        question: 'L’eau brumisée est-elle sûre (légionellose) ?',
        reponse:
          'Oui. Galiléo brumise uniquement de l’eau potable issue du réseau, filtrée à 5 microns et traitée aux UV en milieu urbain. Le système est conçu avec notre partenaire BRO Brumisation, spécialiste de la haute pression, et fait l’objet d’une maintenance deux fois par an pour contrôler le circuit et les buses.',
      },
      {
        question: 'Quel entretien prévoir ?',
        reponse:
          'Très peu. La structure en aluminium thermolaqué ne rouille pas, même en bord de mer, et se nettoie simplement à l’eau. L’assise en bois Kebony ne demande aucun traitement et prend une teinte argentée avec le temps. Sur Galiléo, la brumisation est révisée deux fois par an. Sur Fotos, les plantes s’arrosent seules par capillarité grâce au réservoir d’eau de pluie de 120 L ; il suffit de les entretenir comme un massif.',
      },
      {
        question: 'Est-ce compatible avec un marché public ?',
        reponse:
          'Oui. Nous accompagnons les collectivités dans leurs démarches : chaque proposition comprend la configuration, l’implantation en 3D, le chiffrage et les fiches techniques, prêts à être présentés en commission ou en conseil municipal. Les abris sont conçus à Lyon et fabriqués en France par nos partenaires industriels.',
      },
      {
        question: 'Quelle garantie et quelle durée de vie ?',
        reponse:
          'Les abris sont pensés pour durer : structure en aluminium recyclé à 40 % minimum et thermolaqué, assise en bois Kebony classe 4, toiture en tôle d’aluminium perforée. Les conditions et durées de garantie de chaque élément sont précisées dans votre proposition sur-mesure.',
      },
      {
        question: 'Comment l’abri est-il fixé ? Résiste-t-il au vent ?',
        reponse:
          'Cela dépend de la gamme. Galiléo est ancré au sol sur une fondation béton, avec une arrivée d’eau qui passe par le sol. Fotos ne nécessite aucun ancrage : son bac de 1 m³ de terre pèse environ 900 kg et le leste naturellement. Il peut être posé en pleine terre ou rester déplaçable au chariot élévateur. Les caractéristiques de résistance figurent dans les fiches techniques.',
      },
      {
        question: 'Que se passe-t-il en hiver ?',
        reponse:
          'L’abri reste en place et continue d’offrir un lieu où s’asseoir et se retrouver toute l’année. Sur Galiléo, la brumisation est mise à l’arrêt hors de la saison chaude. Sur Fotos, la végétation suit le rythme des saisons et repart au printemps, le réservoir se remplissant avec les pluies.',
      },
      {
        question: 'Quel budget prévoir ?',
        reponse:
          'Le budget dépend de la gamme, du nombre de modules et de votre site (pose, raccordement à l’eau pour Galiléo). Contactez-nous : nous revenons vers vous sous 48 h avec une première orientation, puis un chiffrage détaillé dans la proposition sur-mesure.',
      },
    ],
  },
  fondateur: {
    portrait: { src: '/images/process-visuel01-contact.png', alt: 'Paul Saraceno, fondateur d’Abri Toi' } as Img,
    citation:
      '« Pouvoir s’asseoir à l’ombre le plus longtemps possible dans la journée. C’est pour ça que j’ai créé Abri Toi. »',
    texte:
      'Designer industriel, j’ai passé plus de cinq ans à concevoir du mobilier urbain. Chaque été, je voyais les mêmes bancs brûlants et les mêmes places désertes. Abri Toi est né à Lyon en 2025 pour redonner aux habitants des lieux où se retrouver, même au cœur de l’été.',
    nom: 'Paul Saraceno',
    role: 'Fondateur & designer industriel',
  },
  articles: {
    titre: 'Comprendre l’enjeu de l’ombre en ville.',
    lien: 'Tous les articles',
    selection: ['seniors-ehpad-canicules', 'financer-ombrage-espaces-publics', 'brumisation-haute-pression'],
  },
}
