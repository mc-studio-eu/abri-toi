import type { Img } from './commun'

type MorceauManifeste = { texte: string; accent?: boolean } | { image: Img; largeur: number }

export const pageAccueil = {
  hero: {
    photo: { src: '/images/hero-v5-photo-plein-fond.png', alt: 'Des habitants assis à l’ombre d’un abri Galiléo' } as Img,
    surtitre: 'Bureau d’études design et conception Lyonnais · Fabrication française',
    titre: 'Reconquérir les espaces',
    titreSuite: 'extérieurs',
    // Mot animé (reflet orange) en fin de titre
    titreAccent: '',
    texte:
      'Plus que des abris contre le soleil : De véritables espaces d’ombrage et de fraîcheur où l’on a envie de se retrouver et passer du temps.',
    boutonProduits: 'Découvrez nos produits',
  },
  manifeste: {
    morceaux: [
      { texte: 'Chaque été,' },
      { texte: 'nos villes et espaces extérieurs' },
      { texte: 'sont désertés', accent: true },
      { texte: 'à cause de la canicule.' },
      { image: { src: '/images/manifesto-fotos-lacet.jpg', alt: 'Une femme fait ses lacets sur le banc Fotos' }, largeur: 132 },
      { texte: 'Notre objectif' },
      { texte: 'leur' },
      { texte: 'redonner vie.', accent: true },
      { image: { src: '/images/image-pill2.jpg', alt: 'Trois amis profitent de l’ombre du banc Galiléo' }, largeur: 150 },
    ] as MorceauManifeste[],
    signatureNom: 'Paul Saraceno',
    signatureRole: 'Fondateur & designer industriel · Lyon',
  },
  probleme: {
    titre: '2026, l’année de tous les records !',
    titreSuite: 'Nos espaces publics deviennent invivables.',
    texte:
      'La chaleur accroît la sédentarité en intérieur, la fréquentation des espaces climatisés et réduit le lien social et l’envie de sortir de chez soi.',
    chiffres: [
      { valeur: '40,3 °C', texte: 'Record de température mesuré à Lavaur (Tarn) le 6 septembre 2026.' },
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
        titre: 'Structure et bac jardinière en aluminium, fabriqué en France.',
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
      tags: 'Ombrage métallique · Brumisation',
      legende: 'Un abri ancré au sol, relié au réseau d’eau, pour de l’ombre et de la fraîcheur dès la pose.',
      etapes: [
        {
          titre: 'Brumisation. Jusqu’à –8 °C sous l’abri.',
          texte:
            'Brumisation haute pression à 70 bars avec BRO Brumisation : eau potable filtrée et traitée aux UV, temporisation pilotée pour maîtriser chaque litre.',
        },
        {
          titre: 'Installation fixe. Ancrage au sol.',
          texte:
            'Fixé via cheville à béton sur une dalle béton ou longrine dimensionnée. Option brumisation nécessitant un raccord à l’eau potable.',
        },
      ],
      etiquettes: ['Structure aluminium', 'Toiture perforée', 'Brumisation 70 bars', 'Platines ancrées au sol'],
      badge: 'Ancré sur dalle béton · Eau par le sol',
    },
    fotos: {
      tags: 'Végétal · Déplaçable · Eau de pluie',
      legende: 'Un abri déplaçable qui associe végétation et récupération d’eau de pluie.',
      toiture: {
        titre: 'Toiture végétalisée pour un ombrage naturel.',
        texte: 'Le support des plantes grimpantes est un filet de pêche recyclé, tout droit venu du port de Marseille par notre partenaire Philae.',
      },
      etapes: [
        {
          titre: 'Végétation et gestion des eaux pluviales.',
          texte:
            'Les plantes grimpantes s’épanouissent dans une jardinière à large volume de terre. Un réservoir d’eau pluviale est directement intégré au bac jardinière.',
        },
        {
          titre: 'Installation déplaçable ou accès pleine terre.',
          texte:
            'Fotos est disponible en version déplaçable par chariot élévateur ou en version pleine terre, avec une jardinière ouverte en partie basse. Dans les deux cas, aucun ancrage au sol n’est nécessaire.',
        },
      ],
      etiquettes: ['Structure aluminium', 'Toiture perforée', 'Filet de grimpe recyclé', 'Jardinière 800 kg & réservoir 120 L'],
      badge: 'Sans ancrage · Déplaçable au chariot · Réservoir 120 L',
    },
  },
  modulaire: {
    titre: 'Des abris combinables et modulables.',
    texte:
      'Chaque gamme se combine avec elle-même. Les configurations peuvent accueillir jusqu’à 8 personnes et créer jusqu’à 12 m² d’ombre : banquettes, bancs, tables ou gradins chez Galiléo, bancs et tables sous une arche végétale chez Fotos.',
  },
  process: {
    titre: 'À 10 degrés de vous',
    titreSuite: 'sentir bien dehors.',
    duree: '8 semaines',
    note: 'au total*',
    etapes: [
      {
        titre: 'Rendez-vous découverte',
        texte: 'Premiers échanges, rencontre et présentation du projet. Site concerné, usages, contraintes, calendrier, budget.',
      },
      {
        titre: 'Étude d’aménagement',
        texte: 'Nous réalisons un dossier de présentation de votre espace aménagé avec nos installations.',
      },
      {
        titre: 'Marché conclu !',
        texte: 'L’intégration 3D de votre aménagement vous plaît, les contraintes techniques ont été appréhendées, le budget est validé.',
      },
      {
        titre: 'Fabrication, pose et ombrage',
        texte:
          'Fabrication chez nos partenaires industriels en France, installation sur site. Vos habitants retrouvent l’ombre et l’extérieur.',
      },
    ],
    photoContact: { src: '/images/process-visuel01-contact.png' } as Img,
    photoPose: { src: '/images/installe-usagers-a-lombre.jpg' } as Img,
  },
  installations: {
    titre: 'Nos premières réalisations.',
    texte:
      'Voici nos premières réalisations Galiléo et Fotos, dans des espaces de vie réels.',
    bandeaux: [
      {
        titre: 'Fotos · Jardin de copropriété · Six-Fours (83)',
        gamme: 'fotos',
        image: { src: '/images/bandeau-hover-fotos-premier-banc-installe.jpg' } as Img,
        produit: 'banc-fotos',
      },
      {
        titre: 'Galiléo · Terrasse d’un particulier · Sanary (83)',
        gamme: 'galileo',
        image: { src: '/images/bandeau-galileo-premiers-usagers.jpg' } as Img,
        produit: 'banc-galileo',
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
        question: 'Quel volume d’eau consomme la brumisation ?',
        reponse:
          'La brumisation consomme environ 4 à 5 L d’eau par heure et par buse. Galiléo possède 6 buses : à fonctionnement continu, cela représente 24 à 30 L par heure. La temporisation adapte les cycles de pulvérisation à l’usage de l’espace et peut réduire la consommation jusqu’à 75 %.',
      },
      {
        question: 'Y a-t-il un risque de légionellose avec la brumisation ?',
        reponse:
          'Galiléo brumise uniquement de l’eau potable issue du réseau, filtrée à 5 microns et traitée aux UV en milieu urbain. Le système est conçu avec notre partenaire BRO Brumisation, spécialiste de la haute pression, et fait l’objet d’une maintenance deux fois par an pour contrôler le circuit et les buses.',
      },
      {
        question: 'Quel entretien prévoir ?',
        reponse:
          'Très peu. La structure en aluminium thermolaqué ne rouille pas, même en bord de mer, et se nettoie simplement à l’eau. L’assise en bois Kebony ne demande aucun traitement et prend une teinte argentée avec le temps. Sur Galiléo, la brumisation est révisée deux fois par an. Sur Fotos, les plantes s’arrosent seules par capillarité grâce au réservoir d’eau de pluie de 120 L ; il suffit de les entretenir comme un massif.',
      },
      {
        question: 'Quelle garantie et quelle durée de vie ?',
        reponse:
          'Les abris sont pensés pour durer : structure en aluminium recyclé à 40 % minimum et thermolaqué, assise en bois Kebony classe 4, toiture en tôle d’aluminium perforée. Le bois Kebony est garanti 30 ans contre les champignons et la pourriture, la structure aluminium 5 ans et le système de brumisation 2 ans, à compter de la livraison. Le bois demande un simple brossage à sec mensuel, la brumisation une maintenance avant et après l’été.',
      },
      {
        question: 'Quels ancrages au sol nécessitent vos abris ?',
        reponse:
          'Cela dépend de la gamme. Galiléo est ancré au sol sur une fondation béton, avec une arrivée d’eau qui passe par le sol. Fotos ne nécessite aucun ancrage : sa jardinière contient près de 800 kg de terre qui la lestent naturellement. Il peut être posé en pleine terre ou rester déplaçable au chariot élévateur. Les caractéristiques de résistance figurent dans les fiches techniques.',
      },
      {
        question: 'Quelle est la fréquence d’arrosage recommandée des plantes en jardinière Fotos ?',
        reponse:
          'Le réservoir de 120 L récupère l’eau de pluie et arrose les plantes par capillarité. Les besoins complémentaires dépendent des plantes, de la saison et de l’exposition de votre site. Nous vous accompagnons dans le choix des végétaux et les consignes d’entretien adaptées.',
      },
      {
        question: 'Combien coûte une installation Abri Toi ?',
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
      'J’ai toujours aimé observer la ville et les lieux où l’on se retrouve au quotidien.\nAprès cinq années dans l’aménagement urbain chez Pro Urba, j’ai fondé Abri Toi à Lyon, en octobre 2025, pour rendre les espaces urbains plus confortables, plus vivants et plus durables.\n\nUne envie guide ce projet : permettre à chacun de s’asseoir à l’ombre et de profiter plus longtemps de la ville.',
    nom: 'Paul Saraceno',
    role: 'Fondateur & designer industriel',
  },
  articles: {
    titre: 'Comprendre l’enjeu de l’ombre en ville.',
    lien: 'Tous les articles',
    selection: ['recuperer-eau-pluie-vegetaliser-villes', 'ombrage-cour-ecole-solutions-sans-plantation', 'solution-ombrage-metallique-aluminium'],
  },
}
