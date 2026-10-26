<script setup lang="ts">
// Scrollytelling façon Brickwise : le bloc anatomie reste épinglé pendant qu'on défile,
// chaque tranche de défilement active une étape (texte mis en avant + couche ajoutée à la vue 3D).
// Contenu et états repris des 8 variantes Figma « Solution / Choix de gamme » (Gamme × Étape).
type GammeId = 'galileo' | 'fotos'

// Couches de la vue éclatée, de l'arrière vers l'avant. `from` : étape à partir de laquelle la couche apparaît.
// `drop` : décalage vertical de départ (en % de la hauteur de la vue) pour l'effet de pose.
interface Layer {
  src: string
  from: number
  drop?: number
}

// Textes éditables dans Sanity (page Accueil → Solution) ; les couches de la vue éclatée restent ici.
const page = await usePageAccueil()
const solution = computed(() => page.value.solution)
const noms = await useGammes()

const visuels = {
  galileo: {
    thumb: '/images/vignette.png',
    layers: [
      { src: '/images/couche0-sol-ombre-portee.svg', from: 0 },
      { src: '/images/couche4-b-assise-bois.svg', from: 0 },
      { src: '/images/couche1-structure-acier.svg', from: 1, drop: -9.21 },
      { src: '/images/couche3-brumisation.svg', from: 3, drop: -2 },
      { src: '/images/couche2-toiture-aluminium-perforee.svg', from: 2, drop: -21.05 },
    ] as Layer[],
  },
  fotos: {
    thumb: '/images/vignette1.png',
    layers: [
      { src: '/images/couche0-sol-ombre-portee.svg', from: 0 },
      { src: '/images/fotos-couche4-bac-vegetalise.svg', from: 4, drop: -6 },
      { src: '/images/couche4-b-assise-bois.svg', from: 0 },
      { src: '/images/fotos-couche1-structure-alu-brun.svg', from: 1, drop: -9.21 },
      { src: '/images/fotos-couche4c-plantes-grimpantes.svg', from: 3, drop: 3 },
      { src: '/images/couche2-toiture-aluminium-perforee.svg', from: 2, drop: -21.05 },
    ] as Layer[],
  },
}

const gammes = computed(() =>
  Object.fromEntries(
    (['galileo', 'fotos'] as GammeId[]).map((id) => {
      const textes = solution.value[id]
      return [
        id,
        {
          ...visuels[id],
          name: noms.value[id].nom,
          tags: textes.tags,
          caption: textes.legende,
          steps: [...(solution.value.communes ?? []), ...(textes.etapes ?? [])],
          labels: (textes.etiquettes ?? []).slice(0, markers.length),
          badge: textes.badge,
        },
      ]
    }),
  ) as Record<GammeId, typeof visuels.galileo & { name: string; tags: string; caption: string; steps: { titre: string; texte: string }[]; labels: string[]; badge: string }>,
)

// Repères de la maquette (720 × 760) : trait + pastille, et position de l'étiquette associée.
const markers = [
  { line: 'M425 479L480.7 443.4H494.7', dot: [425, 479], tag: [495, 427] },
  { line: 'M545 299L535 263H549', dot: [545, 299], tag: [549, 246] },
  { line: 'M309 370L213 450.5H199', dot: [309, 370], tag: [51, 434], alignEnd: 256 },
  { line: 'M318 343L226 243.5H212', dot: [318, 343], tag: [20, 227], alignEnd: 241 },
]

const gammeId = ref<GammeId>('galileo')
const gamme = computed(() => gammes.value[gammeId.value])
const step = ref(1)
const progress = ref(0)
const track = ref<HTMLElement>()

const STEPS = 4

function update() {
  const el = track.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const scrollable = el.offsetHeight - window.innerHeight
  const p = scrollable > 0 ? Math.min(Math.max(-rect.top / scrollable, 0), 0.9999) : 0
  progress.value = p * STEPS
  step.value = Math.floor(p * STEPS) + 1
}

let frame = 0
const schedule = () => {
  frame ||= requestAnimationFrame(() => {
    frame = 0
    update()
  })
}

// Les liens « #fotos » du reste de la page ouvrent directement la gamme Fotos.
const syncHash = () => {
  if (location.hash === '#fotos') gammeId.value = 'fotos'
}

onMounted(() => {
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  window.addEventListener('hashchange', syncHash)
  syncHash()
  update()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
  window.removeEventListener('hashchange', syncHash)
  cancelAnimationFrame(frame)
})

