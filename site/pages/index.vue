<script setup lang="ts">
import { DESCRIPTION_ACCUEIL, TITRE_ACCUEIL } from '~/utils/seo'
const page = await usePageAccueil()
usePageSeo(() => ({ titre: TITRE_ACCUEIL, description: DESCRIPTION_ACCUEIL, image: page.value.hero.photo }))
</script>

<template>
  <div>
    <main>
      <HomeHero />
      <HomePartners />
      <HomeManifesto />
      <HomeProblem />
      <HomeSolution />
      <HomeProcess />
      <HomeInstallations />
      <HomeIdeas />
      <HomeFaq />
      <HomeFounder />
      <ContactCta />
      <HomeArticles />
    </main>
    <AppFooter />
  </div>
</template>
