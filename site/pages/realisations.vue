<script setup lang="ts">
import { typesLieu, type TypeLieu } from '~/content/realisations'
import type { GammeCle } from '~/content/commun'

const page = await usePageRealisations()
const realisations = await useRealisations()
const gammes = await useGammes()

useHead({ title: 'Nos réalisations — Abri Toi' })

const une = computed(() => page.value.aLaUne)

// Filtres et pagination côté navigateur
const PAR_PAGE = 9
const filtreGamme = ref<GammeCle | ''>('')
const filtreLieu = ref<TypeLieu | ''>('')
const affiches = ref(PAR_PAGE)
watch([filtreGamme, filtreLieu], () => (affiches.value = PAR_PAGE))

const filtrees = computed(() =>
  realisations.value.filter(
    (r) => (!filtreGamme.value || r.gamme === filtreGamme.value) && (!filtreLieu.value || r.typeLieu === filtreLieu.value),
  ),
)
const visibles = computed(() => filtrees.value.slice(0, affiches.value))
</script>

<template>
  <div>
    <main>
      <PageHero :hero="page.hero" />

      <section id="a-la-une" class="une section">
        <header v-reveal class="entete">
          <h2 class="display-h2 entete__titre">{{ une.titre }}</h2>
        </header>

        <div class="une__projet">
          <img v-reveal :src="img(une.photo, 1600)" :alt="alt(une.photo) || une.nomProjet" class="une__photo" />
          <div v-reveal="120" class="fiche">
            <p class="label-mono fiche__label">{{ une.label }}</p>
            <h3 class="display-h3">{{ une.nomProjet }}</h3>
            <dl class="fiche__infos">
              <div v-for="info in une.infos" :key="info.label" class="fiche__info">
                <dt class="label-mono">{{ info.label }}</dt>
                <dd>{{ info.valeur }}</dd>
              </div>
            </dl>
            <UiLink v-if="une.lien?.url" :label="une.lien.label" :to="une.lien.url" />
          </div>
        </div>

        <ul class="une__galerie">
          <li v-for="(photo, i) in une.galerie" :key="i" v-reveal="i * 90">
            <img :src="img(photo, 700)" :alt="alt(photo)" loading="lazy" />
          </li>
        </ul>
      </section>

      <section id="projets" class="projets section">
        <header v-reveal class="entete">
          <h2 class="display-h2 entete__titre">{{ page.liste.titre }}</h2>
          <p class="body-m entete__intro">{{ page.liste.intro }}</p>
        </header>

        <div class="filtres">
          <div class="filtres__groupe" role="group" aria-label="Filtrer par gamme">
            <span class="label-mono filtres__label">Gamme</span>
            <button type="button" class="filtre" :aria-pressed="!filtreGamme" @click="filtreGamme = ''">Toutes</button>
            <button
              v-for="cle in (['galileo', 'fotos'] as GammeCle[])"
              :key="cle"
              type="button"
              class="filtre"
              :aria-pressed="filtreGamme === cle"
              @click="filtreGamme = cle"
            >
              {{ gammes[cle].nom }}
            </button>
          </div>
          <div class="filtres__groupe" role="group" aria-label="Filtrer par type de lieu">
            <span class="label-mono filtres__label">Lieu</span>
            <button type="button" class="filtre" :aria-pressed="!filtreLieu" @click="filtreLieu = ''">Tous</button>
            <button
              v-for="t in typesLieu"
              :key="t.cle"
              type="button"
              class="filtre"
              :aria-pressed="filtreLieu === t.cle"
              @click="filtreLieu = t.cle"
            >
              {{ t.label }}
            </button>
          </div>
          <p class="label-mono filtres__compte" aria-live="polite">
            {{ filtrees.length }} réalisation{{ filtrees.length > 1 ? 's' : '' }}
          </p>
        </div>

        <ul v-if="visibles.length" class="grille">
          <li v-for="r in visibles" :key="r.nom" class="carte">
            <img :src="img(r.photo, 900, 600)" :alt="alt(r.photo) || r.nom" loading="lazy" class="carte__photo" />
            <div class="carte__contenu">
              <h3 class="display-h4">{{ r.nom }}</h3>
              <p class="carte__description">{{ r.description }}</p>
            </div>
          </li>
        </ul>
        <p v-else class="body-m projets__vide">Aucune réalisation ne correspond à ces filtres pour l’instant.</p>

        <div v-if="filtrees.length > affiches" class="projets__plus">
          <button type="button" class="plus" @click="affiches += PAR_PAGE">
            {{ page.liste.boutonPlus }}
            <img src="/images/arrow-brown-900.svg" alt="" width="16" height="16" />
          </button>
        </div>
      </section>


      <ContactCta />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.une,
.projets {
  display: flex;
  flex-direction: column;
  gap: 48px;
  padding-top: 96px;
  padding-bottom: 96px;
  background: var(--paper);
  scroll-margin-top: 0;
}

.projets {
  gap: 40px;
  background: var(--cream);
}

.entete {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 80px;
}

.entete__titre {
  max-width: 780px;
}

.entete__intro {
  max-width: 420px;
  color: var(--brown-700);
}

.une__projet {
  display: flex;
  gap: 32px;
}

.une__photo {
  width: 61%;
  height: 560px;
  flex: none;
  border-radius: 20px;
  object-fit: cover;
}

.fiche {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  padding: 40px;
  border-radius: 20px;
  background: var(--cream);
}

.fiche__label {
  color: var(--orange-700);
}

.fiche__infos {
  width: 100%;
  margin: 0;
}

.fiche__info {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
}

.fiche__info dt {
  color: var(--brown-500);
}

.fiche__info dd {
  margin: 0;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.3;
}


.une__galerie {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 32px;
}

.une__galerie img {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  object-fit: cover;
}

.filtres {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--line);
}

.filtres__groupe {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.filtres__label,
.filtres__compte {
  color: var(--brown-500);
}

.filtres__compte {
  margin-left: auto;
}

.filtre {
  padding: 10px 18px;
  border: 1px solid var(--line);
  border-radius: 999px;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.3;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

.filtre:hover {
  border-color: var(--brown-900);
}

.filtre[aria-pressed='true'] {
  border-color: var(--brown-900);
  background: var(--brown-900);
  color: var(--cream);
}

.grille {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
}

.carte {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--paper);
}

.carte__photo {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.carte__contenu {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 28px 28px;
}


.carte__description {
  font-size: 14px;
  line-height: 1.5;
  color: var(--brown-700);
}

.projets__vide {
  color: var(--brown-700);
}

.projets__plus {
  display: flex;
  justify-content: center;
  padding-top: 16px;
}

.plus {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px 14px 22px;
  border: 1.2px solid var(--brown-900);
  border-radius: 999px;
  font-weight: 500;
  font-size: 16px;
}

.plus:hover {
  background: rgba(63, 38, 29, 0.06);
}


@media (max-width: 1024px) {
  .entete {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .une__projet {
    flex-direction: column;
  }

  .une__photo {
    width: 100%;
    height: 420px;
  }

  .une__galerie,
  .grille {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filtres__compte {
    margin-left: 0;
  }
}

@media (max-width: 640px) {
  .grille {
    grid-template-columns: 1fr;
  }

  .une__photo {
    height: 280px;
  }

  .fiche {
    padding: 28px 24px;
  }
}
</style>
