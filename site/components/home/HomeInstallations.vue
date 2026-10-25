<script setup lang="ts">
// Bandeaux en noir et blanc, qui s'ouvrent et passent en couleur au survol.
const installations = [
  {
    title: 'Fotos — premier banc installé',
    range: 'Gamme Fotos',
    src: '/images/bandeau-hover-fotos-premier-banc-installe.jpg',
    to: '#fotos',
  },
  {
    title: 'Galiléo blanc — banc brumisé',
    range: 'Gamme Galiléo',
    src: '/images/bandeau-galileo-blanc-banc-brumise.jpg',
    to: '#galileo',
  },
  {
    title: 'Galiléo — premiers usagers',
    range: 'Gamme Galiléo',
    src: '/images/bandeau-galileo-premiers-usagers.jpg',
    to: '#galileo',
  },
  { title: 'Fotos — vue de face', range: 'Gamme Fotos', src: '/images/bandeau-fotos-vue-de-face.png', to: '#fotos' },
]

const gallery = [
  { src: '/images/photo-structure-aluminium-brun.jpg', caption: 'Structure aluminium brun' },
  { src: '/images/photo-une-pause-a-lombre.jpg', caption: 'Une pause à l’ombre' },
  { src: '/images/photo-grimpantes-et-fleurs.jpg', caption: 'Grimpantes et fleurs' },
  { src: '/images/photo-la-pergola-vue-den-bas.jpg', caption: 'La pergola, vue d’en bas' },
  { src: '/images/photo-assise-en-bois-kebony.jpg', caption: 'Assise en bois Kebony' },
]

const open = ref(0)
</script>

<template>
  <section id="realisations" class="installs section">
    <header v-reveal class="installs__header">
      <div class="installs__intro">
        <h2 class="display-h2 installs__title">Nos premières installations.</h2>
        <p class="body-l installs__text">
          Abri Toi est une jeune entreprise : Voici nos prototypes, tests et projets en cours. Les premières installations
          en usage arrivent.
        </p>
      </div>
      <UiLink tone="dark" label="Toutes les réalisations" to="#realisations" />
    </header>

    <ul v-reveal="100" class="bands">
      <li
        v-for="(item, i) in installations"
        :key="item.title"
        class="band"
        :class="{ 'band--open': open === i }"
        @mouseenter="open = i"
        @focusin="open = i"
      >
        <img :src="item.src" alt="" class="band__img" />
        <div class="band__shade" />
        <div class="band__content">
          <h3 class="display-h3 band__title">{{ item.title }}</h3>
          <div class="band__actions">
            <span class="band__tag">{{ item.range }}</span>
            <UiLink tone="dark" :to="item.to" />
          </div>
        </div>
      </li>
    </ul>

    <div class="gallery">
      <p v-reveal class="gallery__label">FOTOS · EN DÉTAIL</p>
      <ul class="gallery__grid">
        <li v-for="(photo, i) in gallery" :key="photo.src" v-reveal="(i % 4) * 90">
          <figure class="gallery__item">
            <div class="gallery__frame">
              <img :src="photo.src" :alt="photo.caption" loading="lazy" />
            </div>
            <figcaption>{{ photo.caption }}</figcaption>
          </figure>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.installs {
  display: flex;
  flex-direction: column;
  gap: 48px;
  padding-top: 112px;
  padding-bottom: 112px;
  background: var(--brown-900);
}

.installs__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
}

.installs__intro {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.installs__title {
  max-width: 680px;
  color: var(--cream);
}

.installs__text {
  max-width: 560px;
  color: var(--sand);
}

/* Bandeaux */
.bands {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.band {
  position: relative;
  height: 150px;
  overflow: hidden;
  border-radius: 16px;
  background: #2c1a14;
  transition: height 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.band--open {
  height: 260px;
}

.band__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1);
  transition: filter 0.5s ease;
}

.band--open .band__img {
  filter: grayscale(0);
}

.band__shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(23, 15, 13, 0.8), rgba(23, 15, 13, 0.35) 65%);
  transition: background 0.5s;
}

.band--open .band__shade {
  background: linear-gradient(to right, rgba(23, 15, 13, 0.8), rgba(23, 15, 13, 0.05) 65%);
}

.band__content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 0 32px;
  transition: padding 0.5s;
}

.band--open .band__content {
  align-items: flex-end;
  padding-bottom: 28px;
}

.band__title {
  color: var(--paper);
}

.band__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: none;
}

.band__tag {
  padding: 6px 12px;
  border: 1px solid var(--paper);
  border-radius: 999px;
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: 12px;
  line-height: 1.3;
  letter-spacing: 0.06em;
  color: var(--paper);
}

/* Galerie */
.gallery {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.gallery__label {
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: 12px;
  letter-spacing: 0.08em;
  color: #e8ded1;
}

.gallery__grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.gallery__item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
}

.gallery__frame {
  height: 328px;
  overflow: hidden;
  border-radius: 8px;
}

.gallery__frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.gallery__item:hover img {
  transform: scale(1.05);
}

.gallery__item figcaption {
  font-size: 14px;
  color: #e8ded1;
}

@media (max-width: 1024px) {
  .installs__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .gallery__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .band__tag {
    display: none;
  }
}

@media (max-width: 640px) {
  .band__content {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 12px;
    padding: 0 20px;
  }

  .band--open .band__content {
    align-items: flex-start;
    justify-content: flex-end;
  }

  .band__title {
    font-size: 22px;
  }

  .gallery__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .gallery__frame {
    height: 220px;
  }
}
</style>
