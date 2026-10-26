# Abri Toi — site et CMS

- `site/` : le site Nuxt (pages Accueil, Produits, fiches produits, Réalisations, À propos, Articles, Contact).
- `studio/` : le Studio Sanity, où le client modifie tous les textes et visuels.
- `site/content/` : le contenu des maquettes. Le site l'affiche tant que Sanity n'est pas branché, et le script `seed` le copie dans Sanity.

## Brancher Sanity (une seule fois)

1. Créer le projet sur sanity.io/manage (jeu de données `production`).
2. Ajouter l'adresse du site dans **API → CORS origins** (ex. `http://localhost:3000` et l'adresse de production).
3. Créer un jeton **Editor** dans **API → Tokens** (pour enregistrer les demandes des formulaires).
4. Remplir `studio/.env` et `site/.env` à partir des fichiers `.env.example`.
5. Copier le contenu des maquettes dans Sanity, images comprises :

```bash
cd studio && npm install && npx sanity login && npm run seed
```

6. Mettre le Studio en ligne (adresse `abri-toi.sanity.studio`) :

```bash
cd studio && npm run deploy
```

## Développement

```bash
cd site && npm install && npm run dev
```

```bash
cd studio && npm run dev
```

## Mise en ligne

Le site lit Sanity à chaque visite : il doit tourner en Node sur le serveur (`npm run build`, puis `node .output/server/index.mjs`) avec les variables de `site/.env`. Une modification publiée dans le Studio apparaît alors sans reconstruire le site.

Les demandes envoyées par les formulaires (contact, documentation) arrivent dans le Studio, rubrique **Demandes reçues**.
