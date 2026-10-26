<script setup lang="ts">
// Compteur animé : le premier nombre trouvé dans `value` monte de 0 à sa valeur quand le bloc
// entre dans l'écran. Le texte autour (« °C », « jours »…) et le format d'origine sont conservés.
// Rendu serveur et sans JS : la valeur finale s'affiche telle quelle.
const props = withDefaults(
  defineProps<{
    value: string
    delay?: number
    duration?: number
  }>(),
  { delay: 0, duration: 1600 },
)

// Nombre avec séparateur de milliers (espace, insécable, fine insécable) et décimales éventuelles.
const NUMBER = /\d{1,3}(?:([   .])\d{3})+(?:([,.])(\d+))?|\d+(?:([,.])(\d+))?/

const parsed = computed(() => {
  const match = props.value.match(NUMBER)
  if (!match || match.index === undefined) return null
  const [raw, groupSep, decSepA, decA, decSepB, decB] = match
  const decimalSep = decSepA ?? decSepB ?? ','
  const decimals = (decA ?? decB ?? '').length
  const digits = raw.replace(new RegExp(`[^\\d${decimalSep === '.' ? '\\.' : ','}]`, 'g'), '')
  return {
    before: props.value.slice(0, match.index),
    after: props.value.slice(match.index + raw.length),
    target: Number(digits.replace(',', '.')),
    groupSep: groupSep ?? '',
    decimalSep,
    decimals,
  }
})

function format(n: number) {
  const p = parsed.value!
  const [int, dec] = n.toFixed(p.decimals).split('.')
  const grouped = p.groupSep ? int.replace(/\B(?=(\d{3})+(?!\d))/g, p.groupSep) : int
  return p.before + grouped + (dec ? p.decimalSep + dec : '') + p.after
}

const display = ref(props.value)
const root = ref<HTMLElement>()
let observer: IntersectionObserver | undefined
let frame = 0

function animate() {
  const p = parsed.value
  if (!p) return
  let start = 0
  const step = (now: number) => {
    start ||= now
    const t = Math.min((now - start) / props.duration, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    display.value = format(p.target * eased)
    if (t < 1) frame = requestAnimationFrame(step)
  }
  setTimeout(() => (frame = requestAnimationFrame(step)), props.delay)
}

onMounted(() => {
  if (!parsed.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  display.value = format(0)
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      observer?.disconnect()
      animate()
    },
    { rootMargin: '0px 0px -10% 0px' },
  )
  observer.observe(root.value!)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(frame)
})
</script>

<template>
  <span ref="root" class="count">
    <!-- La valeur finale, invisible, réserve la largeur : pas de saut de mise en page pendant le comptage. -->
    <span class="count__ghost" aria-hidden="true">{{ value }}</span>
    <span class="count__value" :aria-label="value">{{ display }}</span>
  </span>
</template>

<style scoped>
.count {
  display: inline-grid;
  font-variant-numeric: tabular-nums;
}

.count__ghost,
.count__value {
  grid-area: 1 / 1;
}

.count__ghost {
  visibility: hidden;
}
</style>
