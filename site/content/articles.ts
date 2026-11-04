import type { Img } from './commun'

export type Categorie = 'collectivites' | 'sante' | 'conception' | 'vegetation'

export const categories: { cle: Categorie; label: string }[] = [
  { cle: 'collectivites', label: 'Collectivités' },
  { cle: 'sante', label: 'Santé' },
  { cle: 'conception', label: 'Conception' },
  { cle: 'vegetation', label: 'Végétation' },
]

// Fonds proposés dans Sanity pour les couvertures illustrées
export const fondsCouverture = [
  { title: 'Papier', value: '#fbf8f3' },
  { title: 'Orange clair', value: '#fbe3cf' },
  { title: 'Sauge', value: '#dde3d3' },
  { title: 'Sable', value: '#e9dfd1' },
]

// Corps d'article au format Portable Text (celui de Sanity)
export type Bloc =
  | { _type: 'block'; _key: string; style: 'normal' | 'h2'; markDefs: []; children: { _type: 'span'; _key: string; text: string; marks: string[] }[] }
  | { _type: 'encadre'; _key: string; titre: string; texte: string }
  | { _type: 'citation'; _key: string; texte: string; auteur: string }
  | { _type: 'imageLegendee'; _key: string; image: Img; legende: string }

export interface Article {
  slug: string
  titre: string
  categorie: Categorie
  tempsLecture: number
  date: string
  extrait: string
  couverture: Img
  couvertureFond: string
  couvertureInset?: boolean
  // Illustration en tête d'article (sinon la couverture est reprise)
  illustration?: Img
  legendeIllustration?: string
  auteur: { nom: string; bio: string; photo?: Img }
  intro: string
  corps: Bloc[]
}

let k = 0
const key = () => `b${++k}`
const p = (text: string): Bloc => ({
  _type: 'block',
  _key: key(),
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})
const h2 = (text: string): Bloc => ({ ...(p(text) as Extract<Bloc, { _type: 'block' }>), style: 'h2' })

const paul = {
  nom: 'Paul Saraceno',
  bio: 'Fondateur d’Abri Toi. Il conçoit à Lyon des abris qui rafraîchissent les espaces publics.',
  photo: { src: '/images/figma-secondary/paul-saraceno.png', alt: 'Paul Saraceno' },
}

const enCours = [p('Article en cours de rédaction.')]

