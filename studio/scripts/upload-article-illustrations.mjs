import { createReadStream, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@sanity/client'

const slugs = [
  'vegetation-barriere-pollution',
  'seniors-ehpad-canicules',
  'financer-ombrage-espaces-publics',
  'brumisation-haute-pression',
  'ombrager-cours-ecole',
  'toiture-perforee-40-degres',
  'arroser-sans-reseau-eau-de-pluie',
  'recuperer-eau-pluie-vegetaliser-villes',
  'ombrage-cour-ecole-solutions-sans-plantation',
  'solution-ombrage-metallique-aluminium',
]

const client = createClient({
  projectId: process.env.NUXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NUXT_PUBLIC_SANITY_DATASET,
  token: process.env.NUXT_SANITY_WRITE_TOKEN,
  apiVersion: '2026-10-01',
  useCdn: false,
})

const documents = await client.fetch(
  '*[_type == "article" && slug.current in $slugs]{_id,titre,"slug":slug.current}',
  { slugs },
)
for (const slug of slugs) {
  if (!documents.some((document) => document.slug === slug)) throw new Error(`Article Sanity introuvable : ${slug}`)
  const path = resolve(import.meta.dirname, `../../site/public/images/articles/generated/${slug}.png`)
  if (!existsSync(path)) throw new Error(`Fichier introuvable : ${path}`)
}

for (const slug of slugs) {
  const path = resolve(import.meta.dirname, `../../site/public/images/articles/generated/${slug}.png`)
  const asset = await client.assets.upload('image', createReadStream(path), { filename: `${slug}.png` })
  for (const document of documents.filter((item) => item.slug === slug)) {
    const image = {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
      alt: `Illustration éditoriale : ${document.titre}`,
    }
    await client.patch(document._id).set({ couverture: image, illustration: image }).commit()
    console.log(`${slug}: ${document._id} → ${asset._id}`)
  }
}
