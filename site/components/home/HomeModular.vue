<script setup lang="ts">
const page = await usePageAccueil()
const ranges = [
  {
    name: 'Gamme Galiléo',
    modules: [
      { src: '/images/modular/galileo-solo.png', size: 242.25 },
      { src: '/images/modular/galileo-solo.png', size: 242.25 },
    ],
    space: {
      configurations: ['/images/modular/galileo-a.png', '/images/modular/galileo-b.png'],
      size: 155, label: 'Espace Galiléo',
    },
  },
  {
    name: 'Gamme Fotos',
    modules: [
      { src: '/images/modular/fotos-solo.png', size: 256.5 },
      { src: '/images/modular/fotos-solo.png', size: 256.5 },
    ],
    space: {
      configurations: ['/images/modular/fotos-a.png', '/images/modular/fotos-b.png'],
      size: 160, label: 'Espace Fotos',
    },
  },
]
</script>

<template>
  <section class="modular section">
    <header v-reveal class="modular__header">
      <h2 class="display-h2 modular__title">{{ page.modulaire.titre }}</h2>
      <p class="modular__text">{{ page.modulaire.texte }}</p>
    </header>

    <div>
      <article v-for="range in ranges" :key="range.name" v-reveal class="range">
        <h3 class="range__name">{{ range.name }}</h3>
        <div class="range__equation">
          <template v-for="(mod, i) in range.modules" :key="i">
            <figure class="range__item">
              <div class="range__visual" :style="{ width: `${mod.size}px` }">
                <img :src="mod.src" alt="" :width="mod.size" :height="mod.size" />
              </div>
              <figcaption>
                <span class="range__label">Module</span>
                <span class="range__meta">3 places</span>
              </figcaption>
            </figure>
            <span class="range__op" aria-hidden="true">{{ i === 0 ? '+' : '=' }}</span>
          </template>
          <figure class="range__item range__item--space">
            <div
              v-for="(configuration, i) in range.space.configurations"
              :key="configuration"
              class="range__visual"
              :style="{ width: `${range.space.size}px` }"
            >
              <img
                :src="configuration"
                :alt="`${range.space.label}, configuration ${i + 1}`"
                :width="range.space.size"
                :height="range.space.size"
              />
            </div>
            <figcaption>
              <span class="range__label">{{ range.space.label }}</span>
              <span class="range__meta">Jusqu’à 8 personnes · 12 m² d’ombre</span>
            </figcaption>
          </figure>
        </div>
      </article>
    </div>

  </section>
</template>

<style scoped>
.modular {
  display: flex;
  flex-direction: column;
  gap: 100px;
  padding-top: 120px;
  padding-bottom: 120px;
  background: var(--brown-900);
  color: var(--white);
}

.modular__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 40px;
}

.modular__title {
  max-width: 640px;
}

.modular__text {
  max-width: 588px;
  font-size: 17px;
  line-height: 1.55;
}

.range {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 40px 0 48px;
  border-top: 1px solid rgba(244, 238, 229, 0.18);
}

.range__name {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 40px;
  letter-spacing: -0.01em;
  color: var(--cream);
}

.range__equation {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.range__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 0;
  min-width: 0;
}

.range__item--space {
  gap: 14px;
}

.range__visual {
  max-width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 16px;
  background: var(--white);
}

.range__visual img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.range__item figcaption {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.range__label {
  font-weight: 500;
  font-size: 16px;
  color: var(--cream);
}

.range__meta {
  font-size: 13px;
  color: rgba(244, 238, 229, 0.7);
}

.range__op {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: 90px;
  font-size: 40px;
  color: var(--cream);
  opacity: 0.5;
  flex: none;
}

@media (max-width: 1024px) {
  .modular__header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 760px) {
  .modular { padding-top: 48px; padding-bottom: 48px; gap: 40px; }
  .modular__header { gap: 24px; }
  .range { gap: 24px; padding: 32px 0; }
  .range__name { font-size: 28px; }
  .range__equation {
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 24px;
  }

  .range__op {
    margin-bottom: 0;
  }
}
</style>
