// Raccourcis pour déclarer les champs de façon homogène dans tous les schémas.
import { defineArrayMember, defineField } from 'sanity'

type Extra = Record<string, unknown>

export const texte = (name: string, title: string, extra: Extra = {}) =>
  defineField({ name, title, type: 'string', ...extra })

export const paragraphe = (name: string, title: string, extra: Extra = {}) =>
  defineField({ name, title, type: 'text', rows: 3, ...extra })

export const image = (name: string, title: string, extra: Extra = {}) =>
  defineField({
    name,
    title,
    type: 'image',
    options: { hotspot: true },
    fields: [defineField({ name: 'alt', title: 'Description de l’image (accessibilité)', type: 'string' })],
    ...extra,
  })

export const listeTextes = (name: string, title: string, extra: Extra = {}) =>
  defineField({ name, title, type: 'array', of: [defineArrayMember({ type: 'string' })], ...extra })

export const objet = (name: string, title: string, fields: ReturnType<typeof defineField>[], extra: Extra = {}) =>
  defineField({ name, title, type: 'object', fields, options: { collapsible: true, collapsed: false }, ...extra })

export const liste = (
  name: string,
  title: string,
  fields: ReturnType<typeof defineField>[],
  preview: { title: string; subtitle?: string; media?: string },
  extra: Extra = {},
) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [defineArrayMember({ type: 'object', fields, preview: { select: preview } })],
    ...extra,
  })

// En-tête brun des pages intérieures
export const hero = (avecAncres = false) =>
  objet('hero', 'En-tête de page', [
    texte('titre', 'Titre', { validation: (r: any) => r.required() }),
    paragraphe('chapo', 'Texte d’introduction'),
    ...(avecAncres
      ? [
          liste(
            'ancres',
            'Boutons d’ancre',
            [
              texte('label', 'Libellé'),
              texte('cible', 'Section visée', { description: 'Ex. #galileo : identifiant de la section sur la page' }),
              texte('point', 'Pastille de couleur', {
                options: { list: [{ title: 'Orange', value: 'orange' }, { title: 'Sauge', value: 'sage' }] },
              }),
            ],
            { title: 'label', subtitle: 'cible' },
          ),
        ]
      : []),
  ])

export const lignes = (name: string, title: string) =>
  liste(name, title, [texte('label', 'Intitulé'), texte('valeur', 'Valeur')], { title: 'label', subtitle: 'valeur' })

export const gammeChamp = (name = 'gamme', title = 'Gamme') =>
  texte(name, title, {
    options: { list: [{ title: 'Galiléo', value: 'galileo' }, { title: 'Fotos', value: 'fotos' }], layout: 'radio' },
    validation: (r: any) => r.required(),
  })
