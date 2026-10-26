import { createClient, type SanityClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'
import type { Img } from '~/content/commun'

let client: SanityClient | null = null

export function sanityClient() {
  const { projectId, dataset, apiVersion } = useRuntimeConfig().public.sanity
  if (!projectId) return null
  client ||= createClient({ projectId, dataset, apiVersion, useCdn: true, perspective: 'published' })
  return client
}

// Image issue de Sanity (avec recadrage et point d'intérêt) ou chemin local du contenu de référence.
export type Visuel = Img | { asset?: { _ref: string }; alt?: string; crop?: unknown; hotspot?: unknown } | null | undefined

export function img(visuel: Visuel, largeur?: number, hauteur?: number) {
  if (!visuel) return ''
  if ('src' in visuel) return visuel.src
  const c = sanityClient()
  if (!c || !visuel.asset) return ''
  let builder = createImageUrlBuilder(c).image(visuel).auto('format').fit('max')
  if (largeur) builder = builder.width(largeur)
  if (hauteur) builder = builder.height(hauteur).fit('crop')
  return builder.url()
}

export const alt = (visuel: Visuel) => (visuel && 'alt' in visuel ? visuel.alt || '' : '')
