<script setup lang="ts">
const page = await usePageProduits()
const ranges = computed(() => page.value.modulaire.gammes.map((gamme) => ({
  ...gamme,
  moduleSize: gamme.gamme === 'fotos' ? 256.5 : 242.25,
  titleParts: gamme.titre.split(/(Galiléo|Fotos)/gi),
})))
</script>

<template>
  <section class="modular section">
    <header v-reveal class="modular__header">
      <h2 class="display-h2 modular__title">{{ page.modulaire.titre }}</h2>
      <p class="modular__text">{{ page.modulaire.texte }}</p>
    </header>

    <div>
      <article v-for="range in ranges" :key="range._key" v-reveal class="range">
        <h3 class="range__name"><span v-for="(part, index) in range.titleParts" :key="index" :class="{ 'range__collection': /^(Galiléo|Fotos)$/i.test(part) }">{{ part }}</span></h3>
        <div class="range__equation">
          <template v-for="(mod, i) in range.modules" :key="mod._key">
            <figure class="range__item">
              <div class="range__visual" :style="{ width: `${range.moduleSize}px` }">
                <img :src="img(mod.image, 600)" loading="lazy" :alt="alt(mod.image)" :width="range.moduleSize" :height="range.moduleSize" />
              </div>
              <figcaption>
                <span class="range__label">{{ mod.titre }}</span>
                <span class="range__meta">{{ mod.texte }}</span>
              </figcaption>
            </figure>
            <span class="range__op" aria-hidden="true">{{ i === 0 ? '+' : '=' }}</span>
          </template>
          <figure class="range__item range__item--space">
            <div
              v-for="configuration in range.configurations"
              :key="configuration._key"
              class="range__visual"
              :style="{ width: `${range.moduleSize}px` }"
            >
              <img
                :src="img(configuration.image, 600)"
                loading="lazy"
                :alt="alt(configuration.image)"
                :width="range.moduleSize"
                :height="range.moduleSize"
              />
            </div>
            <figcaption>
              <span class="range__label">{{ range.titreEspace }}</span>
              <span class="range__meta">{{ range.texteEspace }}</span>
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

.range__collection { color: var(--orange-500); }

.range__equation {
  display: flex;
  align-items: center;
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
  max-width: 100%;
  text-align: center;
  overflow-wrap: anywhere;
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
  margin-bottom: 0;
  font-size: 40px;
  color: var(--cream);
  opacity: 0.5;
  flex: none;
}

@media (min-width: 761px) and (max-width: 1200px) {
  .range__equation { gap: 12px; }
  .range__item { flex: 1 1 0; }
  .range__op { width: 32px; font-size: 32px; }
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
