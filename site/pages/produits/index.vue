<script setup lang="ts">
import type { GammeCle } from '~/content/commun'

const page = await usePageProduits()
const gammes = await useGammes()
const produits = await useProduits()

usePageSeo({
  titre: 'Mobilier urbain ombragé : Galiléo et Fotos | Abri Toi',
  description: 'Découvrez nos gammes Galiléo et Fotos : bancs, banquettes et espaces ombragés pour aménager vos extérieurs, conçus à Lyon et fabriqués en France.',
  fil: [{ nom: 'Produits', chemin: '/produits' }],
})

const ordre = computed(() => (['galileo', 'fotos'] as GammeCle[]).filter((cle) => gammes.value[cle]))
const collection = (gamme: GammeCle, categorie: 'modele' | 'espace') =>
  produits.value.filter((p) => p.gamme === gamme && p.categorie === categorie)
</script>

<template>
  <div>
    <main>
      <PageHero :hero="page.hero" />

      <section class="collection section">
        <header v-reveal class="entete">
          <h2 class="display-h2 entete__titre">{{ page.collection.titre }}</h2>
          <p class="body-m entete__intro">{{ page.collection.intro }}</p>
        </header>

        <div v-for="cle in ordre" :id="cle" :key="cle" class="gamme">
          <div v-reveal class="gamme__titre">
            <h3 class="display-h3">{{ gammes[cle]?.nom }}</h3>
            <p class="label-mono" :class="`gamme__tag--${cle}`">{{ gammes[cle]?.tag }}</p>
          </div>

          <ul class="grille grille--3">
            <li v-for="(p, i) in collection(cle, 'modele')" :key="p.slug" v-reveal="i * 100">
              <ProduitCarte :titre="p.nom" :description="p.carte.description" :visuel="p.carte.visuel" :to="lienProduit(p)" />
            </li>
            <li v-if="cle === 'fotos'" v-reveal="200">
              <div class="sur-mesure">
                <p class="label-mono sur-mesure__label">{{ page.surMesure.label }}</p>
                <p class="display-h3">{{ page.surMesure.titre }}</p>
                <p class="sur-mesure__texte">{{ page.surMesure.texte }}</p>
                <UiButton pill :label="page.surMesure.bouton" />
              </div>
            </li>
          </ul>

          <div class="usages" v-reveal>
            <h4 class="usages__titre">Des usages pour vos espaces</h4>
            <ul><li v-for="usage in page.usages[cle]" :key="usage">{{ usage }}</li></ul>
          </div>

          <div class="espaces">
            <p v-reveal class="label-mono espaces__label">{{ gammes[cle]?.labelEspaces }}</p>
            <ul class="grille" :class="collection(cle, 'espace').length > 3 ? 'grille--4' : 'grille--3'">
              <li v-for="(p, i) in collection(cle, 'espace')" :key="p.slug" v-reveal="i * 100">
                <ProduitCarte :titre="p.nom" :description="p.carte.description" :visuel="p.carte.visuel" :to="lienProduit(p)" />
              </li>
            </ul>
          </div>
        </div>
      </section>

      <HomeModular />

      <section id="comparatif" class="comparatif section">
        <h2 v-reveal class="display-h2 comparatif__titre">{{ page.comparatif.titre }}</h2>
        <div v-reveal="100" class="comparatif__colonnes">
          <article v-for="colonne in page.comparatif.colonnes" :key="colonne.gamme" class="comparatif__colonne" :class="colonne.numero === '01' ? 'comparatif__colonne--galileo' : 'comparatif__colonne--fotos'">
            <div class="comparatif__entete">
              <p class="comparatif__type">{{ colonne.typeOmbre }}</p>
              <h3 class="comparatif__nom">{{ colonne.gamme }}</h3>
            </div>
            <ul class="comparatif__liste">
              <li v-for="caracteristique in colonne.caracteristiques" :key="caracteristique">
                {{ caracteristique }}
              </li>
              <li>{{ colonne.surface }} d’ombrage</li>
              <li>{{ colonne.capacite }} personnes</li>
            </ul>
          </article>
        </div>
      </section>

      <ContactCta :titre="page.surMesure.titre" :texte="page.surMesure.texte" />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.collection {
  display: flex;
  flex-direction: column;
  gap: 56px;
  padding-top: 96px;
  padding-bottom: 96px;
  background: var(--paper);
}

