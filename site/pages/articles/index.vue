<script setup lang="ts">
import { categories, type Categorie } from '~/content/articles'

const page = await usePageArticles()
const articles = await useArticles()

useHead({ title: 'Articles — Abri Toi' })

const une = computed(() => articles.value.find((a) => a.slug === page.value.aLaUne) ?? articles.value[0])

const PAR_PAGE = 6
const filtre = ref<Categorie | ''>('')
const affiches = ref(PAR_PAGE)
watch(filtre, () => (affiches.value = PAR_PAGE))
const liste = computed(() =>
  articles.value.filter((a) => a.slug !== une.value?.slug && (!filtre.value || a.categorie === filtre.value)),
)
</script>

<template>
  <div>
    <main>
      <PageHero :hero="page.hero" />

      <section v-if="une" class="une section">
        <NuxtLink :to="`/articles/${une.slug}`" class="une__lien">
          <ArticleCouverture v-reveal :article="une" class="une__couv" />
          <div v-reveal="120" class="une__texte">
            <p class="label-mono une__meta">
              {{ page.labelALaUne }}&nbsp;&nbsp;·&nbsp;&nbsp;{{ labelCategorie(une.categorie) }}&nbsp;&nbsp;·&nbsp;&nbsp;{{ une.tempsLecture }} min
            </p>
            <h2 class="une__titre">{{ une.titre }}</h2>
            <p class="body-m une__extrait">{{ une.extrait }}</p>
            <p class="label-mono une__date">Publié le {{ dateLongue(une.date) }}</p>
            <span class="une__cta">{{ page.lienALaUne }} <img src="/images/arrow-orange-700.svg" alt="" width="16" height="16" /></span>
          </div>
        </NuxtLink>
      </section>

      <section class="tous section">
        <header class="tous__entete">
          <h2 class="display-h2">{{ page.titreListe }}</h2>
          <div class="filtres" role="group" aria-label="Filtrer par thème">
            <button type="button" class="filtre" :aria-pressed="!filtre" @click="filtre = ''">Tous</button>
            <button
              v-for="c in categories"
              :key="c.cle"
              type="button"
              class="filtre"
              :aria-pressed="filtre === c.cle"
              @click="filtre = c.cle"
            >
              {{ c.label }}
            </button>
          </div>
        </header>

        <ul v-if="liste.length" class="grille">
          <li v-for="(article, i) in liste.slice(0, affiches)" :key="article.slug" v-reveal="(i % 3) * 100">
            <ArticleCarte :article="article" />
          </li>
        </ul>
        <p v-else class="body-m tous__vide">Pas encore d’article sur ce thème.</p>

        <div v-if="liste.length > affiches" class="tous__plus">
          <button type="button" class="plus" @click="affiches += PAR_PAGE">{{ page.boutonPlus }}</button>
        </div>
      </section>

      <ContactCta />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.une {
  padding-top: 96px;
  padding-bottom: 96px;
  background: var(--paper);
}

.une__lien {
  display: flex;
  align-items: center;
  gap: 64px;
}

.une__couv {
  width: 720px;
  height: 456px;
  flex: none;
}

.une__texte {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

.une__meta {
  color: var(--orange-700);
}

.une__titre {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 44px;
  line-height: 1.06;
  letter-spacing: -0.02em;
}

.une__lien:hover .une__titre {
  text-decoration: underline;
  text-decoration-color: var(--orange-500);
  text-underline-offset: 6px;
}

.une__extrait {
  color: var(--brown-700);
}

.une__date {
  opacity: 0.6;
}

.une__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 4px;
  border-bottom: 1.5px solid var(--orange-700);
  font-weight: 500;
  font-size: 16px;
}

.tous {
  display: flex;
  flex-direction: column;
  gap: 48px;
  padding-top: 96px;
  padding-bottom: 96px;
  background: var(--cream);
}

.tous__entete {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.filtres {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filtre {
  padding: 11px 18px;
  border: 1px solid rgba(63, 38, 29, 0.25);
  border-radius: 999px;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.3;
  transition: background-color 0.2s, color 0.2s;
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
  gap: 56px 24px;
}

.tous__vide {
  color: var(--brown-700);
}

.tous__plus {
  display: flex;
  justify-content: center;
}

.plus {
  padding: 14px 24px;
  border: 1px solid var(--brown-900);
  border-radius: 999px;
  font-weight: 500;
  font-size: 14px;
}

.plus:hover {
  background: rgba(63, 38, 29, 0.06);
}

@media (max-width: 1200px) {
  .une__lien {
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
  }

  .une__couv {
    width: 100%;
  }
}

@media (max-width: 1024px) {
  .tous__entete {
    flex-direction: column;
    align-items: flex-start;
  }

  .grille {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .grille {
    grid-template-columns: 1fr;
  }

  .une__couv {
    height: 260px;
  }

  .une__titre {
    font-size: 32px;
  }
}
</style>
