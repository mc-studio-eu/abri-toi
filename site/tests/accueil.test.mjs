import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'

async function importerTypeScript(chemin) {
  const source = stripTypeScriptTypes(await readFile(new URL(chemin, import.meta.url), 'utf8'))
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
}

const { pageAccueil } = await importerTypeScript('../content/accueil.ts')
const { normaliserAccueil } = await importerTypeScript('../utils/normaliserAccueil.ts')

function anciennePage() {
  const page = structuredClone(pageAccueil)
  page.manifeste.morceaux = [
    { _type: 'morceauTexte', texte: 'Chaque été,' },
    { _type: 'morceauImage', image: { asset: { _ref: 'image-b4a8d31b5b6231af0731ea5540c51d418448492a-2000x2000-jpg' } }, largeur: 132 },
    { _type: 'morceauTexte', texte: 'nos villes et espaces extérieurs' },
    { _type: 'morceauTexte', texte: 'sont désertés', accent: true },
    { _type: 'morceauTexte', texte: 'à cause de la canicule.' },
    { _type: 'morceauImage', image: { asset: { _ref: 'image-b29e8a949967c27445cf7d5cddbdcc0bb6a99158-2000x1422-jpg' } }, largeur: 112 },
    { _type: 'morceauTexte', texte: 'Notre objectif' },
    { _type: 'morceauImage', texte: 'où l’on reste', image: { asset: { _ref: 'image-8f3909e54e4ce77d2b593096e679c12d5bb3ee72-2000x1444-jpg' } }, largeur: 150 },
    { _type: 'morceauTexte', texte: 'leur', image: { asset: { _ref: 'image-8f3909e54e4ce77d2b593096e679c12d5bb3ee72-2000x1444-jpg' } } },
    { _type: 'morceauTexte', texte: 'redonner vie.', accent: true },
  ]
  page.probleme.texte = 'La chaleur accroît la sédentarité en intérieur, la fréquentation des espaces climatisés et réduit le lien social.'
  page.solution.galileo.etapes[1].texte = 'Fixé sur une dalle béton ou longrine. Option brumisation nécessitant un raccord à l’eau potable.'
  return page
}

test('le contenu Sanity antérieur affiche le retour Figma sans muter le document source', () => {
  const ancien = anciennePage()
  const sauvegarde = structuredClone(ancien)
  const resultat = normaliserAccueil(ancien, pageAccueil)
  assert.deepEqual(resultat.manifeste.morceaux, pageAccueil.manifeste.morceaux)
  assert.equal(resultat.probleme.texte, pageAccueil.probleme.texte)
  assert.deepEqual(resultat.solution.galileo.etapes, pageAccueil.solution.galileo.etapes)
  assert.deepEqual(ancien, sauvegarde)
  assert.equal(resultat.hero, ancien.hero)
})

test('les futures éditions CMS des textes, photos et signatures restent prioritaires', () => {
  const futur = anciennePage()
  futur.manifeste.morceaux[1].image.asset._ref = 'image-future-photo-1200x800-jpg'
  futur.manifeste.signatureRole = 'Une nouvelle signature'
  futur.probleme.texte = 'Un nouveau texte publié'
  futur.solution.galileo.etapes[1].texte = 'Une nouvelle description publiée'
  const resultat = normaliserAccueil(futur, pageAccueil)
  assert.deepEqual(resultat, futur)
})

test('une édition du manifeste ne restaure pas les anciennes photos ou positions', () => {
  const futur = anciennePage()
  futur.manifeste.morceaux[0].texte = 'Chaque saison,'
  assert.equal(normaliserAccueil(futur, pageAccueil).manifeste, futur.manifeste)
  const valide = normaliserAccueil(pageAccueil, pageAccueil)
  assert.equal(valide.manifeste, pageAccueil.manifeste)
  assert.deepEqual(normaliserAccueil(valide, pageAccueil), valide)
})

test('une image Sanity supprimée ou absente ne casse pas la page', () => {
  for (const image of [null, undefined]) {
    const incomplet = anciennePage()
    incomplet.manifeste.morceaux[1].image = image
    assert.equal(normaliserAccueil(incomplet, pageAccueil).manifeste, incomplet.manifeste)
    assert.equal(normaliserAccueil(incomplet, pageAccueil).probleme.texte, pageAccueil.probleme.texte)
  }
})

test('les éditions de largeur, recadrage, point d’intérêt, texte alternatif et accent restent prioritaires', () => {
  const editions = [
    (morceaux) => { morceaux[1].largeur = 170 },
    (morceaux) => { morceaux[1].image.crop = { top: 0.1, bottom: 0.2, left: 0, right: 0 } },
    (morceaux) => { morceaux[1].image.hotspot = { x: 0.6, y: 0.3, width: 0.5, height: 0.5 } },
    (morceaux) => { morceaux[1].image.alt = 'Une nouvelle description de la photo' },
    (morceaux) => { morceaux[3].accent = false },
    (morceaux) => { morceaux[0].accent = true },
  ]
  for (const editer of editions) {
    const futur = anciennePage()
    editer(futur.manifeste.morceaux)
    assert.equal(normaliserAccueil(futur, pageAccueil).manifeste, futur.manifeste)
  }
})
