// node --env-file=site/.env studio/scripts/migrate-realisations.mjs [--apply]
// Complète uniquement les champs absents des documents publiés, sans toucher aux brouillons.
import { writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { createClient } from '../../site/node_modules/@sanity/client/dist/index.js'

export function slugRealisation(nom) {
  return nom.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80).replace(/-$/g, '')
}

export function planMigration(documents) {
  const publies = documents.filter((doc) => doc._type === 'realisation' && !doc._id.startsWith('drafts.'))
  const une = documents.find((doc) => doc._id === 'pageRealisations')?.aLaUne
  const asset = une?.photo?.asset?._ref
  const correspondances = asset ? publies.filter((doc) => doc.photo?.asset?._ref === asset) : []
  const idUne = correspondances.length === 1 ? correspondances[0]._id : undefined
  const utilises = new Set(publies.map((doc) => doc.slug?.current).filter(Boolean))

  return publies.map((doc) => {
    const absent = {}
    if (!doc.slug?.current) {
      const base = slugRealisation(doc.nom)
      if (!base) throw new Error(`Nom sans slug possible : ${doc._id}`)
      let slug = base
      let suffixe = 2
      while (utilises.has(slug)) slug = `${base.slice(0, 75)}-${suffixe++}`
      utilises.add(slug)
      if (doc.slug && typeof doc.slug === 'object') absent['slug.current'] = slug
      else if (!Object.hasOwn(doc, 'slug')) absent.slug = { _type: 'slug', current: slug }
      else throw new Error(`Champ slug existant invalide à vérifier manuellement : ${doc._id}`)
    }
    if (doc._id === idUne) {
      for (const champ of ['titre', 'nomProjet', 'infos', 'galerie']) {
        if (!Object.hasOwn(doc, champ) && une[champ] !== undefined) absent[champ] = une[champ]
      }
    }
    return { id: doc._id, revision: doc._rev, nom: doc.nom, setIfMissing: absent }
  }).filter((patch) => Object.keys(patch.setIfMissing).length)
}

// Les deux correspondances ont été vérifiées dans les documents publiés.
export function planLiensAccueil(documents) {
  const accueil = documents.find((doc) => doc._id === 'pageAccueil')
  if (!accueil) return []
  const cibles = [
    { cle: 'k3x', titre: 'Installation Fotos · Parc de copropriété · Six-Fours (83)', asset: 'image-bce1dc53c2b6e5fd5f3a73523c473c37d6e271a0-2000x1500-jpg', id: 'kDvdAlfxkk4xS3OlV656ER' },
    { cle: 'k3y', titre: 'Installation Galiléo · Jardin de particulier · Sanary (83)', asset: 'image-14b0c99c262da461da52e42b295e42ad8e69d7bb-2000x1444-jpg', id: '3dh7Uy0cViNXfPOm30y3Ze' },
  ]
  const absent = {}
  for (const cible of cibles) {
    const bandeaux = accueil.installations?.bandeaux?.filter((item) => item._key === cible.cle) ?? []
    const bandeau = bandeaux.length === 1 ? bandeaux[0] : undefined
    if (!bandeau || bandeau.titre !== cible.titre || bandeau.image?.asset?._ref !== cible.asset) {
      throw new Error(`Bandeau modifié depuis sa vérification : ${cible.cle}`)
    }
    if (Object.hasOwn(bandeau, 'realisation')) continue
    if (!documents.some((doc) => doc._id === cible.id && doc._type === 'realisation' && doc.slug?.current)) {
      throw new Error(`Réalisation publiée avec slug introuvable : ${cible.id}`)
    }
    absent[`installations.bandeaux[_key=="${cible.cle}"].realisation`] = { _type: 'reference', _ref: cible.id }
  }
  return Object.keys(absent).length ? [{ id: accueil._id, revision: accueil._rev, nom: 'Liens des installations de l’accueil', setIfMissing: absent }] : []
}

function verifierConservation(avant, apres, chemin) {
  if (avant && typeof avant === 'object' && apres && typeof apres === 'object') {
    if (Array.isArray(avant) && (!Array.isArray(apres) || avant.length !== apres.length)) throw new Error(`Tableau modifié : ${chemin}`)
    for (const [champ, valeur] of Object.entries(avant)) {
      if (['_rev', '_updatedAt', '_system'].includes(champ)) continue
      verifierConservation(valeur, apres[champ], `${chemin}.${champ}`)
    }
    return
  }
  if (JSON.stringify(avant) !== JSON.stringify(apres)) throw new Error(`Champ existant modifié : ${chemin}`)
}

async function main() {
  const client = createClient({
    projectId: process.env.NUXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NUXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2026-10-01',
    useCdn: false,
    perspective: 'raw',
    token: process.env.NUXT_SANITY_WRITE_TOKEN,
  })
  const requete = '*[_type == "realisation" || _id in ["pageRealisations", "drafts.pageRealisations", "pageAccueil", "drafts.pageAccueil"]]'
  const documents = await client.fetch(requete)
  const plan = [...planMigration(documents), ...planLiensAccueil(documents)]
  const horodatage = new Date().toISOString().replace(/[:.]/g, '-')
  const sauvegarde = `exports/realisations-backup-${horodatage}.json`
  await writeFile(sauvegarde, `${JSON.stringify(documents, null, 2)}\n`, { flag: 'wx' })
  console.log(JSON.stringify({ sauvegarde, appliquer: process.argv.includes('--apply'), plan }, null, 2))
  if (!process.argv.includes('--apply') || !plan.length) return
  if (!process.env.NUXT_SANITY_WRITE_TOKEN) throw new Error('Jeton Sanity absent')
  let transaction = client.transaction()
  for (const patch of plan) {
    transaction = transaction.patch(patch.id, (builder) => builder.ifRevisionId(patch.revision).setIfMissing(patch.setIfMissing))
  }
  await transaction.commit()
  const apres = await client.fetch(requete)
  await writeFile(`exports/realisations-after-${horodatage}.json`, `${JSON.stringify(apres, null, 2)}\n`, { flag: 'wx' })
  if (planMigration(apres).length || planLiensAccueil(apres).length) throw new Error('Migration incomplète après relecture')
  for (const avant of documents) {
    const actuel = apres.find((doc) => doc._id === avant._id)
    verifierConservation(avant, actuel, avant._id)
  }
  console.log('Migration relue : champs existants préservés, aucun brouillon modifié.')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main()
