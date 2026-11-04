/** Read-only public-content audit. Never queries requests/contact submissions. */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { getCliClient } from 'sanity/cli'
import { articles } from '../../site/content/articles'
import { pageAccueil } from '../../site/content/accueil'
import { gammes } from '../../site/content/commun'
import { produits } from '../../site/content/produits'

const root = resolve(import.meta.dirname, '../..')
const client = getCliClient({ apiVersion: '2026-10-01' }).withConfig({ useCdn: false, perspective: 'published' })
const sha1 = (bytes: Uint8Array) => createHash('sha1').update(bytes).digest('hex')
const withoutKeys = (value: any): any => Array.isArray(value) ? value.map(withoutKeys) : value && typeof value === 'object'
  ? Object.fromEntries(Object.entries(value).filter(([key]) => key !== '_key').sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, withoutKeys(child)])) : value
const same = (a: any, b: any) => JSON.stringify(withoutKeys(a)) === JSON.stringify(withoutKeys(b))
const prose = (value: any): any => Array.isArray(value) ? value.map(prose) : value && typeof value === 'object'
  ? Object.fromEntries(Object.entries(value).filter(([key]) => !['_key', 'image'].includes(key)).map(([key, child]) => [key, prose(child)])) : value

async function main() {
  const [liveArticles, liveProducts, liveGammes, home, fileAssets] = await Promise.all([
    client.fetch<any[]>('*[_type == "article"]{_id,_rev,_updatedAt,"slug":slug.current,titre,date,intro,corps,couverture,illustration}'),
    client.fetch<any[]>('*[_type == "produit"]{_id,_rev,_updatedAt,"slug":slug.current,nom,gamme,categorie,fiche{titre,caracteristiques,"similaires":similaires[]{"slug":produit->slug.current}},"lienVers":lienVers->slug.current}'),
    client.fetch<any[]>('*[_type == "gamme"]{_id,_rev,cle,nom,tag,"documentation":documentation.asset->{_id,sha1hash,url,originalFilename},"ficheTechnique":ficheTechnique.asset->{_id,sha1hash,url,originalFilename}}'),
    client.fetch<any>('*[_id == "pageAccueil"][0]{_id,_rev,faq,"selection":articles.selection[]->slug.current,"installations":installations.bandeaux[]{"produit":produit->slug.current}}'),
    client.fetch<any[]>('*[_type == "sanity.fileAsset"]{_id,sha1hash,originalFilename}'),
  ])
  const report: any = {
    generatedAt: new Date().toISOString(), mode: 'read-only', projectId: client.config().projectId, dataset: client.config().dataset,
    scope: ['published public articles', 'products', 'gammes', 'homepage FAQ and references', 'PDF asset hashes'],
    mutations: 0,
    articleCount: liveArticles.length,
    articles: articles.map((local) => {
      const live = liveArticles.find((item) => item.slug === local.slug)
      return { slug: local.slug, published: Boolean(live), id: live?._id, titleMatches: live?.titre === local.titre, introMatches: live?.intro === local.intro,
        bodyTextMatches: live ? same(prose(live.corps), prose(local.corps)) : false,
        localBodyPlaceholder: local.corps.some((item: any) => item.children?.some((span: any) => span.text === 'Article en cours de rédaction.')),
        publishedBodyPlaceholder: live?.corps?.some((item: any) => item.children?.some((span: any) => span.text === 'Article en cours de rédaction.')),
        updatedAt: live?._updatedAt }
    }),
    extraPublishedArticles: liveArticles.filter((live) => !articles.some((local) => live.slug === local.slug)).map(({ _id, slug, titre }: any) => ({ id: _id, slug, titre })),
    homepage: { id: home?._id, faqMatchesValidatedLocal: same(home?.faq, pageAccueil.faq), faqCount: home?.faq?.questions?.length ?? home?.faq?.items?.length,
      articleSelection: { published: home?.selection, expected: pageAccueil.articles.selection, matches: same(home?.selection, pageAccueil.articles.selection) },
      installationProducts: home?.installations },
    products: produits.map((local) => {
      const live = liveProducts.find((item) => item.slug === local.slug)
      return { slug: local.slug, id: live?._id, published: Boolean(live), ownPage: Boolean(live?.fiche), legacyRedirect: live?.lienVers ?? null,
        technicalCharacteristicsMatch: same(live?.fiche?.caracteristiques, local.fiche?.caracteristiques),
        publishedCharacteristics: live?.fiche?.caracteristiques,
        expectedCharacteristics: local.fiche?.caracteristiques,
        relatedProducts: live?.fiche?.similaires?.map((item: any) => item.slug),
        brokenRelatedReferences: live?.fiche?.similaires?.filter((item: any) => !item.slug).length ?? 0 }
    }),
    gammePdfs: Object.values(gammes).flatMap((local) => ['documentation', 'ficheTechnique'].map((field) => {
      const live = liveGammes.find((item) => item.cle === local.cle)
      const path = (local as any)[field]
      const hash = sha1(readFileSync(resolve(root, 'site/public', path.replace(/^\//, ''))))
      const current = live?.[field]
      return { gamme: local.cle, documentId: live?._id, revision: live?._rev, field, localFile: path, localSha1: hash, publishedAsset: current,
        matchesLocalFile: current?.sha1hash === hash, matchingExistingAsset: fileAssets.find((asset) => asset.sha1hash === hash)?._id ?? null }
    })),
  }
  const syncReport = JSON.parse(readFileSync(resolve(root, 'exports/figma-sync-report.json'), 'utf8'))
  report.presentationSync = { summary: syncReport.summary, missing: syncReport.missing, blocked: syncReport.blocked,
    changes: syncReport.changedDocuments?.map(({ id, type, changes }: any) => ({ id, type, paths: changes.map((change: any) => change.path) })) }
  mkdirSync(resolve(root, 'exports'), { recursive: true })
  const output = resolve(root, 'exports/sanity-audit-2026-11-04.json')
  writeFileSync(output, JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify({ output, articles: report.articles, homepage: report.homepage,
    products: report.products.map(({ slug, published, ownPage, legacyRedirect, technicalCharacteristicsMatch, brokenRelatedReferences }: any) => ({ slug, published, ownPage, legacyRedirect, technicalCharacteristicsMatch, brokenRelatedReferences })),
    gammePdfs: report.gammePdfs.map(({ gamme, field, matchesLocalFile, matchingExistingAsset }: any) => ({ gamme, field, matchesLocalFile, matchingExistingAsset })) }, null, 2))
}
main().catch((error) => { console.error(error instanceof Error ? error.message : 'Audit failed'); process.exitCode = 1 })
