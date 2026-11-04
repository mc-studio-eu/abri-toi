import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'
import { PassThrough } from 'node:stream'
import * as bufferModule from 'node:buffer'
import { createContext, SourceTextModule, SyntheticModule } from 'node:vm'

const source = stripTypeScriptTypes(await readFile(new URL('../server/api/demande.post.ts', import.meta.url), 'utf8'))
const contentSource = stripTypeScriptTypes(await readFile(new URL('../content/commun.ts', import.meta.url), 'utf8'))
const contact = { profil: 'Collectivité', consentement: true, type: 'contact', email: 'camille@example.org', prenom: 'Camille', nom: 'Martin', organisation: 'Mairie', message: 'Une cour à ombrager' }

async function endpoint({ body = contact, config = {}, emailError, emailThrows = false, sanityError, fetchError, cmsFiles = null } = {}) {
  const sent = []
  const saved = []
  const logs = []
  const runtime = {
    resendApiKey: 'fake-test-key',
    emailFrom: 'formulaire@abritoi.com',
    contactEmail: 'collaborer@abritoi.com',
    sanityWriteToken: 'fake-test-token',
    siteUrl: 'https://www.abritoi.test',
    public: { sanity: { projectId: 'test', dataset: 'production', apiVersion: '2026-10-01' } },
    ...config,
  }
  const context = createContext({
    URL,
    setResponseHeader: (event, name, value) => { event.responseHeaders[name.toLowerCase()] = value },
    defineEventHandler: (handler) => handler,
    useRuntimeConfig: () => runtime,
    createError: (details) => Object.assign(new Error(details.statusMessage), details),
    console: { error: (...args) => logs.push(args) },
  })
  const contentModule = new SourceTextModule(contentSource, { context })
  await contentModule.link(() => { throw new Error('Unexpected content dependency') })
  await contentModule.evaluate()
  const fetched = []
  const dependencies = {
    '../../content/commun': contentModule,
    'node:buffer': new SyntheticModule(['Buffer'], function () { this.setExport('Buffer', bufferModule.Buffer) }, { context }),
    '@sanity/client': new SyntheticModule(['createClient'], function () {
      this.setExport('createClient', () => ({
        create: async (doc) => { if (sanityError) throw new Error('Fake archive failure'); saved.push(doc) },
        fetch: async (query, params) => { fetched.push({ query, params }); if (fetchError) throw new Error('Fake CMS failure'); return cmsFiles },
      }))
    }, { context }),
    resend: new SyntheticModule(['Resend'], function () {
      this.setExport('Resend', class {
        emails = { send: async (email) => { sent.push(email); if (emailThrows === true || emailThrows === email.to) throw new Error('Fake network failure'); return { error: typeof emailError === 'function' ? emailError(email) : emailError } } }
      })
    }, { context }),
  }
  const limitsSource = stripTypeScriptTypes(await readFile(new URL('../utils/demande.ts', import.meta.url), 'utf8'))
  const limitsModule = new SourceTextModule(limitsSource, { context })
  await limitsModule.link(() => { throw new Error('Unexpected limits dependency') })
  await limitsModule.evaluate()
  dependencies['../../utils/demande'] = limitsModule
  const guardSource = stripTypeScriptTypes(await readFile(new URL('../server/utils/demandeProtection.ts', import.meta.url), 'utf8'))
  const guardModule = new SourceTextModule(guardSource, { context })
  await guardModule.link((specifier) => {
    assert.ok(dependencies[specifier], `Unexpected guard dependency: ${specifier}`)
    return dependencies[specifier]
  })
  await guardModule.evaluate()
  dependencies['../utils/demandeProtection'] = guardModule
  const module = new SourceTextModule(source, { context })
  await module.link((specifier) => {
    assert.ok(dependencies[specifier], `Unexpected dependency: ${specifier}`)
    return dependencies[specifier]
  })
  await module.evaluate()
  const responses = []
  function run(options = {}) {
    const req = new PassThrough()
    req.headers = { 'content-type': 'application/json', ...options.headers }
    req.socket = { remoteAddress: options.ip ?? '192.0.2.1' }
    const event = { node: { req }, responseHeaders: {} }
    responses.push(event.responseHeaders)
    const promise = module.namespace.default(event)
    if (options.abort) req.emit('aborted')
    else {
      const chunks = options.chunks ?? [options.raw ?? JSON.stringify(Object.hasOwn(options, 'body') ? options.body : body)]
      for (const chunk of chunks) req.write(chunk)
      req.end()
    }
    return promise
  }
  return { run, sent, saved, logs, fetched, responses, guard: guardModule.namespace, limits: limitsModule.namespace }

}

