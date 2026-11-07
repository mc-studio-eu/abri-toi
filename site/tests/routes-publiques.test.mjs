import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'
import { createContext, SourceTextModule } from 'node:vm'

const context = createContext({ URL })
const modules = new Map()
async function load(path) {
  const url = new URL(path, import.meta.url)
  if (modules.has(url.href)) return modules.get(url.href)
  const mod = new SourceTextModule(stripTypeScriptTypes(await readFile(url, 'utf8')), { context, identifier: url.href })
  modules.set(url.href, mod)
  await mod.link((specifier) => load(new URL(specifier + '.ts', url).href))
  await mod.evaluate()
  return mod
}
const routes = (await load('../utils/routesPubliques.ts')).namespace
const seo = (await load('../utils/seo.ts')).namespace

test('known public URLs normalize without changing arbitrary CMS slug casing', () => {
  assert.equal(routes.cheminPublic('/CONTACT/'), '/contact')
  assert.equal(routes.cheminPublic('/politique-de-cookies-ue/'), '/politique-de-cookies')
  assert.equal(routes.cheminPublic('/produits/' + encodeURIComponent(routes.ANCIEN_SLUG_BANQUETTE)), '/produits/' + routes.SLUG_BANQUETTE)
  assert.equal(routes.cheminPublic('/produits/Modele-CMS'), '/produits/Modele-CMS')
  assert.equal(routes.slugProduitPublic(routes.SLUG_BANQUETTE), routes.SLUG_BANQUETTE)
})

test('only listing pagination gets a distinct canonical; tracking and invalid pages are removed', () => {
  assert.equal(seo.urlCanonique('/CONTACT?utm_source=test'), 'https://abritoi.com/contact')
  assert.equal(seo.urlCanonique('/articles?page=2&utm_source=test#liste'), 'https://abritoi.com/articles?page=2')
  assert.equal(seo.urlCanonique('/realisations?page=3'), 'https://abritoi.com/realisations?page=3')
  for (const value of ['1', '0', '-2', 'NaN', '999999999999999999999']) {
    assert.equal(seo.urlCanonique('/articles?page=' + value), 'https://abritoi.com/articles')
  }
  assert.equal(seo.urlCanonique('/contact?page=2'), 'https://abritoi.com/contact')
})
