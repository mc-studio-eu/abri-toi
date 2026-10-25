<script setup lang="ts">
const ranges = [
  {
    name: 'Gamme Galiléo',
    modules: [
      { src: '/images/iso.svg', w: 242.25, h: 281.2 },
      { src: '/images/iso1.svg', w: 242.25, h: 281.2 },
    ],
    space: { src: '/images/iso2.svg', w: 321.1, h: 326.8, label: 'Espace Galiléo' },
  },
  {
    name: 'Gamme Fotos',
    modules: [
      { src: '/images/iso3.svg', w: 256.5, h: 294.5 },
      { src: '/images/iso4.svg', w: 256.5, h: 294.5 },
    ],
    space: { src: '/images/iso5.svg', w: 336.3, h: 340.1, label: 'Espace Fotos' },
  },
]
</script>

<template>
  <section class="modular section">
    <header v-reveal class="modular__header">
      <h2 class="display-h2 modular__title">Assemblez vos abris comme des briques.</h2>
      <p class="modular__text">
        Chaque gamme se combine avec elle-même.<br />
        Deux modules de 3 places forment un espace de 6 places et 12 m² d’ombre : banquettes, bancs, tables ou gradins
        chez Galiléo, bancs et tables sous une arche végétale chez Fotos.
      </p>
    </header>

    <div>
      <article v-for="range in ranges" :key="range.name" v-reveal class="range">
        <h3 class="range__name">{{ range.name }}</h3>
        <div class="range__equation">
          <template v-for="(mod, i) in range.modules" :key="mod.src">
            <figure class="range__item">
              <img :src="mod.src" alt="" :width="mod.w" :height="mod.h" :style="{ width: `${mod.w}px` }" />
              <figcaption>
                <span class="range__label">Module</span>
                <span class="range__meta">3 places</span>
              </figcaption>
            </figure>
            <span class="range__op" aria-hidden="true">{{ i === 0 ? '+' : '=' }}</span>
          </template>
          <figure class="range__item">
            <img
              :src="range.space.src"
              alt=""
              :width="range.space.w"
              :height="range.space.h"
              :style="{ width: `${range.space.w}px` }"
            />
            <figcaption>
              <span class="range__label">{{ range.space.label }}</span>
              <span class="range__meta">6 places en vis-à-vis · 12 m² d’ombre</span>
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

.range__item img {
  max-width: 100%;
  height: auto;
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
  .range__equation {
    flex-direction: column;
    align-items: center;
  }

  .range__op {
    margin-bottom: 0;
  }
}
</style>
