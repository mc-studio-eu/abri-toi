import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'
import { computed, nextTick, reactive, ref, watch } from 'vue'

async function importerContenu(path) {
  const source = stripTypeScriptTypes(await readFile(new URL(path, import.meta.url), 'utf8'))
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
}

const { pageContact } = await importerContenu('../content/pages.ts')
const { produits } = await importerContenu('../content/produits.ts')
const { descriptor } = parse(await readFile(new URL('../pages/contact.vue', import.meta.url), 'utf8'))
const { limitesDemande, erreurDemande } = await importerContenu('../utils/demande.ts')
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
// Execute the actual page setup with Vue reactivity and local content; no mail or CMS calls.
const setup = new AsyncFunction('usePageContact', 'useParametres', 'useProduits', 'useRoute', 'usePageSeo', 'computed', 'reactive', 'ref', 'watch', '$fetch', 'limitesDemande', 'erreurDemande',
  `${stripTypeScriptTypes(descriptor.scriptSetup.content).replace(/^import .*$/m, '')}\nreturn { form, produitSelectionne, envoyer, etat, erreur }`)

async function formulaire(produit, fetcher, demande) {
  const route = reactive({ query: { ...(produit === undefined ? {} : { produit }), ...(demande === undefined ? {} : { demande }) } })
  const sent = []
  const page = await setup(
    async () => ref(pageContact), async () => ref({}), async () => ref(produits), () => route, () => {},
    computed, reactive, ref, watch, async (url, options) => { sent.push({ url, ...options }); return fetcher?.(url, options) }, limitesDemande, erreurDemande,
  )
  return { ...page, route, sent }
}

test('a product query prefills the catalogue title and its gamme', async () => {
  const page = await formulaire('banc-galileo')
  assert.equal(page.form.produit, 'banc-galileo')
  assert.equal(page.produitSelectionne.value.fiche.titre, 'Banc Galiléo')
  assert.equal(page.form.gamme, 'Galiléo · brumisation')
})

test('direct contact, unknown products and repeated query values keep a generic request', async () => {
  for (const query of [undefined, null, '', 'inconnu', ['banc-galileo'], ['banc-galileo', 'banquette-galileo']]) {
    const page = await formulaire(query)
    assert.equal(page.form.produit, '')
    assert.equal(page.produitSelectionne.value, undefined)
    assert.equal(page.form.gamme, 'Les deux')
    await page.envoyer()
    assert.equal(page.sent[0].body.produit, '')
  }
})

test('product changes update the gamme and an incompatible gamme clears the product', async () => {
  const page = await formulaire('banc-galileo')
  const fotos = produits.find((produit) => produit.gamme === 'fotos' && produit.fiche)
  page.form.produit = fotos.slug
  assert.equal(page.form.gamme, 'Fotos · végétation')
  assert.equal(page.produitSelectionne.value.slug, fotos.slug)
  page.form.gamme = 'Galiléo · brumisation'
  assert.equal(page.form.produit, '')
  assert.equal(page.produitSelectionne.value, undefined)
  assert.equal(page.form.gamme, 'Galiléo · brumisation')
  page.form.produit = 'banc-galileo'
  page.form.gamme = 'Les deux'
  assert.equal(page.form.produit, '')
})

test('removing a product is optional and does not erase the rest of the project', async () => {
  const page = await formulaire('banc-galileo')
  page.form.message = 'Une cour à ombrager'
  page.form.produit = ''
  await page.envoyer()
  assert.equal(page.sent[0].body.produit, '')
  assert.equal(page.sent[0].body.message, 'Une cour à ombrager')
})

test('the setup query watcher updates product context independently of project fields', async () => {
  const page = await formulaire('banc-galileo')
  page.form.message = 'Une cour à ombrager'
  const fotos = produits.find((produit) => produit.gamme === 'fotos' && produit.fiche)
  page.route.query.produit = fotos.slug
  await nextTick()
  assert.equal(page.form.produit, fotos.slug)
  assert.equal(page.form.gamme, 'Fotos · végétation')
  delete page.route.query.produit
  await nextTick()
  assert.equal(page.form.produit, '')
  assert.equal(page.form.gamme, 'Les deux')
  assert.equal(page.form.message, 'Une cour à ombrager')
})

test('contact sends the current product title rather than its slug or initial query', async () => {
  const page = await formulaire('banc-galileo')
  page.form.produit = 'banquette-galileo'
  page.form.email = 'camille@example.org'
  page.form.consentement = true
  await page.envoyer()
  assert.equal(page.sent[0].url, '/api/demande')
  assert.equal(page.sent[0].body.type, 'contact')
  assert.equal(page.sent[0].body.produit, 'Banquette Galiléo')
  assert.equal(page.sent[0].body.gamme, 'Galiléo · brumisation')
  assert.equal(page.sent[0].body.email, 'camille@example.org')
  assert.equal(page.sent[0].body.consentement, true)
  assert.equal(page.etat.value, 'ok')
})