test('contact routes the complete escaped message to the requested mailbox, with visitor reply-to', async () => {
  const api = await endpoint({ body: { ...contact, email: ' camille@example.org ', message: '<script>alert("test")</script>', unexpected: 'ignore' } })
  assert.equal((await api.run()).ok, true)
  assert.equal(api.sent.length, 1)
  assert.equal(api.sent[0].to, 'collaborer@abritoi.com')
  assert.equal(api.sent[0].from, 'formulaire@abritoi.com')
  assert.equal(api.sent[0].replyTo, 'camille@example.org')
  assert.match(api.sent[0].subject, /Mairie/)
  assert.match(api.sent[0].html, /&lt;script&gt;/)
  assert.doesNotMatch(api.sent[0].html, /<script>/)
  assert.match(api.sent[0].text, /<script>/)
  assert.equal(api.saved.length, 1)
  assert.equal(api.saved[0].unexpected, undefined)
})

test('contact rejects missing email configuration even when Sanity can archive it', async () => {
  for (const key of ['resendApiKey', 'emailFrom', 'contactEmail']) {
    const api = await endpoint({ config: { [key]: '' } })
    await assert.rejects(api.run, (error) => error.statusCode === 503)
    assert.equal(api.sent.length, 0)
    assert.equal(api.saved.length, 0)
  }
})

test('contact includes the selected product in both notification formats and the archive', async () => {
  const api = await endpoint({ body: { ...contact, produit: 'Banc Galiléo', gamme: 'Galiléo · brumisation' } })
  assert.equal((await api.run()).ok, true)
  assert.match(api.sent[0].text, /Produit concerné :\nBanc Galiléo/)
  assert.match(api.sent[0].html, /Produit concerné[\s\S]*Banc Galiléo/)
  assert.equal(api.saved[0].produit, 'Banc Galiléo')
  assert.equal(api.saved[0].gamme, 'Galiléo · brumisation')
})

test('invalid email payloads are rejected before sending or archiving', async () => {
  for (const email of [undefined, '', 'invalid', 'a@b@c.fr', ['camille@example.org'], 'a'.repeat(250) + '@example.org']) {
    const api = await endpoint({ body: { ...contact, email } })
    await assert.rejects(api.run, (error) => error.statusCode === 400)
    assert.equal(api.sent.length, 0)
    assert.equal(api.saved.length, 0)
  }
})

test('a refused email reports failure and does not claim delivery through Sanity', async () => {
  const api = await endpoint({ emailError: { message: 'Fake provider failure' } })
  await assert.rejects(api.run, (error) => error.statusCode === 502)
  assert.equal(api.saved.length, 0)
  assert.equal(JSON.stringify(api.logs).includes('Fake provider failure'), false)
})

test('an archive outage does not turn a successfully sent contact into an error', async () => {
  const api = await endpoint({ sanityError: true })
  assert.equal((await api.run()).ok, true)
  assert.equal(api.sent.length, 1)
  assert.equal(api.saved.length, 0)
})

test('contact sends successfully without a Sanity write token', async () => {
  const api = await endpoint({ config: { sanityWriteToken: '' } })
  assert.equal((await api.run()).ok, true)
  assert.equal(api.sent.length, 1)
  assert.equal(api.saved.length, 0)
})

const documentationRequest = { type: 'documentation', email: ' camille@example.org ', gamme: 'galileo', produit: 'Banquette Galiléo' }

