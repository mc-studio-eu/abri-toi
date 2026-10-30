// Ajoute uniquement les trois articles reçus de Paul, sans toucher aux autres documents.
import { createReadStream, existsSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { getCliClient } from 'sanity/cli'
import { articles } from '../../site/content/articles'

const slugs = [
  'recuperer-eau-pluie-vegetaliser-villes',
  'ombrage-cour-ecole-solutions-sans-plantation',
  'solution-ombrage-metallique-aluminium',
]
const client = getCliClient({ apiVersion: '2026-10-01' })
const publicDir = resolve(import.meta.dirname, '../../site/public')
const assets = new Map<string, string>()
let keyIndex = 0
const key = () => `client${(++keyIndex).toString(36)}`

async function upload(src: string) {
  if (!assets.has(src)) {
    const file = resolve(publicDir, src.replace(/^\//, ''))
    if (!existsSync(file)) throw new Error(`Image introuvable : ${file}`)
    const asset = await client.assets.upload('image', createReadStream(file), { filename: basename(file) })
    assets.set(src, asset._id)
  }
  return assets.get(src)!
}

async function convertir(value: unknown): Promise<unknown> {
  if (Array.isArray(value)) {
    return Promise.all(value.map(async (item) => {
      const out = await convertir(item)
      return out && typeof out === 'object' && !('_key' in out) ? { _key: key(), ...out } : out
    }))
  }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if (typeof obj.src === 'string' && obj.src.startsWith('/images/')) {
      return { _type: 'image', asset: { _type: 'reference', _ref: await upload(obj.src) }, ...(obj.alt ? { alt: obj.alt } : {}) }
    }
    const out: Record<string, unknown> = {}
    for (const [name, child] of Object.entries(obj)) out[name] = await convertir(child)
    return out
  }
  return value
}

for (const slug of slugs) {
  const article = articles.find((candidate) => candidate.slug === slug)
  if (!article) throw new Error(`Article absent du contenu : ${slug}`)
  const existing = await client.fetch<{ _id: string } | null>(
    '*[_type == "article" && slug.current == $slug][0]{ _id }',
    { slug },
  )
  const contenu = (await convertir({ ...article, slug: { _type: 'slug', current: slug } })) as object
  if (existing) {
    await client.patch(existing._id).set(contenu).commit()
    console.log(`✓ ${slug} mis à jour (${existing._id})`)
  } else {
    const created = await client.create({ _type: 'article', ...contenu })
    console.log(`✓ ${slug} créé (${created._id})`)
  }
}
