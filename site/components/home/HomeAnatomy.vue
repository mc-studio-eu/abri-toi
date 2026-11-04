<script setup lang="ts">
type GammeId = 'galileo' | 'fotos'
const props = defineProps<{ gammeId: GammeId }>()
const page = await usePageAccueil()
const solution = computed(() => page.value.solution)

// Photographies et cadrages exportés du composant Figma « Choisir sa gamme ».
const photos = {
  galileo: [
    { src: 'galileo-structure', alt: 'La structure en aluminium de Galiléo et son assise en bois' },
    { src: 'galileo-roof', alt: 'Détail de la toiture en aluminium perforé de Galiléo' },
    { src: 'galileo-misting', alt: 'Une buse de brumisation intégrée au montant de Galiléo' },
    { src: 'galileo-installation', alt: 'Un abri Galiléo installé sur une terrasse' },
  ],
  fotos: [
    { src: 'fotos-structure', alt: 'Une personne assise sous la structure et la jardinière Fotos' },
    { src: 'fotos-roof', alt: 'Les plantes grimpantes sur le filet de la toiture Fotos' },
    { src: 'fotos-vegetation', alt: 'La végétation et le bac jardinière Fotos' },
    { src: 'fotos-installation', alt: 'Un abri Fotos avec sa jardinière installé dans un jardin' },
  ],
}
const steps = computed(() => {
  const gamme = solution.value[props.gammeId]
  const common = solution.value.communes ?? []
  const roof = props.gammeId === 'fotos' ? solution.value.fotos.toiture ?? common[1] : common[1]
  return [common[0], roof, ...(gamme.etapes ?? [])].filter(Boolean).map((copy, index) => ({
    ...copy,
    ...photos[props.gammeId][index],
    largeWidth: photos[props.gammeId][index]?.src === 'fotos-vegetation' ? 941 : 1440,
    label: index === 0 ? '01' : index === 1 ? `02 · ${props.gammeId === 'fotos' ? 'Fotos' : 'Galiléo'}` : `0${index + 1} · ${props.gammeId === 'fotos' ? 'Fotos' : 'Galiléo'}`,
  }))
})

const track = ref<HTMLElement>()
const animated = ref(false)
const flowAnimated = ref(false)
const activeStep = ref(0)
const progress = ref(0)
const reveals = ref<number[]>([])
let frame = 0
let motionQuery: MediaQueryList | undefined
let mobileQuery: MediaQueryList | undefined
let contentObserver: ResizeObserver | undefined

