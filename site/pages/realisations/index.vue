<script setup lang="ts">
import type { GammeCle } from '~/content/commun'

const page = await usePageRealisations()
const realisations = await useRealisations()
const gammes = await useGammes()
const gammesDisponibles = computed(() => (['galileo', 'fotos'] as GammeCle[]).filter((cle) => gammes.value[cle]))

const une = computed(() => page.value.aLaUne)
const realisationALaUne = computed(() => realisations.value.find((r) =>
  r.nomProjet === une.value.nomProjet || r.nom === une.value.nomProjet,
))
const lienALaUne = computed(() => realisationALaUne.value
  ? { label: 'Voir la réalisation', url: `/realisations/${realisationALaUne.value.slug}` }
  : une.value.lien,
)

// Pagination rendue côté serveur, liens explorables.
const PAR_PAGE = 9
const filtreGamme = ref<GammeCle | ''>('')

const filtrees = computed(() =>
  realisations.value.filter((r) => !filtreGamme.value || r.gamme === filtreGamme.value),
)
const pagination = usePagination(() => filtrees.value.length, PAR_PAGE)
const visibles = computed(() => filtreGamme.value ? filtrees.value : filtrees.value.slice(pagination.debut.value, pagination.debut.value + PAR_PAGE))

usePageSeo(() => ({
  titre: `Réalisations : des espaces de pause ombragés${pagination.courante.value > 1 ? ` — page ${pagination.courante.value}` : ''} | Abri Toi`,
  chemin: pagination.lien(pagination.courante.value),
  description: 'Découvrez les installations Galiléo et Fotos : des espaces de pause et d’ombrage adaptés aux lieux de vie, aux collectivités et aux jardins.',
  image: page.value.aLaUne.photo,
  fil: [{ nom: 'Réalisations', chemin: '/realisations' }],
}))



</script>

<template>
  <div>
    <main>
      <PageHero :hero="page.hero" />

      <section v-if="pagination.courante.value === 1" id="a-la-une" class="une section">
        <header v-reveal class="entete">
          <h2 class="display-h2 entete__titre">{{ une.titre }}</h2>
        </header>

        <RealisationProjet
          :photo="une.photo"
          :nom-projet="une.nomProjet"
          titre-balise="h3"
          :label="une.label"
          :infos="une.infos"
          :galerie="une.galerie"
          :lien="lienALaUne"
        />
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
              v-for="cle in gammesDisponibles"
              :key="cle"
              type="button"
              class="filtre"
              :aria-pressed="filtreGamme === cle"
              @click="filtreGamme = cle"
            >
              {{ gammes[cle]?.nom }}
            </button>
          </div>
          <p class="label-mono filtres__compte" aria-live="polite">
            {{ filtrees.length }} réalisation{{ filtrees.length > 1 ? 's' : '' }}
          </p>
        </div>

        <ul v-if="visibles.length" class="grille">
          <li v-for="r in visibles" :key="r.slug" class="carte">
            <img :src="img(r.photo, 900, 600)" :srcset="imgSrcset(r.photo, 1600, 1067)" sizes="(min-width: 1440px) 405px, (max-width: 640px) calc(100vw - 40px), (max-width: 1024px) calc((100vw - 112px) / 2), calc((100vw - 224px) / 3)" :alt="alt(r.photo) || r.nom" loading="lazy" class="carte__photo" />
            <div class="carte__contenu">
              <h3 class="display-h4">{{ r.nom }}</h3>
              <p class="carte__description">{{ r.description }}</p>
              <UiLink
                class="carte__lien"
                label="Voir la réalisation"
                :to="`/realisations/${r.slug}`"
                :aria-label="`Voir la réalisation : ${r.nom}`"
              />
            </div>
          </li>
        </ul>
        <p v-else class="body-m projets__vide">Aucune réalisation ne correspond à ces filtres pour l’instant.</p>

        <ListePagination v-if="!filtreGamme" :courante="pagination.courante.value" :pages="pagination.pages.value" :lien="pagination.lien" />
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
  scroll-margin-top: var(--nav-content-offset);
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
  min-height: 44px;
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
  position: relative;
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
  flex: 1;
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 28px 28px;
}


.carte__description {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  color: var(--brown-700);
}

.carte__lien {
  margin-top: 8px;
}

.carte__lien::after {
  position: absolute;
  inset: 0;
  content: '';
}

.carte:focus-within {
  outline: 3px solid var(--orange-700);
  outline-offset: 4px;
}

.carte:hover :deep(.link__icon) {
  transform: translateX(3px);
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

  .grille {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filtres__compte {
    margin-left: 0;
  }
}

@media (max-width: 640px) {
  .entete {
    gap: 40px;
  }

  .filtres {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }

  .grille {
    grid-template-columns: 1fr;
  }

  .carte__photo {
    height: auto;
    aspect-ratio: 3 / 2;
  }

}
</style>
