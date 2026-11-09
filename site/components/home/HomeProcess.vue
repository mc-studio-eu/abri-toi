<script setup lang="ts">
const page = await usePageAccueil()
const process = computed(() => page.value.process)
const etape = (i: number) => process.value.etapes?.[i] ?? { titre: '', texte: '' }
const thermoGradientId = `thermo-${useId()}`
const thermoStops = [8, 334, 660, 986]
const temps = [
  { value: 38, label: 'Ressenti au soleil', left: 0, color: '#b8321a' },
  { value: 34, label: 'On étudie l’ombre', left: 354, color: 'var(--orange-500)' },
  { value: 30, label: 'L’ombre se dessine', left: 680, color: '#8c6a44' },
  { value: 26, label: 'Installé · il fait bon', left: 1004, color: 'var(--sage-500)', big: true },
]
// Une seule progression pilote la jauge et les cartes : aucun délai indépendant.
const stepsElement = ref<HTMLOListElement | null>(null)
const progress = ref(1)
const stepStyle = (index: number) => {
  const visibility = Math.min(1, Math.max(0, (progress.value - thermoStops[index] / 1280) / .07))
  return { opacity: visibility, transform: `translateY(${(1 - visibility) * 12}px)` }
}
let cleanupMotion = () => {}
onMounted(() => {
  const motion = window.matchMedia('(min-width: 1025px) and (prefers-reduced-motion: no-preference)')
  let frame = 0
  const update = () => {
    frame = 0
    if (!stepsElement.value || !motion.matches) return
    const top = stepsElement.value.getBoundingClientRect().top
    const viewport = window.innerHeight
    // Étaler les quatre étapes sur 70 % de la hauteur de l'écran.
    // Le remplissage s'arrête avec le scroll et suit aussi le retour en arrière.
    progress.value = Math.min(1, Math.max(0, (viewport * .85 - top) / (viewport * .70)))
  }
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update)
  }
  const stopWaiting = () => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  }
  const configure = () => {
    cancelAnimationFrame(frame)
    frame = 0
    stopWaiting()
    if (!motion.matches) {
      progress.value = 1
      return
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()
  }
  motion.addEventListener('change', configure)
  configure()
  cleanupMotion = () => {
    cancelAnimationFrame(frame)
    stopWaiting()
    motion.removeEventListener('change', configure)
  }
})
onBeforeUnmount(() => cleanupMotion())
const proposalRows = [['2 × Galiléo Banc', 'face à face'], ['Ombre', '12 m²'], ['Orientation', 'sud-ouest']]
</script>

