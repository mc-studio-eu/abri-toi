import { defineArrayMember, defineField, defineType } from 'sanity'
import { categories, fondsCouverture } from '../../../site/content/articles'
import { gammeChamp, image, liste, lignes, objet, paragraphe, texte } from '../champs'

const slug = (source: string) =>
  defineField({
    name: 'slug',
    title: 'Adresse de la page',
    type: 'slug',
    options: { source, maxLength: 80 },
    validation: (r) => r.required(),
  })

export const parametres = defineType({
  name: 'parametres',
  title: 'Paramètres du site',
  type: 'document',
  fields: [
    texte('boutonNav', 'Bouton du menu'),
    texte('telephone', 'Téléphone'),
    texte('email', 'E-mail de contact'),
    texte('adresse', 'Adresse du bureau'),
    paragraphe('pitch', 'Phrase du pied de page'),
    defineField({ name: 'linkedin', title: 'Lien LinkedIn', type: 'url' }),
    defineField({ name: 'youtube', title: 'Lien YouTube', type: 'url' }),
    texte('mentions', 'Mentions en bas de page'),
    liste(
      'partenaires',
      'Logos partenaires (bandeau défilant)',
      [
        texte('nom', 'Nom'),
        image('logo', 'Logo'),
        defineField({ name: 'largeur', title: 'Largeur affichée (px)', type: 'number' }),
        defineField({ name: 'hauteur', title: 'Hauteur affichée (px)', type: 'number' }),
      ],
      { title: 'nom', media: 'logo' },
    ),
    objet('contact', 'Bloc « Un projet d’ombrage… » (bas de page)', [
      texte('titre', 'Titre'),
      paragraphe('texte', 'Texte'),
      texte('bouton', 'Bouton'),
    ]),
  ],
  preview: { prepare: () => ({ title: 'Paramètres du site' }) },
})

export const gamme = defineType({
  name: 'gamme',
  title: 'Gamme',
  type: 'document',
  fields: [
    texte('cle', 'Identifiant technique', { readOnly: true }),
    texte('nom', 'Nom'),
    texte('tag', 'Accroche courte'),
    texte('labelEspaces', 'Titre de la rangée « espaces »'),
    defineField({
      name: 'documentation',
      title: 'Documentation technique (PDF)',
      type: 'file',
      description: 'Envoyée après saisie de l’e-mail sur les fiches produits de la gamme.',
      options: { accept: 'application/pdf' },
    }),
    liste(
      'reassurance',
      'Arguments sur les fiches produits',
      [image('icone', 'Pictogramme'), texte('titre', 'Titre'), paragraphe('texte', 'Texte')],
      { title: 'titre', media: 'icone' },
      { validation: (r: any) => r.max(3) },
    ),
  ],
  preview: { select: { title: 'nom', subtitle: 'tag' } },
})

export const produit = defineType({
  name: 'produit',
  title: 'Produit',
  type: 'document',
  groups: [
    { name: 'carte', title: 'Carte (page Produits)', default: true },
    { name: 'fiche', title: 'Fiche produit' },
  ],
  fields: [
    texte('nom', 'Nom sur la carte', { group: 'carte', validation: (r: any) => r.required() }),
    { ...slug('nom'), group: 'carte' },
    { ...gammeChamp(), group: 'carte' },
    texte('categorie', 'Type', {
      group: 'carte',
      options: {
        list: [
          { title: 'Modèle (a sa fiche produit)', value: 'modele' },
          { title: 'Espace (deux modules en vis-à-vis)', value: 'espace' },
        ],
        layout: 'radio',
      },
      validation: (r: any) => r.required(),
    }),
    defineField({ name: 'ordre', title: 'Ordre d’affichage', type: 'number', group: 'carte' }),
    paragraphe('description', 'Description de la carte', { group: 'carte' }),
    image('visuel', 'Visuel de la carte', { group: 'carte' }),
    defineField({
      name: 'lienVers',
      title: 'Fiche produit liée',
      description: 'Pour un espace : la fiche du modèle qui le compose.',
      type: 'reference',
      to: [{ type: 'produit' }],
      group: 'carte',
      hidden: ({ document }) => document?.categorie !== 'espace',
    }),
    objet(
      'fiche',
      'Fiche produit',
      [
        texte('titre', 'Titre de la fiche'),
        texte('sousTitre', 'Sous-titre'),
        paragraphe('description', 'Description'),
        defineField({
          name: 'galerie',
          title: 'Galerie photos',
          description: 'La première image est affichée en grand.',
          type: 'array',
          of: [defineArrayMember({ type: 'image', options: { hotspot: true } })],
          options: { layout: 'grid' },
        }),
        lignes('caracteristiques', 'Caractéristiques techniques'),
        liste(
          'similaires',
          'Produits « Dans la même gamme »',
          [
            defineField({ name: 'produit', title: 'Produit', type: 'reference', to: [{ type: 'produit' }] }),
            texte('titre', 'Titre'),
            paragraphe('description', 'Description'),
          ],
          { title: 'titre', subtitle: 'description' },
          { validation: (r: any) => r.max(3) },
        ),
      ],
      { group: 'fiche', hidden: ({ document }: any) => document?.categorie === 'espace' },
    ),
  ],
  orderings: [{ title: 'Ordre d’affichage', name: 'ordre', by: [{ field: 'ordre', direction: 'asc' }] }],
  preview: { select: { title: 'nom', subtitle: 'gamme', media: 'visuel' } },
})

