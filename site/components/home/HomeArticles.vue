<script setup lang="ts">
const articles = [
  {
    tag: 'Santé',
    title: 'Nos seniors ont besoin d’ombre : adapter les EHPAD aux canicules',
    cover: '/images/illustration.svg',
    bg: 'var(--paper)',
  },
  {
    tag: 'Collectivités',
    title: 'Îlots de fraîcheur : comment financer l’ombrage de vos espaces publics',
    cover: '/images/illustration1.svg',
    bg: 'var(--orange-100)',
  },
  {
    tag: 'Conception',
    title: 'Brumisation très haute pression : comment ça marche ?',
    cover: '/images/illustration2.svg',
    bg: '#dde3d3',
    inset: true,
  },
]
</script>

<template>
  <section id="articles" class="articles section">
    <header v-reveal class="articles__header">
      <h2 class="display-h2 articles__title">Comprendre l’enjeu de l’ombre en ville.</h2>
      <UiLink label="Tous les articles" to="#articles" />
    </header>

    <ul class="articles__grid">
      <li v-for="(article, i) in articles" :key="article.title" v-reveal="i * 120">
        <NuxtLink to="#articles" class="card">
          <div class="card__cover" :style="{ background: article.bg }">
            <img :src="article.cover" alt="" class="card__illu" :class="{ 'card__illu--inset': article.inset }" />
          </div>
          <span class="label-mono card__tag">{{ article.tag }}&nbsp;&nbsp;·&nbsp;&nbsp;5 min</span>
          <h3 class="display-h4 card__title">{{ article.title }}</h3>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.articles {
  display: flex;
  flex-direction: column;
  gap: 48px;
  padding-top: 112px;
  padding-bottom: 112px;
  background: var(--sand);
}

.articles__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
}

.articles__title {
  max-width: 680px;
}

.articles__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card__cover {
  position: relative;
  height: 260px;
  overflow: hidden;
  border-radius: 16px;
}

.card__illu {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

/* Illustration 3 : inset 13.85 % 5.1 % 6.15 % 14.84 % dans la maquette */
.card__illu--inset {
  inset: 13.85% 5.1% 6.15% 14.84%;
  width: 80.06%;
  height: 80%;
  object-fit: contain;
}

.card:hover .card__illu {
  transform: scale(1.04);
}

.card__tag {
  color: var(--orange-700);
}

.card__title {
  max-width: 400px;
}

.card:hover .card__title {
  text-decoration: underline;
  text-decoration-color: var(--orange-500);
  text-underline-offset: 4px;
}

@media (max-width: 1024px) {
  .articles__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .articles__grid {
    grid-template-columns: 1fr;
  }
}
</style>
