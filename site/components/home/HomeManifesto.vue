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
  // La photo et « Notre objectif » forment un seul élément de mise en page.
  const groups: { tokens: typeof tokens; objectif: boolean; attached?: boolean }[] = []
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!
    const next = tokens[i + 1]
    if ('img' in token && next && 'nouvelleLigne' in next && next.nouvelleLigne) {
      const [first, ...rest] = next.words!
      groups.push({ tokens: [token, { ...next, words: [first!] }], objectif: true, attached: true })
      if (rest.length) groups.push({ tokens: [{ ...next, words: rest }], objectif: false })
      i++
    } else if ('words' in token && token.words?.length && next && 'img' in next && !tokens[i + 2]?.nouvelleLigne) {
      const words = token.words
      if (words.length > 1) groups.push({ tokens: [{ ...token, words: words.slice(0, -1) }], objectif: false })
      groups.push({ tokens: [{ ...token, words: words.slice(-1) }, next], objectif: false, attached: true })
      i++
    } else {
      groups.push({ tokens: [token], objectif: 'nouvelleLigne' in token && Boolean(token.nouvelleLigne) })
    }
  }
  return { groups, total: rank }
})
const groups = computed(() => decoupage.value.groups)
const total = computed(() => decoupage.value.total)

const textEl = ref<HTMLElement | null>(null)
const shown = ref(0)
let mobileMotion: MediaQueryList | undefined

function update() {
  const el = textEl.value
  if (!el) return
  const { top, height } = el.getBoundingClientRect()
  const vh = window.innerHeight
  // 0 quand le haut du texte entre à 90 % de l'écran, 1 quand son bas atteint 75 % :
  // la phrase est entièrement lisible avant que la signature n'apparaisse.
  const progress = (vh * 0.9 - top) / (height + vh * 0.15)
  const visible = Math.round(Math.min(Math.max(progress, 0), 1) * total.value)
  // Le texte déjà lu ne redevient pas flou au retour ou au mouvement de la barre mobile.
  shown.value = mobileMotion?.matches ? Math.max(shown.value, visible) : visible
}

let frame = 0
const onScroll = () => {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(update)
}

onMounted(() => {
  mobileMotion = window.matchMedia('(max-width: 900px), (pointer: coarse)')
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
      <template v-for="(group, i) in groups" :key="i">
        <br v-if="group.objectif" />
        <span :class="group.attached ? 'manifesto__attached' : 'manifesto__group'">
        <template v-for="(token, k) in group.tokens" :key="k">
        <img
          v-if="'img' in token"
          class="pill"
          :class="{ 'is-on': token.rank < shown }"
          :src="token.img"
          loading="lazy"
          alt=""
          :style="{ width: `calc(${token.width} * var(--manifesto-unit))` }"
        />
        <component :is="token.em ? 'em' : 'span'" v-else>
          <template v-for="(word, j) in token.words" :key="j">
            <span class="word" :class="{ 'is-on': word.rank < shown }">{{ word.w }}</span>{{ j < token.words.length - 1 ? ' ' : '' }}
          </template>
        </component>{{ k < group.tokens.length - 1 ? ' ' : '' }}
        </template>
        </span>{{ i < groups.length - 1 ? ' ' : '' }}
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
@font-face { font-family:'Bricolage Manifesto'; font-style:normal; font-weight:400; font-display:swap; src:url('/fonts/bricolage-regular.woff2') format('woff2'); }
@font-face { font-family:'Bricolage Manifesto'; font-style:normal; font-weight:500; font-display:swap; src:url('/fonts/bricolage-medium.woff2') format('woff2'); }

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
  text-align: center;
  font-family: 'Bricolage Manifesto', var(--font-display);
  font-weight: 500;
  font-size: calc(52 * var(--manifesto-unit));
  line-height: 1.55;
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

.manifesto__group { display: inline; }
.manifesto__attached { display: inline-block; white-space: nowrap !important; }

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
  display: inline-block;
  vertical-align: middle;
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

@media (hover: hover) and (pointer: fine) {
  .pill.is-on:hover {
    transform: scale(1.6);
    position: relative;
    z-index: 1;
  }
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
  .manifesto__attached {
    display: inline;
    white-space: normal !important;
  }

  .manifesto__attached .pill {
    display: block;
    margin: 16px auto;
  }

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
