<script setup lang="ts">
import type { Hero } from '~/content/commun'

defineProps<{ hero: Hero; large?: boolean }>()
</script>

<template>
  <section class="page-hero section">
    <AppNav />
    <div class="page-hero__contenu">
      <h1 class="page-hero__titre" :class="{ 'page-hero__titre--large': large }">{{ hero.titre }}</h1>
      <div class="page-hero__droite" :class="{ 'page-hero__droite--etroite': large }">
        <slot name="chapo">
          <p v-if="hero.chapo" class="body-l page-hero__chapo">{{ hero.chapo }}</p>
        </slot>
        <ul v-if="hero.ancres?.length" class="page-hero__ancres">
          <li v-for="ancre in hero.ancres" :key="ancre.cible">
            <a :href="ancre.cible" class="page-hero__ancre">
              <span v-if="ancre.point" class="page-hero__point" :class="`page-hero__point--${ancre.point}`" />
              {{ ancre.label }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-hero {
  display: flex;
  flex-direction: column;
  gap: 96px;
  padding-top: 20px;
  padding-bottom: 112px;
  background: var(--brown-900);
  color: var(--cream);
}

.page-hero__contenu {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 80px;
}

.page-hero__titre {
  max-width: 720px;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 68px;
  line-height: 1;
  letter-spacing: -0.03em;
  animation: hero-rise 0.9s var(--ease-out) both;
}

.page-hero__titre--large {
  max-width: 900px;
}

.page-hero__droite {
  display: flex;
  flex-direction: column;
  gap: 28px;
  width: 440px;
  flex: none;
  animation: hero-rise 0.9s 0.15s var(--ease-out) both;
}

.page-hero__droite--etroite {
  width: 300px;
}

.page-hero__chapo {
  opacity: 0.85;
}

.page-hero__ancres {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.page-hero__ancre {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1px solid var(--cream);
  border-radius: 999px;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.3;
  white-space: nowrap;
  transition: background-color 0.2s, color 0.2s;
}

.page-hero__ancre:hover {
  background: var(--cream);
  color: var(--brown-900);
}

.page-hero__point {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--orange-500);
}

.page-hero__point--sage {
  background: var(--sage-500);
}

@keyframes hero-rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
}

@media (max-width: 1024px) {
  .page-hero {
    gap: 64px;
    padding-bottom: 72px;
  }

  .page-hero__contenu {
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
  }

  .page-hero__titre {
    font-size: 52px;
  }

  .page-hero__droite {
    width: 100%;
    max-width: 560px;
  }
}

@media (max-width: 640px) {
  .page-hero__titre {
    font-size: 40px;
  }
}
</style>
