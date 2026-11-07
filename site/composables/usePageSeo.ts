import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { createImageUrlBuilder } from '@sanity/image-url'
import type { Visuel } from '~/utils/sanity'
import { DESCRIPTION_ACCUEIL, descriptionCourte, imageAbsolue, origineSeo, serialiserJsonLd, urlCanonique } from '~/utils/seo'

type FilAriane = { nom: string; chemin: string }
type OptionsSeo = {
  titre: string
  chemin?: string
  description: string
  image?: string | Visuel
  type?: 'website' | 'article'
  noindex?: boolean
  fil?: FilAriane[]
  article?: { titre: string; date?: string; auteur?: string }
}

export function usePageSeo(options: MaybeRefOrGetter<OptionsSeo>) {
  const route = useRoute()
  const config = useRuntimeConfig().public
  const origine = origineSeo(config.seoSiteUrl)
  // Capturer la configuration dans setup : Unhead peut évaluer son getter hors contexte Nuxt.
  const images = config.sanity.projectId ? createImageUrlBuilder(config.sanity) : null
  const canonical = computed(() => urlCanonique(toValue(options).chemin || route.path, origine))
  useHead(() => {
    const seo = toValue(options)
    const description = descriptionCourte(seo.description, DESCRIPTION_ACCUEIL)
    const visuel = seo.image
    const source = typeof visuel === 'string' ? visuel
      : visuel?.asset && images ? images.image(visuel).auto('format').fit('max').width(1200).url()
      : visuel && 'src' in visuel ? visuel.src : undefined
    const image = imageAbsolue(source, origine)
    const organisation = {
      '@type': 'Organization', '@id': `${origine}/#organization`,
      name: 'Abri Toi', url: `${origine}/`, logo: `${origine}/favicon-512.png`,
    }
    const graph: Record<string, unknown>[] = [organisation]
    if (seo.fil?.length) graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [{ nom: 'Accueil', chemin: '/' }, ...seo.fil].map((item, index) => ({
        '@type': 'ListItem', position: index + 1, name: item.nom, item: urlCanonique(item.chemin, origine),
      })),
    })
    if (seo.article && !seo.noindex) graph.push({
      '@type': 'Article', '@id': `${canonical.value}#article`, mainEntityOfPage: canonical.value,
      headline: seo.article.titre, description, image: [image], inLanguage: 'fr-FR',
      publisher: { '@id': organisation['@id'] },
      ...(seo.article.auteur ? { author: { '@type': 'Person', name: seo.article.auteur } } : {}),
      ...(/^\d{4}-\d{2}-\d{2}$/.test(seo.article.date || '') ? { datePublished: seo.article.date } : {}),
    })
    return {
      title: seo.titre,
      link: [{ key: 'canonical', rel: 'canonical', href: canonical.value }],
      meta: [
        { name: 'description', content: description },
        { name: 'robots', content: seo.noindex ? 'noindex, follow' : 'index, follow' },
        { property: 'og:locale', content: 'fr_FR' },
        { property: 'og:site_name', content: 'Abri Toi' },
        { property: 'og:type', content: seo.type || 'website' },
        { property: 'og:title', content: seo.titre },
        { property: 'og:description', content: description },
        { property: 'og:url', content: canonical.value },
        { property: 'og:image', content: image },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: seo.titre },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: image },
      ],
      script: [{ key: 'seo-jsonld', type: 'application/ld+json', innerHTML: serialiserJsonLd({ '@context': 'https://schema.org', '@graph': graph }) }],
    }
  })
  return { canonical }
}
