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
    couverture: { src: '/images/articles/a-la-une-vegetation.svg' },
    couvertureFond: '#dde3d3',
    illustration: { src: '/images/articles/couverture-vegetation.svg' },
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
    couverture: { src: '/images/articles/ehpad.svg' },
    couvertureFond: '#fbf8f3',
    auteur: paul,
    intro: '',
    corps: enCours,
  },
  {
    slug: 'financer-ombrage-espaces-publics',
    titre: 'Îlots de fraîcheur : comment financer l’ombrage de vos espaces publics',
    categorie: 'collectivites',
    tempsLecture: 5,
    date: '2026-09-30',
    extrait: '',
    couverture: { src: '/images/articles/financer-ilots.svg' },
    couvertureFond: '#fbe3cf',
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
    couverture: { src: '/images/articles/brumisation.svg' },
    couvertureFond: '#dde3d3',
    couvertureInset: true,
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
    couverture: { src: '/images/articles/cours-ecole.svg' },
    couvertureFond: '#e9dfd1',
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
    couverture: { src: '/images/articles/toiture-perforee.svg' },
    couvertureFond: '#e9dfd1',
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
    couverture: { src: '/images/articles/brumisation.svg' },
    couvertureFond: '#dde3d3',
    couvertureInset: true,
    auteur: paul,
    intro: '',
    corps: enCours,
  },
]