// Clic sur une étape : on défile jusqu'à la tranche correspondante.
function goTo(n: number) {
  const el = track.value
  if (!el) return
  const scrollable = el.offsetHeight - window.innerHeight
  const top = el.getBoundingClientRect().top + window.scrollY + ((n - 1 + 0.5) / STEPS) * scrollable
  window.scrollTo({ top, behavior: 'smooth' })
}

// Remplissage du filet de l'étape active (0 → 1 pendant sa tranche de défilement).
const fill = (n: number) => Math.min(Math.max(progress.value - (n - 1), 0), 1)
const stepState = (n: number) => (n === step.value ? 'active' : n < step.value ? 'done' : 'next')
</script>

<template>
  <section id="solution" class="solution section" :class="`solution--${gammeId}`">
    <header v-reveal class="solution__header">
      <h2 class="display-h2">{{ solution.titre }}<br />{{ solution.titreSuite }}</h2>
      <p class="body-l solution__intro">{{ solution.intro }}</p>
    </header>

    <div id="fotos" v-reveal="100" class="selector">
      <div class="selector__options" role="tablist" aria-label="Choisir une gamme">
        <button
          v-for="(g, id) in gammes"
          :key="id"
          type="button"
          role="tab"
          class="selector__option"
          :class="{ 'selector__option--active': gammeId === id }"
          :aria-selected="gammeId === id"
          @click="gammeId = id"
        >
          <img :src="g.thumb" alt="" width="52" height="52" />
          <span class="selector__label">
            <span class="selector__name">{{ g.name }}</span>
            <span class="selector__tags">{{ g.tags }}</span>
          </span>
        </button>
      </div>
      <Transition name="swap" mode="out-in">
        <p :key="gammeId" class="selector__caption">{{ gamme.caption }}</p>
      </Transition>
    </div>

    <div ref="track" class="anatomy-track">
      <div class="anatomy">
        <div class="anatomy__steps">
          <ol class="anatomy__layers" :style="{ '--fill': fill(step) }" aria-live="polite">
            <li
              v-for="(s, i) in gamme.steps"
              :key="i"
              class="anatomy__layer"
              :class="`anatomy__layer--${stepState(i + 1)}`"
              :aria-current="step === i + 1 ? 'step' : undefined"
              :aria-hidden="step !== i + 1"
            >
              <span class="label-mono anatomy__num">
                0{{ i + 1 }} · {{ i < 2 ? 'Commun aux deux gammes' : gamme.name }}
              </span>
              <Transition name="swap" mode="out-in">
                <div :key="gammeId" class="anatomy__copy">
                  <h3 class="display-h3 anatomy__title">{{ s.titre }}</h3>
                  <p class="body-m anatomy__text">{{ s.texte }}</p>
                </div>
              </Transition>
            </li>
          </ol>

        </div>

        <figure class="anatomy__view" :aria-label="`Vue éclatée de l’abri ${gamme.name}, étape ${step} sur 4`">
          <img class="anatomy__img" src="/images/grille.svg" alt="" width="720" height="760" />
          <Transition name="fade" mode="out-in">
            <div :key="gammeId" class="anatomy__scene">
              <img
                v-for="layer in gamme.layers"
                :key="layer.src"
                class="anatomy__img anatomy__piece"
                :class="{ 'anatomy__piece--on': step >= layer.from }"
                :style="{ '--drop': `${layer.drop ?? 0}%` }"
                :src="layer.src"
                alt=""
                width="720"
                height="760"
              />
            </div>
          </Transition>

          <svg class="anatomy__img anatomy__markers" viewBox="0 0 720 760" aria-hidden="true">
            <g
              v-for="(m, i) in markers"
              :key="i"
              class="anatomy__marker"
              :class="{ 'anatomy__marker--on': step > i }"
            >
              <path :d="m.line" stroke="#3F261D" fill="none" />
              <circle :cx="m.dot[0]" :cy="m.dot[1]" r="4" fill="#EC7C26" stroke="#FBF8F3" stroke-width="2" />
            </g>
          </svg>

          <div
            v-for="(label, i) in gamme.labels"
            :key="`${gammeId}-${i}`"
            class="anatomy__tag"
            :class="{ 'anatomy__tag--on': step > i, 'anatomy__tag--current': step === i + 1 }"
            :style="
              markers[i].alignEnd
                ? { right: `${((720 - markers[i].alignEnd!) / 720) * 100}%`, top: `${(markers[i].tag[1] / 760) * 100}%` }
                : { left: `${(markers[i].tag[0] / 720) * 100}%`, top: `${(markers[i].tag[1] / 760) * 100}%` }
            "
          >
            <span class="label-mono anatomy__tag-num">0{{ i + 1 }}</span>
            <span class="anatomy__tag-text">{{ label }}</span>
          </div>

          <span class="label-mono anatomy__badge" :class="{ 'anatomy__badge--on': step === 4 }">
            {{ gamme.badge }}
          </span>

          <figcaption class="label-mono anatomy__legend">
            <span>Vue éclatée · {{ gamme.name }}</span>
            <span class="anatomy__counter">0{{ step }} / 04</span>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<style scoped>
