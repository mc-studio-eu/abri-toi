export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Jeton d'écriture Sanity, côté serveur uniquement : enregistre les demandes envoyées depuis le site.
    sanityWriteToken: '',
    public: {
      // Sans projectId, le site affiche le contenu de référence (dossier content/).
      sanity: {
        projectId: '',
        dataset: 'production',
        apiVersion: '2026-10-01',
      },
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      // Les animations d'apparition ne masquent le contenu que si le JS tourne.
      script: [{ innerHTML: "document.documentElement.classList.add('js')", tagPosition: 'head' }],
      title: 'Abri Toi — Reconquérir l’extérieur',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Des abris qui protègent du soleil et apportent de la fraîcheur, conçus à Lyon et fabriqués en France pour les collectivités.',
        },
      ],
      link: [
        // Logo carré repris de abritoi.com
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', type: 'image/png', href: '/favicon-32.png', sizes: '32x32' },
        { rel: 'icon', type: 'image/png', href: '/favicon-192.png', sizes: '192x192' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500&family=Geist+Mono:wght@500&family=Instrument+Sans:wght@400;500&display=swap',
        },
      ],
    },
  },
})
