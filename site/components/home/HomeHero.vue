<script setup lang="ts">
const nav = [
  { label: 'Accueil', to: '/' },
  { label: 'Produits', to: '#solution' },
  { label: 'Réalisations', to: '#realisations' },
  { label: 'Articles', to: '#articles' },
  { label: 'À propos', to: '#fondateur' },
]
</script>

<template>
  <section class="hero">
    <img class="hero__photo" src="/images/hero-v5-photo-plein-fond.png" alt="Des habitants assis à l’ombre d’un abri Galiléo" />
    <div class="hero__shade" aria-hidden="true" />

    <header class="hero__nav">
      <div class="hero__nav-left">
        <NuxtLink to="/" aria-label="Abri Toi — accueil">
          <img src="/images/logo-blanc.png" alt="Abri Toi" width="130" height="23" class="hero__logo" />
        </NuxtLink>
        <nav aria-label="Navigation principale">
          <ul class="hero__menu">
            <li v-for="item in nav" :key="item.label">
              <NuxtLink :to="item.to">{{ item.label }}</NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
      <NuxtLink to="#contact" class="hero__nav-cta">Prendre rendez-vous</NuxtLink>
    </header>

    <div class="hero__content">
      <p class="hero__eyebrow">Bureau d’études à Lyon · Fabrication en France</p>
      <h1 class="hero__title">
        Reconquérir l’extérieur,<br />
        même en pleine <span class="shimmer">canicule.</span>
      </h1>
      <p class="hero__lead">
        Des solutions d’ombrage et de fraîcheur durables, conçues pour améliorer le confort en extérieur par forte
        chaleur et créer des espaces conviviaux toute l’année.
      </p>
      <div class="hero__ctas">
        <UiButton />
        <UiButton variant="outline" label="Découvrez nos produits" to="#solution" />
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

.hero__nav {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
}

.hero__nav-left {
  display: flex;
  align-items: center;
  gap: 48px;
}

.hero__logo {
  width: 130px;
  height: 23px;
  object-fit: contain;
}

.hero__menu {
  display: flex;
  gap: 30px;
  font-weight: 500;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.92);
}

.hero__menu a:hover {
  color: var(--white);
  text-decoration: underline;
  text-underline-offset: 4px;
}

.hero__nav-cta {
  background: var(--orange-500);
  padding: 12px 18px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 15px;
  transition: background-color 0.2s;
}

.hero__nav-cta:hover {
  background: var(--orange-600);
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

  .hero__menu {
    display: none;
  }

  .hero__title {
    font-size: 64px;
  }
}

@media (max-width: 640px) {
  .hero__title {
    font-size: 44px;
  }

  .hero__nav-cta {
    display: none;
  }

  .hero__shade {
    background: linear-gradient(180deg, rgba(18, 11, 8, 0.75) 0%, rgba(18, 11, 8, 0.35) 100%);
  }
}
</style>
