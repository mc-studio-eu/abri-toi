<script setup lang="ts">
import type { GammeCle } from '~/content/commun'

const page = await usePageProduits()
const gammes = await useGammes()
const produits = await useProduits()

useHead({ title: 'Nos produits — Abri Toi' })

const ordre: GammeCle[] = ['galileo', 'fotos']
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
            <h3 class="display-h3">{{ gammes[cle].nom }}</h3>
            <p class="label-mono" :class="`gamme__tag--${cle}`">{{ gammes[cle].tag }}</p>
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

          <div class="espaces">
            <p v-reveal class="label-mono espaces__label">{{ gammes[cle].labelEspaces }}</p>
            <ul class="grille" :class="collection(cle, 'espace').length > 3 ? 'grille--4' : 'grille--3'">
              <li v-for="(p, i) in collection(cle, 'espace')" :key="p.slug" v-reveal="i * 100">
                <ProduitCarte :titre="p.nom" :description="p.carte.description" :visuel="p.carte.visuel" :to="lienProduit(p)" />
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section id="comparatif" class="comparatif section">
        <h2 v-reveal class="display-h2 comparatif__titre">{{ page.comparatif.titre }}</h2>
        <div v-reveal="100" class="tableau" role="table">
          <div class="tableau__ligne tableau__ligne--entete" role="row">
            <span class="label-mono tableau__label" role="columnheader" />
            <span class="display-h4 tableau__gamme--galileo" role="columnheader">{{ gammes.galileo.nom }}</span>
            <span class="display-h4 tableau__gamme--fotos" role="columnheader">{{ gammes.fotos.nom }}</span>
          </div>
          <div v-for="ligne in page.comparatif.lignes" :key="ligne.label" class="tableau__ligne" role="row">
            <span class="label-mono tableau__label" role="rowheader">{{ ligne.label }}</span>
            <span class="body-l" role="cell">{{ ligne.galileo }}</span>
            <span class="body-l" role="cell">{{ ligne.fotos }}</span>
          </div>
        </div>
      </section>

      <ContactCta />
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
  scroll-margin-top: 24px;
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
}

.grille--3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.grille--4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

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
  scroll-margin-top: 0;
}

.comparatif__titre {
  max-width: 720px;
}

.tableau__ligne {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) minmax(0, 1fr);
  gap: 32px;
  padding: 22px 0;
  border-bottom: 1px solid var(--line);
}

.tableau__label {
  color: var(--brown-500);
}

.tableau__gamme--galileo {
  color: var(--orange-700);
}

.tableau__gamme--fotos {
  color: var(--sage-500);
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

  .tableau__ligne {
    grid-template-columns: 140px minmax(0, 1fr) minmax(0, 1fr);
    gap: 16px;
  }
}

@media (max-width: 640px) {
  .grille--3,
  .grille--4 {
    grid-template-columns: 1fr;
  }

  .gamme__titre {
    flex-direction: column;
    gap: 6px;
  }

  .tableau__ligne {
    grid-template-columns: 1fr 1fr;
  }

  .tableau__label {
    grid-column: 1 / -1;
  }

  .tableau__ligne .body-l {
    font-size: 15px;
  }
}
</style>
