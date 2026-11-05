import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'
import { createContext, SourceTextModule, SyntheticModule } from 'node:vm'
import { computed, reactive, toValue } from 'vue'
import { createImageUrlBuilder } from '@sanity/image-url'

const root = new URL('../', import.meta.url)
async function environnement({ config, fetchedProducts = [], fetchedArticles = [], productError = false, articleError = false, client = false, globals = {} } = {}) {
  const route = reactive({ path: '/contact', query: { produit: 'banc-galileo' } })
  let setup = true
  let head
  const headers = {}
  const queries = []
  const clients = []
  const runtime = config || { public: { seoSiteUrl: 'https://abritoi.com', contentSource: 'sanity', sanity: { projectId: 'test123', dataset: 'production', apiVersion: '2026-10-01' } } }
  const context = createContext({
    URL, console, computed,
    useRoute: () => route,
    useRuntimeConfig: () => { assert.ok(setup, 'runtime config must be captured in setup, before Unhead evaluation'); return runtime },
    useHead: (callback) => { head = callback },
    defineEventHandler: (handler) => handler,
    setHeader: (_, key, value) => { headers[key] = value },
    ...globals,
  })
  const modules = new Map()
  function synthese(exports) {
    return new SyntheticModule(Object.keys(exports), function () {
      for (const [nom, valeur] of Object.entries(exports)) this.setExport(nom, valeur)
    }, { context })
  }
  const externes = {
    vue: synthese({ computed, toValue }),
    '@sanity/image-url': synthese({ createImageUrlBuilder }),
    '@sanity/client': synthese({ createClient: (options) => {
      clients.push(options)
      return { fetch: async (query) => {
        queries.push(query)
        const article = query.includes('_type == "article"')
        if (article ? articleError : productError) throw new Error('CMS unavailable')
        return article ? fetchedArticles : fetchedProducts
      } }
    } }),
  }
  async function charger(path) {
    const url = new URL(path, root)
    if (modules.has(url.href)) return modules.get(url.href)
    const chargement = (async () => {
      const source = stripTypeScriptTypes(await readFile(url, 'utf8'))
      const module = new SourceTextModule(source, {
        context,
        identifier: url.href,
        initializeImportMeta: (meta) => { meta.client = client; meta.server = !client },
      })
      await module.link(async (specifier) => {
        if (externes[specifier]) return externes[specifier]
        const lien = specifier.startsWith('~/') ? new URL(specifier.slice(2), root) : new URL(specifier, url)
        return charger(lien.href.endsWith('.ts') ? lien.href : `${lien.href}.ts`)
      })
      await module.evaluate()
      return module
    })()
    modules.set(url.href, chargement)
    return chargement
  }
  return { charger, route, headers, queries, clients, runtime, renderHead: () => { setup = false; return head() } }
}

const env = await environnement()
const seo = (await env.charger('utils/seo.ts')).namespace
const contenu = (await env.charger('utils/contenuPublic.ts')).namespace
const { produits } = (await env.charger('content/produits.ts')).namespace
const { articles } = (await env.charger('content/articles.ts')).namespace
const { cheminsSitemap } = (await env.charger('utils/sitemap.ts')).namespace
const bloc = (text) => ({ _type: 'block', children: [{ _type: 'span', text }] })
const nouveau = { slug: 'un-nouvel-article', titre: 'Une ombre agréable', corps: [bloc('Un contenu éditorial complet et utile pour aménager une place.')], extrait: 'Une description propre.' }

test('canonical uses the configured HTTPS origin, never request query, fragment or untrusted origin', () => {
  assert.equal(seo.urlCanonique('/contact?produit=banc-galileo#formulaire'), 'https://abritoi.com/contact')
  assert.equal(seo.urlCanonique('/produits/banc-fotos/', 'https://www.exemple.fr/'), 'https://www.exemple.fr/produits/banc-fotos')
  assert.equal(seo.urlCanonique('/'), 'https://abritoi.com/')
  for (const value of ['', null, 'http://abritoi.com', 'javascript:alert(1)', 'https://u:p@exemple.fr', 'https://exemple.fr/path', 'https://exemple.fr/?x=1', 'https://exemple.fr/#x']) {
    assert.equal(seo.origineSeo(value), 'https://abritoi.com')
  }
  assert.equal(seo.urlCanonique('//evil.test/'), 'https://abritoi.com/')
})

test('social image URL and JSON-LD are safe and retain existing content', () => {
  assert.equal(seo.imageAbsolue('/images/visuel.png'), 'https://abritoi.com/images/visuel.png')
  assert.equal(seo.imageAbsolue('https://cdn.sanity.io/visuel.jpg'), 'https://cdn.sanity.io/visuel.jpg')
  assert.equal(seo.imageAbsolue('javascript:alert(1)'), `https://abritoi.com${seo.IMAGE_PARTAGE}`)
  const original = { titre: '</script><script>alert("x")</script>&\u2028\u2029' }
  const serialise = seo.serialiserJsonLd(original)
  assert.ok(!serialise.includes('<'))
  assert.ok(!serialise.includes('&'))
  assert.deepEqual(JSON.parse(serialise), original)
})

