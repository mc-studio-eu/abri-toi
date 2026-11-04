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

Le formulaire de contact envoie également chaque demande à **collaborer@abritoi.com** via Resend. Sur le serveur, renseigner `NUXT_RESEND_API_KEY`, `NUXT_EMAIL_FROM` (adresse d'un domaine vérifié dans Resend) et `NUXT_CONTACT_EMAIL=collaborer@abritoi.com`. Ces variables restent privées, sans préfixe `NUXT_PUBLIC_`. Un contact sans configuration d'e-mail affiche une erreur : l'archivage Sanity seul ne confirme pas un envoi. L'e-mail du visiteur est utilisé comme adresse de réponse.

La demande de documentation envoie au visiteur deux liens PDF de sa gamme (documentation et fiches techniques Galiléo ou Fotos) et notifie la boîte de contact. Renseigner aussi `NUXT_SITE_URL` avec l’origine publique HTTPS réelle, sans chemin, par exemple `https://abritoi.com`. Les fichiers publiés dans Sanity sont prioritaires ; les quatre PDF de `site/public/docs/` servent de secours. Sans configuration complète, ou si l’e-mail échoue, le formulaire propose les téléchargements en indiquant que l’envoi n’est pas confirmé. Le succès affiché correspond à l’acceptation par Resend, pas à une garantie d’arrivée en boîte de réception.

`/api/demande` accepte seulement un objet JSON (`Content-Type: application/json`), avec une limite de **32 Kio mesurée sur les octets reçus avant analyse JSON**, même sans `Content-Length`. Le type doit être explicitement `contact` ou `documentation`. Les champs reconnus doivent être de véritables chaînes, sans caractères de contrôle dans les champs sur une ligne. Le message accepte les retours à la ligne et tabulations. Les limites partagées avec les formulaires sont : e-mail 254, prénom/nom 100 chacun, organisation/profil/gamme/échéance/produit 200 chacun, fonction 150, téléphone 40, code postal 20 et message 4 000 caractères JS. Les dépassements sont refusés, sans troncature. L’e-mail doit être une adresse nue, sans nom d’affichage, commentaire ni partie locale entre guillemets : partie locale ASCII de 64 caractères maximum (apostrophe, signe `+` et ponctuation usuelle acceptés), domaine composé de labels de 63 caractères maximum séparés par des points, sans tiret en début ou fin de label. Le contact exige profil, prénom, nom, organisation, e-mail, message et `consentement: true` ; la documentation exige l’e-mail et une gamme `galileo` ou `fotos`. Les libellés de choix du contact restent éditables dans le CMS.

Les deux formulaires comportent un champ piège `website`, hors écran, sans tabulation ni autocomplétion. Toute valeur non vide est refusée côté serveur ; ce champ et le consentement ne sont ni envoyés dans les e-mails ni archivés. Les validations et quotas sont appliqués avant tout appel Resend ou Sanity. Les refus 400/413/415/429 conservent la saisie et affichent une erreur ; ils ne deviennent pas un succès de téléchargement de documentation.

Les quotas des deux formulaires sont communs : **10 tentatives par adresse IP de socket sur 10 minutes**, **100 tentatives globales sur une heure** (après le filtre IP), puis **5 demandes valides par adresse e-mail sur une heure** avant les effets externes. Les fenêtres sont fixes à partir de la première réservation ; les échecs ultérieurs ne rendent pas de quota. Le quota e-mail ignore espaces de bord et casse, sans modifier la casse de l’adresse de livraison. Les refus 429 fournissent `Retry-After`. Les réservations sont synchrones, y compris en concurrence ; chaque table est bornée à 5 000 entrées, purgée à l’expiration et refuse les nouvelles clés si pleine sans évincer de quota actif.

Ces compteurs sont **en mémoire par processus** : ils sont réinitialisés au redémarrage et ne sont pas partagés entre plusieurs réplicas. L’IP provient uniquement du socket ; `X-Forwarded-For`, `X-Real-IP` et `Forwarded` ne sont pas utilisés. Une IP absente partage un quota commun. Derrière un proxy, ses visiteurs peuvent donc partager le quota IP du proxy. Aucune configuration d’hébergement n’a été trouvée dans ce dépôt : adapter la stratégie d’IP à un proxy explicitement fiable et partager les compteurs avant un déploiement multi-réplica. Ces mesures réduisent les soumissions automatisées sans éliminer tous les robots ; aucun filtrage WAF externe n’a été vérifié.

Les fichiers `.env` servent au développement ; au lancement du serveur compilé, fournir les variables par l'hébergeur ou l'environnement du processus. Un hébergement purement statique (`npm run generate`) ne peut pas exécuter `/api/demande`. La livraison réelle dépend de la validation du domaine et du suivi de livraison Resend.

Tests du formulaire sans envoi réel ni accès réseau : `cd site && npm run test:contact`.


### Référencement et domaine public

Le site génère les titres, descriptions, canonical, cartes Open Graph/Twitter et données structurées côté serveur. `NUXT_PUBLIC_SEO_SITE_URL` fixe leur origine HTTPS (par défaut `https://abritoi.com`) ainsi que celle du sitemap et de `robots.txt`. Cette valeur doit être une origine seule, sans chemin, identifiants, paramètres ni fragment ; toute valeur invalide utilise le domaine par défaut. Le domaine n’est jamais tiré des en-têtes HTTP du visiteur. **`NUXT_SITE_URL` conserve son seul rôle existant : les liens PDF envoyés par e-mail.**

`/sitemap.xml` est une route Nitro dynamique : elle lit les produits et articles publiés dans Sanity, avec les mêmes règles de complément des contenus de référence que les pages. En mode `reference`, sans projet Sanity ou en cas d’échec de lecture, elle utilise le contenu de secours effectivement servi. Les fiches produit de référence restent incluses quand Sanity est partiel ou utilise l’ancien catalogue lié. Les mentions légales, confidentialité et cookies suivent les pages locales actuellement affichées. Aucune date `lastmod` n’est inventée.

Les articles provisoires restent accessibles mais portent `noindex, follow` : ils sont exclus du sitemap et du JSON-LD `Article` tant que le titre ou le corps manque, ou que le corps contient un marqueur « en cours de rédaction » / « article à venir » / « contenu à venir ». Le slug `financer-ombrage-espaces-publics` reste exclu. Ce contrôle de complétude ne valide pas le fond éditorial ; la publication d’un article doit toujours être relue. Aucun contenu distant n’est modifié par ces mécanismes. Les images sociales reprennent les visuels existants de chaque fiche/article ou le visuel d’accueil en secours ; elles ne sont pas générées et leur cadrage n’est pas retouché.

Vérification ciblée : `cd site && npm run test:seo`. La disponibilité du sitemap dynamique nécessite un serveur Nuxt/Nitro (`npm run build` puis lancement de `.output/server/index.mjs`) ; un export statique seul ne peut pas maintenir les nouvelles publications Sanity à jour.
