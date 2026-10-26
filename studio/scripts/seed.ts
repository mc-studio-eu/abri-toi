// Remplit Sanity avec le contenu des maquettes (site/content) et envoie les images de site/public.
// À lancer une seule fois, une fois le projet Sanity créé :
//   npm run seed            → n'écrit que les documents absents
//   npm run seed -- --force → remplace aussi les pages et paramètres existants
import { createReadStream, existsSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { getCliClient } from 'sanity/cli'
import { pageAccueil } from '../../site/content/accueil'
import { articles } from '../../site/content/articles'
import { gammes, parametres } from '../../site/content/commun'
import {
  ficheProduit,
  pageAPropos,
  pageArticles,
  pageContact,
  pageProduits,
  pageRealisations,
} from '../../site/content/pages'
import { produits } from '../../site/content/produits'
import { realisations } from '../../site/content/realisations'

const client = getCliClient({ apiVersion: '2026-10-01' })
const force = process.argv.includes('--force')
const publicDir = resolve(import.meta.dirname, '../../site/public')

const assets = new Map<string, string>()

async function upload(src: string) {
  if (!assets.has(src)) {
    const file = resolve(publicDir, src.replace(/^\//, ''))
    if (!existsSync(file)) throw new Error(`Image introuvable : ${file}`)
    const asset = await client.assets.upload('image', createReadStream(file), { filename: basename(file) })
    assets.set(src, asset._id)
    console.log(`  image envoyée : ${src}`)
  }
  return assets.get(src)!
}

let n = 0
const key = () => `k${(++n).toString(36)}`

// Convertit le contenu de référence au format Sanity : images envoyées, clés ajoutées dans les listes.
async function convertir(value: unknown): Promise<unknown> {
  if (Array.isArray(value)) {
    return Promise.all(
      value.map(async (item) => {
        const out = await convertir(item)
        return out && typeof out === 'object' && !('_key' in out) ? { _key: key(), ...out } : out
      }),
    )
  }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if (typeof obj.src === 'string' && obj.src.startsWith('/images/')) {
      return {
        _type: 'image',
        asset: { _type: 'reference', _ref: await upload(obj.src) },
        ...(obj.alt ? { alt: obj.alt } : {}),
      }
    }
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) out[k] = await convertir(v)
    return out
  }
  return value
}

const ref = (id: string) => ({ _type: 'reference', _ref: id })
const slug = (current: string) => ({ _type: 'slug', current })

async function existe(id: string) {
  return Boolean(await client.getDocument(id))
}

async function unique(id: string, type: string, contenu: Record<string, unknown>) {
  if (!force && (await existe(id))) return console.log(`= ${id} existe déjà`)
  await client.createOrReplace({ _id: id, _type: type, ...((await convertir(contenu)) as object) })
  console.log(`✓ ${id}`)
}

// Crée une collection si elle est vide ; renvoie les identifiants par slug (ou par nom).
async function collection<T>(type: string, items: T[], cle: (item: T) => string, doc: (item: T, i: number) => Promise<object>) {
  const ids = new Map<string, string>()
  const existants: { _id: string; cle: string }[] = await client.fetch(
    `*[_type == $type]{ _id, "cle": coalesce(slug.current, nom) }`,
    { type },
  )
  if (existants.length) {
    console.log(`= ${type} : ${existants.length} document(s) déjà présents, rien n'est créé`)
    existants.forEach((e) => ids.set(e.cle, e._id))
    return ids
  }
  for (const [i, item] of items.entries()) {
    const created = await client.create({ _type: type, ...(await doc(item, i)) })
    ids.set(cle(item), created._id)
  }
  console.log(`✓ ${type} : ${items.length} document(s) créés`)
  return ids
}

async function main() {
  console.log(`Projet ${client.config().projectId} · jeu de données ${client.config().dataset}`)

  await unique('parametres', 'parametres', parametres)
  for (const g of Object.values(gammes)) await unique(`gamme-${g.cle}`, 'gamme', { ...g, documentation: undefined })

  // Produits : création, puis liens entre produits une fois les identifiants connus
  const idsProduits = await collection('produit', produits, (p) => p.slug, async (p, i) =>
    convertir({
      nom: p.nom,
      slug: slug(p.slug),
      gamme: p.gamme,
      categorie: p.categorie,
      ordre: i + 1,
      description: p.carte.description,
      visuel: p.carte.visuel,
      fiche: p.fiche ? { ...p.fiche, similaires: [] } : undefined,
    }) as Promise<object>,
  )
  for (const p of produits) {
    const id = idsProduits.get(p.slug)
    if (!id) continue
    const patch: Record<string, unknown> = {}
    if (p.lienVers) patch.lienVers = ref(idsProduits.get(p.lienVers)!)
    if (p.fiche?.similaires.length) {
      patch['fiche.similaires'] = p.fiche.similaires.map((s) => ({
        _key: key(),
        titre: s.titre,
        description: s.description,
        produit: ref(idsProduits.get(s.produit)!),
      }))
    }
    if (Object.keys(patch).length) await client.patch(id).setIfMissing(patch).commit()
  }

  await collection('realisation', realisations, (r) => r.nom, async (r, i) =>
    convertir({ ...r, ordre: i + 1 }) as Promise<object>,
  )

  const idsArticles = await collection('article', articles, (a) => a.slug, async (a) =>
    convertir({ ...a, slug: slug(a.slug) }) as Promise<object>,
  )

  // Pages
  const manifeste = pageAccueil.manifeste.morceaux.map((m) =>
    'image' in m ? { _type: 'morceauImage', ...m } : { _type: 'morceauTexte', ...m },
  )
  await unique('pageAccueil', 'pageAccueil', {
    ...pageAccueil,
    manifeste: { ...pageAccueil.manifeste, morceaux: manifeste },
    installations: {
      ...pageAccueil.installations,
      bandeaux: pageAccueil.installations.bandeaux.map((b) => ({ ...b, produit: ref(idsProduits.get(b.produit)!) })),
    },
    articles: {
      ...pageAccueil.articles,
      selection: pageAccueil.articles.selection.map((s) => ({ _key: key(), ...ref(idsArticles.get(s)!) })),
    },
  })
  await unique('pageProduits', 'pageProduits', pageProduits)
  await unique('ficheProduit', 'ficheProduit', ficheProduit)
  await unique('pageRealisations', 'pageRealisations', pageRealisations)
  await unique('pageAPropos', 'pageAPropos', pageAPropos)
  await unique('pageArticles', 'pageArticles', { ...pageArticles, aLaUne: ref(idsArticles.get(pageArticles.aLaUne)!) })
  await unique('pageContact', 'pageContact', pageContact)

  console.log('Terminé.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
