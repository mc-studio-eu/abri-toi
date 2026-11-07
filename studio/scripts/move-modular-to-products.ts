import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-10-01' }).withConfig({ useCdn: false, perspective: 'raw' })
const docs = await client.fetch('*[_id in ["pageAccueil", "drafts.pageAccueil", "pageProduits", "drafts.pageProduits"]]')
const published = docs.find((doc: any) => doc._id === 'pageProduits')
assert.ok(published, 'Page Produits publiée introuvable')
writeFileSync(resolve(import.meta.dirname, `../../exports/modular-move-before-${Date.now()}.json`), JSON.stringify(docs, null, 2))
let transaction = client.transaction()
const expectedDocs = []
for (const prefix of ['', 'drafts.']) {
  const source = docs.find((doc: any) => doc._id === `${prefix}pageAccueil`)
    ?? docs.find((doc: any) => doc._id === 'pageAccueil')
  assert.ok(source?.modulaire?.gammes, 'Section source introuvable')
  let target = docs.find((doc: any) => doc._id === `${prefix}pageProduits`)
  if (!target && prefix && !docs.some((doc: any) => doc._id === 'drafts.pageAccueil')) continue
  if (!target) {
    target = { ...published, _id: `${prefix}pageProduits` }
    for (const key of ['_rev', '_createdAt', '_updatedAt']) delete target[key]
    target.modulaire = source.modulaire
    transaction = transaction.create(target)
  } else if (target.modulaire === undefined) {
    transaction = transaction.patch(target._id, (patch) => patch.ifRevisionId(target._rev).setIfMissing({ modulaire: source.modulaire }))
    target = { ...target, modulaire: source.modulaire }
  } else {
    assert.deepEqual(target.modulaire, source.modulaire, 'Contenu destination différent : ne pas écraser')
  }
  expectedDocs.push(target)
}
await transaction.commit({ visibility: 'sync' })
for (const expected of expectedDocs) {
  const after = await client.getDocument(expected._id)
  for (const key of ['_rev', '_createdAt', '_updatedAt']) { delete expected[key]; delete after![key] }
  assert.deepEqual(after, expected)
}
console.log('Section transférée et vérifiée dans Produits. Ancienne copie conservée, masquée dans Accueil.')
