import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'
import { createContext, SourceTextModule } from 'node:vm'
import { planLiensAccueil, planMigration, slugRealisation } from '../../studio/scripts/migrate-realisations.mjs'

const root = new URL('../', import.meta.url)
const context = createContext({ URL, console })
const modules = new Map()
async function charger(path) {
  const url = new URL(path, root)
  if (modules.has(url.href)) return modules.get(url.href)
  const chargement = (async () => {
    const module = new SourceTextModule(stripTypeScriptTypes(await readFile(url, 'utf8')), { context, identifier: url.href })
    await module.link((specifier) => {
      const lien = new URL(specifier, url)
      return charger(lien.href.endsWith('.ts') ? lien.href : `${lien.href}.ts`)
    })
    await module.evaluate()
    return module
  })()
  modules.set(url.href, chargement)
  return chargement
}
const { realisations } = (await charger('content/realisations.ts')).namespace
const publicContent = (await charger('utils/realisationsPublic.ts')).namespace
const { requeteContenu } = (await charger('utils/requetesContenu.ts')).namespace
const { cheminsSitemap } = (await charger('utils/sitemap.ts')).namespace

test('reference realisations have stable, distinct route slugs', () => {
  assert.equal(new Set(realisations.map((item) => item.slug)).size, realisations.length)
  assert.ok(realisations.every((item) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)))
})

test('published realisations replace reference collection and empty publication stays empty', () => {
  const document = { ...realisations[0], slug: 'sanary', nom: 'Nom éditorial' }
  const result = publicContent.realisationsPubliques([
    document, { ...document, _id: 'drafts.secret', slug: 'brouillon' },
    { ...document, slug: '' }, { ...document, nom: 'Doublon' },
  ])
  assert.equal(result.length, 1)
  assert.equal(result[0].nom, 'Nom éditorial')
  assert.equal(publicContent.realisationsPubliques([]).length, 0)
  assert.equal(publicContent.realisationsPubliques().length, 0)
  assert.ok(cheminsSitemap([], [], [document]).includes('/realisations/sanary'))
  assert.equal(cheminsSitemap([], [], []).some((path) => path.startsWith('/realisations/')), false)
})

test('detail query uses a parameter and the same published-only fields as collection', () => {
  const slug = 'sanary" || true'
  const query = requeteContenu('realisation', slug)
  assert.equal(query.params.slug, slug)
  assert.ok(query.groq.includes('slug.current == $slug'))
  assert.ok(query.groq.includes('drafts.**'))
  assert.ok(query.groq.includes('nomProjet'))
  assert.ok(query.groq.includes('galerie'))
  assert.equal(requeteContenu('realisation', undefined), undefined)
  assert.equal(requeteContenu('realisation', ['sanary']), undefined)
})

test('migration copies only verified featured details and preserves editorial fields and drafts', () => {
  const photo = { asset: { _ref: 'image-same' } }
  const base = { _type: 'realisation', _rev: 'revision', nom: 'Galiléo à Sanary', photo }
  const source = { _id: 'pageRealisations', aLaUne: { photo, titre: 'Titre vérifié', nomProjet: 'Sanary', infos: [{ label: 'Gamme', valeur: 'Galiléo' }], galerie: [photo] } }
  const documents = [source, { ...base, _id: 'published', titre: '', infos: [], galerie: [] }, { ...base, _id: 'drafts.published' }]
  const copy = JSON.stringify(documents)
  const [plan] = planMigration(documents)
  assert.equal(plan.id, 'published')
  assert.equal(plan.revision, 'revision')
  assert.equal(plan.setIfMissing.slug.current, 'galileo-a-sanary')
  assert.equal(plan.setIfMissing.nomProjet, 'Sanary')
  assert.equal(Object.hasOwn(plan.setIfMissing, 'titre'), false)
  assert.equal(Object.hasOwn(plan.setIfMissing, 'infos'), false)
  assert.equal(Object.hasOwn(plan.setIfMissing, 'galerie'), false)
  assert.equal(JSON.stringify(documents), copy)
  const sansCorrespondance = planMigration([source, { ...base, _id: 'other', photo: { asset: { _ref: 'image-other' } } }])
  assert.deepEqual(Object.keys(sansCorrespondance[0].setIfMissing), ['slug'])
  const ambigu = planMigration([source, { ...base, _id: 'one' }, { ...base, _id: 'two' }])
  assert.ok(ambigu.every((patch) => !Object.hasOwn(patch.setIfMissing, 'nomProjet')))
})

test('migration reuses existing slugs, avoids collisions and is idempotent', () => {
  const docs = [
    { _id: 'one', _type: 'realisation', nom: 'Fotos', slug: { _type: 'slug', current: 'fotos' } },
    { _id: 'two', _type: 'realisation', nom: 'Fôtos' },
  ]
  const plan = planMigration(docs)
  assert.equal(plan.length, 1)
  assert.equal(plan[0].setIfMissing.slug.current, 'fotos-2')
  assert.equal(slugRealisation('Galiléo · Banc ombragé'), 'galileo-banc-ombrage')
  assert.equal(planMigration([docs[0], { ...docs[1], ...plan[0].setIfMissing }]).length, 0)
})

test('home references require the two verified banners and preserve explicit editorial choices', () => {
  const bandeaux = [
    { _key: 'k3x', titre: 'Installation Fotos · Parc de copropriété · Six-Fours (83)', image: { asset: { _ref: 'image-bce1dc53c2b6e5fd5f3a73523c473c37d6e271a0-2000x1500-jpg' } }, produit: { _ref: 'existing-product' } },
    { _key: 'k3y', titre: 'Installation Galiléo · Jardin de particulier · Sanary (83)', image: { asset: { _ref: 'image-14b0c99c262da461da52e42b295e42ad8e69d7bb-2000x1444-jpg' } }, realisation: null },
  ]
  const documents = [
    { _id: 'pageAccueil', _rev: 'revision', installations: { bandeaux } },
    { _id: 'kDvdAlfxkk4xS3OlV656ER', _type: 'realisation', slug: { current: 'six-fours' } },
  ]
  const avant = JSON.stringify(documents)
  const [patch] = planLiensAccueil(documents)
  assert.equal(patch.id, 'pageAccueil')
  assert.deepEqual(Object.keys(patch.setIfMissing), ['installations.bandeaux[_key=="k3x"].realisation'])
  assert.equal(patch.setIfMissing['installations.bandeaux[_key=="k3x"].realisation']._ref, 'kDvdAlfxkk4xS3OlV656ER')
  assert.equal(JSON.stringify(documents), avant)
  bandeaux[0].titre = 'Autre projet'
  assert.throws(() => planLiensAccueil(documents), /Bandeau modifié/)
})
