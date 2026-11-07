import { createImageUrlBuilder } from '@sanity/image-url'
import type { Img } from '~/content/commun'

// Image issue de Sanity (avec recadrage et point d'intérêt) ou chemin local du contenu de référence.
export type Visuel = Img | { asset?: { _ref: string }; alt?: string; crop?: unknown; hotspot?: unknown } | null | undefined

export function img(visuel: Visuel, largeur?: number, hauteur?: number) {
  if (!visuel) return ''
  const asset = 'asset' in visuel ? visuel.asset : undefined
  if (!asset?._ref) return 'src' in visuel ? visuel.src : ''
  const configuration = useRuntimeConfig().public.sanity
  if (!configuration.projectId) return 'src' in visuel ? visuel.src : ''
  let builder = createImageUrlBuilder(configuration).image(visuel).auto('format').fit('max')
  if (largeur) builder = builder.width(largeur)
  if (hauteur) builder = builder.height(hauteur).fit('crop')
  return builder.url()
}

export const alt = (visuel: Visuel) => (visuel && 'alt' in visuel ? visuel.alt || '' : '')
