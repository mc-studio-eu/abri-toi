// Ajoute uniquement la section absente, sans remplacer les éditions existantes.
// npx sanity exec scripts/seed-home-ideas.ts --with-user-token
import assert from 'node:assert/strict'
import { createReadStream, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { getCliClient } from 'sanity/cli'
import { pageAccueil } from '../../site/content/accueil'

const client = getCliClient({ apiVersion: '2026-10-01' }).withConfig({ useCdn: false, perspective: 'raw' })
const docs = await client.fetch('*[_id in ["pageAccueil", "drafts.pageAccueil"]]')
assert.ok(docs.some((doc: any) => doc._id === 'pageAccueil'), 'Page publiée introuvable')
const targets = docs.filter((doc: any) => doc.sujets === undefined)
if (targets.length) {
  writeFileSync(resolve(import.meta.dirname, `../../exports/home-ideas-before-${Date.now()}.json`), JSON.stringify(docs, null, 2))
  const cartes = []
  for (const carte of pageAccueil.sujets.cartes) {
    const file = resolve(import.meta.dirname, '../../site/public', carte.image.src.replace(/^\//, ''))
    const asset = await client.assets.upload('image', createReadStream(file), { filename: basename(file) })
    cartes.push({ ...carte, _type: 'object', image: { _type: 'image', alt: carte.image.alt, asset: { _type: 'reference', _ref: asset._id } } })
  }
  const sujets = { ...pageAccueil.sujets, cartes }
  let transaction = client.transaction()
  for (const doc of targets) {
    transaction = transaction.patch(doc._id, (patch) => patch.ifRevisionId(doc._rev).setIfMissing({ sujets }))
  }
  await transaction.commit({ visibility: 'sync' })
  for (const before of targets) {
    const after = await client.getDocument(before._id)
    const expected = { ...before, sujets }
    for (const key of ['_rev', '_updatedAt']) { delete expected[key]; delete after![key] }
    assert.deepEqual(after, expected)
  }
}
console.log(`Section initialisée et vérifiée dans ${targets.length} document(s). Les autres champs sont inchangés.`)
