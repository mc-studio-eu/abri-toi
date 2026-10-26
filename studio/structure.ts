import type { StructureBuilder, StructureResolver } from 'sanity/structure'

const unique = (S: StructureBuilder, type: string, titre: string) =>
  S.listItem().title(titre).id(type).child(S.document().schemaType(type).documentId(type).title(titre))

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenu du site')
    .items([
      S.listItem()
        .title('Pages')
        .child(
          S.list()
            .title('Pages')
            .items([
              unique(S, 'pageAccueil', 'Accueil'),
              unique(S, 'pageProduits', 'Produits'),
              unique(S, 'ficheProduit', 'Fiches produits (textes communs)'),
              unique(S, 'pageRealisations', 'Réalisations'),
              unique(S, 'pageAPropos', 'À propos'),
              unique(S, 'pageArticles', 'Articles'),
              unique(S, 'pageContact', 'Contact'),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title('Gammes')
        .child(
          S.list()
            .title('Gammes')
            .items([
              S.listItem().title('Galiléo').child(S.document().schemaType('gamme').documentId('gamme-galileo')),
              S.listItem().title('Fotos').child(S.document().schemaType('gamme').documentId('gamme-fotos')),
            ]),
        ),
      S.documentTypeListItem('produit').title('Produits'),
      S.documentTypeListItem('realisation').title('Réalisations'),
      S.documentTypeListItem('article').title('Articles'),
      S.divider(),
      S.documentTypeListItem('demande').title('Demandes reçues'),
      unique(S, 'parametres', 'Paramètres du site'),
    ])