test('documentation sends the two correct fallback PDFs to the visitor and notifies the owner for each gamme', async () => {
  for (const gamme of ['galileo', 'fotos']) {
    const api = await endpoint({ body: { ...documentationRequest, gamme } })
    const result = await api.run()
    assert.equal(result.delivery, 'emailed')
    assert.equal(result.documents.length, 2)
    assert.equal(api.sent.length, 2)
    const [visitor, owner] = api.sent
    assert.equal(visitor.to, 'camille@example.org')
    assert.equal(visitor.replyTo, 'collaborer@abritoi.com')
    assert.equal(visitor.from, 'formulaire@abritoi.com')
    for (const filename of [`abri-toi-${gamme}-documentation.pdf`, `abri-toi-${gamme}-fiches-techniques.pdf`]) {
      assert.ok(visitor.text.includes(`https://www.abritoi.test/docs/${filename}`))
      assert.ok(visitor.html.includes(`https://www.abritoi.test/docs/${filename}`))
      assert.ok(result.documents.some((document) => document.url === `/docs/${filename}`))
    }
    assert.doesNotMatch(visitor.text, gamme === 'galileo' ? /abri-toi-fotos-/ : /abri-toi-galileo-/)
    assert.equal(owner.to, 'collaborer@abritoi.com')
    assert.equal(owner.replyTo, 'camille@example.org')
    assert.ok(owner.text.includes(gamme))
    assert.equal(api.saved.length, 1)
    assert.equal(api.saved[0].email, 'camille@example.org')
    assert.equal(api.fetched[0].params.gamme, gamme)
    assert.match(api.fetched[0].query, /ficheTechnique\.asset->url/)
  }
})

test('CMS PDF URLs are used before sending, including without a write token', async () => {
  const cmsFiles = { documentation: 'https://cdn.sanity.io/files/project/production/booklet.pdf', ficheTechnique: 'https://cdn.sanity.io/files/project/production/technical.pdf' }
  const api = await endpoint({ body: documentationRequest, cmsFiles, config: { sanityWriteToken: '' } })
  const result = await api.run()
  assert.equal(result.delivery, 'emailed')
  assert.equal(result.documents[0].url, cmsFiles.documentation)
  assert.equal(result.documents[1].url, cmsFiles.ficheTechnique)
  for (const url of Object.values(cmsFiles)) assert.ok(api.sent[0].html.includes(url))
  assert.equal(api.saved.length, 0)
})

test('missing, unsafe or unavailable CMS files each fall back to the bundled PDFs', async () => {
  for (const options of [{ cmsFiles: { documentation: 'javascript:alert(1)', ficheTechnique: '' } }, { fetchError: true }, { config: { public: { contentSource: 'reference', sanity: { projectId: 'test', dataset: 'production', apiVersion: '2026-10-01' } } } }]) {
    const api = await endpoint({ body: documentationRequest, ...options })
    const result = await api.run()
    assert.equal(result.delivery, 'emailed')
    assert.equal(result.documents.length, 2)
    assert.match(api.sent[0].text, /https:\/\/www\.abritoi\.test\/docs\/abri-toi-galileo-documentation\.pdf/)
    assert.doesNotMatch(api.sent[0].html, /javascript:/)
  }
})

test('documentation remains downloadable when e-mail configuration is incomplete or everything is unconfigured', async () => {
  for (const config of [{ resendApiKey: '' }, { emailFrom: '' }, { contactEmail: '' }, { resendApiKey: '', sanityWriteToken: '', public: { sanity: { projectId: '', dataset: 'production', apiVersion: '2026-10-01' } } }]) {
    const api = await endpoint({ body: documentationRequest, config })
    const result = await api.run()
    assert.equal(result.delivery, 'download-only')
    assert.equal(result.documents.length, 2)
    assert.equal(api.sent.length, 0)
  }
})

test('missing or unsafe public site origin never sends visitor email links based on request Host', async () => {
  for (const siteUrl of ['', 'invalid', 'http://abritoi.com', 'https://localhost', 'https://127.0.0.1', 'https://[::1]', 'https://abritoi.com/path', 'https://user:password@abritoi.com', 'https://abritoi.com?redirect=evil']) {
    const api = await endpoint({ body: documentationRequest, config: { siteUrl } })
    const result = await api.run()
    assert.equal(result.delivery, 'download-only')
    assert.equal(result.documents.length, 2)
    assert.ok(api.sent.every((email) => email.to === 'collaborer@abritoi.com'))
  }
})

