import { defineArrayMember, defineField, defineType } from 'sanity'
import { gammeChamp, hero, image, liste, listeTextes, lignes, objet, paragraphe, texte } from '../champs'

const page = (name: string, title: string, fields: ReturnType<typeof defineField>[]) =>
  defineType({ name, title, type: 'document', fields, preview: { prepare: () => ({ title }) } })

const titreIntro = [texte('titre', 'Titre'), paragraphe('intro', 'Texte d’introduction')]

const refArticle = (name: string, title: string) =>
  defineField({ name, title, type: 'reference', to: [{ type: 'article' }] })

export const pageAccueil = page('pageAccueil', 'Accueil', [
  objet('hero', 'Grand visuel', [
    image('photo', 'Photo de fond'),
    texte('surtitre', 'Surtitre'),
    texte('titre', 'Titre (1re ligne)'),
    texte('titreSuite', 'Titre (2e ligne)'),
    texte('titreAccent', 'Mot animé en fin de titre'),
    paragraphe('texte', 'Texte'),
    texte('boutonProduits', 'Bouton vers les produits'),
  ]),
  objet('manifeste', 'Manifeste', [
    defineField({
      name: 'morceaux',
      title: 'Phrase, morceau par morceau',
      description: 'Alterner des bouts de texte et des pastilles photo.',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'morceauTexte',
          title: 'Texte',
          type: 'object',
          fields: [texte('texte', 'Texte'), defineField({ name: 'accent', title: 'En italique', type: 'boolean' })],
          preview: { select: { title: 'texte' } },
        }),
        defineArrayMember({
          name: 'morceauImage',
          title: 'Pastille photo',
          type: 'object',
          fields: [image('image', 'Photo'), defineField({ name: 'largeur', title: 'Largeur (px)', type: 'number' })],
          preview: { select: { media: 'image' }, prepare: ({ media }) => ({ title: 'Pastille photo', media }) },
        }),
      ],
    }),
    texte('signatureNom', 'Signature : nom'),
    texte('signatureRole', 'Signature : rôle'),
  ]),
  objet('probleme', 'Constat', [
    texte('titre', 'Titre (1re ligne)'),
    texte('titreSuite', 'Titre (2e ligne)'),
    paragraphe('texte', 'Texte'),
    liste('chiffres', 'Chiffres', [texte('valeur', 'Chiffre'), paragraphe('texte', 'Explication')], {
      title: 'valeur',
      subtitle: 'texte',
    }),
  ]),
  objet('solution', 'Solution (vue éclatée)', [
    texte('titre', 'Titre (1re ligne)'),
    texte('titreSuite', 'Titre (2e ligne)'),
    paragraphe('intro', 'Introduction'),
    liste('communes', 'Étapes 01 et 02 (communes aux deux gammes)', [texte('titre', 'Titre'), paragraphe('texte', 'Texte')], {
      title: 'titre',
    }),
    ...(['galileo', 'fotos'] as const).map((g) =>
      objet(g, g === 'galileo' ? 'Gamme Galiléo' : 'Gamme Fotos', [
        texte('tags', 'Mots-clés'),
        paragraphe('legende', 'Légende du sélecteur'),
        liste('etapes', 'Étapes 03 et 04', [texte('titre', 'Titre'), paragraphe('texte', 'Texte')], { title: 'titre' }),
        listeTextes('etiquettes', 'Étiquettes de la vue éclatée (4)'),
        texte('badge', 'Badge de l’étape 04'),
      ]),
    ),
  ]),
  objet('modulaire', 'Système modulaire', [texte('titre', 'Titre'), paragraphe('texte', 'Texte')]),
  objet('process', 'Process', [
    texte('titre', 'Titre (1re ligne)'),
    texte('titreSuite', 'Titre (2e ligne)'),
    texte('duree', 'Durée totale'),
    texte('note', 'Note'),
    liste('etapes', 'Étapes (4)', [texte('titre', 'Titre'), paragraphe('texte', 'Texte')], { title: 'titre' }),
    image('photoContact', 'Photo de l’étape 01'),
    image('photoPose', 'Photo de l’étape 04'),
  ]),
  objet('installations', 'Premières installations', [
    texte('titre', 'Titre'),
    paragraphe('texte', 'Texte'),
    liste(
      'bandeaux',
      'Bandeaux',
      [
        texte('titre', 'Titre'),
        gammeChamp(),
        image('image', 'Photo'),
        defineField({ name: 'produit', title: 'Fiche produit liée', type: 'reference', to: [{ type: 'produit' }] }),
      ],
      { title: 'titre', media: 'image' },
    ),
    texte('labelGalerie', 'Titre de la galerie'),
    liste('galerie', 'Galerie', [image('image', 'Photo'), texte('legende', 'Légende')], {
      title: 'legende',
      media: 'image',
    }),
  ]),
  objet('faq', 'Questions fréquentes', [
    texte('titre', 'Titre'),
    paragraphe('intro', 'Introduction'),
    liste('questions', 'Questions', [texte('question', 'Question'), paragraphe('reponse', 'Réponse', { rows: 6 })], {
      title: 'question',
    }),
  ]),
  objet('fondateur', 'Mot du fondateur', [
    image('portrait', 'Portrait'),
    paragraphe('citation', 'Citation'),
    paragraphe('texte', 'Texte'),
    texte('nom', 'Nom'),
    texte('role', 'Rôle'),
  ]),
  objet('articles', 'Articles', [
    texte('titre', 'Titre'),
    texte('lien', 'Lien vers tous les articles'),
    defineField({
      name: 'selection',
      title: 'Articles mis en avant (3)',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'article' }] })],
      validation: (r) => r.max(3),
    }),
  ]),
])

