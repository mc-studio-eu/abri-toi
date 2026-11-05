import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'
import { parse } from '@vue/compiler-sfc'

const { descriptor } = parse(await readFile(new URL('../components/AnalyticsConsent.vue', import.meta.url), 'utf8'))
const setup = new Function('useState', 'useCookie', 'onMounted', 'window', 'document',
  `${stripTypeScriptTypes(descriptor.scriptSetup.content)}\nreturn { choose }`)

function browser(choice = null) {
  const consent = { value: choice }
  const scripts = []
  const deletions = []
  let reloads = 0
  const window = { location: { hostname: 'www.abritoi.com', reload: () => reloads++ } }
  const document = {
    head: { appendChild: script => scripts.push(script) },
    createElement: () => ({}),
    get cookie() { return '_ga=123; _ga_STB0MGR5RF=456; unrelated=789' },
    set cookie(value) { deletions.push(value) },
  }
  const component = setup(() => ({ value: false }), () => consent, fn => fn(), window, document)
  return { ...component, consent, scripts, window, deletions, reloads: () => reloads }
}

test('no Google script or event before consent or after refusal', () => {
  for (const choice of [null, 'rejected', 'invalid']) {
    const page = browser(choice)
    assert.equal(page.scripts.length, 0)
    assert.equal(page.window.dataLayer, undefined)
    page.choose(false)
    assert.equal(page.scripts.length, 0)
    assert.equal(page.consent.value, 'rejected')
  }
})

test('acceptance loads the supplied property once and keeps advertising disabled', () => {
  const page = browser()
  page.choose(true)
  page.choose(true)
  assert.equal(page.scripts.length, 1)
  assert.equal(page.scripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-STB0MGR5RF')
  assert.equal(page.scripts[0].async, true)
  const events = page.window.dataLayer.map(args => [...args])
  assert.equal(events[0][2].ad_storage, 'denied')
  assert.equal(events[2][1], 'G-STB0MGR5RF')
  assert.equal(events[2][2].allow_google_signals, false)
  assert.equal(browser('accepted').scripts.length, 1)
})

test('withdrawal disables collection, removes only Analytics cookies and reloads', () => {
  const page = browser('accepted')
  page.choose(false)
  assert.equal(page.window['ga-disable-G-STB0MGR5RF'], true)
  assert.equal(page.consent.value, 'rejected')
  assert.equal(page.reloads(), 1)
  assert.ok(page.deletions.some(cookie => cookie.startsWith('_ga=') && cookie.includes('Domain=abritoi.com')))
  assert.ok(page.deletions.some(cookie => cookie.startsWith('_ga_STB0MGR5RF=')))
  assert.ok(page.deletions.every(cookie => !cookie.startsWith('unrelated=')))
})