test('documentation provider errors or exceptions retain downloads and do not claim e-mail delivery', async () => {
  for (const options of [{ emailError: { message: 'Fake provider failure' } }, { emailThrows: true }]) {
    const api = await endpoint({ body: documentationRequest, ...options })
    const result = await api.run()
    assert.equal(result.delivery, 'download-only')
    assert.equal(result.documents.length, 2)
    assert.equal(api.sent.length, 2)
    assert.equal(api.saved.length, 1)
    assert.equal(JSON.stringify(api.logs).includes('Fake provider failure'), false)
  }
})

test('owner notification failure does not falsely report that visitor documentation failed', async () => {
  const api = await endpoint({ body: documentationRequest, emailError: (email) => email.to === 'collaborer@abritoi.com' ? { message: 'Fake failure' } : null, sanityError: true })
  assert.equal((await api.run()).delivery, 'emailed')
  assert.equal(api.sent.length, 2)
  assert.equal(api.saved.length, 0)
})

test('documentation stays downloadable when both mail and archival fail', async () => {
  const api = await endpoint({ body: documentationRequest, config: { resendApiKey: '' }, sanityError: true })
  assert.equal((await api.run()).delivery, 'download-only')
  assert.equal(api.sent.length, 0)
  assert.equal(api.saved.length, 0)
})

test('documentation rejects a missing or unknown gamme before any external operation', async () => {
  for (const gamme of [undefined, '', 'modulaire', 'GALILEO', '__proto__', ['galileo']]) {
    const api = await endpoint({ body: { ...documentationRequest, gamme } })
    await assert.rejects(api.run, (error) => error.statusCode === 400)
    assert.equal(api.sent.length, 0)
    assert.equal(api.saved.length, 0)
    assert.equal(api.fetched.length, 0)
  }
})

test('checked-in configuration defaults target collaborer@abritoi.com', async () => {
  const [config, example] = await Promise.all([
    readFile(new URL('../nuxt.config.ts', import.meta.url), 'utf8'),
    readFile(new URL('../.env.example', import.meta.url), 'utf8'),
  ])
  assert.match(config, /contactEmail: 'collaborer@abritoi\.com'/)
  assert.match(example, /^NUXT_CONTACT_EMAIL=collaborer@abritoi\.com$/m)
})

function aucuneOperation(api) {
  assert.equal(api.sent.length, 0)
  assert.equal(api.saved.length, 0)
  assert.equal(api.fetched.length, 0)
}

test('malformed structures, unknown types and incomplete contact cannot reach external services', async () => {
  const invalid = [null, [], 'text', 4, true, {}, { type: 'non-prevu', email: 'audit@example.org' }]
  for (const field of ['profil', 'prenom', 'nom', 'organisation', 'message', 'email']) {
    for (const value of [undefined, '', '   ', null, ['test'], {}, 10, true]) invalid.push({ ...contact, [field]: value })
  }
  for (const consentement of [undefined, false, 'true', 1, null, []]) invalid.push({ ...contact, consentement })
  for (const body of invalid) {
    const api = await endpoint({ body })
    await assert.rejects(api.run, (error) => error.statusCode === 400)
    aucuneOperation(api)
  }
})

test('every optional field is bounded text, and one-line fields reject header/control injection', async () => {
  const api = await endpoint()
  const bounds = api.limits.limitesDemande
  for (const [field, max] of Object.entries(bounds)) {
    for (const value of ['x'.repeat(max + 1), [], {}, 3, null, false, 'abc\u0000def', 'abc\u0085def', ...(field === 'message' ? [] : ['abc\r\nBcc: victim@example.org', 'abc\u2028def'])]) {
      const api = await endpoint({ body: { ...contact, [field]: value } })
      await assert.rejects(api.run, (error) => error.statusCode === 400, `${field} must reject ${JSON.stringify(value).slice(0, 60)}`)
      aucuneOperation(api)
    }
  }
})