test('partial CMS completion preserves explicit false, empty text and arrays', () => {
  const resultat = contenu.completerContenu({ visible: false, texte: '', liste: [], nested: { title: null } }, { visible: true, texte: 'Secours', liste: ['Défaut'], nested: { title: 'Titre de secours' } })
  assert.equal(resultat.visible, false)
  assert.equal(resultat.texte, '')
  assert.equal(resultat.liste.length, 0)
  assert.equal(resultat.nested.title, 'Titre de secours')
})

test('product merging retains all served reference routes, accepts complete published additions and rejects incomplete additions', () => {
  const reference = produits[0]
  const publie = { ...reference, nom: 'Nom publié' }
  const ajout = { ...reference, slug: 'nouveau-produit', nom: 'Nouveau produit' }
  const incomplet = { ...reference, slug: 'incomplet', fiche: null }
  const resultat = contenu.cataloguePublic([publie, ajout, incomplet])
  assert.equal(resultat.length, produits.length + 1)
  assert.equal(resultat.find((p) => p.slug === reference.slug).nom, 'Nom publié')
  assert.equal(resultat.some((p) => p.slug === 'incomplet'), false)
  assert.equal(contenu.cataloguePublic([{ ...publie, lienVers: 'ancien-modele' }])[0].nom, reference.nom)
  const paths = cheminsSitemap([publie, ajout, incomplet], [])
  assert.ok(paths.includes('/produits/nouveau-produit'))
  assert.equal(paths.some((path) => path.includes('incomplet')), false)
})

test('article completeness distinguishes real content without intro from placeholders and empty bodies', () => {
  assert.equal(contenu.articleComplet(nouveau), true)
  for (const corps of [[], [bloc('Article en cours de rédaction.')], [bloc('Contenu à venir')], [bloc('')]]) {
    assert.equal(contenu.articleComplet({ ...nouveau, corps }), false)
  }
  assert.ok(contenu.texteArticle(nouveau).includes('éditorial complet'))
})

test('article sitemap matches the actual partial-document fallback, while excluding provisional and forbidden articles', () => {
  const reference = articles.find((a) => contenu.articleComplet(a))
  const partiel = { slug: reference.slug, titre: 'Titre publié partiellement' }
  const rendu = contenu.articlePublic(reference.slug, partiel)
  assert.equal(rendu.titre, partiel.titre)
  assert.ok(rendu.corps.length)
  assert.equal(contenu.articleComplet(rendu), true)
  const placeholder = { ...reference, corps: [bloc('Article en cours de rédaction.')] }
  const interdit = { ...nouveau, slug: contenu.SLUG_ARTICLE_EXCLU }
  const paths = cheminsSitemap([], [placeholder, nouveau, interdit])
  assert.equal(paths.includes(`/articles/${reference.slug}`), false)
  assert.ok(paths.includes('/articles/un-nouvel-article'))
  assert.equal(paths.some((path) => path.includes(contenu.SLUG_ARTICLE_EXCLU)), false)
  assert.equal(contenu.articlePublic(contenu.SLUG_ARTICLE_EXCLU, interdit), null)
  assert.ok(cheminsSitemap([], [partiel]).includes(`/articles/${reference.slug}`))
})

test('head resolves Sanity images after setup without accessing Nuxt context, and follows canonical route changes', async () => {
  const env = await environnement()
  const { usePageSeo } = (await env.charger('composables/usePageSeo.ts')).namespace
  usePageSeo(() => ({ titre: 'Titre propre', description: 'Description propre', image: { asset: { _ref: 'image-0123456789abcdef-1200x630-jpg' } }, fil: [{ nom: 'Contact', chemin: '/contact' }] }))
  let head = env.renderHead()
  const meta = (name) => head.meta.find((item) => item.name === name || item.property === name)?.content
  assert.equal(meta('og:title'), 'Titre propre')
  assert.equal(meta('twitter:description'), 'Description propre')
  assert.ok(meta('og:image').startsWith('https://cdn.sanity.io/images/test123/production/'))
  assert.equal(head.link[0].href, 'https://abritoi.com/contact')
  env.route.path = '/produits/banc-fotos'
  head = env.renderHead()
  assert.equal(head.link[0].href, 'https://abritoi.com/produits/banc-fotos')
  const graph = JSON.parse(head.script[0].innerHTML)['@graph']
  assert.ok(graph.some((schema) => schema['@type'] === 'Organization'))
  assert.equal(graph.find((schema) => schema['@type'] === 'BreadcrumbList').itemListElement.length, 2)
})

