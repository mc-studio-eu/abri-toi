import { img, type Visuel } from './sanity'

/** Variantes CDN réelles ; les fichiers locaux restent servis sans faux srcset. */
export function imgSrcset(visuel: Visuel, largeur = 1600, hauteur?: number): string | undefined {
  const asset = visuel && 'asset' in visuel ? visuel.asset?._ref : undefined
  if (!asset) return undefined

  // fit=max n'agrandit pas l'original : les descripteurs doivent rester exacts.
  const dimensions = asset.match(/-(\d+)x(\d+)-[^-]+$/)
  let maximum = largeur
  if (dimensions) {
    const crop = visuel && 'crop' in visuel ? visuel.crop as { left?: number; right?: number; top?: number; bottom?: number } | undefined : undefined
    maximum = Math.min(maximum, Math.floor(Number(dimensions[1]) * (1 - (crop?.left || 0) - (crop?.right || 0))))
    if (hauteur) maximum = Math.min(maximum, Math.floor(Number(dimensions[2]) * (1 - (crop?.top || 0) - (crop?.bottom || 0)) * largeur / hauteur))
  }
  if (maximum < 1 || !img(visuel, maximum).startsWith('https://cdn.sanity.io/images/')) return undefined

  const widths = [...new Set([320, 480, 640, 800, 1000, 1280, 1600, 1920, 2560, maximum])]
    .filter((width) => width <= maximum)
    .sort((a, b) => a - b)
  return widths.map((width) => `${img(visuel, width, hauteur ? Math.round(width * hauteur / largeur) : undefined)} ${width}w`).join(', ')
}

export const taillesImageSection = '(min-width: 1440px) 1280px, (max-width: 640px) calc(100vw - 40px), (max-width: 1024px) calc(100vw - 80px), calc(100vw - 160px)'
export const taillesImageCarte = '(min-width: 1440px) 411px, (max-width: 640px) calc(100vw - 40px), (max-width: 1024px) calc((100vw - 104px) / 2), calc((100vw - 208px) / 3)'