<template>
  <section class="process section">
    <header v-reveal class="process__header">
      <h2 class="process__title">{{ process.titre }}<br />{{ process.titreSuite }}</h2>
      <p v-if="process.note" class="label-mono process__note">{{ process.note }}</p>
    </header>

    <div class="thermo" aria-hidden="true">
      <svg class="thermo__rule" viewBox="0 0 1280 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient :id="thermoGradientId" x1="0" y1="0" x2="1280" y2="0" gradientUnits="userSpaceOnUse">
            <stop stop-color="#b8321a" />
            <stop offset=".35" stop-color="#ec7c26" />
            <stop offset=".7" stop-color="#d9c3a5" />
            <stop offset="1" stop-color="#5d6b4c" />
          </linearGradient>
        </defs>
        <path v-for="tick in 81" :key="tick" :d="`M${(tick - 1) * 16} 80v${(tick - 1) % 5 === 0 ? 14 : 8}`" stroke="var(--brown-900)" :stroke-opacity="(tick - 1) % 5 === 0 ? .35 : .18" />
        <rect y="62" width="1280" height="10" rx="5" fill="var(--line)" />
        <circle v-for="stop in thermoStops" :key="stop" :cx="stop" cy="67" r="11" fill="var(--sand)" stroke="var(--cream)" stroke-width="4" />
        <g class="thermo__fill" :style="{ clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)` }">
          <rect y="62" width="1280" height="10" rx="5" :fill="`url(#${thermoGradientId})`" />
          <circle v-for="(stop, i) in thermoStops" :key="stop" :cx="stop" cy="67" r="11" :fill="temps[i].color" stroke="var(--cream)" stroke-width="4" />
        </g>
        <circle cx="8" cy="67" r="11" fill="#b8321a" stroke="var(--cream)" stroke-width="4" />
      </svg>
      <div v-for="t in temps" :key="t.value" class="thermo__mark" :class="{ 'thermo__mark--big': t.big }" :style="{ left: `${(t.left / 1280) * 100}%` }">
        <span class="thermo__value" :style="{ color: t.color }">{{ t.value }}°</span><span class="thermo__label">{{ t.label }}</span>
      </div>
    </div>

    <ol ref="stepsElement" class="steps">
      <li class="step" :style="stepStyle(0)">
        <div class="step__visual"><img :src="img(process.photoContact, 800)" :srcset="imgSrcset(process.photoContact, 1200)" sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 1024px) calc((100vw - 104px) / 2), (max-width: 1390px) calc((100vw - 256px) / 4), 240px" loading="lazy" alt="" class="step__photo" /></div>
        <h3 class="step__title">{{ etape(0).titre }}</h3><p class="step__text">{{ etape(0).texte }}</p>
      </li>
      <li class="step" :style="stepStyle(1)">
        <div class="step__visual step__visual--paper">
          <img src="/images/plan-solaire.svg" alt="" width="302" height="201" class="solar__plan" />
          <span class="solar__txt" style="left:92.33%;top:-0.5%;color:var(--brown-900)">N</span><span class="solar__txt" style="left:83.67%;top:48.5%">9H</span><span class="solar__txt" style="left:53%;top:68.5%">13H</span><span class="solar__txt" style="left:9.67%;top:48.5%">17H</span><span class="solar__txt solar__txt--muted" style="left:19%;top:45.5%">OMBRE 9H</span><span class="solar__txt solar__txt--muted" style="left:62.33%;top:45.5%">OMBRE 17H</span>
        </div>
        <h3 class="step__title">{{ etape(1).titre }}</h3><p class="step__text">{{ etape(1).texte }}</p>
      </li>
      <li class="step" :style="stepStyle(2)">
        <div class="step__visual step__visual--sand"><div class="proposal__back" /><div class="proposal">
          <div class="proposal__head"><span class="proposal__kind">PROPOSITION</span><span class="proposal__num">N° 026</span></div>
          <div class="proposal__plan"><img src="/images/illustration-iso.svg" alt="" width="176" height="117" /></div><p class="proposal__place">Place du Marché</p>
          <div v-for="row in proposalRows" :key="row[0]" class="proposal__row"><span>{{ row[0] }}</span><strong>{{ row[1] }}</strong></div><span class="proposal__file">Fiche technique.pdf</span>
        </div></div>
        <h3 class="step__title step__title--conclusion">{{ etape(2).titre.replace(/^Marché\s+/, 'Marché\n') }}</h3><p class="step__text">{{ etape(2).texte }}</p>
      </li>
      <li class="step" :style="stepStyle(3)">
        <div class="step__visual"><img :src="img(process.photoPose, 800)" :srcset="imgSrcset(process.photoPose, 1200)" sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 1024px) calc((100vw - 104px) / 2), (max-width: 1390px) calc((100vw - 256px) / 4), 240px" loading="lazy" alt="" class="step__photo step__photo--plain" /><div class="step__tint" /><span class="step__badge">Installé · à l’ombre</span></div>
        <h3 class="step__title">{{ etape(3).titre }}</h3><p class="step__text">{{ etape(3).texte }}</p>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.process { display:flex; flex-direction:column; gap:56px; padding-top:160px; padding-bottom:46px; }