test('provisional pages emit noindex without Article schema and complete articles expose only real publication dates', async () => {
  const env = await environnement()
  const { usePageSeo } = (await env.charger('composables/usePageSeo.ts')).namespace
  const options = reactive({ titre: nouveau.titre, description: nouveau.extrait, noindex: true, article: { titre: nouveau.titre, auteur: 'Paul Saraceno', date: '2026-10-30' } })
  usePageSeo(options)
  let head = env.renderHead()
  assert.equal(head.meta.find((meta) => meta.name === 'robots').content, 'noindex, follow')
  assert.equal(JSON.parse(head.script[0].innerHTML)['@graph'].some((schema) => schema['@type'] === 'Article'), false)
  options.noindex = false
  head = env.renderHead()
  const article = JSON.parse(head.script[0].innerHTML)['@graph'].find((schema) => schema['@type'] === 'Article')
  assert.equal(article.datePublished, '2026-10-30')
  assert.equal(article.dateModified, undefined)
})

test('dynamic Nitro sitemap requests published CMS content and preserves fallback independently after a collection failure', async () => {
  const ajout = { ...produits[0], slug: 'addition-cms' }
  const env = await environnement({ fetchedProducts: [ajout], articleError: true })
  const handler = (await env.charger('server/routes/sitemap.xml.get.ts')).namespace.default
  const xml = await handler({})
  assert.equal(env.queries.length, 2)
  assert.equal(env.clients[0].perspective, 'published')
  assert.ok(env.queries.every((query) => query.includes('drafts.**')))
  assert.ok(xml.includes('/produits/addition-cms</loc>'))
  assert.ok(xml.includes('/produits/banc-galileo</loc>'))
  assert.ok(xml.includes('/articles/vegetation-barriere-pollution</loc>'))
  assert.ok(!xml.includes('/articles/seniors-ehpad-canicules'))
  assert.ok(!xml.includes('<lastmod>'))
  assert.equal(env.headers['Content-Type'], 'application/xml; charset=utf-8')
})

test('reference-mode sitemap and robots use the same configured origin without CMS access', async () => {
  const env = await environnement({ config: { public: { seoSiteUrl: 'https://www.exemple.fr', contentSource: 'reference', sanity: { projectId: 'test123' } } } })
  const sitemap = (await env.charger('server/routes/sitemap.xml.get.ts')).namespace.default
  const robots = (await env.charger('server/routes/robots.txt.get.ts')).namespace.default
  const xml = await sitemap({})
  assert.ok(xml.includes('<loc>https://www.exemple.fr/</loc>'))
  assert.equal(env.queries.length, 0)
  assert.equal(robots({}), 'User-agent: *\nAllow: /\n\nSitemap: https://www.exemple.fr/sitemap.xml\n')
  const escaped = seo.sitemapXml(['/contact?x=1', '/contact', '/a&b'])
  assert.equal((escaped.match(/<url>/g) || []).length, 2)
  assert.ok(escaped.includes('/a&amp;b</loc>'))
})

test('SSR awaits the Sanity client from the Nuxt context and passes its request signal', async () => {
  const signal = new AbortController().signal
  const env = await environnement({ globals: {
    useAsyncData: async (key, handler, options) => {
      assert.equal(key, 'ficheProduit')
      assert.equal(options.timeout, 8000)
      const nuxtApp = { runWithContext: async (callback) => callback() }
      return { data: { value: await handler(nuxtApp, { signal }) } }
    },
    sanityClient: () => ({ fetch: async (query, _params, options) => {
      assert.equal(query, '*[_id == "ficheProduit"][0]{...}')
      assert.equal(options.signal, signal)
      return { titre: 'Titre publié' }
    } }),
    $fetch: () => assert.fail('SSR should query Sanity directly'),
  } })
  const { useContenu } = (await env.charger('composables/useContenu.ts')).namespace
  const resultat = await useContenu('ficheProduit', { titre: 'Secours', legende: 'Description de référence' })
  assert.equal(resultat.value.titre, 'Titre publié')
  assert.equal(resultat.value.legende, 'Description de référence')
})

test('client content uses the same-origin named endpoint with a bounded request and no retry', async () => {
  const signal = new AbortController().signal
  const env = await environnement({ client: true, globals: {
    useAsyncData: async (key, handler, options) => {
      assert.equal(key, 'article-un-nouvel-article')
      assert.equal(options.timeout, 8000)
      return { data: { value: await handler({}, { signal }) } }
    },
    sanityClient: () => assert.fail('the browser should use the site API'),
    $fetch: async (url, options) => {
      assert.equal(url, '/api/contenu/article')
      assert.equal(options.query.slug, 'un-nouvel-article')
      assert.equal(options.signal, signal)
      assert.equal(options.retry, 0)
      return false
    },
  } })
  const { useContenu } = (await env.charger('composables/useContenu.ts')).namespace
  const secours = { titre: 'Article de référence' }
  const resultat = await useContenu('article', secours, 'un-nouvel-article')
  assert.equal(resultat.value, secours)
})
