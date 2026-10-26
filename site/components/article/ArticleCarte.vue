<script setup lang="ts">
import type { Article } from '~/content/articles'

defineProps<{ article: Pick<Article, 'slug' | 'titre' | 'categorie' | 'tempsLecture' | 'couverture' | 'couvertureFond' | 'couvertureInset'> }>()
</script>

<template>
  <NuxtLink :to="`/articles/${article.slug}`" class="carte">
    <ArticleCouverture :article="article" class="carte__couv" />
    <span class="label-mono carte__tag">{{ labelCategorie(article.categorie) }}&nbsp;&nbsp;·&nbsp;&nbsp;{{ article.tempsLecture }} min</span>
    <h3 class="display-h4 carte__titre">{{ article.titre }}</h3>
  </NuxtLink>
</template>

<style scoped>
.carte {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.carte__couv {
  height: 260px;
}

.carte__tag {
  color: var(--orange-700);
}

.carte__titre {
  max-width: 400px;
}

.carte:hover .carte__titre {
  text-decoration: underline;
  text-decoration-color: var(--orange-500);
  text-underline-offset: 4px;
}

.carte:hover :deep(.couv__illu) {
  transform: scale(1.04);
}
</style>