.process__header { display:flex; align-items:flex-end; justify-content:space-between; gap:32px; }
.process__note { flex:0 1 320px; color:var(--brown-700); text-align:right; }
.process__title { font-family:var(--font-display); font-weight:500; font-size:72px; line-height:1; letter-spacing:-.03em; }
.thermo { position:relative; width:100%; height:112px; container-type:inline-size; }.thermo__rule { position:absolute; inset:auto 0 0; width:100%; height:auto; aspect-ratio:1280 / 100; }
.thermo__mark { position:absolute; bottom:calc(2.96875cqw + 8px); display:flex; flex-direction:column; white-space:nowrap; }.thermo__value { font-family:var(--font-display); font-weight:500; font-size:36px; line-height:normal; letter-spacing:-.02em; }.thermo__mark--big .thermo__value { font-size:44px; }
.thermo__fill { clip-path:inset(0); }
.thermo__label { margin-top:-2px; font-family:var(--font-mono); font-weight:500; font-size:10px; letter-spacing:.06em; text-transform:uppercase; color:var(--brown-700); }
.steps { display:flex; gap:97px; margin:0; padding:0; list-style:none; }.step { flex:0 0 240px; min-width:0; display:flex; flex-direction:column; gap:16px; }
.step__visual { position:relative; height:201px; overflow:hidden; border:1px solid var(--line); border-radius:16px; }.step__visual--paper { background:var(--paper); }.step__visual--sand { background:var(--sand); }
.step__photo { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .6s ease; }.step__photo--plain { border:0; }.step:hover .step__photo { transform:scale(1.04); }
.step__title { font-family:var(--font-display); font-weight:500; min-height:62px; font-size:26px; line-height:1.2; letter-spacing:-.01em; }.step__text { font-size:15px; line-height:1.55; color:var(--brown-700); }
.step__title--conclusion { white-space:pre-line; }
.solar__plan { position:absolute; inset:-1px; width:100%; height:100%; }.solar__txt { position:absolute; font-family:var(--font-mono); font-weight:500; font-size:9px; letter-spacing:.04em; color:var(--orange-700); white-space:nowrap; }.solar__txt--muted { color:var(--brown-700); }
.proposal__back { position:absolute; left:calc(50% - 88.6px + 10px); top:30px; width:177px; height:177px; border-radius:6px; background:var(--paper); opacity:.6; transform:rotate(5deg); }
.proposal { position:absolute; left:calc(50% - 88.6px + 5px); top:22px; display:flex; flex-direction:column; gap:6px; width:177px; padding:12px; border-radius:6px; background:var(--paper); box-shadow:0 8px 18px rgba(64,38,28,.16); transform:rotate(-3deg); transition:transform .4s ease; }.step:hover .proposal { transform:rotate(0deg) translateY(-4px); }
.proposal__head { display:flex; justify-content:space-between; font-family:var(--font-mono); font-weight:500; font-size:8px; }.proposal__kind { color:var(--orange-700); letter-spacing:.06em; }.proposal__num { color:var(--brown-500); letter-spacing:.04em; }
.proposal__plan { position:relative; height:72.5px; overflow:hidden; border-radius:4px; background:var(--cream); }.proposal__plan img { position:absolute; left:-11.5px; top:-28.5px; width:176px; height:117.3px; max-width:none; }.proposal__place { font-family:var(--font-display); font-weight:500; font-size:12px; }
.proposal__row { display:flex; justify-content:space-between; padding-bottom:3px; border-bottom:1px solid var(--line); font-size:8px; color:var(--brown-700); }.proposal__row strong { font-weight:500; color:var(--brown-900); }.proposal__file { align-self:flex-start; padding:3px 8px; border-radius:999px; background:var(--orange-100); color:var(--orange-700); font-family:var(--font-mono); font-weight:500; font-size:7px; }
.step__tint { position:absolute; inset:0; background:rgba(127,167,176,.18); mix-blend-mode:soft-light; }
.step__badge { position:absolute; left:12px; bottom:12px; padding:6px 12px; border-radius:999px; background:var(--sage-500); color:var(--paper); font-family:var(--font-mono); font-size:10px; letter-spacing:.06em; text-transform:uppercase; }
@media(min-width:1025px) and (max-width:1390px) { .steps { gap:32px; } .step { flex:1 1 0; } }
@media(max-width:1024px) { .process { padding-top:100px; padding-bottom:100px; }.process__title { font-size:52px; }.thermo { display:none; }.steps { flex-wrap:wrap; gap:24px; }.step { flex-basis:calc(50% - 12px); }.step__title { min-height:0; }.step__title--conclusion { white-space:normal; } }
@media(max-width:1200px) { .process { padding-top:48px; } }
@media(max-width:640px) {
  .process__header { flex-direction:column; align-items:flex-start; }
  .process__note { flex-basis:auto; text-align:left; }
  .process__title { font-size:40px; }
  .steps { gap:40px; }
  .step { flex-basis:100%; }
}

</style>