.solution {
  --accent: var(--orange-500);
  --accent-text: var(--orange-600);
  --accent-num: var(--orange-700);

  display: flex;
  flex-direction: column;
  gap: 56px;
  padding-top: 120px;
  padding-bottom: 64px;
}

.solution--fotos {
  --accent: var(--sage-500);
  --accent-text: var(--sage-500);
  --accent-num: var(--sage-500);
}

.solution__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
}

.solution__header h2 {
  max-width: 900px;
}

.solution__intro {
  max-width: 620px;
  color: var(--brown-700);
}

/* Sélecteur de gamme */
.selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  scroll-margin-top: 32px;
}

.selector__options {
  display: flex;
  gap: 6px;
  padding: 6px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 999px;
}

.selector__option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 28px 10px 10px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.35s var(--ease-out),
    transform 0.35s var(--ease-out);
}

.selector__option img {
  border-radius: 50%;
  filter: grayscale(1);
  transition: filter 0.35s;
}

.selector__option:hover {
  background: var(--sand);
}

.selector__option:hover img,
.selector__option--active img {
  filter: none;
}

.selector__option--active,
.selector__option--active:hover {
  background: var(--accent);
  color: var(--white);
}

.selector__option:focus-visible {
  outline: 2px solid var(--brown-900);
  outline-offset: 2px;
}

.selector__label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-weight: 500;
  white-space: nowrap;
}

.selector__name {
  font-family: var(--font-display);
  font-size: 22px;
  color: var(--brown-900);
}

.selector__tags {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--brown-700);
}

.selector__option--active .selector__name,
.selector__option--active .selector__tags {
  color: var(--white);
}

.selector__option--active .selector__tags {
  opacity: 0.85;
}

.selector__caption {
  font-size: 17px;
  line-height: 1.55;
  color: var(--brown-700);
  text-align: center;
}

/* Anatomie épinglée : la piste donne une tranche de défilement par étape */
.anatomy-track {
  height: calc(100svh + 4 * 60svh);
}

.anatomy {
  /* Place réservée en haut pour la barre de navigation flottante (12 px + 64 px + marge) */
  --nav-h: 96px;
  --view-w: min(720px, calc((100svh - var(--nav-h) - 40px) * 720 / 760), 52vw);

  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  gap: 56px;
  height: 100svh;
  padding-top: var(--nav-h);
  padding-bottom: 24px;
}

