<script setup lang="ts">
import type { Article } from '~/content/articles'

withDefaults(defineProps<{
  article: Pick<Article, 'couverture' | 'couvertureFond' | 'couvertureInset'>
  image?: Article['illustration']
  fullWidth?: boolean
  loading?: 'lazy' | 'eager'
  sizes?: string
}>(), { loading: 'lazy', sizes: taillesImageCarte })
</script>

<template>
  <div class="couv" :style="{ background: article.couvertureFond || 'var(--paper)' }">
    <img
      :src="img(image || article.couverture, 1400)"
      :srcset="imgSrcset(image || article.couverture, 2560)"
      :sizes="sizes"
      :loading="loading"
      :alt="alt(image || article.couverture)"
      class="couv__illu"
      :class="{ 'couv__illu--inset': article.couvertureInset && !image && !fullWidth }"
    />
  </div>
</template>

<style scoped>
.couv {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
}

.couv__illu {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

/* Illustrations en retrait : inset 13.85 % 5.1 % 6.15 % 14.84 % dans la maquette */
.couv__illu--inset {
  inset: 13.85% 5.1% 6.15% 14.84%;
  width: 80.06%;
  height: 80%;
  object-fit: contain;
}
</style>