test('contact prevents concurrent duplicate submissions and preserves entries on a useful refusal', async () => {
  let finish
  const page = await formulaire('banc-galileo', () => new Promise((_, reject) => { finish = reject }))
  page.form.message = 'Mon projet à conserver'
  page.form.consentement = true
  const pending = page.envoyer()
  await page.envoyer()
  assert.equal(page.sent.length, 1)
  assert.equal(page.sent[0].body.consentement, true)
  assert.equal(page.sent[0].body.website, '')
  finish({ statusCode: 429 })
  await pending
  assert.equal(page.etat.value, 'erreur')
  assert.match(page.erreur.value, /Trop de demandes/)
  assert.equal(page.form.message, 'Mon projet à conserver')
  assert.equal(page.form.produit, 'banc-galileo')
})

test('contact renders the server validation message and body-size refusal without clearing entries', async () => {
  for (const [error, expected] of [
    [{ statusCode: 400, data: { data: { message: 'Le champ nom est obligatoire.' } } }, /champ nom/],
    [{ statusCode: 413 }, /volumineuse/],
  ]) {
    const page = await formulaire(undefined, async () => { throw error })
    page.form.nom = 'Camille'
    await page.envoyer()
    assert.equal(page.form.nom, 'Camille')
    assert.match(page.erreur.value, expected)
    assert.equal(page.etat.value, 'erreur')
  }
})

const { descriptor: productDescriptor } = parse(await readFile(new URL('../pages/produits/[slug].vue', import.meta.url), 'utf8'))
const docSource = productDescriptor.scriptSetup.content.slice(productDescriptor.scriptSetup.content.indexOf('// Le téléchargement'))
const docSetup = new Function('ref', 'computed', 'watch', 'slug', 'gamme', 'fiche', 'produit', 'parametres', '$fetch', 'erreurDemande',
  `${stripTypeScriptTypes(docSource)}\nreturn { email, website, etat, erreur, demanderDoc, pdfs }`)

function documentation(fetcher) {
  return docSetup(ref, computed, watch, ref('banc-galileo'), ref({ nom: 'Galiléo', documentation: '/doc.pdf', ficheTechnique: '/tech.pdf' }),
    ref({ titre: 'Banc Galiléo' }), ref({ gamme: 'galileo' }), ref({ email: 'contact@example.org' }), fetcher, erreurDemande)
}

test('documentation validation, oversized bodies and throttling keep the form and typed email visible', async () => {
  for (const statusCode of [400, 413, 415, 429]) {
    const doc = documentation(async () => { throw { statusCode } })
    doc.email.value = 'Camille@example.org'
    await doc.demanderDoc()
    assert.equal(doc.etat.value, 'erreur')
    assert.equal(doc.email.value, 'Camille@example.org')
    assert.ok(doc.erreur.value)
  }
})

test('documentation retains PDF fallback for network/provider outages and sends the empty honeypot', async () => {
  for (const error of [new Error('Network'), { statusCode: 502 }]) {
    const doc = documentation(async (_, options) => {
      assert.equal(options.body.website, '')
      assert.equal(options.body.gamme, 'galileo')
      assert.equal(options.body.produit, 'Banc Galiléo')
      throw error
    })
    await doc.demanderDoc()
    assert.equal(doc.etat.value, 'download-only')
    assert.equal(doc.pdfs.value.length, 2)
  }
})

test('both templates contain an unfocusable honeypot and share email bounds with the API', () => {
  for (const template of [descriptor.template.content, productDescriptor.template.content]) {
    assert.match(template, /name="website" tabindex="-1" autocomplete="off"/)
    assert.match(template, /:maxlength="limitesDemande.email"/)
  }
})


test('DWG requests prefill the product and retain their intent when the message is edited', async () => {
  const page = await formulaire('banc-galileo', undefined, 'dwg')
  assert.match(page.form.message, /DWG ou 3D du produit Banc Galiléo/)
  const fotos = produits.find(p => p.gamme === 'fotos' && p.fiche)
  page.form.produit = fotos.slug
  await nextTick()
  assert.ok(page.form.message.includes(fotos.fiche.titre))
  page.form.message = 'Merci de fournir le modèle pour notre étude.'
  page.form.produit = 'banc-galileo'
  await nextTick()
  assert.equal(page.form.message, 'Merci de fournir le modèle pour notre étude.')
  await page.envoyer()
  assert.equal(page.sent[0].body.produit, 'Banc Galiléo')
  assert.match(page.sent[0].body.message, /^Demande de fichier DWG ou 3D/)
  assert.ok(page.sent[0].body.message.includes(page.form.message))
})
