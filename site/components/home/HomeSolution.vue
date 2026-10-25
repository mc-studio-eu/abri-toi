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

const common = [
  {
    title: 'Structure. Aluminium thermolaqué, fabriqué en France.',
    text: 'Légère, très résistante et composée d’au moins 40 % de matière recyclée. Thermolaquée, elle ne s’oxyde pas, même en bord de mer.',
  },
  {
    title: 'Toiture. L’ombre là où il faut, quand il faut.',
    text: 'Nous vous accompagnons avec une étude d’ensoleillement pour orienter la toiture et maximiser l’ombre sous l’abri, aux heures où vous en avez besoin.',
  },
]

const gammes = {
  galileo: {
    name: 'Galiléo',
    tags: 'Ombrage immédiat · Brumisation',
    thumb: '/images/vignette.png',
    caption: 'Ancré au sol et relié au réseau d’eau, Galiléo brumise l’air pour rafraîchir dès la pose.',
    steps: [
      ...common,
      {
        title: 'Brumisation. Jusqu’à –8 °C sous l’abri.',
        text: 'Brumisation haute pression à 70 bars avec BRO Brumisation : eau potable filtrée et traitée aux UV, temporisation pilotée pour maîtriser chaque litre.',
      },
      {
        title: 'Ancré au sol. Efficace dès la pose.',
        text: 'Fixé sur une dalle béton et raccordé au réseau d’eau par le sol : une installation pérenne, rafraîchissante dès le premier jour.',
      },
    ],
    labels: ['Structure aluminium', 'Toiture perforée', 'Brumisation 70 bars', 'Platines ancrées au sol'],
    badge: 'Ancré sur dalle béton · Eau par le sol',
    layers: [
      { src: '/images/couche0-sol-ombre-portee.svg', from: 0 },
      { src: '/images/couche4-b-assise-bois.svg', from: 0 },
      { src: '/images/couche1-structure-acier.svg', from: 1, drop: -9.21 },
      { src: '/images/couche3-brumisation.svg', from: 3, drop: -2 },
      { src: '/images/couche2-toiture-aluminium-perforee.svg', from: 2, drop: -21.05 },
    ] as Layer[],
  },
  fotos: {
    name: 'Fotos',
    tags: 'Végétal · Déplaçable · Eau de pluie',
    thumb: '/images/vignette1.png',
    caption: 'Sans ancrage et déplaçable, Fotos récupère l’eau de pluie pour faire pousser son ombre végétale.',
    steps: [
      ...common,
      {
        title: 'Végétation. L’ombre prend vie.',
        text: 'Plantes grimpantes sur un filet issu de filets de pêche recyclés, plantées dans un bac de 1 m³ de terre. Un filet en fibre de coco les guide le temps qu’elles poussent.',
      },
      {
        title: 'Autonome et déplaçable.',
        text: 'Un réservoir de 120 L recueille l’eau de pluie et arrose les plantes par capillarité. Les 900 kg de terre servent de lest : pas de béton, l’abri se déplace au chariot élévateur.',
      },
    ],
    labels: ['Structure aluminium', 'Toiture perforée', 'Filet de grimpe recyclé', 'Bac 1 m³ & réservoir 120 L'],
    badge: 'Sans ancrage · Déplaçable au chariot · Réservoir 120 L',
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

// Repères de la maquette (720 × 760) : trait + pastille, et position de l'étiquette associée.
const markers = [
  { line: 'M425 479L480.7 443.4H494.7', dot: [425, 479], tag: [495, 427] },
  { line: 'M545 299L535 263H549', dot: [545, 299], tag: [549, 246] },
  { line: 'M309 370L213 450.5H199', dot: [309, 370], tag: [51, 434], alignEnd: 256 },
  { line: 'M318 343L226 243.5H212', dot: [318, 343], tag: [20, 227], alignEnd: 241 },
]

const gammeId = ref<GammeId>('galileo')
const gamme = computed(() => gammes[gammeId.value])
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
      <h2 class="display-h2">L’ombre à échelle humaine,<br />vraiment efficace.</h2>
      <p class="body-l solution__intro">
        Deux choix s’offrent à vous. Deux gammes conçues à Lyon et fabriquées en France, pour deux façons de rafraîchir
        vos espaces.
      </p>
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
        <ol class="anatomy__layers">
          <li
            v-for="(s, i) in gamme.steps"
            :key="i"
            class="anatomy__layer"
            :class="`anatomy__layer--${stepState(i + 1)}`"
            :style="{ '--fill': fill(i + 1) }"
            :aria-current="step === i + 1 ? 'step' : undefined"
            @click="goTo(i + 1)"
          >
            <span class="label-mono anatomy__num">
              0{{ i + 1 }} · {{ i < 2 ? 'Commun aux deux gammes' : gamme.name }}
            </span>
            <Transition name="swap" mode="out-in">
              <div :key="gammeId" class="anatomy__copy">
                <h3 class="display-h3 anatomy__title">{{ s.title }}</h3>
                <div class="anatomy__text-wrap">
                  <p class="body-m anatomy__text">{{ s.text }}</p>
                </div>
              </div>
            </Transition>
          </li>
        </ol>

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
  --view-w: min(720px, calc((100svh - 64px) * 720 / 760), 52vw);

  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  gap: 56px;
  height: 100svh;
}

.anatomy__layers {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.anatomy__layer {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0 4px 24px;
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.5s var(--ease-out);
}

/* Filet gris + remplissage à la couleur de la gamme, au rythme du défilement */
.anatomy__layer::before,
.anatomy__layer::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--line);
}

.anatomy__layer::after {
  background: var(--accent);
  transform: scaleY(var(--fill, 0));
  transform-origin: top;
}

.anatomy__layer--done {
  opacity: 0.55;
}

.anatomy__layer--active {
  opacity: 1;
}

.anatomy__layer:hover {
  opacity: 1;
}

.anatomy__num {
  color: var(--accent-num);
  transition: color 0.35s;
}

.anatomy__copy {
  display: flex;
  flex-direction: column;
}

.anatomy__title {
  max-width: 470px;
  color: var(--accent-text);
  transition: color 0.35s;
}

/* Le texte ne se déplie que pour l'étape active, pour que la liste tienne à l'écran */
.anatomy__text-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.5s var(--ease-out);
}

.anatomy__layer--active .anatomy__text-wrap {
  grid-template-rows: 1fr;
}

.anatomy__text {
  overflow: hidden;
  max-width: 450px;
  padding-top: 12px;
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
  .anatomy__layers {
    gap: 20px;
  }

  .anatomy__title {
    font-size: 26px;
  }
}

/* Mobile : la vue en haut, seule l'étape active en dessous */
@media (max-width: 900px) {
  .anatomy-track {
    height: calc(100svh + 4 * 50svh);
  }

  .anatomy {
    --view-w: min(100%, calc(52svh * 720 / 760));

    flex-direction: column-reverse;
    justify-content: center;
    gap: 20px;
  }

  .anatomy__view {
    align-self: center;
  }

  .anatomy__layers {
    flex: 0 0 auto;
    align-self: stretch;
    display: grid;
    gap: 0;
  }

  .anatomy__layer {
    grid-area: 1 / 1;
    opacity: 0;
    pointer-events: none;
  }

  .anatomy__layer--active {
    opacity: 1;
    pointer-events: auto;
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
