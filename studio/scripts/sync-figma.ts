/**
 * Synchronise les seuls champs de présentation des maquettes avec Sanity.
 * npm run sync:figma             : lecture et rapport, aucune mutation ni upload.
 * npm run sync:figma -- --apply  : uploads nécessaires puis transaction avec gardes de révision.
 * Les documents absents doivent être initialisés séparément, via Studio ou un seed revu.
 */
import { createHash } from 'node:crypto'
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, relative, resolve } from 'node:path'
import { getCliClient } from 'sanity/cli'
import { pageAccueil } from '../../site/content/accueil'
import { articles } from '../../site/content/articles'
import { gammes, parametres } from '../../site/content/commun'
import { ficheProduit, pageAPropos, pageArticles, pageContact, pageProduits, pageRealisations } from '../../site/content/pages'
import { produits } from '../../site/content/produits'
import { realisations } from '../../site/content/realisations'

type Obj = Record<string, any>
type Doc = Obj & { _id: string; _rev: string; _type: string }
type Target = { document: Doc; fields: Obj }
type Change = { path: string; before: unknown; after: unknown }
type Plan = { id: string; type: string; revision: string; changes: Change[]; set: Obj; parents: Obj }
type ImageSource = { src: string; file: string; sha1: string; assetId?: string }

const root = resolve(import.meta.dirname, '../..')
const publicDir = resolve(root, 'site/public')
const reportPath = resolve(root, 'exports/figma-sync-report.json')
const types = ['parametres', 'gamme', 'produit', 'realisation', 'article', 'pageAccueil', 'pageProduits', 'ficheProduit', 'pageRealisations', 'pageAPropos', 'pageArticles', 'pageContact']
const preserve = ['article.corps', 'article.intro', 'article.auteur', 'produit.fiche.caracteristiques', 'gamme.documentation', 'gamme.ficheTechnique', 'parametres.linkedin', 'parametres.youtube', 'pageContact.rendezVous.lien', 'drafts.**', 'versions.**', 'unknown fields']
const object = (value: unknown): value is Obj => value !== null && typeof value === 'object' && !Array.isArray(value)
const hash = (value: string) => createHash('sha256').update(value).digest('hex').slice(0, 20)
const ref = (id: string) => ({ _type: 'reference', _ref: id })

// Compare images by asset identity and content by value, ignoring Sanity array keys.
export function comparable(value: any): any {
  if (Array.isArray(value)) return value.map(comparable)
  if (object(value)) return Object.fromEntries(Object.entries(value).filter(([k]) => k !== '_key').sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, comparable(v)]))
  return value
}
const same = (a: unknown, b: unknown) => JSON.stringify(comparable(a)) === JSON.stringify(comparable(b))

function identity(item: any): string | undefined {
  if (!object(item)) return undefined
  if (item._type === 'reference') return `ref:${item._ref}`
  for (const key of ['nom', 'produit', 'cible', 'label', 'titre', 'valeur', 'numero', 'question', 'legende']) {
    const value = item[key]
    if (typeof value === 'string' && value) return `${key}:${value}`
    if (object(value) && value._ref) return `${key}:${value._ref}`
  }
  return undefined
}

// Merge only source-defined fields; retain unknown CMS fields on corresponding objects.
// Array order/content follows the maquette, retaining existing _keys when an item matches.
export function mergeDesign(source: any, current: any, path = ''): any {
  if (Array.isArray(source)) {
    const old = Array.isArray(current) ? current : []
    const used = new Set<number>()
    return source.map((item, index) => {
      if (!object(item)) return item
      const id = identity(item)
      let match = id ? old.findIndex((candidate, i) => !used.has(i) && identity(candidate) === id) : -1
      // A renamed row still corresponds to its position unless another source row
      // explicitly retains that existing identity (which could indicate reordering).
      if (match < 0 && object(old[index]) && !used.has(index) && !source.some((candidate) => identity(candidate) && identity(candidate) === identity(old[index]))) match = index
      const existing = match >= 0 ? old[match] : undefined
      if (match >= 0) used.add(match)
      return { ...mergeDesign(item, existing, `${path}[${index}]`), _key: existing?._key || `f${hash(`${path}:${id || ''}:${index}`)}` }
    })
  }
  if (object(source)) {
    const out = object(current) ? { ...current } : {}
    for (const [key, value] of Object.entries(source)) out[key] = mergeDesign(value, out[key], path ? `${path}.${key}` : key)
    // A union member must not retain fields from its previous content type.
    // Otherwise a former image can render instead of the replacement text.
    if (source._type === 'morceauTexte') {
      delete out.image
      delete out.largeur
    } else if (source._type === 'morceauImage') {
      delete out.texte
      delete out.accent
    }
    return out
  }
  return source
}