function updateScroll() {
  const el = track.value
  if (!el) return
  if (flowAnimated.value) {
    reveals.value = Array.from(el.querySelectorAll<HTMLElement>('.anatomy__row'), row =>
      Math.min(Math.max((window.innerHeight - row.getBoundingClientRect().top) / (window.innerHeight * .5), 0), 1))
  }
  if (!animated.value) return
  const panel = el.querySelector<HTMLElement>('.anatomy')!
  const top = mobileQuery?.matches ? 96 : 0
  const distance = el.offsetHeight - panel.offsetHeight
  const ratio = distance > 0 ? Math.min(Math.max((top - el.getBoundingClientRect().top) / distance, 0), 0.9999) : 0
  progress.value = ratio * steps.value.length
  activeStep.value = Math.floor(progress.value)
}
function schedule() {
  if (frame) return
  frame = requestAnimationFrame(() => { frame = 0; updateScroll() })
}
function syncMotion() {
  const allowed = motionQuery?.matches ?? false
  const mobile = mobileQuery?.matches ?? false
  // Long CMS copy must stay in the document flow if a whole card cannot fit.
  const available = (window.visualViewport?.height ?? window.innerHeight) - 96 - 32
  const fits = !mobile || Array.from(track.value?.querySelectorAll<HTMLElement>('.anatomy__row') ?? []).every(row => {
    const copy = row.querySelector<HTMLElement>('.anatomy__copy')!
    const view = row.querySelector<HTMLElement>('.anatomy__view')!
    return copy.scrollHeight + view.offsetHeight + 16 <= available
  })
  animated.value = allowed && fits
  flowAnimated.value = allowed && mobile && !fits
  nextTick(schedule)
}
function observeContent() {
  if (!contentObserver) return
  contentObserver.disconnect()
  track.value?.querySelectorAll('.anatomy__copy, .anatomy__view').forEach(el => contentObserver?.observe(el))
  syncMotion()
}
watch(steps, observeContent, { flush: 'post' })
onMounted(() => {
  // On small landscape screens, retain the readable, naturally scrolling layout.
  motionQuery = window.matchMedia('(prefers-reduced-motion: no-preference) and (min-width: 901px) and (min-height: 550px), (prefers-reduced-motion: no-preference) and (max-width: 900px) and (orientation: portrait) and (min-height: 550px)')
  mobileQuery = window.matchMedia('(max-width: 900px)')
  motionQuery.addEventListener('change', syncMotion)
  mobileQuery.addEventListener('change', syncMotion)
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', syncMotion)
  window.visualViewport?.addEventListener('resize', syncMotion)
  contentObserver = new ResizeObserver(syncMotion)
  observeContent()
})
onBeforeUnmount(() => {
  motionQuery?.removeEventListener('change', syncMotion)
  mobileQuery?.removeEventListener('change', syncMotion)
  contentObserver?.disconnect()
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', syncMotion)
  window.visualViewport?.removeEventListener('resize', syncMotion)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <div ref="track" class="anatomy-track" :class="{ 'anatomy-track--animated': animated, 'anatomy-track--flow-animated': flowAnimated }">
  <div class="anatomy" :style="{ '--fill': progress - activeStep }">
    <div v-for="(step, index) in steps" :key="`${gammeId}-${index}`" class="anatomy__row" :style="{ '--reveal': reveals[index] ?? 0 }" :class="{ 'anatomy__row--active': index === activeStep, 'anatomy__row--done': index < activeStep }" :aria-hidden="animated && index !== activeStep ? true : undefined">
      <div class="anatomy__copy">
        <span class="label-mono anatomy__number">{{ step.label }}</span>
        <h3 class="display-h3 anatomy__title">{{ step.titre }}</h3>
        <p class="body-m anatomy__text">{{ step.texte }}</p>
      </div>
      <figure class="anatomy__view">
        <img :src="`/images/figma-home/anatomy/${step.src}-720.webp`" :srcset="`/images/figma-home/anatomy/${step.src}-720.webp 720w, /images/figma-home/anatomy/${step.src}-1440.webp ${step.largeWidth}w`" sizes="(min-width: 1440px) 720px, (min-width: 761px) 56.25vw, calc(100vw - 40px)" :alt="step.alt" width="720" height="760" loading="lazy" class="anatomy__photo" />
        <img v-if="gammeId === 'galileo' && index === 3" src="/images/figma-home/anatomy/galileo-anchor-zoom-720.webp" alt="Détail de l’ancrage de Galiléo au sol" width="245" height="245" loading="lazy" class="anatomy__zoom" />
      </figure>
    </div>
  </div>
  </div>
</template>

<style scoped>
.anatomy { display:flex; flex-direction:column; gap:56px; }
.anatomy__row { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,720px); align-items:center; gap:56px; }
.anatomy__copy { display:flex; flex-direction:column; gap:14px; padding:4px 0 4px 24px; border-left:2px solid var(--accent-text); }
.anatomy__number { color:var(--accent-num); }
.anatomy__title { max-width:470px; color:var(--accent-text); }
.anatomy__text { max-width:450px; color:var(--brown-700); }
.anatomy__view { position:relative; width:100%; aspect-ratio:720 / 760; margin:0; overflow:hidden; border-radius:8px; background:var(--paper); }
.anatomy__photo { display:block; width:100%; height:100%; object-fit:cover; }
.anatomy__zoom { position:absolute; right:3.333%; bottom:3.158%; width:34.028%; height:auto;  border-radius:50%; box-shadow:0 8px 24px rgba(63,38,29,.18); }
@media(max-width:1200px) { .anatomy__row { grid-template-columns:minmax(0,1fr) minmax(0,56.25%); gap:32px; }.anatomy__title { font-size:28px; } }
@media(max-width:760px) { .anatomy { gap:48px; }.anatomy__row { grid-template-columns:1fr; gap:24px; }.anatomy__copy { padding-left:20px; }.anatomy__title { font-size:28px; }.anatomy__view { max-height:720px; } }

/* Each scroll segment advances the pinned photograph and its accompanying copy. */
.anatomy-track--animated { height:340svh; }
.anatomy-track--animated .anatomy { position:sticky; top:0; height:100svh; box-sizing:border-box; padding-block:96px 24px; display:grid; gap:0; }
.anatomy-track--animated .anatomy__row { grid-area:1 / 1; grid-template-columns:minmax(0,1fr) min(720px, calc((100svh - 120px) * 720 / 760), 52vw); opacity:0; pointer-events:none; transition:opacity .45s var(--ease-out); }
.anatomy-track--animated .anatomy__row--active { opacity:1; pointer-events:auto; }
.anatomy-track--animated .anatomy__copy { position:relative; border-color:var(--line); transform:translateY(24px); transition:transform .6s var(--ease-out); }
.anatomy-track--animated .anatomy__copy::before { content:''; position:absolute; left:-2px; top:0; bottom:0; width:2px; background:var(--accent-text); transform:scaleY(var(--fill)); transform-origin:top; }
.anatomy-track--animated .anatomy__row--done .anatomy__copy { transform:translateY(-24px); }
.anatomy-track--animated .anatomy__row--active .anatomy__copy { transform:none; }
@media (min-width:901px) and (max-height:820px) {
  .anatomy-track--animated .anatomy__title { font-size:30px; }
  .anatomy-track--animated .anatomy__text { font-size:16px; }
}
@media (max-width:900px) {
  .anatomy { gap:36px; }
  .anatomy__row, .anatomy-track--animated .anatomy__row { display:flex; flex-direction:column-reverse; justify-content:flex-end; gap:16px; }
  .anatomy__view, .anatomy-track--animated .anatomy__view { flex:none; width:100%; aspect-ratio:16 / 9; max-height:300px; }
  .anatomy__copy, .anatomy-track--animated .anatomy__copy { flex:none; align-self:stretch; gap:10px; padding:2px 0 2px 16px; }
  .anatomy__title, .anatomy-track--animated .anatomy__title { max-width:none; font-size:22px; }
  .anatomy__text, .anatomy-track--animated .anatomy__text { max-width:none; font-size:16px; }
  .anatomy-track--animated { height:268dvh; }
  .anatomy-track--animated .anatomy { top:96px; height:calc(100dvh - 96px); padding-block:12px 20px; }
  .anatomy-track--flow-animated .anatomy__row { opacity:calc(.65 + var(--reveal) * .35); transform:translateY(calc((1 - var(--reveal)) * 20px)); }
}
</style>
