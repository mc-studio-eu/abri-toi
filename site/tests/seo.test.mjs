import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'
import { createContext, SourceTextModule, SyntheticModule } from 'node:vm'
import { computed, reactive, toValue } from 'vue'
import { createImageUrlBuilder } from '@sanity/image-url'

const root = new URL('../', import.meta.url)
async function environnement({ config, fetchedProducts = [], fetchedArticles = [], fetchedRealisations = [], realisationError = false, productError = false, articleError = false, fetcher, client = false, globals = {} } = {}) {
  const route = reactive({ path: '/contact', query: { produit: 'banc-galileo' } })
  let setup = true
  let head
  const headers = {}
  const queries = []
  const clients = []
  const runtime = config || { public: { seoSiteUrl: 'https://abritoi.com', contentSource: 'sanity', sanity: { projectId: 'test123', dataset: 'production', apiVersion: '2026-10-01' } } }
  const context = createContext({
    URL, console, computed, AbortSignal,
    useRoute: () => route,
    useRuntimeConfig: () => { assert.ok(setup, 'runtime config must be captured in setup, before Unhead evaluation'); return runtime },
    useHead: (callback) => { head = callback },
    defineEventHandler: (handler) => handler,
    createError: (options) => Object.assign(new Error(options.statusMessage), options),
    useRequestFetch: () => globals.$fetch,
    getRouterParam: (event, key) => event.params?.[key],
    getQuery: (event) => event.query || {},
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
        if (fetcher) return fetcher(query)
        if (!query.includes('_type ==')) return null
        if (query.includes('_type == "realisation"')) {
          if (realisationError) throw new Error('CMS unavailable')
          return fetchedRealisations
        }
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

test('CMS image completion keeps the HD asset without introducing a local fallback src', () => {
  const photo = { asset: { _ref: 'image-photo-6000x4000-jpg' } }
  const fallback = { src: '/images/hero.png', alt: 'Hero' }
  const result = contenu.completerContenu({ photo }, { photo: fallback })
  assert.equal(result.photo.src, undefined)
  assert.equal(result.photo.asset._ref, photo.asset._ref)
  assert.equal(result.photo.alt, 'Hero')
  assert.equal(photo.alt, undefined)
  assert.equal(contenu.completerContenu({ photo: null }, { photo: fallback }).photo.src, fallback.src)
})

test('image URLs prefer a Sanity asset even when the CMS also stores a local src', async () => {
  const isolated = await environnement()
  const { img } = (await isolated.charger('utils/sanity.ts')).namespace
  const image = { asset: { _ref: 'image-08eace22fb56224d53a3998a691b9e8b9c59cb95-6000x4000-jpg' }, src: '/images/fallback.jpg' }
  const url = new URL(img(image, 1600))
  assert.equal(url.hostname, 'cdn.sanity.io')
  assert.equal(url.searchParams.get('w'), '1600')
  assert.equal(img({ src: '/images/local.svg' }, 400), '/images/local.svg')
  assert.equal(img(null), '')
})

test('published products are authoritative, reject incomplete additions and normalize the permanent alias', () => {
  const reference = produits[0]
  const publie = { ...reference, nom: 'Nom publié' }
  const ajout = { ...reference, slug: 'nouveau-produit', nom: 'Nouveau produit' }
  const incomplet = { ...reference, slug: 'incomplet', fiche: null }
  const resultat = contenu.cataloguePublic([publie, ajout, incomplet])
  assert.equal(resultat.length, 2)
  assert.equal(resultat.find((p) => p.slug === reference.slug).nom, 'Nom publié')
  assert.equal(resultat.some((p) => p.slug === 'incomplet'), false)
  assert.equal(contenu.cataloguePublic([]).length, 0)
  assert.equal(contenu.cataloguePublic().length, 0)
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

test('article lists and sitemap exclude absent, incomplete, provisional and forbidden publications', () => {
  const reference = articles.find((a) => contenu.articleComplet(a))
  const partiel = { slug: reference.slug, titre: 'Titre publié partiellement' }
  assert.equal(contenu.articlePublic(reference.slug), null)
  assert.equal(contenu.articlePublic(reference.slug, null), null)
  assert.equal(contenu.articlePublic(reference.slug, partiel).corps, undefined)
  const placeholder = { ...reference, corps: [bloc('Article en cours de rédaction.')] }
  const interdit = { ...nouveau, slug: contenu.SLUG_ARTICLE_EXCLU }
  const paths = cheminsSitemap([], [placeholder, partiel, nouveau, interdit])
  assert.equal(paths.includes(`/articles/${reference.slug}`), false)
  assert.ok(paths.includes('/articles/un-nouvel-article'))
  assert.equal(paths.some((path) => path.includes(contenu.SLUG_ARTICLE_EXCLU)), false)
  assert.equal(contenu.articlePublic(contenu.SLUG_ARTICLE_EXCLU, interdit), null)
  assert.equal(cheminsSitemap([], [], []).length, 6)
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

test('dynamic sitemap uses published CMS collections and omits absent reference products and legal documents', async () => {
  const ajout = { ...produits[0], slug: 'addition-cms' }
  const env = await environnement({ fetchedProducts: [ajout], fetchedArticles: [nouveau] })
  const handler = (await env.charger('server/routes/sitemap.xml.get.ts')).namespace.default
  const xml = await handler({})
  assert.equal(env.queries.length, 6)
  assert.equal(env.clients[0].perspective, 'published')
  assert.equal(env.clients[0].useCdn, false)
  assert.ok(xml.includes('/produits/addition-cms</loc>'))
  assert.equal(xml.includes('/produits/banc-galileo</loc>'), false)
  assert.ok(xml.includes('/articles/un-nouvel-article</loc>'))
  assert.equal(xml.includes('/mentions-legales</loc>'), false)
  assert.ok(!xml.includes('<lastmod>'))
  assert.equal(env.headers['Content-Type'], 'application/xml; charset=utf-8')
  // Shared server cache: a second request does not query Sanity again.
  assert.equal(await handler({}), xml)
  assert.equal(env.queries.length, 6)
})

test('reference-mode sitemap and robots use the configured origin without CMS access', async () => {
  const env = await environnement({ config: { public: { seoSiteUrl: 'https://www.exemple.fr', contentSource: 'reference', sanity: { projectId: 'test123' } } } })
  const sitemap = (await env.charger('server/routes/sitemap.xml.get.ts')).namespace.default
  const robots = (await env.charger('server/routes/robots.txt.get.ts')).namespace.default
  const xml = await sitemap({})
  assert.ok(xml.includes('<loc>https://www.exemple.fr/</loc>'))
  assert.ok(xml.includes('/mentions-legales</loc>'))
  assert.ok(xml.includes('/produits/banc-galileo</loc>'))
  assert.ok(xml.includes('/articles/vegetation-barriere-pollution</loc>'))
  assert.equal(xml.includes('/articles/seniors-ehpad-canicules'), false)
  assert.equal(env.queries.length, 0)
  assert.equal(robots({}), 'User-agent: *\nAllow: /\n\nSitemap: https://www.exemple.fr/sitemap.xml\n')
  const escaped = seo.sitemapXml(['/contact?x=1', '/contact', '/a&b'])
  assert.equal((escaped.match(/<url>/g) || []).length, 2)
  assert.ok(escaped.includes('/a&amp;b</loc>'))
})

test('cold CMS failure returns 503 and Retry-After rather than a changed sitemap or local routes', async () => {
  const env = await environnement({ articleError: true })
  const handler = (await env.charger('server/routes/sitemap.xml.get.ts')).namespace.default
  await assert.rejects(handler({}), (error) => error.statusCode === 503)
  assert.equal(env.headers['Retry-After'], '60')
})

test('sitemap includes only published realisation routes and preserves an empty collection', async () => {
  const document = { slug: 'sanary-publie', nom: 'Sanary' }
  const env = await environnement({ fetchedRealisations: [document] })
  const handler = (await env.charger('server/routes/sitemap.xml.get.ts')).namespace.default
  const xml = await handler({})
  assert.ok(xml.includes('/realisations/sanary-publie</loc>'))
  assert.equal(xml.includes('/realisations/galileo-banquette-brumisee</loc>'), false)
  const vide = await environnement()
  const sitemap = (await vide.charger('server/routes/sitemap.xml.get.ts')).namespace.default
  assert.equal((await sitemap({})).includes('/realisations/galileo-banquette-brumisee</loc>'), false)
})

test('cache expires at 60 seconds, reuses last good values during a transient outage, and stops after 15 minutes', async () => {
  const { creerCacheContenu, FRAICHEUR_CONTENU, AGE_MAX_SECOURS } = (await env.charger('server/utils/cacheContenu.ts')).namespace
  let now = 0
  const cache = creerCacheContenu(() => now)
  let calls = 0
  let outage = false
  const load = async () => { calls++; if (outage) throw new Error('network'); return ['nouveau-cms'] }
  assert.deepEqual(await cache('articles', load), ['nouveau-cms'])
  now = FRAICHEUR_CONTENU - 1
  await cache('articles', load)
  assert.equal(calls, 1)
  now = FRAICHEUR_CONTENU
  outage = true
  assert.deepEqual(await cache('articles', load), ['nouveau-cms'])
  assert.equal(calls, 2)
  now += 1000
  await cache('articles', load)
  assert.equal(calls, 2)
  now = AGE_MAX_SECOURS
  await assert.rejects(cache('articles', load), /network/)
  await assert.rejects(cache('new-slug', load), /network/)
})

test('successful empty publications and missing documents replace last good entries; nontransient errors never use stale data', async () => {
  const { creerCacheContenu, FRAICHEUR_CONTENU } = (await env.charger('server/utils/cacheContenu.ts')).namespace
  let now = 0
  const cache = creerCacheContenu(() => now)
  await cache('list', async () => [nouveau])
  await cache('detail', async () => nouveau)
  now += FRAICHEUR_CONTENU
  assert.equal((await cache('list', async () => [])).length, 0)
  assert.equal(await cache('detail', async () => null), null)
  now += FRAICHEUR_CONTENU
  const outage = async () => { throw new Error('network') }
  assert.equal((await cache('list', outage)).length, 0)
  assert.equal(await cache('detail', outage), null)
  now += FRAICHEUR_CONTENU
  await assert.rejects(cache('detail', async () => { throw Object.assign(new Error('Unauthorized'), { statusCode: 401 }) }), /Unauthorized/)
})

test('content API filters article lists before stripping full bodies, and missing CMS details stay null', async () => {
  const placeholder = { ...nouveau, slug: 'provisoire', corps: [bloc('Article en cours de rédaction.')] }
  const env = await environnement({ fetchedArticles: [nouveau, placeholder] })
  const handler = (await env.charger('server/api/contenu/[nom].get.ts')).namespace.default
  const result = await handler({ params: { nom: 'articles' } })
  assert.equal(result.contenu.length, 1)
  assert.equal(result.contenu[0].slug, nouveau.slug)
  assert.equal('corps' in result.contenu[0], false)
  assert.equal('auteur' in result.contenu[0], false)
  const absent = await environnement({ fetcher: () => null })
  const missing = (await absent.charger('server/api/contenu/[nom].get.ts')).namespace.default
  assert.equal((await missing({ params: { nom: 'article' }, query: { slug: articles[0].slug } })).contenu, null)
})

test('SSR and client use the same named API, propagate request signal and do not reuse old SPA payloads', async () => {
  for (const client of [false, true]) {
    const signal = new AbortController().signal
    const env = await environnement({ client, globals: {
      useAsyncData: async (key, handler, options) => {
        assert.equal(key, 'article-un-nouvel-article')
        assert.equal(options.timeout, 9000)
        const cached = { contenu: { titre: 'Old title' } }
        assert.equal(options.getCachedData(key, { isHydrating: true, payload: { data: { [key]: cached } } }), cached)
        assert.equal(options.getCachedData(key, { isHydrating: false, payload: { data: { [key]: cached } } }), undefined)
        return { data: { value: await handler({}, { signal }) }, error: { value: null } }
      },
      $fetch: async (url, options) => {
        assert.equal(url, '/api/contenu/article')
        assert.equal(options.query.slug, 'un-nouvel-article')
        assert.equal(options.signal, signal)
        assert.equal(options.retry, 0)
        return { contenu: nouveau }
      },
    } })
    const { useContenu } = (await env.charger('composables/useContenu.ts')).namespace
    assert.equal((await useContenu('article', 'un-nouvel-article')).value, nouveau)
  }
})

test('content composable propagates 503 instead of producing a false 404 or reference detail', async () => {
  const env = await environnement({ globals: {
    useAsyncData: async () => ({ data: { value: undefined }, error: { value: { statusCode: 503 } } }),
  } })
  const { useContenu } = (await env.charger('composables/useContenu.ts')).namespace
  await assert.rejects(useContenu('article', articles[0].slug), (error) => error.statusCode === 503)
})