// Report only source-defined public fields, never arbitrary data stored alongside them.
function publicValue(current: any, source: any): any {
  if (current === undefined) return null
  if (source === null && object(current)) return '[existing object outside the source presentation shape]'
  if (Array.isArray(source)) return Array.isArray(current) ? current.map((item, i) => publicValue(item, source[i] ?? source[0] ?? null)) : '[existing value has a different shape]'
  if (object(source)) return object(current) ? Object.fromEntries(Object.keys(source).filter((k) => k !== '_key').map((k) => [k, publicValue(current[k], source[k])])) : current
  return object(current) || Array.isArray(current) ? '[existing value has a different shape]' : current
}

export function planDocument(document: Doc, fields: Obj): Plan {
  const plan: Plan = { id: document._id, type: document._type, revision: document._rev, changes: [], set: {}, parents: {} }
  function walk(source: any, current: any, path: string) {
    if (object(source) && source._type !== 'image' && source._type !== 'reference') {
      for (const [key, value] of Object.entries(source)) {
        if (value !== undefined) walk(value, current?.[key], path ? `${path}.${key}` : key)
      }
      return
    }
    const merged = mergeDesign(source, current, path)
    if (same(merged, current)) return
    plan.set[path] = merged
    plan.changes.push({ path, before: publicValue(current, source), after: publicValue(merged, source) })
    const parts = path.split('.')
    let parent: any = document
    for (let i = 0; i < parts.length - 1; i++) {
      parent = parent?.[parts[i]]
      if (!object(parent)) plan.parents[parts.slice(0, i + 1).join('.')] = {}
    }
  }
  walk(fields, document, '')
  return plan
}

