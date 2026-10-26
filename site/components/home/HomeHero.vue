<script setup lang="ts">
const page = await usePageAccueil()
const hero = computed(() => page.value.hero)
</script>

<template>
  <section class="hero">
    <img class="hero__photo" :src="img(hero.photo, 2400)" :alt="alt(hero.photo)" />
    <div class="hero__shade" aria-hidden="true" />

    <AppNav class="hero__nav" />

    <div class="hero__content">
      <p class="hero__eyebrow">{{ hero.surtitre }}</p>
      <h1 class="hero__title">
        {{ hero.titre }}<br />
        {{ hero.titreSuite }} <span class="shimmer">{{ hero.titreAccent }}</span>
      </h1>
      <p class="hero__lead">{{ hero.texte }}</p>
      <div class="hero__ctas">
        <UiButton />
        <UiButton variant="outline" :label="hero.boutonProduits" to="/produits" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  height: 805px;
  overflow: hidden;
  color: var(--white);
  padding: 28px max(90px, calc((100% - var(--page-max)) / 2 + 90px)) 0;
}

.hero__photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero__shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105.41deg,
    rgba(18, 11, 8, 0.82) 20.593%,
    rgba(18, 11, 8, 0.45) 22.695%,
    rgba(18, 11, 8, 0) 47.757%
  );
}

.hero__content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 28px;
  margin-top: 57px;
}

.hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* Entrée en cascade au chargement */
.hero__photo {
  animation: hero-zoom 1.8s var(--ease-out) both;
}

.hero__nav,
.hero__content > * {
  animation: hero-rise 0.9s var(--ease-out) both;
}

/* Pas de remplissage après l'animation : une transformation conservée piègerait la barre fixe */
.hero__nav {
  animation-fill-mode: backwards;
}

.hero__content > :nth-child(1) {
  animation-delay: 0.15s;
}

.hero__content > :nth-child(2) {
  animation-delay: 0.25s;
}

.hero__content > :nth-child(3) {
  animation-delay: 0.4s;
}

.hero__content > :nth-child(4) {
  animation-delay: 0.55s;
}

@keyframes hero-zoom {
  from {
    transform: scale(1.06);
  }
}

@keyframes hero-rise {
  from {
    opacity: 0;
    transform: translateY(16px);
    filter: blur(6px);
  }
}

.hero__title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 96px;
  line-height: 1;
  letter-spacing: -0.035em;
}

.hero__lead {
  width: 628px;
  max-width: 100%;
  min-height: 86px;
  font-size: 19px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.9);
}

.hero__ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 16px;
}

@media (max-width: 1024px) {
  .hero {
    height: auto;
    min-height: 720px;
    padding-inline: var(--gutter);
    padding-bottom: 80px;
  }

  .hero__title {
    font-size: 64px;
  }
}

@media (max-width: 640px) {
  .hero__title {
    font-size: 44px;
  }

  .hero__shade {
    background: linear-gradient(180deg, rgba(18, 11, 8, 0.75) 0%, rgba(18, 11, 8, 0.35) 100%);
  }
}
</style>