.entete {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 80px;
}

.entete__titre {
  max-width: 680px;
}

.entete__intro {
  width: 420px;
  flex: none;
  color: var(--brown-700);
}

.gamme {
  display: flex;
  flex-direction: column;
  gap: 24px;
  scroll-margin-top: var(--nav-content-offset);
}

.gamme__titre {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--line);
}

.gamme__tag--galileo {
  color: var(--orange-700);
}

.gamme__tag--fotos {
  color: var(--sage-500);
}

.grille {
  display: grid;
  gap: 32px;
}

.grille > li,
.grille > li > * {
  height: 100%;
  min-width: 0;
}

.grille--3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.grille--4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.usages { display:flex; flex-wrap:wrap; align-items:center; gap:8px; padding:18px 0; border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
.usages__titre { font-size:14px; font-weight:500; white-space:nowrap; }
.usages ul { display:flex; flex-wrap:wrap; gap:8px; margin:0; padding:0; list-style:none; }
.usages li { padding:6px 10px; border-radius:999px; background:var(--cream); color:var(--brown-700); font-size:12px; }
.espaces {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.espaces__label {
  color: var(--brown-500);
}

.sur-mesure {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 16px;
  min-height: 100%;
  padding: 36px 32px;
  border-radius: 16px;
  background: var(--brown-900);
  color: var(--cream);
}

.sur-mesure__label {
  color: var(--orange-500);
}

.sur-mesure__texte {
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.8;
}

.comparatif {
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding-top: 96px;
  padding-bottom: 96px;
  background: var(--paper);
  scroll-margin-top: var(--nav-content-offset);
}

.comparatif__titre {
  max-width: 960px;
}

.comparatif__colonnes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.comparatif__colonne {
  --card-text: #fffaf1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 390px;
  padding: 25px 32px 32px;
  border-radius: 18px;
  color: var(--card-text);
}

.comparatif__colonne--galileo { background: #7a351c; }
.comparatif__colonne--fotos { background: #4a583a; }

.comparatif__entete {
  position: relative;
  padding-bottom: 13px;
  border-bottom: 1px solid rgba(255, 250, 241, 0.25);
}

.comparatif__type {
  font-size: 11px;
  font-weight: 500;
  line-height: 18px;
  text-transform: uppercase;
  color: rgba(255, 250, 241, 0.77);
}

.comparatif__nom {
  margin-top: 6px;
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 500;
  line-height: 1.1;
}

.comparatif__liste {
  margin-top: 14px;
  padding: 0;
  list-style: none;
}

.comparatif__liste li {
  font-family: 'Geist', var(--font-body);
  font-size: 17px;
  font-weight: 700;
  line-height: 29px;
  color: rgba(255, 250, 241, 0.95);
}

.comparatif__liste li::before {
  content: '•';
  margin-right: 12px;
}

@media (max-width: 1024px) {
  .entete {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .entete__intro {
    width: auto;
  }

  .grille--3,
  .grille--4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .collection, .comparatif { padding-top: 48px; padding-bottom: 48px; }
  .collection { gap: 40px; }
  .entete { gap: 24px; }
  .grille--3,
  .grille--4 {
    grid-template-columns: 1fr;
  }

  .gamme__titre {
    flex-direction: column;
    gap: 6px;
  }

  .comparatif__colonnes { grid-template-columns: 1fr; gap: 20px; }
  .comparatif__colonne { min-height: 360px; padding-inline: 24px; }
  .comparatif__liste li { font-size: 15px; line-height: 25px; }
}
</style>