.anatomy__steps {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* Les étapes partagent la même cellule : une seule est visible à la fois, comme un diaporama piloté par le défilement */
.anatomy__layers {
  position: relative;
  display: grid;
  margin: 0;
  padding: 0 0 0 28px;
  list-style: none;
}

/* Filet vertical : gris, rempli à la couleur de la gamme au rythme du défilement de l'étape */
.anatomy__layers::before,
.anatomy__layers::after {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 2px;
  background: var(--line);
}

.anatomy__layers::after {
  background: var(--accent);
  transform: scaleY(var(--fill, 0));
  transform-origin: top;
}

.anatomy__layer {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  opacity: 0;
  transform: translateY(24px);
  pointer-events: none;
  transition:
    opacity 0.45s var(--ease-out),
    transform 0.6s var(--ease-out);
}

/* Les étapes passées sortent par le haut, les suivantes arrivent par le bas */
.anatomy__layer--done {
  transform: translateY(-24px);
}

.anatomy__layer--active {
  opacity: 1;
  transform: none;
  pointer-events: auto;
  transition-delay: 0.1s;
}

.anatomy__num {
  color: var(--accent-num);
  transition: color 0.35s;
}

.anatomy__copy {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.anatomy__title {
  max-width: 520px;
  font-size: 44px;
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: var(--accent-text);
  transition: color 0.35s;
}

.anatomy__text {
  max-width: 470px;
  font-size: 18px;
  line-height: 1.55;
  color: var(--brown-700);
}

.anatomy__view {
  position: relative;
  flex: 0 0 auto;
  width: var(--view-w);
  aspect-ratio: 720 / 760;
  margin: 0;
  overflow: hidden;
  border-radius: 8px;
  background: var(--paper);
  container-type: inline-size;
}

.anatomy__img,
.anatomy__scene {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* Chaque couche se pose depuis le haut avec un léger rebond, comme dans l'animation Figma */
.anatomy__piece {
  opacity: 0;
  transform: translateY(var(--drop));
  transition:
    opacity 0.45s ease-out,
    transform 0.8s cubic-bezier(0.45, 1.45, 0.8, 1);
}

.anatomy__piece--on {
  opacity: 1;
  transform: none;
}

.anatomy__marker {
  opacity: 0;
  transition: opacity 0.4s 0.35s;
}

.anatomy__marker--on {
  opacity: 1;
}

.anatomy__tag {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 1.1cqw;
  padding: 0.7cqw 1.7cqw 0.7cqw 0.7cqw;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 999px;
  font-weight: 500;
  font-size: max(10px, 1.95cqw);
  line-height: 1.3;
  white-space: nowrap;
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 0.4s 0.35s,
    transform 0.4s 0.35s var(--ease-out),
    border-color 0.3s;
}

.anatomy__tag--on {
  opacity: 1;
  transform: none;
}

.anatomy__tag--current {
  border-color: var(--accent);
}

.anatomy__tag-num {
  padding: 0.55cqw 1cqw;
  border-radius: 999px;
  background: var(--brown-900);
  color: var(--cream);
  font-size: max(9px, 1.65cqw);
  transition: background-color 0.3s;
}

.anatomy__tag--current .anatomy__tag-num {
  background: var(--accent);
}

.anatomy__badge {
  position: absolute;
  left: 3.33%;
  top: 84.2%;
  padding: 1.1cqw 1.95cqw;
  border-radius: 999px;
  background: var(--accent);
  color: var(--white);
  font-size: max(9px, 1.65cqw);
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 0.4s 0.3s,
    transform 0.4s 0.3s var(--ease-out);
}

.anatomy__badge--on {
  opacity: 1;
  transform: none;
}

.anatomy__legend {
  position: absolute;
  left: 0;
  right: 0;
  top: 92.63%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 6.3%;
  padding: 0 3.33%;
  font-size: max(10px, 1.65cqw);
  color: var(--brown-700);
}

.anatomy__counter {
  color: var(--accent-num);
  font-variant-numeric: tabular-nums;
}

/* Transitions de changement de gamme */
.swap-enter-active,
.swap-leave-active,
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-height: 820px) and (min-width: 901px) {
  .anatomy__title {
    font-size: 34px;
  }

  .anatomy__text {
    font-size: 16px;
  }
}

/* Mobile : la vue en haut, seule l'étape active en dessous */
@media (max-width: 900px) {
  .anatomy-track {
    height: calc(100svh + 4 * 50svh);
  }

  .anatomy {
    --view-w: min(100%, calc(46svh * 720 / 760));

    flex-direction: column-reverse;
    justify-content: center;
    gap: 20px;
  }

  .anatomy__view {
    align-self: center;
  }

  .anatomy__steps {
    flex: 0 0 auto;
    align-self: stretch;
    gap: 16px;
  }

  .anatomy__layers {
    padding-left: 20px;
  }

  .anatomy__title {
    font-size: 22px;
  }

  .anatomy__text {
    font-size: 15px;
  }
}

@media (max-width: 640px) {
  .selector__options {
    flex-direction: column;
    border-radius: 24px;
  }

  .selector__caption {
    font-size: 15px;
  }

  /* Trop étroit pour les libellés : on ne garde que les pastilles numérotées */
  .anatomy__tag {
    padding: 3px;
  }

  .anatomy__tag-text {
    display: none;
  }

  .anatomy__badge {
    max-width: 93%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 9px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .anatomy__piece,
  .anatomy__tag,
  .anatomy__badge {
    transition-duration: 0.01s;
    transition-delay: 0s;
  }
}
</style>
