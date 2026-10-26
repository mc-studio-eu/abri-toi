<script setup lang="ts">
// Révélation mot à mot au scroll façon Brickwise : chaque mot passe de flou/estompé à net.
const page = await usePageAccueil()
const manifeste = computed(() => page.value.manifeste)

// Chaque mot et chaque pastille reçoit un rang dans l'ordre de lecture.
const decoupage = computed(() => {
  let rank = 0
  const tokens = manifeste.value.morceaux.map((part) =>
    'image' in part
      ? { img: img(part.image, 400), width: part.largeur, rank: rank++ }
      : { em: part.accent, words: part.texte.split(' ').map((w) => ({ w, rank: rank++ })) },
  )
  return { tokens, total: rank }
})
const tokens = computed(() => decoupage.value.tokens)
const total = computed(() => decoupage.value.total)

const textEl = ref<HTMLElement | null>(null)
const shown = ref(0)

function update() {
  const el = textEl.value
  if (!el) return
  const { top, height } = el.getBoundingClientRect()
  const vh = window.innerHeight
  // 0 quand le haut du texte entre à 90 % de l'écran, 1 quand son bas atteint 75 % :
  // la phrase est entièrement lisible avant que la signature n'apparaisse.
  const progress = (vh * 0.9 - top) / (height + vh * 0.15)
  shown.value = Math.round(Math.min(Math.max(progress, 0), 1) * total.value)
}

let frame = 0
const onScroll = () => {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(update)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    shown.value = total.value
    return
  }
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<template>
  <section class="manifesto section">
    <p ref="textEl" class="manifesto__text">
      <template v-for="(token, i) in tokens" :key="i">
        <img
          v-if="'img' in token"
          class="pill"
          :class="{ 'is-on': token.rank < shown }"
          :src="token.img"
          alt=""
          :style="{ width: `${token.width}px` }"
        />
        <component :is="token.em ? 'em' : 'span'" v-else>
          <template v-for="(word, j) in token.words" :key="j">
            <span class="word" :class="{ 'is-on': word.rank < shown }">{{ word.w }}</span>{{ j < token.words.length - 1 ? ' ' : '' }}
          </template>
        </component>
      </template>
    </p>

    <div class="manifesto__signature" :class="{ 'is-on': shown >= total }">
      <img src="/images/ellipse.png" alt="" width="48" height="48" />
      <div>
        <p class="manifesto__name">{{ manifeste.signatureNom }}</p>
        <p class="manifesto__role">{{ manifeste.signatureRole }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.manifesto {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 56px;
  padding-top: 120px;
  padding-bottom: 60px;
  padding-inline: max(120px, calc((100% - var(--page-max)) / 2 + 120px));
}

.manifesto__text {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px 16px;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 64px;
  line-height: 1.15;
  letter-spacing: -0.03em;
  color: var(--brown-900);
}

.manifesto__text span,
.manifesto__text em {
  white-space: nowrap;
}

.manifesto__text em {
  font-style: normal;
  font-weight: 400;
  font-size: 72px;
  letter-spacing: -0.01em;
  color: var(--orange-600);
}

.word {
  display: inline-block;
  opacity: 0.15;
  filter: blur(3px);
  transition:
    opacity 0.5s var(--ease-out),
    filter 0.5s var(--ease-out);
}

.pill {
  height: 72px;
  border-radius: 999px;
  object-fit: cover;
  opacity: 0.15;
  filter: blur(3px);
  transform: scale(0.85);
  transition:
    opacity 0.5s var(--ease-out),
    filter 0.5s var(--ease-out),
    transform 0.4s var(--ease-out);
}

.word.is-on,
.pill.is-on {
  opacity: 1;
  filter: none;
}

.pill.is-on {
  transform: none;
}

.pill.is-on:hover {
  transform: scale(1.6);
  position: relative;
  z-index: 1;
}

.manifesto__signature {
  display: flex;
  align-items: center;
  gap: 14px;
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 0.7s var(--ease-out),
    transform 0.7s var(--ease-out);
}

.manifesto__signature.is-on {
  opacity: 1;
  transform: none;
}

.manifesto__signature img {
  border-radius: 50%;
}

.manifesto__name {
  font-weight: 500;
  font-size: 15px;
  margin-bottom: 2px;
}

.manifesto__role {
  font-size: 14px;
  color: var(--brown-700);
}

@media (max-width: 1024px) {
  .manifesto {
    padding-inline: var(--gutter);
  }

  .manifesto__text {
    font-size: 44px;
  }

  .manifesto__text em {
    font-size: 50px;
  }

  .pill {
    height: 52px;
  }
}

@media (max-width: 640px) {
  .manifesto {
    padding-top: 80px;
  }

  .manifesto__text {
    font-size: 32px;
    gap: 6px 10px;
  }

  .manifesto__text em {
    font-size: 36px;
  }

  .pill {
    height: 40px;
    width: auto !important;
    aspect-ratio: 1.8;
  }
}
</style>
