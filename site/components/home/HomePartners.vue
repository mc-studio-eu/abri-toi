<script setup lang="ts">
const logos = [
  { src: '/images/logo-dargaisse.png', alt: 'Dargaisse', w: 136, h: 52 },
  { src: '/images/logo-kebony.png', alt: 'Kebony', w: 46, h: 76 },
  { src: '/images/logo-larbaletier.png', alt: 'Larbaletier', w: 187, h: 36 },
  { src: '/images/logo-bro-brumisation.png', alt: 'B.R.O Brumisation', w: 112, h: 58 },
  { src: '/images/logo-filae.png', alt: 'Filae', w: 164, h: 44 },
]
</script>

<template>
  <section class="partners section" aria-labelledby="partners-title">
    <hr class="partners__rule" />
    <h2 id="partners-title" class="label-mono partners__title">Nos partenaires industriels</h2>
    <!-- Défilement continu façon Brickwise : la liste est doublée pour boucler sans saut. -->
    <div class="marquee">
      <ul v-for="copy in 2" :key="copy" class="marquee__track" :aria-hidden="copy === 2 ? 'true' : undefined">
        <li v-for="logo in logos" :key="logo.alt">
          <img
            :src="logo.src"
            :alt="copy === 1 ? logo.alt : ''"
            :width="logo.w"
            :height="logo.h"
            :style="{ width: `${logo.w}px`, height: `${logo.h}px` }"
          />
        </li>
      </ul>
    </div>
    <hr class="partners__rule" />
  </section>
</template>

<style scoped>
.partners {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding-top: 32px;
  padding-bottom: 56px;
}

.partners__rule {
  width: 100%;
  height: 1px;
  margin: 0;
  border: 0;
  background: var(--line);
}

.partners__title {
  color: var(--brown-700);
}

.marquee {
  display: flex;
  width: 100%;
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
}

.marquee__track {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  animation: marquee 40s linear infinite;
}

.marquee:hover .marquee__track {
  animation-play-state: paused;
}

.marquee__track li {
  display: flex;
  align-items: center;
  height: 76px;
  padding-inline: 48px;
}

.marquee__track img {
  object-fit: contain;
  filter: grayscale(1);
  opacity: 0.75;
  transition:
    filter 0.4s var(--ease-out),
    opacity 0.4s var(--ease-out);
}

.marquee__track li:hover img {
  filter: none;
  opacity: 1;
}

@keyframes marquee {
  to {
    transform: translateX(-100%);
  }
}

@media (max-width: 640px) {
  .marquee__track li {
    padding-inline: 28px;
  }
}
</style>