export const realisation = defineType({
  name: 'realisation',
  title: 'Réalisation',
  type: 'document',
  fields: [
    texte('nom', 'Nom du projet', { validation: (r: any) => r.required() }),
    gammeChamp(),
    paragraphe('description', 'Description courte'),
    image('photo', 'Photo', { validation: (r: any) => r.required() }),
    defineField({ name: 'ordre', title: 'Ordre d’affichage', type: 'number' }),
  ],
  orderings: [{ title: 'Ordre d’affichage', name: 'ordre', by: [{ field: 'ordre', direction: 'asc' }] }],
  preview: { select: { title: 'nom', subtitle: 'gamme', media: 'photo' } },
})

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  groups: [
    { name: 'carte', title: 'Présentation', default: true },
    { name: 'contenu', title: 'Contenu' },
  ],
  fields: [
    texte('titre', 'Titre', { group: 'carte', validation: (r: any) => r.required() }),
    { ...slug('titre'), group: 'carte' },
    texte('categorie', 'Catégorie', {
      group: 'carte',
      options: { list: categories.map((c) => ({ title: c.label, value: c.cle })) },
    }),
    defineField({ name: 'tempsLecture', title: 'Temps de lecture (min)', type: 'number', group: 'carte' }),
    defineField({ name: 'date', title: 'Date de publication', type: 'date', group: 'carte' }),
    paragraphe('extrait', 'Résumé (article à la une)', { group: 'carte' }),
    image('couverture', 'Couverture', { group: 'carte' }),
    texte('couvertureFond', 'Fond de la couverture', {
      group: 'carte',
      options: { list: fondsCouverture },
    }),
    defineField({
      name: 'couvertureInset',
      title: 'Couverture en retrait',
      description: 'Pour les illustrations qui ne remplissent pas toute la carte.',
      type: 'boolean',
      group: 'carte',
    }),
    image('illustration', 'Illustration en tête d’article', {
      group: 'contenu',
      description: 'Facultatif : sinon la couverture est reprise.',
    }),
    texte('legendeIllustration', 'Légende de l’illustration', { group: 'contenu' }),
    objet('auteur', 'Auteur', [texte('nom', 'Nom'), paragraphe('bio', 'Présentation'), image('photo', 'Photo')], {
      group: 'contenu',
    }),
    paragraphe('intro', 'Chapeau (paragraphe d’introduction)', { group: 'contenu' }),
    defineField({
      name: 'corps',
      title: 'Texte de l’article',
      description: 'Les intertitres alimentent le sommaire automatiquement.',
      type: 'array',
      group: 'contenu',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Paragraphe', value: 'normal' },
            { title: 'Intertitre', value: 'h2' },
          ],
          lists: [{ title: 'Liste à puces', value: 'bullet' }],
        }),
        defineArrayMember({
          name: 'encadre',
          title: 'Encadré « À retenir »',
          type: 'object',
          fields: [texte('titre', 'Titre', { initialValue: 'À retenir' }), paragraphe('texte', 'Texte')],
          preview: { select: { title: 'titre', subtitle: 'texte' } },
        }),
        defineArrayMember({
          name: 'citation',
          title: 'Citation',
          type: 'object',
          fields: [paragraphe('texte', 'Citation'), texte('auteur', 'Auteur')],
          preview: { select: { title: 'texte', subtitle: 'auteur' } },
        }),
        defineArrayMember({
          name: 'imageLegendee',
          title: 'Photo avec légende',
          type: 'object',
          fields: [image('image', 'Photo'), texte('legende', 'Légende')],
          preview: { select: { title: 'legende', media: 'image' } },
        }),
      ],
    }),
  ],
  orderings: [{ title: 'Date de publication', name: 'date', by: [{ field: 'date', direction: 'desc' }] }],
  preview: { select: { title: 'titre', subtitle: 'date', media: 'couverture' } },
})

// Demandes envoyées depuis le site (formulaire de contact, documentation)
export const demande = defineType({
  name: 'demande',
  title: 'Demande reçue',
  type: 'document',
  readOnly: true,
  fields: [
    texte('type', 'Type', {
      options: { list: [{ title: 'Contact', value: 'contact' }, { title: 'Documentation', value: 'documentation' }] },
    }),
    defineField({ name: 'recueLe', title: 'Reçue le', type: 'datetime' }),
    texte('email', 'E-mail'),
    texte('prenom', 'Prénom'),
    texte('nom', 'Nom'),
    texte('organisation', 'Organisation'),
    texte('fonction', 'Fonction'),
    texte('telephone', 'Téléphone'),
    texte('profil', 'Vous êtes'),
    texte('gamme', 'Gamme'),
    texte('codePostal', 'Code postal'),
    texte('echeance', 'Échéance'),
    paragraphe('message', 'Projet'),
    texte('produit', 'Produit consulté'),
  ],
  orderings: [{ title: 'Plus récentes', name: 'recueLe', by: [{ field: 'recueLe', direction: 'desc' }] }],
  preview: {
    select: { prenom: 'prenom', nom: 'nom', email: 'email', type: 'type', organisation: 'organisation' },
    prepare: ({ prenom, nom, email, type, organisation }) => ({
      title: [prenom, nom].filter(Boolean).join(' ') || email,
      subtitle: [type === 'documentation' ? 'Documentation' : 'Contact', organisation].filter(Boolean).join(' · '),
    }),
  },
})