test('message line breaks, CMS-editable labels and exact maximum lengths remain valid without truncation', async () => {
  const body = { ...contact, email: ' Camille@Example.org ', profil: 'Un profil ajouté dans le CMS', gamme: 'Une gamme éditée', echeance: 'Une échéance éditée', organisation: '界'.repeat(200), message: 'Ligne 1\r\nLigne 2\t' + '界'.repeat(3982), website: '' }
  const api = await endpoint({ body })
  assert.equal((await api.run()).ok, true)
  assert.equal(api.sent[0].replyTo, 'Camille@Example.org')
  assert.equal(api.saved[0].message, body.message)
  assert.equal(api.saved[0].organisation, body.organisation)
  assert.equal(api.saved[0].website, undefined)
  assert.equal(api.saved[0].consentement, undefined)
  assert.match(api.sent[0].subject, new RegExp(body.organisation))
})

test('honeypot is rejected for both request types before any external service', async () => {
  for (const body of [contact, documentationRequest]) {
    for (const website of ['https://bot.test', ' ']) {
      const api = await endpoint({ body: { ...body, website } })
      await assert.rejects(api.run, (error) => error.statusCode === 400)
      aucuneOperation(api)
    }
  }
})

test('both forms reject mailbox display envelopes, comments, quoted syntax and malformed domains before side effects', async () => {
  const malformed = [
    ...Array.from({ length: 6 }, (_, i) => `name${i}<audit@example.org>`),
    'Camille <audit@example.org>', 'audit@example.org(comment)', '(Camille)audit@example.org',
    '"audit"@example.org', 'audit@example.org,other@example.org', 'audit:alias@example.org',
    'audit\\alias@example.org', 'audit@example..org', 'audit@-example.org', 'audit@example-.org',
    'audit@example.org.', 'audit@exa_mple.org', 'audit@' + 'a'.repeat(64) + '.org',
    'audit@[192.0.2.1]', '.audit@example.org', 'audit.@example.org', 'audit..name@example.org',
  ]
  for (const body of [contact, documentationRequest]) {
    for (const email of malformed) {
      const api = await endpoint({ body: { ...body, email } })
      await assert.rejects(api.run, (error) => error.statusCode === 400, email)
      aucuneOperation(api)
    }
  }
})

test('valid bare mailboxes retain plus addresses, apostrophes and usual local punctuation without changing delivery case', async () => {
  for (const body of [contact, documentationRequest]) {
    for (const email of ['Audit@Example.org', "O'Connor+projet@Example.org", "a!#$%&'*+/=?^_`{|}~-.b@sub-domain.example.org"]) {
      const api = await endpoint({ body: { ...body, email: ` ${email} ` } })
      await api.run()
      assert.equal(api.saved[0].email, email)
      assert.ok(api.sent.some((message) => message.to === email || message.replyTo === email))
    }
  }
})

test('raw stream rejects malformed JSON, unsupported content types, aborted requests and byte overflow', async () => {
  for (const options of [
    { raw: '{broken' }, { abort: true },
    { headers: { 'content-type': 'application/x-www-form-urlencoded' } },
    { headers: { 'content-type': undefined } },
    { chunks: ['{"message":"', '界'.repeat(11_000), '"}'] },
    { headers: { 'content-length': '1' }, chunks: [' '.repeat(20_000), ' '.repeat(20_000)] },
  ]) {
    const api = await endpoint()
    const expected = options.chunks ? 413 : options.headers ? 415 : 400
    await assert.rejects(() => api.run(options), (error) => error.statusCode === expected)
    aucuneOperation(api)
  }
  const api = await endpoint()
  const raw = JSON.stringify(contact)
  assert.equal((await api.run({ chunks: [Buffer.from(raw.slice(0, 10)), Buffer.from(raw.slice(10))], headers: { 'content-type': 'application/json; charset=utf-8' } })).ok, true)
})

test('shared recipient quota normalizes trim/case across contact and documentation and returns Retry-After', async () => {
  const api = await endpoint()
  for (let i = 0; i < 5; i++) {
    await api.run({ body: { ...(i % 2 ? contact : documentationRequest), email: i % 2 ? ' CAMILLE@EXAMPLE.ORG ' : 'camille@example.org' }, ip: `192.0.2.${i}` })
  }
  const counts = [api.sent.length, api.saved.length, api.fetched.length]
  await assert.rejects(() => api.run({ body: contact, ip: '192.0.2.100' }), (error) => error.statusCode === 429)
  assert.deepEqual([api.sent.length, api.saved.length, api.fetched.length], counts)
  assert.equal(api.responses.at(-1)['retry-after'], '3600')
})

