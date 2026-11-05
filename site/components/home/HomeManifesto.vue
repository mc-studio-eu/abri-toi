<script setup lang="ts">
// Révélation mot à mot au scroll façon Brickwise : chaque mot passe de flou/estompé à net.
const page = await usePageAccueil()
const manifeste = computed(() => page.value.manifeste)

// Chaque mot et chaque pastille reçoit un rang dans l'ordre de lecture.
const decoupage = computed(() => {
  let rank = 0
  const tokens = manifeste.value.morceaux.map((value) => {
    // Sanity's explicit union type wins over stale fields from older content.
    const part = value as typeof value & { _type?: string }
    return (part._type ? part._type === 'morceauTexte' : 'texte' in part) && 'texte' in part
      ? { em: part.accent, nouvelleLigne: /^Notre objectif\b/i.test(part.texte.trim()), words: part.texte.split(' ').map((w) => ({ w, rank: rank++ })) }
      : { img: img('image' in part ? part.image : null, 400), width: 'largeur' in part ? part.largeur : 132, rank: rank++ }
  })
  // Le saut de ligne précède aussi la photo qui introduit l'objectif.
  const objectif = manifeste.value.morceaux.findIndex((part) =>
    'texte' in part && /^Notre objectif\b/i.test(part.texte.trim()),
  )
  if (objectif > 0 && 'img' in tokens[objectif - 1]!) {
    Object.assign(tokens[objectif - 1]!, { nouvelleLigne: true })
    Object.assign(tokens[objectif]!, { nouvelleLigne: false })
  }
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
        <span v-if="'nouvelleLigne' in token && token.nouvelleLigne" class="manifesto__break" aria-hidden="true" />
        <img
          v-if="'img' in token"
          class="pill"
          :class="{ 'is-on': token.rank < shown }"
          :src="token.img"
          alt=""
          :style="{ width: `calc(${token.width} * var(--manifesto-unit))` }"
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
@font-face { font-family:'Bricolage Manifesto'; font-style:normal; font-weight:400; font-display:swap; src:url('/fonts/bricolage-regular.ttf') format('truetype'); }
@font-face { font-family:'Bricolage Manifesto'; font-style:normal; font-weight:500; font-display:swap; src:url('/fonts/bricolage-medium.ttf') format('truetype'); }

.manifesto {
  --manifesto-unit: min(1px, calc((100vw - 240px) / 1200));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 56px;
  padding-top: 60px;
  padding-bottom: 60px;
  padding-inline: max(120px, calc((100% - var(--page-max)) / 2 + 120px));
}

.manifesto__text {
  max-width: 100%;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: calc(10 * var(--manifesto-unit)) calc(16 * var(--manifesto-unit));
  font-family: 'Bricolage Manifesto', var(--font-display);
  font-weight: 500;
  font-size: calc(52 * var(--manifesto-unit));
  line-height: 1.15;
  letter-spacing: -0.03em;
  font-variation-settings: "opsz" 14, "wdth" 100;
  color: var(--brown-900);
}

.manifesto__text > span,
.manifesto__text > em {
  max-width: 100%;
  white-space: normal;
  text-align: center;
}

.manifesto__text .word {
  white-space: nowrap;
}

/* L'objectif commence la dernière ligne de la composition sur ordinateur. */
.manifesto__break {
  flex-basis: 100%;
  height: 0;
  margin-bottom: calc(-10 * var(--manifesto-unit));
}

.manifesto__text em {
  font-style: normal;
  font-weight: 400;
  font-size: calc(52 * var(--manifesto-unit));
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
  height: calc(72 * var(--manifesto-unit));
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
  .manifesto__break {
    display: none;
  }

  .manifesto {
    --manifesto-unit: 1px;
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
    padding-bottom: 80px;
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
