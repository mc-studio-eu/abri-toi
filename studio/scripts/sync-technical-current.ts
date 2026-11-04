/**
 * Narrow reviewed migration: current technical data, missing configuration pages,
 * obsolete product redirects, two technical PDFs and homepage article selection.
 * Default is read-only; --apply opts into asset upload and one guarded transaction.
 */
import { createHash } from 'node:crypto'
import { createReadStream, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { getCliClient } from 'sanity/cli'
import { produits } from '../../site/content/produits'
import { gammes } from '../../site/content/commun'

type Obj = Record<string, any>
type PatchPlan = { id: string; revision: string; type: string; label: string; set: Obj; unset: string[]; before: Obj; absentBefore: string[] }
const root = resolve(import.meta.dirname, '../..')
const publicDir = resolve(root, 'site/public')
const reportFile = resolve(root, 'exports/sanity-technical-sync-2026-11-04.json')
const hash = (value: Uint8Array | string) => createHash('sha1').update(value).digest('hex')
const normalize = (value: any): any => Array.isArray(value) ? value.map(normalize) : value && typeof value === 'object'
  ? Object.fromEntries(Object.entries(value).filter(([key]) => key !== '_key').sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, normalize(child)])) : value
const same = (a: any, b: any) => JSON.stringify(normalize(a)) === JSON.stringify(normalize(b))
const digest = (value: any) => hash(JSON.stringify(normalize(value)))
const reference = (id: string) => ({ _type: 'reference', _ref: id })
const selection = ['recuperer-eau-pluie-vegetaliser-villes', 'ombrage-cour-ecole-solutions-sans-plantation', 'solution-ombrage-metallique-aluminium']
const client = getCliClient({ apiVersion: '2026-10-01' }).withConfig({ useCdn: false, perspective: 'published' })
const apply = process.argv.includes('--apply')

async function state() {
  const [products, ranges, home, articles] = await Promise.all([
    client.fetch<Obj[]>('*[_type == "produit"]{_id,_rev,"slug":slug.current,fiche,lienVers}'),
    client.fetch<Obj[]>('*[_type == "gamme"]{_id,_rev,cle,documentation,ficheTechnique,"technicalAsset":ficheTechnique.asset->{_id,sha1hash}}'),
    client.fetch<Obj>('*[_id == "pageAccueil"][0]{_id,_rev,faq,articles{selection}}'),
    client.fetch<Obj[]>('*[_type == "article"] | order(_id){_id,"slug":slug.current,intro,corps,auteur}'),
  ])
  return { products, ranges, home, articles }
}

function protectedValues(data: Awaited<ReturnType<typeof state>>) {
  return {
    faq: digest(data.home.faq), articleContent: digest(data.articles.map(({ _id, intro, corps, auteur }) => ({ _id, intro, corps, auteur }))),
    commercialDocumentation: digest(data.ranges.map(({ _id, documentation }) => ({ _id, documentation })).sort((a, b) => a._id.localeCompare(b._id))),
  }
}