test('socket IP budget is shared by both forms, ignores spoofed forwarded headers and counts concurrent requests', async () => {
  const api = await endpoint()
  const results = await Promise.allSettled(Array.from({ length: 11 }, (_, i) => api.run({
    body: { ...(i % 2 ? contact : documentationRequest), email: `person${i}@example.org` },
    ip: i % 2 ? '::ffff:192.0.2.1' : '192.0.2.1',
    headers: { 'x-forwarded-for': `198.51.100.${i}`, 'x-real-ip': `198.51.100.${i}`, forwarded: `for=198.51.100.${i}` },
  })))
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 10)
  assert.equal(results[10].reason.statusCode, 429)
  assert.equal(api.saved.length, 10)
  assert.equal(api.responses.at(-1)['retry-after'], '600')
})

test('synchronous recipient reservations allow only five concurrent side-effect flows', async () => {
  const api = await endpoint()
  const results = await Promise.allSettled(Array.from({ length: 6 }, (_, i) => api.run({ ip: `192.0.2.${i}` })))
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 5)
  assert.equal(api.sent.length, 5)
  assert.equal(api.saved.length, 5)
})

test('repeated refusals for a saturated IP do not consume the global budget of other visitors', async () => {
  const api = await endpoint()
  const limiter = api.guard.creerLimiteurDemandes(() => 1000)
  for (let i = 0; i < 10; i++) limiter.requete('192.0.2.1')
  for (let i = 0; i < 100; i++) assert.throws(() => limiter.requete('192.0.2.1'), (error) => error.statusCode === 429)
  for (let i = 0; i < 90; i++) assert.doesNotThrow(() => limiter.requete(`198.51.100.${i}`))
  assert.throws(() => limiter.requete('203.0.113.1'), (error) => error.statusCode === 429)
})

test('request limiter expiry, shared unknown socket, global budget and fail-closed capacity', async () => {
  const api = await endpoint()
  let now = 1000
  const limiter = api.guard.creerLimiteurDemandes(() => now)
  for (let i = 0; i < 10; i++) limiter.requete()
  assert.throws(() => limiter.requete(), (error) => error.statusCode === 429 && error.retryAfter === 600)
  for (let i = 0; i < 5; i++) limiter.destinataire('email@example.org')
  assert.throws(() => limiter.destinataire(' EMAIL@EXAMPLE.ORG '), (error) => error.statusCode === 429)
  now += 600_000
  assert.doesNotThrow(() => limiter.requete())
  assert.throws(() => limiter.destinataire('email@example.org'), (error) => error.statusCode === 429)
  now += 3_000_000
  assert.doesNotThrow(() => limiter.destinataire('email@example.org'))
  const global = api.guard.creerLimiteurDemandes(() => now)
  for (let i = 0; i < 100; i++) global.requete(`198.51.100.${i}`)
  assert.throws(() => global.requete('203.0.113.1'), (error) => error.statusCode === 429)
  now += 3_600_000
  assert.doesNotThrow(() => global.requete('203.0.113.1'))
  const bounded = api.guard.creerLimiteurDemandes(() => now, 1)
  bounded.requete('192.0.2.1')
  bounded.destinataire('a@example.org')
  assert.throws(() => bounded.requete('192.0.2.2'), (error) => error.statusCode === 429)
  assert.throws(() => bounded.destinataire('b@example.org'), (error) => error.statusCode === 429)
  // Refusing the new key did not evict the existing live bucket.
  for (let i = 1; i < 10; i++) bounded.requete('192.0.2.1')
  assert.throws(() => bounded.requete('192.0.2.1'), (error) => error.statusCode === 429)
  now += 3_600_000
  assert.doesNotThrow(() => bounded.requete('192.0.2.2'))
  assert.doesNotThrow(() => bounded.destinataire('b@example.org'))
})
