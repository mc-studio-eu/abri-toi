export type Categorie = 'collectivites' | 'sante' | 'conception' | 'vegetation'

export const categories: { cle: Categorie; label: string }[] = [
  { cle: 'collectivites', label: 'Collectivités' },
  { cle: 'sante', label: 'Santé' },
  { cle: 'conception', label: 'Conception' },
  { cle: 'vegetation', label: 'Végétation' },
]