async function main() {
  if (process.argv.includes('--force')) throw new Error('--force is unsupported.')
  const initial = await state()
  if (process.argv.includes('--verify')) {
    // GROQ object projections represent absent fields as null. This mode rechecks
    // an already committed migration without any upload or content mutation.
    const previous = JSON.parse(readFileSync(reportFile, 'utf8'))
    const problems: string[] = []
    for (const local of produits) {
      const current = initial.products.filter((doc) => doc.slug === local.slug)
      if (current.length !== 1 || !current[0].fiche) problems.push(`${local.slug}: missing or ambiguous fiche`)
      else if (!same(current[0].fiche.caracteristiques, local.fiche?.caracteristiques)) problems.push(`${local.slug}: technical characteristics differ`)
      if (current[0]?.lienVers) problems.push(`${local.slug}: obsolete redirect remains`)
    }
    const selected = initial.home.articles.selection?.map((ref: Obj) => initial.articles.find((doc) => doc._id === ref._ref)?.slug)
    if (!same(selected, selection)) problems.push('Homepage article selection differs')
    for (const local of Object.values(gammes)) {
      const range = initial.ranges.find((doc) => doc.cle === local.cle)
      if (range?.technicalAsset?.sha1hash !== hash(readFileSync(resolve(publicDir, local.ficheTechnique.slice(1))))) problems.push(`${local.cle}: PDF bytes differ`)
    }
    const protectedAfter = protectedValues(initial)
    if (!same(previous.protectedHashesBefore, protectedAfter)) problems.push('Protected content changed since migration baseline')
    previous.validation = { checkedAt: new Date().toISOString(), passed: problems.length === 0, problems, protectedHashesAfter: protectedAfter,
      productsWithOwnFiche: initial.products.filter((doc) => Boolean(doc.fiche)).length, legacyProductRedirects: initial.products.filter((doc) => Boolean(doc.lienVers)).length }
    previous.status = problems.length ? 'applied-validation-failed' : 'applied-and-verified'
    writeFileSync(reportFile, JSON.stringify(previous, null, 2) + '\n')
    console.log(JSON.stringify(previous.validation, null, 2))
    if (problems.length) throw new Error('Read-only verification failed')
    return
  }
  const plans: PatchPlan[] = []
  const sourceImages = new Map<string, { file: string; sha1: string; assetId?: string }>()
  const unique = (docs: Obj[], key: string, value: string) => {
    const matches = docs.filter((doc) => doc[key] === value)
    if (matches.length !== 1) throw new Error(`Expected one ${key}=${value}; found ${matches.length}. No writes attempted.`)
    return matches[0]
  }
  function collectImages(value: any) {
    if (Array.isArray(value)) value.forEach(collectImages)
    else if (value && typeof value === 'object') {
      if (typeof value.src === 'string') {
        if (!value.src.startsWith('/images/') || value.src.includes('..')) throw new Error('Invalid local image path')
        const file = resolve(publicDir, value.src.slice(1))
        sourceImages.set(value.src, { file, sha1: hash(readFileSync(file)) })
      } else Object.values(value).forEach(collectImages)
    }
  }
  produits.forEach((local) => { if (!unique(initial.products, 'slug', local.slug).fiche) collectImages(local.fiche) })
  const assets = await client.fetch<Obj[]>('*[_type == "sanity.imageAsset" && sha1hash in $hashes]{_id,sha1hash}', { hashes: [...sourceImages.values()].map((asset) => asset.sha1) })
  for (const [src, image] of sourceImages) {
    image.assetId = assets.find((asset) => asset.sha1hash === image.sha1)?._id
    // These maquette images are already present; do not upload unrelated images.
    if (!image.assetId) throw new Error(`Missing existing image asset: ${src}. No writes attempted.`)
  }
  function convert(value: any, path: string): any {
    if (Array.isArray(value)) return value.map((item, index) => {
      const converted = convert(item, `${path}[${index}]`)
      return converted && typeof converted === 'object' ? { ...converted, _key: `t${hash(`${path}:${index}:${JSON.stringify(normalize(converted))}`).slice(0, 18)}` } : converted
    })
    if (!value || typeof value !== 'object') return value
    if (typeof value.src === 'string') return { _type: 'image', asset: reference(sourceImages.get(value.src)!.assetId!), ...(value.alt ? { alt: value.alt } : {}) }
    return Object.fromEntries(Object.entries(value).filter(([, child]) => child !== undefined).map(([key, child]) => [key, convert(child, `${path}.${key}`)]))
  }
  function add(doc: Obj, type: string, label: string, desired: Obj, unset: string[] = []) {
    const set: Obj = {}, before: Obj = {}, absentBefore: string[] = []
    for (const [path, after] of Object.entries(desired)) {
      const existing = path.split('.').reduce((value: any, key) => value?.[key], doc)
      if (same(existing, after)) continue
      set[path] = after
      if (existing === undefined) absentBefore.push(path)
      else before[path] = existing
    }
    unset = unset.filter((path) => doc[path] !== undefined)
    unset.forEach((path) => { before[path] = doc[path] })
    if (Object.keys(set).length || unset.length) plans.push({ id: doc._id, revision: doc._rev, type, label, set, unset, before, absentBefore })
  }
  for (const local of produits) {
    const doc = unique(initial.products, 'slug', local.slug)
    if (!local.fiche) throw new Error(`Missing local fiche: ${local.slug}`)
    if (doc.fiche) add(doc, 'produit', local.slug, { 'fiche.caracteristiques': convert(local.fiche.caracteristiques, `${local.slug}.fiche.caracteristiques`) })
    else {
      const fiche = { ...local.fiche, similaires: local.fiche.similaires.map((item) => ({ ...item, produit: reference(unique(initial.products, 'slug', item.produit)._id) })) }
      add(doc, 'produit', local.slug, { fiche: convert(fiche, `${local.slug}.fiche`) }, local.categorie === 'espace' && !local.lienVers ? ['lienVers'] : [])
    }
    // Remove obsolete redirects even on reruns after a partly completed historical migration.
    if (doc.fiche && local.categorie === 'espace' && !local.lienVers && doc.lienVers) {
      const existing = plans.find((plan) => plan.id === doc._id)
      if (existing) { existing.unset.push('lienVers'); existing.before.lienVers = doc.lienVers }
      else add(doc, 'produit', local.slug, {}, ['lienVers'])
    }
  }
  if (!initial.home?.articles) throw new Error('Missing homepage articles object; no writes attempted.')
  const articleReferences = selection.map((slug, index) => ({ ...reference(unique(initial.articles, 'slug', slug)._id), _key: `techarticle${index}` }))
  add(initial.home, 'pageAccueil', 'homepage article selection', { 'articles.selection': articleReferences })
  const pdfs = Object.values(gammes).map((local) => {
    const doc = unique(initial.ranges, 'cle', local.cle)
    const file = resolve(publicDir, local.ficheTechnique.slice(1))
    return { doc, gamme: local.cle, file, sha1: hash(readFileSync(file)), currentHash: doc.technicalAsset?.sha1hash }
  }).filter((pdf) => pdf.sha1 !== pdf.currentHash)
  const existingPdfs = await client.fetch<Obj[]>('*[_type == "sanity.fileAsset" && sha1hash in $hashes]{_id,sha1hash}', { hashes: pdfs.map((pdf) => pdf.sha1) })
  for (const pdf of pdfs) {
    const existing = existingPdfs.find((asset) => asset.sha1hash === pdf.sha1)?._id
    add(pdf.doc, 'gamme', `${pdf.gamme} technical PDF`, { ficheTechnique: { _type: 'file', asset: reference(existing ?? `pending-upload-${pdf.sha1}`) } })
  }
  const baseline = protectedValues(initial)
  const report: Obj = { generatedAt: new Date().toISOString(), mode: apply ? 'apply' : 'dry-run', status: 'review',
    projectId: client.config().projectId, dataset: client.config().dataset,
    scope: ['product technical characteristics', 'missing product fiche objects', 'obsolete configuration redirects', 'two current technical PDFs', 'three original homepage articles'],
    preserved: ['validated FAQ', 'article bodies, introductions and authors', 'commercial PDFs', 'unrelated page and settings fields'],
    protectedHashesBefore: baseline,
    summary: { documents: plans.length, setFields: plans.reduce((n, p) => n + Object.keys(p.set).length, 0), unsetFields: plans.reduce((n, p) => n + p.unset.length, 0), pdfUploads: pdfs.filter((pdf) => !existingPdfs.some((asset) => asset.sha1hash === pdf.sha1)).length },
    changes: plans.map(({ id, type, label, set, unset }) => ({ id, type, label, setPaths: Object.keys(set), unsetPaths: unset })),
    pdfs: pdfs.map(({ gamme, file, sha1, currentHash }) => ({ gamme, localFile: basename(file), sha1, previousSha1: currentHash })),
  }
  mkdirSync(resolve(root, 'exports'), { recursive: true })
  const writeReport = () => writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n')
  writeReport()
  console.log(JSON.stringify({ mode: report.mode, summary: report.summary, changes: report.changes }, null, 2))
  if (!apply) return
  if (!plans.length) { report.status = 'already-current'; writeReport(); return }
  const backupFile = resolve(root, `exports/sanity-technical-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  writeFileSync(backupFile, JSON.stringify({ generatedAt: new Date().toISOString(), projectId: client.config().projectId, dataset: client.config().dataset, protectedHashes: baseline,
    documents: plans.map(({ id, revision, label, before, absentBefore }) => ({ id, revision, label, before, absentBefore })) }, null, 2) + '\n')
  report.backupFile = backupFile
  writeReport()
  try {
    for (const pdf of pdfs) {
      let assetId = existingPdfs.find((asset) => asset.sha1hash === pdf.sha1)?._id
      if (!assetId) assetId = (await client.assets.upload('file', createReadStream(pdf.file), { filename: basename(pdf.file), contentType: 'application/pdf' }))._id
      if (hash(readFileSync(pdf.file)) !== pdf.sha1) throw new Error('Local PDF changed while uploading; content transaction cancelled.')
      plans.find((plan) => plan.id === pdf.doc._id)!.set.ficheTechnique.asset = reference(assetId)
    }
    let transaction = client.transaction()
    for (const plan of plans) transaction = transaction.patch(plan.id, (patch) => {
      let guarded = patch.ifRevisionId(plan.revision)
      if (Object.keys(plan.set).length) guarded = guarded.set(plan.set)
      if (plan.unset.length) guarded = guarded.unset(plan.unset)
      return guarded
    })
    const committed = await transaction.commit()
    report.transactionId = committed.transactionId
    report.status = 'applied'
    report.appliedAt = new Date().toISOString()
    const after = await state()
    const protectedAfter = protectedValues(after)
    const problems: string[] = []
    for (const plan of plans) {
      const doc = [...after.products, ...after.ranges, after.home].find((item) => item._id === plan.id)!
      for (const [path, expected] of Object.entries(plan.set)) {
        const value = path.split('.').reduce((current: any, key) => current?.[key], doc)
        if (!same(value, expected)) problems.push(`${plan.label}: ${path} does not match`)
      }
      for (const path of plan.unset) if (doc[path] != null) problems.push(`${plan.label}: ${path} still exists`)
    }
    if (!same(baseline, protectedAfter)) problems.push('Protected FAQ, article content or commercial documentation changed.')
    for (const local of Object.values(gammes)) {
      const range = unique(after.ranges, 'cle', local.cle)
      const expected = hash(readFileSync(resolve(publicDir, local.ficheTechnique.slice(1))))
      if (range.technicalAsset?.sha1hash !== expected) problems.push(`${local.cle}: technical PDF hash does not match`)
    }
    report.validation = { checkedAt: new Date().toISOString(), passed: problems.length === 0, problems, protectedHashesAfter: protectedAfter,
      productsWithOwnFiche: after.products.filter((item) => Boolean(item.fiche)).length, legacyProductRedirects: after.products.filter((item) => item.lienVers).length }
    writeReport()
    if (problems.length) throw new Error(`Applied but validation failed: ${problems.join('; ')}`)
    console.log(`Applied and verified ${plans.length} guarded document patches. Report: ${reportFile}`)
  } catch (error) {
    report.status = report.transactionId ? 'applied-validation-failed' : 'failed-before-content-commit'
    report.note = 'Content patches commit as one revision-guarded transaction. Newly uploaded PDF assets may remain if a content commit is rejected.'
    writeReport()
    throw error
  }
}
main().catch((error) => { console.error(error instanceof Error ? error.message : 'Targeted sync failed'); process.exitCode = 1 })