async function main() {
  const apply = process.argv.includes('--apply')
  mkdirSync(dirname(reportPath), { recursive: true })
  writeFileSync(reportPath, JSON.stringify({ generatedAt: new Date().toISOString(), mode: apply ? 'apply' : 'dry-run', status: 'reading', preserved: preserve }, null, 2) + '\n')
  if (process.argv.includes('--force')) throw new Error('--force is unsupported. Use dry-run for review; --apply is the only mutation opt-in.')
  const client = getCliClient({ apiVersion: '2026-10-01' }).withConfig({ useCdn: false, perspective: 'raw' })
  // Exclude drafts and release versions explicitly; do not read submissions or credentials.
  const docs = await client.fetch<Doc[]>('*[_type in $types && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]', { types })
  const missing: Obj[] = []
  const blocked: Obj[] = []
  const targets: Target[] = []
  const images = new Map<string, ImageSource>()
  function find(type: string, key: string, selector: (doc: Doc) => unknown) {
    const matches = docs.filter((doc) => doc._type === type && selector(doc) === key)
    if (matches.length !== 1) {
      const issue = { type, key, reason: matches.length ? 'Ambiguous identity; no document selected.' : 'Missing published document; initialize separately via Studio or a reviewed seed.' }
      ;(matches.length ? blocked : missing).push(issue)
      return undefined
    }
    return matches[0]
  }
  function reference(type: string, key: string) {
    const matches = docs.filter((doc) => doc._type === type && doc.slug?.current === key)
    if (matches.length !== 1) throw new Error(`Cannot resolve unique ${type} reference for ${key}`)
    return ref(matches[0]._id)
  }
  function add(document: Doc | undefined, fields: () => Obj) {
    if (!document) return
    try { targets.push({ document, fields: fields() }) }
    catch (error) { blocked.push({ id: document._id, reason: error instanceof Error ? error.message : 'Reference resolution failed.' }) }
  }
  const single = (id: string, fields: () => Obj) => add(find(id, id, (doc) => doc._id), fields)
  const { linkedin: _linkedin, youtube: _youtube, ...settings } = parametres
  single('parametres', () => settings)
  single('pageAccueil', () => ({
    ...pageAccueil,
    manifeste: { ...pageAccueil.manifeste, morceaux: pageAccueil.manifeste.morceaux.map((item) => ({ _type: 'image' in item ? 'morceauImage' : 'morceauTexte', ...item })) },
    installations: { ...pageAccueil.installations, bandeaux: pageAccueil.installations.bandeaux.map((item) => ({ ...item, produit: reference('produit', item.produit) })) },
    articles: { ...pageAccueil.articles, selection: pageAccueil.articles.selection.map((slug) => reference('article', slug)) },
  }))
  single('pageProduits', () => ({ ...pageProduits, hero: { chapo: '', ...pageProduits.hero } }))
  single('ficheProduit', () => ficheProduit)
  single('pageRealisations', () => {
    // Preserve a real case-study URL when the local maquette has none.
    const { url: _url, ...link } = pageRealisations.aLaUne.lien
    return { ...pageRealisations, aLaUne: { ...pageRealisations.aLaUne, lien: { ...link, ...(pageRealisations.aLaUne.lien.url ? { url: pageRealisations.aLaUne.lien.url } : {}) } } }
  })
  single('pageAPropos', () => pageAPropos)
  single('pageArticles', () => ({ ...pageArticles, aLaUne: reference('article', pageArticles.aLaUne) }))
  single('pageContact', () => {
    const { lien: _lien, ...rendezVous } = pageContact.rendezVous
    return { ...pageContact, rendezVous }
  })
  for (const gamme of Object.values(gammes)) add(find('gamme', gamme.cle, (doc) => doc.cle), () => ({ labelEspaces: gamme.labelEspaces, reassurance: gamme.reassurance }))
  for (const [index, product] of produits.entries()) add(find('produit', product.slug, (doc) => doc.slug?.current), () => ({
    nom: product.nom, gamme: product.gamme, categorie: product.categorie, ordre: index + 1,
    description: product.carte.description, visuel: product.carte.visuel,
    ...(product.lienVers ? { lienVers: reference('produit', product.lienVers) } : {}),
    ...(product.fiche ? { fiche: {
      titre: product.fiche.titre, sousTitre: product.fiche.sousTitre, description: product.fiche.description, galerie: product.fiche.galerie,
      similaires: product.fiche.similaires.map((item) => ({ ...item, produit: reference('produit', item.produit) })),
    } } : {}),
  }))
  for (const [index, realization] of realisations.entries()) add(find('realisation', realization.nom, (doc) => doc.nom), () => ({ ...realization, slug: { _type: 'slug', current: realization.slug }, ordre: index + 1 }))
  for (const article of articles) add(find('article', article.slug, (doc) => doc.slug?.current), () => ({
    titre: article.titre, categorie: article.categorie, tempsLecture: article.tempsLecture, date: article.date,
    ...(article.extrait ? { extrait: article.extrait } : {}), couverture: article.couverture,
    couvertureFond: article.couvertureFond, couvertureInset: article.couvertureInset ?? false,
    ...(article.illustration ? { illustration: article.illustration } : {}),
    ...(article.legendeIllustration ? { legendeIllustration: article.legendeIllustration } : {}),
  }))

  function collectImages(value: any) {
    if (Array.isArray(value)) value.forEach(collectImages)
    else if (object(value)) {
      if (typeof value.src === 'string' && value.src.startsWith('/images/')) {
        const file = resolve(publicDir, value.src.slice(1))
        if (relative(publicDir, file).startsWith('..') || !existsSync(file)) throw new Error(`Invalid or missing local image: ${value.src}`)
        images.set(value.src, { src: value.src, file, sha1: createHash('sha1').update(readFileSync(file)).digest('hex') })
      } else Object.values(value).forEach(collectImages)
    }
  }
  targets.forEach(({ fields }) => collectImages(fields))
  const existingAssets = await client.fetch<{ _id: string; sha1hash: string }[]>('*[_type == "sanity.imageAsset" && sha1hash in $hashes]{_id, sha1hash}', { hashes: [...new Set([...images.values()].map((image) => image.sha1))] })
  for (const image of images.values()) image.assetId = existingAssets.find((asset) => asset.sha1hash === image.sha1)?._id

  function convert(value: any): any {
    if (Array.isArray(value)) return value.map(convert)
    if (!object(value)) return value
    if (typeof value.src === 'string' && images.has(value.src)) {
      const image = images.get(value.src)!
      return { _type: 'image', ...(image.assetId ? { asset: ref(image.assetId) } : { pendingUpload: { src: image.src, sha1: image.sha1 } }), ...(value.alt ? { alt: value.alt } : {}) }
    }
    return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined).map(([key, item]) => [key, convert(item)]))
  }
  const plans = () => targets.map(({ document, fields }) => planDocument(document, convert(fields))).filter((plan) => plan.changes.length)
  let currentPlans = plans()
  const report: Obj = {
    generatedAt: new Date().toISOString(), mode: apply ? 'apply' : 'dry-run', status: 'review',
    projectId: client.config().projectId, dataset: client.config().dataset,
    preserved: preserve, missing, blocked,
    notes: ['No documents are created or deleted. Unknown CMS fields are retained on matched objects.', 'Presentation arrays follow source ordering; replaced rows retain their Sanity keys when their identity matches.', 'Empty local article excerpts and absent case-study/scheduling URLs preserve authored CMS values.'],
  }
  function writeReport() {
    report.changedDocuments = currentPlans.map(({ id, type, revision, changes }) => ({ id, type, revision, changes }))
    report.summary = { changedDocuments: currentPlans.length, changedFields: currentPlans.reduce((sum, plan) => sum + plan.changes.length, 0), missingDocuments: missing.length, blockedDocuments: blocked.length }
    report.images = [...images.values()].map(({ src, sha1, assetId }) => ({ src, sha1, ...(assetId ? { assetId } : { needsUpload: true }) }))
    mkdirSync(dirname(reportPath), { recursive: true })
    writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n')
  }
  writeReport()
  if (!apply) {
    console.log(`Dry-run: ${currentPlans.length} document(s) would change. No assets uploaded; no documents mutated.`)
    console.log(`Report: ${reportPath}`)
    return
  }
  if (missing.length || blocked.length) {
    report.status = 'blocked'; writeReport()
    throw new Error('Apply blocked: resolve missing or ambiguous documents/references listed in the report first. No assets uploaded; no documents mutated.')
  }
  // Save only public fields that this exact revision-guarded transaction changes.
  // This preserves original array keys and unknown nested CMS values for recovery.
  const backupPath = resolve(root, `exports/figma-sync-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  const beforeDocuments = currentPlans.map((plan) => {
    const document = targets.find((target) => target.document._id === plan.id)!.document
    const values: Obj = {}
    const absent: string[] = []
    for (const path of Object.keys(plan.set)) {
      const value = path.split('.').reduce((current: any, field) => current?.[field], document)
      if (value === undefined) absent.push(path)
      else values[path] = value
    }
    return { id: plan.id, type: plan.type, revision: plan.revision, values, absent }
  })
  writeFileSync(backupPath, JSON.stringify({ generatedAt: new Date().toISOString(), projectId: client.config().projectId, dataset: client.config().dataset, documents: beforeDocuments }, null, 2) + '\n')
  report.backupPath = backupPath
  writeReport()
  try {
    // Sanity deduplicates content-identical image uploads; also cache duplicate local bytes here.
    const uploadedByHash = new Map(existingAssets.map((asset) => [asset.sha1hash, asset._id]))
    for (const image of images.values()) {
      if (!uploadedByHash.has(image.sha1)) {
        const asset = await client.assets.upload('image', createReadStream(image.file), { filename: basename(image.file) })
        uploadedByHash.set(image.sha1, asset._id)
      }
      image.assetId = uploadedByHash.get(image.sha1)
    }
    currentPlans = plans()
    writeReport()
    if (currentPlans.length) {
      let transaction = client.transaction()
      for (const plan of currentPlans) transaction = transaction.patch(plan.id, (patch) => patch.ifRevisionId(plan.revision).setIfMissing(plan.parents).set(plan.set))
      // A concurrent CMS edit rejects the complete content transaction; no partial document updates.
      const committed = await transaction.commit()
      report.transactionId = committed.transactionId
    }
    report.status = 'applied'; report.appliedAt = new Date().toISOString(); writeReport()
    // Keep application evidence when a subsequent read-only dry-run refreshes the main report.
    const appliedReportPath = reportPath.replace(/\.json$/, `-applied-${new Date().toISOString().slice(0, 10)}.json`)
    writeFileSync(appliedReportPath, JSON.stringify(report, null, 2) + '\n')
    console.log(`Applied ${currentPlans.length} document patch(es). Report: ${reportPath}`)
  } catch (error) {
    report.status = 'failed'; report.note = 'Content is committed as one revision-guarded transaction. Uploaded assets may remain if the transaction failed; rerun dry-run before retrying.'; writeReport()
    throw error
  }
}

// This guard supports isolated, read-only helper tests; the CLI command always runs main.
if (!process.env.ABRITOI_SYNC_HELPERS_ONLY) main().catch((error) => {
  if (existsSync(reportPath)) {
    const report = JSON.parse(readFileSync(reportPath, 'utf8'))
    if (report.status === 'reading') {
      report.status = 'failed-before-planning'
      report.note = 'Content could not be read or validated. No assets uploaded; no content mutations attempted.'
      writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n')
    }
  }
  console.error(error instanceof Error ? error.message : 'Figma synchronization failed.')
  process.exitCode = 1
})
