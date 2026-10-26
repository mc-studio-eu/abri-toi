<script setup lang="ts">
const page = await usePageAccueil()
const tous = await useArticles()
const selection = computed(() => {
  const slugs = page.value.articles.selection ?? []
  const choisis = slugs.map((slug) => tous.value.find((a) => a.slug === slug)).filter((a) => a !== undefined)
  return choisis.length ? choisis : tous.value.slice(0, 3)
})
</script>

<template>
  <section id="articles" class="articles section">
    <header v-reveal class="articles__header">
      <h2 class="display-h2 articles__title">{{ page.articles.titre }}</h2>
      <UiLink :label="page.articles.lien" to="/articles" />
    </header>

    <ul class="articles__grid">
      <li v-for="(article, i) in selection" :key="article.slug" v-reveal="i * 120">
        <ArticleCarte :article="article" />
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