export const articles: Article[] = [
  {
    slug: 'vegetation-barriere-pollution',
    titre: 'La végétation est-elle vraiment une barrière à la pollution ?',
    categorie: 'vegetation',
    tempsLecture: 6,
    date: '2026-10-14',
    extrait:
      'Haies, arbres, plantes grimpantes : on prête beaucoup de vertus au végétal en ville. Ce que disent vraiment les études, et ce qu’on peut en attendre sous un abri Fotos.',
    couverture: { src: '/images/articles/generated/vegetation-barriere-pollution.png', alt: 'Illustration éditoriale : La végétation est-elle vraiment une barrière à la pollution ?' },
    couvertureFond: '#dde3d3',
    illustration: { src: '/images/articles/generated/vegetation-barriere-pollution.png', alt: 'Illustration éditoriale : La végétation est-elle vraiment une barrière à la pollution ?' },
    legendeIllustration: 'Illustration · abri Fotos, filet de grimpe en filets de pêche recyclés',
    auteur: paul,
    intro:
      'On plante des arbres, des haies et des façades végétales pour « dépolluer » la ville. L’idée est séduisante, mais la réalité est plus nuancée : selon l’endroit où on le place, le végétal peut aider… ou piéger la pollution là où l’on respire.',
    corps: [
      h2('Ce que la végétation fait vraiment'),
      p(
        'Les feuilles retiennent une partie des particules fines qui se déposent à leur surface, puis la pluie les lessive vers le sol. Certaines espèces captent aussi des polluants gazeux. Ces effets existent, mais ils restent modestes à l’échelle d’une rue : la végétation ne remplace pas la réduction du trafic.',
      ),
      p(
        'Son vrai point fort est ailleurs : l’ombre et la fraîcheur. En évaporant de l’eau, les plantes rafraîchissent l’air qui les entoure, et leur feuillage protège du rayonnement direct.',
      ),
      {
        _type: 'encadre',
        _key: key(),
        titre: 'À retenir',
        texte:
          'Le végétal est d’abord un outil de confort thermique. Contre la pollution, il aide surtout s’il est bien placé : bas et dense entre la route et les usagers.',
      },
      h2('Là où elle peut gêner'),
      p(
        'Dans une rue étroite bordée d’immeubles, une rangée d’arbres très denses peut former un couvercle : l’air circule moins bien et les gaz d’échappement restent piégés au niveau des piétons. C’est l’effet inverse de celui recherché.',
      ),
      {
        _type: 'citation',
        _key: key(),
        texte: '« Une plante au mauvais endroit, c’est de l’ombre en moins et de la pollution en plus. »',
        auteur: 'Paul Saraceno, fondateur',
      },
      h2('Bien placer le végétal'),
      p(
        'Les haies basses et denses, plantées entre la circulation et les zones d’assise, font écran sans bloquer la ventilation. En hauteur, mieux vaut un feuillage léger qui laisse passer l’air. Et dans tous les cas, il faut de l’eau : une plante qui souffre de la sécheresse ne rafraîchit plus.',
      ),
      {
        _type: 'imageLegendee',
        _key: key(),
        image: { src: '/images/articles/photo-fotos-en-situation.jpg', alt: 'Un abri Fotos en cours de végétalisation' },
        legende: 'Un abri Fotos en cours de végétalisation',
      },
      h2('Et sous un abri Fotos ?'),
      p(
        'Fotos a été pensé dans cette logique. Les grimpantes poussent dans un bac d’un mètre cube de terre et montent le long d’un filet en filets de pêche recyclés. Un réservoir de 120 litres récupère l’eau de pluie et arrose les racines par capillarité, sans raccordement au réseau.',
      ),
      p(
        'Résultat : une ombre qui s’épaissit chaque saison, un feuillage qui laisse circuler l’air, et un abri que l’on peut déplacer si l’usage de la place change.',
      ),
    ],
  },
  {
    slug: 'seniors-ehpad-canicules',
    titre: 'Nos seniors ont besoin d’ombre : adapter les EHPAD aux canicules',
    categorie: 'sante',
    tempsLecture: 5,
    date: '2026-10-07',
    extrait: '',
    couverture: { src: '/images/figma-secondary/seniors-ehpad-canicules.png', alt: 'Illustration éditoriale : Nos seniors ont besoin d’ombre : adapter les EHPAD aux canicules' },
    couvertureFond: '#fbf8f3',
    illustration: { src: '/images/figma-secondary/seniors-ehpad-canicules.png', alt: 'Illustration éditoriale : Nos seniors ont besoin d’ombre : adapter les EHPAD aux canicules' },
    auteur: paul,
    intro: '',
    corps: enCours,
  },
  {
    slug: 'brumisation-haute-pression',
    titre: 'Brumisation très haute pression : comment ça marche ?',
    categorie: 'conception',
    tempsLecture: 5,
    date: '2026-09-23',
    extrait: '',
    couverture: { src: '/images/articles/generated/brumisation-haute-pression.png', alt: 'Illustration éditoriale : Brumisation très haute pression : comment ça marche ?' },
    couvertureFond: '#dde3d3',
    illustration: { src: '/images/articles/generated/brumisation-haute-pression.png', alt: 'Illustration éditoriale : Brumisation très haute pression : comment ça marche ?' },
    auteur: paul,
    intro: '',
    corps: enCours,
  },
  {
    slug: 'ombrager-cours-ecole',
    titre: 'Cours d’école : ombrager les cours avant l’été',
    categorie: 'collectivites',
    tempsLecture: 4,
    date: '2026-09-16',
    extrait: '',
    couverture: { src: '/images/articles/generated/ombrager-cours-ecole.png', alt: 'Illustration éditoriale : Cours d’école : ombrager les cours avant l’été' },
    couvertureFond: '#e9dfd1',
    illustration: { src: '/images/articles/generated/ombrager-cours-ecole.png', alt: 'Illustration éditoriale : Cours d’école : ombrager les cours avant l’été' },
    auteur: paul,
    intro: '',
    corps: enCours,
  },
  {
    slug: 'toiture-perforee-40-degres',
    titre: 'Toiture perforée : pourquoi 40 °C au lieu de 60 °C sous le soleil',
    categorie: 'conception',
    tempsLecture: 4,
    date: '2026-09-09',
    extrait: '',
    couverture: { src: '/images/articles/generated/toiture-perforee-40-degres.png', alt: 'Illustration éditoriale : Toiture perforée : pourquoi 40 °C au lieu de 60 °C sous le soleil' },
    couvertureFond: '#e9dfd1',
    illustration: { src: '/images/articles/generated/toiture-perforee-40-degres.png', alt: 'Illustration éditoriale : Toiture perforée : pourquoi 40 °C au lieu de 60 °C sous le soleil' },
    auteur: paul,
    intro: '',
    corps: enCours,
  },
  {
    slug: 'arroser-sans-reseau-eau-de-pluie',
    titre: 'Arroser sans réseau : 120 litres d’eau de pluie et des plantes qui grimpent',
    categorie: 'vegetation',
    tempsLecture: 6,
    date: '2026-09-02',
    extrait: '',
    couverture: { src: '/images/articles/generated/arroser-sans-reseau-eau-de-pluie.png', alt: 'Illustration éditoriale : Arroser sans réseau : 120 litres d’eau de pluie et des plantes qui grimpent' },
    couvertureFond: '#dde3d3',
    illustration: { src: '/images/articles/generated/arroser-sans-reseau-eau-de-pluie.png', alt: 'Illustration éditoriale : Arroser sans réseau : 120 litres d’eau de pluie et des plantes qui grimpent' },
    auteur: paul,
    intro: '',
    corps: enCours,
  },
  {
    slug: 'recuperer-eau-pluie-vegetaliser-villes',
    titre: 'Récupérer l’eau de pluie : un enjeu indispensable pour végétaliser nos villes',
    categorie: 'vegetation',
    tempsLecture: 6,
    date: '2026-10-30',
    extrait:
      'Récupération des eaux pluviales, végétalisation et ombrage : découvrez comment capter l’eau de pluie au plus près de sa chute pour la restituer progressivement aux plantations.',
    couverture: { src: '/images/figma-secondary/recuperer-eau-pluie-vegetaliser-villes.png', alt: 'Illustration éditoriale : Récupérer l’eau de pluie : un enjeu indispensable pour végétaliser nos villes' },
    couvertureFond: '#dde3d3',
    illustration: { src: '/images/figma-secondary/recuperer-eau-pluie-vegetaliser-villes.png', alt: 'Illustration éditoriale : Récupérer l’eau de pluie : un enjeu indispensable pour végétaliser nos villes' },
    legendeIllustration: 'Fotos associe ombrage, jardinières et récupération de l’eau de pluie.',
    auteur: paul,
    intro:
      'En ville, les périodes de chaleur et le manque de pluie fragilisent les plantations au moment où elles ont le plus besoin d’eau. Planter ne suffit pas : il faut aussi réfléchir à la façon dont l’eau est dirigée, captée, stockée et rendue disponible pour les végétaux.',
    corps: [
      h2('Un été 2026 exceptionnellement chaud et sec'),
      p('Selon Météo-France, l’été 2026 a été le plus chaud observé en France depuis le début des mesures en 1900, avec une température moyenne de 24 °C, soit 3,6 °C au-dessus de la normale. La pluviométrie a été déficitaire de près de 40 %. En juillet, les précipitations ont été inférieures de 67 % à la normale. Ces données illustrent les difficultés rencontrées par les collectivités et les gestionnaires d’espaces : la végétation urbaine doit pouvoir faire face aux périodes sèches.'),
      h2('Récupérer l’eau de pluie au plus près de sa chute'),
      p('En milieu urbain, une partie de la pluie ruisselle sur les toitures et les surfaces imperméables, puis rejoint les caniveaux et les réseaux. Une approche complémentaire consiste à gérer l’eau à la source : la récupérer, la diriger vers les plantations et favoriser son infiltration à des endroits pertinents, comme les pieds d’arbres et les bosquets.'),
      p('Une toiture peut être raccordée à un réservoir d’arrosage ou à une zone plantée. Dans une rue, une légère pente peut guider l’eau vers des fosses de plantation ou des noues. La conception doit tenir compte du site, de la nature des sols, des volumes d’eau et des éventuels trop-pleins. Cette logique rejoint les recommandations du ministère de la Transition écologique sur la réduction de l’imperméabilisation et la maîtrise du ruissellement au plus près du point de chute.'),
      h2('Des aménagements qui dirigent l’eau vers les plantations'),
      p('À Asnières-sur-Seine, rue Sœur-Valérie, la chaussée a été aménagée pour diriger les eaux pluviales vers des fosses plantées. À Montrevault-sur-Èvre, les eaux de ruissellement de la voirie sont dirigées vers des noues ; l’Hôtel de Ville y raccorde aussi ses eaux de toiture et un parking utilise un revêtement poreux. Ces exemples montrent que la gestion de l’eau peut s’intégrer aux rues, aux parkings et aux espaces plantés.'),
      h2('Fotos : un ombrage végétalisé qui récupère l’eau de pluie'),
      p('La gamme Fotos d’Abri Toi associe un espace d’ombrage à des jardinières intégrées et à un système de récupération d’eau de pluie par la toiture. L’eau collectée est dirigée vers un réservoir de 60 à 120 litres. Un dispositif de diffusion par capillarité la restitue progressivement aux racines des plantations.'),
      p('Fotos propose une réponse complémentaire aux aménagements paysagers classiques : un dispositif déplaçable qui associe ombrage, végétalisation et récupération des eaux pluviales, dans les espaces où il n’est pas toujours possible de planter des arbres.'),
      h2('La récupération des eaux pluviales, un levier parmi d’autres'),
      p('Un réservoir de 60 à 120 litres ne remplace pas une stratégie globale de gestion de l’eau. Son autonomie dépend de la surface de toiture collectrice, des précipitations, de la fréquence d’arrosage et des besoins des végétaux. Il ne supprime pas non plus le besoin d’entretien et de suivi des plantations.'),
      p('Capter la pluie lorsqu’elle tombe, la stocker puis la restituer progressivement constitue toutefois un levier concret pour intégrer la végétalisation aux espaces urbains. Avec Fotos, Abri Toi combine ombrage, plantations en bac et récupération de l’eau de pluie au sein d’un même aménagement.'),
    ],
  },
  {
    slug: 'ombrage-cour-ecole-solutions-sans-plantation',
    titre: 'Ombrage de cour d’école : quelles solutions quand on ne peut pas planter ?',
    categorie: 'collectivites',
    tempsLecture: 7,
    date: '2026-10-30',
    extrait:
      'Ombrage de cour d’école : découvrez les solutions pour créer des espaces frais, de la plantation à la végétalisation, et une alternative déplaçable quand planter est impossible.',
    couverture: { src: '/images/figma-secondary/ombrage-cour-ecole-solutions-sans-plantation.png', alt: 'Illustration éditoriale : Ombrage de cour d’école : quelles solutions quand on ne peut pas planter ?' },
    couvertureFond: '#e9dfd1',
    illustration: { src: '/images/figma-secondary/ombrage-cour-ecole-solutions-sans-plantation.png', alt: 'Illustration éditoriale : Ombrage de cour d’école : quelles solutions quand on ne peut pas planter ?' },
    auteur: paul,
    intro:
      'Désimperméabiliser, planter des arbres et végétaliser les cours aide à créer des espaces plus agréables. Mais les réseaux enterrés, le sol, le budget ou le calendrier des travaux peuvent limiter ces possibilités. Plusieurs solutions permettent alors de penser l’ombrage de façon progressive.',
    corps: [
      h2('Des villes réaménagent leurs cours d’école'),
      p('À Saint-Cloud, le Cerema documente la transformation d’une cour associant plantations, sols moins imperméables, revêtements plus clairs et gestion des eaux pluviales. À Bry-sur-Marne, les cours du groupe scolaire Étienne-de-Silhouette ont été désimperméabilisées et végétalisées. À Hyères, une première cour a été réaménagée dans le cadre d’une démarche de cour oasis, ensuite étendue à d’autres établissements. À Saint-Fons, le groupe scolaire Salvador Allende a vu ses 6 000 m² de cour réaménagés, avec désimperméabilisation des sols, espaces ombragés et plantation d’arbres.'),
      p('Ces projets montrent l’intérêt d’une approche globale et la nécessité d’étudier chaque site : nature du sol, réseaux, usages, entretien et budget.'),
      h2('Quelles solutions pour créer de l’ombre dans une cour d’école ?'),
      h2('1. Décroutage et désimperméabilisation des sols'),
      p('Retirer une partie de l’enrobé ou du béton peut rendre le sol plus perméable et permettre de développer la végétation. Cette démarche contribue aussi à mieux gérer l’eau de pluie. Elle nécessite toutefois d’étudier le sol, les usages de la cour et les contraintes techniques avant d’engager les travaux. À Macau, un revêtement poreux a été posé dans la cour de l’école ; le retour d’expérience du Cerema décrit les bénéfices visés pour l’infiltration et le confort, ainsi que les difficultés de pose rencontrées.'),
      h2('2. Plantation d’arbres'),
      p('Les arbres offrent une ombre naturelle et participent à la végétalisation de la cour. Leur implantation doit tenir compte de la place disponible, de la qualité du sol, des réseaux enterrés et du temps nécessaire à leur développement. À Montrouge, la transformation de la cour de l’école maternelle Berthelot a associé arbres, végétalisation et aménagements favorisant l’infiltration de l’eau.'),
      h2('3. Végétalisation de la cour'),
      p('Massifs, espaces plantés, haies ou jardinières peuvent faire davantage de place au végétal. Selon leur emplacement et leur conception, ces aménagements contribuent à créer des zones plus agréables et à enrichir le cadre de vie scolaire. La démarche des cours Oasis de la Ville de Paris propose également des ressources sur ces aménagements.'),
      h2('4. Brumisation, en complément'),
      p('La brumisation peut compléter un espace ombragé pendant les périodes chaudes. Elle ne remplace pas la création d’ombre et implique de réfléchir à son installation et à sa consommation d’eau. Elle s’envisage en fonction des usages et des équipements déjà présents.'),
      h2('Quand on ne peut pas planter : les contraintes à prendre en compte'),
      p('Les réseaux enterrés peuvent limiter les possibilités de creuser. Un sol compacté ou contraint peut nécessiter des travaux avant d’accueillir des plantations. Le budget, les études préalables et le calendrier peuvent retarder le projet. Enfin, la cour doit rester accessible et les travaux sont souvent à organiser pendant les périodes de fermeture de l’école.'),
      p('Ces contraintes ne signifient pas qu’il faut renoncer à l’ombrage. Elles invitent à comparer les solutions et à envisager des aménagements complémentaires, notamment lorsque les travaux de fond ne peuvent pas être engagés rapidement.'),
      h2('En complément des travaux : Fotos, une structure d’ombrage végétalisée et déplaçable'),
      p('Pour les sites où il est difficile de planter directement en pleine terre, Fotos est une microstructure d’ombrage qui associe jardinières et mobilier de confort, pour favoriser le lien social et le partage.'),
      p('Fotos ne remplace ni la plantation d’arbres ni un projet de désimperméabilisation. C’est une solution complémentaire à étudier lorsque les contraintes du site rendent ces travaux plus difficiles, ou lorsqu’un besoin d’ombrage doit être traité avant leur réalisation.'),
    ],
  },
  {
    slug: 'solution-ombrage-metallique-aluminium',
    titre: 'Solution d’ombrage métallique : l’aluminium, un matériau aux propriétés thermiques méconnues',
    categorie: 'conception',
    tempsLecture: 7,
    date: '2026-10-30',
    extrait:
      'Découvrez les propriétés de l’aluminium pour un abri solaire durable : légèreté, conception de toiture et confort thermique dans les espaces publics.',
    couverture: { src: '/images/figma-secondary/solution-ombrage-metallique-aluminium.png', alt: 'Illustration éditoriale : Solution d’ombrage métallique : l’aluminium, un matériau aux propriétés thermiques méconnues' },
    couvertureFond: '#e9dfd1',
    illustration: { src: '/images/figma-secondary/solution-ombrage-metallique-aluminium.png', alt: 'Illustration éditoriale : Solution d’ombrage métallique : l’aluminium, un matériau aux propriétés thermiques méconnues' },
    auteur: paul,
    intro:
      'Une solution d’ombrage métallique doit créer de l’ombre, durer et contribuer au confort des personnes qui l’utilisent. Chez Abri Toi, l’observation du comportement de différents métaux exposés au soleil nous a conduits à privilégier l’aluminium pour la toiture de la gamme Galiléo.',
    corps: [
      h2('Pourquoi l’aluminium reste-t-il peu présent dans le mobilier urbain ?'),
      p('L’acier permet de réaliser des structures robustes, mais son poids peut compliquer le transport, la pose ou le déplacement. L’aluminium est plus léger, ce qui facilite la mise en place et peut permettre de concevoir des structures déplaçables lorsque l’aménagement évolue. Il ne rouille pas comme l’acier ordinaire, mais il peut se corroder dans certaines conditions : alliage, finitions et environnement d’installation restent importants.'),
      p('L’aluminium conduit bien la chaleur et peut la répartir rapidement dans la matière. Cela ne signifie pas qu’une toiture en aluminium reste froide à elle seule. Sa température dépend aussi de sa couleur, de son état de surface, de sa réflectance solaire, de la ventilation et de sa géométrie. Le confort s’évalue à l’échelle de la conception d’ensemble.'),
      h2('Un test comparatif réalisé en interne chez Abri Toi'),
      p('Nous avons comparé trois tôles de mêmes dimensions et de même épaisseur : une tôle pleine en aluminium, une tôle perforée en aluminium et une tôle pleine en acier. Les échantillons avaient un grain de surface comparable et étaient orientés de la même manière face au soleil. Lors du test, la température extérieure était de 35 °C. Dans les conditions de cet essai, la tôle d’aluminium perforée n’a pas dépassé 40 °C, tandis que la tôle d’acier pleine s’est approchée de 60 °C.'),
      {
        _type: 'imageLegendee',
        _key: key(),
        image: { src: '/images/articles/test-temperature-aluminium-perfore.jpeg', alt: 'Mesure de température sur une tôle d’aluminium perforée' },
        legende: 'Lors de notre essai, la tôle d’aluminium perforée est restée sous les 40 °C.',
      },
      {
        _type: 'imageLegendee',
        _key: key(),
        image: { src: '/images/articles/test-temperature-acier-plein.jpeg', alt: 'Mesure de température sur une tôle d’acier pleine' },
        legende: 'La tôle d’acier pleine s’est approchée de 60 °C dans les mêmes conditions d’essai.',
      },
      p('Il s’agit d’un test interne, réalisé dans des conditions données : il ne constitue pas une étude scientifique indépendante et ne permet pas de généraliser à toutes les tôles, finitions ou conditions météo. La perforation peut modifier l’exposition au soleil et la circulation de l’air autour de la surface. Une comparaison rigoureuse documenterait aussi la méthode de mesure, l’instrument, l’heure, le vent et le rayonnement solaire.'),
      p('Les recherches sur les protections solaires montrent que leur efficacité dépend notamment de la géométrie, du taux d’ouverture et de l’orientation des écrans. La réflectance solaire et l’émissivité thermique influencent également la température de surface et les transferts de chaleur.'),
      h2('L’aluminium au cœur de la toiture Galiléo'),
      p('À la suite de nos observations, nous avons choisi l’aluminium pour les toitures de la gamme Galiléo. Notre objectif est de créer un espace ombragé durable pour les lieux où planter des arbres n’est pas toujours possible ou suffisant : cours d’école, places publiques, terrasses d’EHPAD ou esplanades piétonnes.'),
      p('La toiture en aluminium brut présente une surface fortement réfléchissante. Associée à la conception de la structure, elle contribue à limiter l’échauffement lié au soleil. Toute surface exposée au soleil absorbe, réfléchit et réémet de l’énergie ; l’objectif est d’améliorer le confort sous l’abri grâce à une protection solaire adaptée et à une conception cohérente.'),
      {
        _type: 'imageLegendee',
        _key: key(),
        image: { src: '/images/articles/toiture-aluminium-perforee-detail.jpeg', alt: 'Détail de la toiture perforée en aluminium de Galiléo' },
        legende: 'Détail de la sous-face en aluminium perforé de la toiture Galiléo.',
      },
      p('Avec Galiléo, Abri Toi propose une solution d’ombrage métallique conçue pour accueillir plusieurs personnes et créer un véritable espace de vie. Selon le projet, elle peut être complétée par des assises, de la végétation ou un système de brumisation. L’implantation et l’orientation solaire sont étudiées en amont.'),
      h2('Une solution d’ombrage métallique à évaluer dans son ensemble'),
      p('L’aluminium n’est pas une réponse magique à la chaleur. Sa légèreté, sa résistance à la corrosion dans des conditions adaptées et ses propriétés thermiques en font un matériau pertinent pour le mobilier urbain et les structures d’ombrage. Pour choisir une solution, il est utile de comparer le comportement de la toiture au soleil, la surface réellement ombragée, l’orientation, la facilité d’installation et les possibilités d’évolution du site.'),
      p('Chez Abri Toi, ces critères ont guidé la conception de Galiléo : apporter de l’ombre, faciliter l’installation et créer un lieu accueillant, là où le besoin de fraîcheur se fait sentir.'),
    ],
  },
]
