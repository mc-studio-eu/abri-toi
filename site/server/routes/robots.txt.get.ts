import { origineSeo } from '../../utils/seo'

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  const origine = origineSeo(useRuntimeConfig().public.seoSiteUrl)
  // Laisser lire les articles provisoires pour que leur directive noindex soit vue.
  return `User-agent: *\nAllow: /\n\nSitemap: ${origine}/sitemap.xml\n`
})
