import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'
import { createContext, SourceTextModule, SyntheticModule } from 'node:vm'

async function images(projectId = 'h1ih7r41') {
  const context = createContext({ useRuntimeConfig: () => ({ public: { sanity: { projectId, dataset: 'production', apiVersion: '2026-10-01' } } }) })
  const modules = new Map()
  async function charger(path) {
    if (modules.has(path)) return modules.get(path)
    if (path.startsWith('@')) {
      const exports = await import(path)
      const module = new SyntheticModule(Object.keys(exports), function () {
        for (const key of Object.keys(exports)) this.setExport(key, exports[key])
      }, { context })
      modules.set(path, module)
      return module
    }
    const module = new SourceTextModule(stripTypeScriptTypes(await readFile(new URL(`../utils/${path}.ts`, import.meta.url), 'utf8')), { context })
    modules.set(path, module)
    await module.link((specifier) => charger(specifier.replace(/^\.\//, '')))
    return module
  }
  const module = await charger('images')
  await module.evaluate()
  return module.namespace
}

const { imgSrcset } = await images()
const image = (dimensions) => ({ asset: { _ref: `image-1234567890abcdef-${dimensions}-jpg` } })
const candidates = (srcset) => srcset.split(', ').map((entry) => {
  const [url, width] = entry.split(' ')
  return { url: new URL(url), width: Number.parseInt(width) }
})

test('reference files and unavailable CMS never advertise duplicate local variants', async () => {
  assert.equal(imgSrcset({ src: '/images/reference.png' }), undefined)
  assert.equal(imgSrcset(null), undefined)
  assert.equal(imgSrcset({ asset: {} }), undefined)
  assert.equal((await images('')).imgSrcset(image('3200x1800')), undefined)
})

test('responsive candidates preserve the Sanity format transform and exact width descriptors', () => {
  const variants = candidates(imgSrcset(image('3200x1800'), 1600))
  assert.ok(variants.some(({ width }) => width === 480))
  assert.equal(variants.at(-1).width, 1600)
  for (const { url, width } of variants) {
    assert.equal(url.hostname, 'cdn.sanity.io')
    assert.equal(url.searchParams.get('auto'), 'format')
    assert.equal(Number(url.searchParams.get('w')), width)
    assert.equal(url.searchParams.get('fit'), 'max')
  }
})

test('source dimensions and editorial crop cap variants before fit=max can overstate their width', () => {
  const small = candidates(imgSrcset(image('200x150'), 1600))
  assert.deepEqual(small.map(({ width }) => width), [200])
  const cropped = { ...image('3200x1800'), crop: { left: 0.1, right: 0.2, top: 0, bottom: 0 }, hotspot: { x: 0.5, y: 0.5, width: 0.2, height: 0.2 } }
  const variants = candidates(imgSrcset(cropped, 2560))
  assert.equal(variants.at(-1).width, 2240)
  assert.ok(variants.every(({ url }) => url.searchParams.has('rect')))
})

test('fixed aspect variants scale both dimensions and respect the available source height', () => {
  const variants = candidates(imgSrcset(image('1200x400'), 1600, 1067))
  assert.equal(variants.at(-1).width, 599)
  for (const { url, width } of variants) {
    assert.equal(Number(url.searchParams.get('h')), Math.round(width * 1067 / 1600))
    assert.equal(url.searchParams.get('fit'), 'crop')
  }
})