export const pageProduits = page('pageProduits', 'Page Produits', [
  hero(true),
  objet('collection', 'Toute la collection', titreIntro),
  objet('surMesure', 'Carte « Sur mesure »', [
    texte('label', 'Surtitre'),
    texte('titre', 'Titre'),
    paragraphe('texte', 'Texte'),
    texte('bouton', 'Bouton'),
  ]),
  objet('comparatif', 'Comparatif', [
    texte('titre', 'Titre'),
    liste('lignes', 'Lignes', [texte('label', 'Critère'), texte('galileo', 'Galiléo'), texte('fotos', 'Fotos')], {
      title: 'label',
    }),
  ]),
])

export const ficheProduit = page('ficheProduit', 'Fiches produits (textes communs)', [
  texte('boutonDevis', 'Bouton devis'),
  texte('titreCaracteristiques', 'Titre des caractéristiques'),
  objet('documentation', 'Carte documentation', [
    texte('titre', 'Titre'),
    paragraphe('texte', 'Texte'),
    texte('champ', 'Libellé du champ e-mail'),
    texte('placeholder', 'Exemple dans le champ'),
    texte('bouton', 'Bouton'),
  ]),
  texte('titreSimilaires', 'Titre « Dans la même gamme »'),
])

export const pageRealisations = page('pageRealisations', 'Page Réalisations', [
  hero(true),
  objet('aLaUne', 'Projet à la une', [
    texte('titre', 'Titre'),
    image('photo', 'Photo principale'),
    texte('label', 'Surtitre de la fiche'),
    texte('nomProjet', 'Nom du projet'),
    lignes('infos', 'Informations'),
    objet('lien', 'Lien', [texte('label', 'Libellé'), texte('url', 'Adresse (vide = masqué)')]),
    defineField({
      name: 'galerie',
      title: 'Galerie (4 photos)',
      type: 'array',
      of: [defineArrayMember({ type: 'image', options: { hotspot: true } })],
      options: { layout: 'grid' },
    }),
  ]),
  objet('liste', 'Toutes les réalisations', [...titreIntro, texte('boutonPlus', 'Bouton « voir plus »')]),
])

export const pageAPropos = page('pageAPropos', 'Page À propos', [
  hero(),
  objet('histoire', 'Notre histoire', [
    image('portrait', 'Portrait'),
    texte('titre', 'Titre'),
    listeTextes('paragraphes', 'Paragraphes', { of: [defineArrayMember({ type: 'text', rows: 4 })] }),
    texte('nom', 'Signature : nom'),
    texte('role', 'Signature : rôle'),
  ]),
  objet('chiffres', 'En chiffres', [
    texte('titre', 'Titre'),
    liste('items', 'Chiffres', [texte('valeur', 'Chiffre'), paragraphe('texte', 'Explication')], { title: 'valeur' }),
  ]),
  objet('engagements', 'Nos engagements', [
    ...titreIntro,
    liste(
      'items',
      'Engagements',
      [
        texte('numero', 'Numéro de l’ODD'),
        texte('label', 'Surtitre'),
        texte('titre', 'Titre'),
        paragraphe('texte', 'Texte'),
        listeTextes('preuves', 'Preuves'),
      ],
      { title: 'titre', subtitle: 'label' },
    ),
  ]),
  objet('partenaires', 'Nos partenaires', [
    ...titreIntro,
    liste(
      'items',
      'Partenaires',
      [
        image('logo', 'Logo'),
        defineField({ name: 'largeur', title: 'Largeur du logo (px)', type: 'number' }),
        defineField({ name: 'hauteur', title: 'Hauteur du logo (px)', type: 'number' }),
        texte('categorie', 'Rôle'),
        texte('nom', 'Nom'),
        paragraphe('texte', 'Texte'),
      ],
      { title: 'nom', subtitle: 'categorie', media: 'logo' },
    ),
  ]),
  objet('terrain', 'Sur le terrain', [
    texte('titre', 'Titre'),
    texte('bouton', 'Bouton vers les réalisations'),
    liste('photos', 'Photos', [image('image', 'Photo'), texte('legende', 'Légende')], { title: 'legende', media: 'image' }),
  ]),
])

export const pageArticles = page('pageArticles', 'Page Articles', [
  hero(),
  refArticle('aLaUne', 'Article à la une'),
  texte('labelALaUne', 'Surtitre « À la une »'),
  texte('lienALaUne', 'Lien de l’article à la une'),
  texte('titreListe', 'Titre de la liste'),
  texte('boutonPlus', 'Bouton « voir plus »'),
  texte('titreALireAussi', 'Titre « À lire aussi » (pages article)'),
])

export const pageContact = page('pageContact', 'Page Contact', [
  hero(),
  objet('formulaire', 'Formulaire', [
    texte('titre', 'Titre'),
    texte('sousTitre', 'Sous-titre'),
    listeTextes('typesClient', 'Choix « Vous êtes »'),
    listeTextes('gammes', 'Choix « Gamme qui vous intéresse »'),
    listeTextes('echeances', 'Choix « Échéance souhaitée »'),
    paragraphe('consentement', 'Texte de consentement'),
    texte('bouton', 'Bouton d’envoi'),
    texte('delai', 'Délai de réponse'),
    paragraphe('confirmation', 'Message après envoi'),
  ]),
  objet('rendezVous', 'Carte rendez-vous', [
    texte('label', 'Surtitre'),
    texte('titre', 'Titre'),
    paragraphe('texte', 'Texte'),
    texte('bouton', 'Bouton'),
    defineField({ name: 'lien', title: 'Lien de prise de rendez-vous (Calendly…)', type: 'url' }),
  ]),
  objet('etapes', 'Et ensuite ?', [texte('titre', 'Titre'), listeTextes('items', 'Étapes')]),
])
