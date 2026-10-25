export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
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
