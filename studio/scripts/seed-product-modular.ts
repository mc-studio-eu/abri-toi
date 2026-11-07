// Ajoute uniquement la section absente, sans remplacer les éditions existantes.
// npx sanity exec scripts/seed-product-modular.ts --with-user-token
import assert from 'node:assert/strict'
import { createReadStream, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { getCliClient } from 'sanity/cli'
import { pageProduits } from '../../site/content/pages'

const client = getCliClient({ apiVersion: '2026-10-01' }).withConfig({ useCdn: false, perspective: 'raw' })
const docs = await client.fetch('*[_id in ["pageProduits", "drafts.pageProduits"]]')
assert.ok(docs.some((doc: any) => doc._id === 'pageProduits'), 'Page publiée introuvable')
const targets = docs.filter((doc: any) => doc.modulaire?.gammes === undefined)
if (targets.length) {
  writeFileSync(resolve(import.meta.dirname, `../../exports/home-modular-before-${Date.now()}.json`), JSON.stringify(docs, null, 2))
  const assets = new Map<string, string>()
  async function convertir(value: any): Promise<any> {
    if (Array.isArray(value)) return Promise.all(value.map(convertir))
    if (!value || typeof value !== 'object') return value
    if (typeof value.src === 'string') {
      if (!assets.has(value.src)) {
        const file = resolve(import.meta.dirname, '../../site/public', value.src.replace(/^\//, ''))
        const asset = await client.assets.upload('image', createReadStream(file), { filename: basename(file) })
        assets.set(value.src, asset._id)
      }
      return { _type: 'image', alt: value.alt, asset: { _type: 'reference', _ref: assets.get(value.src) } }
    }
    const result: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(value)) result[key] = await convertir(child)
    return result
  }
  const gammes = await convertir(pageProduits.modulaire.gammes)
  let transaction = client.transaction()
  for (const doc of targets) {
    transaction = transaction.patch(doc._id, (patch) => patch.ifRevisionId(doc._rev).setIfMissing({ modulaire: { titre: pageProduits.modulaire.titre, texte: pageProduits.modulaire.texte }, 'modulaire.gammes': gammes }))
  }
  await transaction.commit({ visibility: 'sync' })
  for (const before of targets) {
    const after = await client.getDocument(before._id)
    const expected = { ...before, modulaire: { ...(before.modulaire ?? { titre: pageProduits.modulaire.titre, texte: pageProduits.modulaire.texte }), gammes } }
    for (const key of ['_rev', '_updatedAt']) { delete expected[key]; delete after![key] }
    assert.deepEqual(after, expected)
  }
}
console.log(`Section initialisée et vérifiée dans ${targets.length} document(s). Les autres champs sont inchangés.`)
