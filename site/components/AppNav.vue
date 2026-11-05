<script setup lang="ts">
const route = useRoute()
const parametres = await useParametres()

const liens = [
  { label: 'Accueil', to: '/' },
  { label: 'Produits', to: '/produits' },
  { label: 'Réalisations', to: '/realisations' },
  { label: 'Articles', to: '/articles' },
  { label: 'À propos', to: '/a-propos' },
]

const actif = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to))
const boutonMenu = ref<HTMLButtonElement | null>(null)
const tiroir = ref<HTMLDialogElement | null>(null)
const ouvert = ref(false)
let ecranMobile: MediaQueryList | undefined
let restaurerDefilement: (() => void) | undefined

function ouvrir() {
  if (!ecranMobile?.matches || !tiroir.value || tiroir.value.open) return

  boutonMenu.value?.focus({ preventScroll: true })
  tiroir.value.showModal()
  ouvert.value = true

  const style = document.documentElement.style
  const overflow = style.getPropertyValue('overflow')
  const priorite = style.getPropertyPriority('overflow')
  style.setProperty('overflow', 'hidden')
  restaurerDefilement = () => style.setProperty('overflow', overflow, priorite)
}

function synchroniserFermeture() {
  if (tiroir.value?.open) return

  ouvert.value = false
  restaurerDefilement?.()
  restaurerDefilement = undefined
}

function fermer() {
  tiroir.value?.close()
  synchroniserFermeture()
}

function fermerSurFond(event: MouseEvent) {
  if (!tiroir.value) return

  const { left, right, top, bottom } = tiroir.value.getBoundingClientRect()
  if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) fermer()
}

function surveillerEcran(event: MediaQueryListEvent) {
  if (!event.matches) fermer()
}

watch(() => route.fullPath, fermer)

// Au-delà du haut de page, la barre se détache et reste visible en haut de l'écran
const flottante = ref(false)
const surveiller = () => (flottante.value = window.scrollY > 80)
onMounted(() => {
  surveiller()
  window.addEventListener('scroll', surveiller, { passive: true })
  ecranMobile = window.matchMedia('(max-width: 1024px)')
  ecranMobile.addEventListener('change', surveillerEcran)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', surveiller)
  ecranMobile?.removeEventListener('change', surveillerEcran)
  fermer()
})
</script>

<template>
  <div class="nav-place">
    <header class="nav" :class="{ 'nav--flottante': flottante }">
      <div class="nav__gauche">
        <a href="/" aria-label="Abri Toi — accueil">
          <img src="/images/logo-blanc.png" alt="Abri Toi" width="130" height="23" class="nav__logo" />
        </a>
        <nav id="menu-principal" aria-label="Navigation principale">
          <ul class="nav__menu">
            <li v-for="lien in liens" :key="lien.to">
              <a :href="lien.to" :class="{ 'nav__lien--actif': actif(lien.to) }" :aria-current="actif(lien.to) ? 'page' : undefined">
                {{ lien.label }}
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div class="nav__droite">
        <a href="/contact" class="nav__cta"><UiTextSlide :text="parametres.boutonNav" /></a>
        <button
          ref="boutonMenu"
          type="button"
          class="nav__burger"
          :aria-expanded="ouvert"
          aria-controls="menu-mobile"
          aria-haspopup="dialog"
          @click="ouvrir"
        >
          <span class="visually-hidden">Menu</span>
          <span aria-hidden="true" />
        </button>
      </div>
    </header>
  </div>

  <ClientOnly>
    <Teleport to="body">
      <dialog
        id="menu-mobile"
        ref="tiroir"
        class="nav-tiroir"
        aria-labelledby="menu-mobile-titre"
        @cancel.prevent="fermer"
        @close="synchroniserFermeture"
        @click.self="fermerSurFond"
      >
        <div class="nav-tiroir__contenu">
          <div class="nav-tiroir__entete">
            <a href="/" aria-label="Abri Toi — accueil" class="nav-tiroir__marque" @click="fermer">
              <span class="nav-tiroir__logo" aria-hidden="true" />
            </a>
            <button type="button" class="nav-tiroir__fermer" aria-label="Fermer le menu" autofocus @click="fermer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path d="m6 6 12 12M6 18 18 6" />
              </svg>
            </button>
          </div>

          <nav aria-labelledby="menu-mobile-titre">
            <h2 id="menu-mobile-titre" class="label-mono nav-tiroir__titre">Menu</h2>
            <ul class="nav-tiroir__liste">
              <li v-for="lien in liens" :key="lien.to">
                <a :href="lien.to" :aria-current="actif(lien.to) ? 'page' : undefined" @click="fermer">
                  {{ lien.label }}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                    <path d="M4 12h15m-6-6 6 6-6 6" />
                  </svg>
                </a>
              </li>
            </ul>
          </nav>

          <a href="/contact" class="nav-tiroir__cta" :aria-current="actif('/contact') ? 'page' : undefined" @click="fermer">
            {{ parametres.boutonNav }}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M4 12h15m-6-6 6 6-6 6" />
            </svg>
          </a>

          <p class="nav-tiroir__signature label-mono">Conçu à Lyon · Fabriqué en France</p>
        </div>
      </dialog>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
/* Garde la place de la barre dans la page quand elle passe en position fixe */
.nav-place {
  position: relative;
  z-index: 20;
  height: 44px;
}

.nav {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  color: var(--white);
}

.nav--flottante {
  position: fixed;
  top: var(--nav-floating-top);
  left: max(8px, calc(var(--gutter) - 20px), calc((100% - var(--page-max)) / 2 + var(--gutter) - 20px));
  right: max(8px, calc(var(--gutter) - 20px), calc((100% - var(--page-max)) / 2 + var(--gutter) - 20px));
  height: var(--nav-floating-height);
  padding: 0 12px 0 20px;
  border-radius: 14px;
  /* Verre dépoli : le fond laisse voir la page, le flou garde le texte lisible */
  border: 1px solid rgba(244, 238, 229, 0.14);
  background: rgba(63, 38, 29, 0.55);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  box-shadow: 0 12px 32px rgba(28, 16, 12, 0.16);
  animation: nav-descend 0.35s var(--ease-out);
}

@keyframes nav-descend {
  from {
    opacity: 0;
    transform: translateY(-16px);
  }
}

.nav__gauche {
  display: flex;
  align-items: center;
  gap: 48px;
}

.nav__logo {
  width: 130px;
  height: 23px;
  object-fit: contain;
}

.nav__menu {
  display: flex;
  gap: 30px;
  font-weight: 500;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.92);
}

.nav__menu a:hover {
  color: var(--white);
  text-decoration: underline;
  text-underline-offset: 4px;
}

.nav__menu .nav__lien--actif {
  color: var(--orange-500);
}

.nav__droite {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav__cta {
  background: var(--orange-500);
  padding: 12px 18px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 15px;
  color: var(--white);
  transition: background-color 0.2s;
}

.nav__cta:hover {
  background: var(--orange-600);
}

.nav__burger {
  display: none;
  position: relative;
  width: 44px;
  height: 44px;
}

.nav__burger span[aria-hidden],
.nav__burger span[aria-hidden]::before,
.nav__burger span[aria-hidden]::after {
  position: absolute;
  left: 11px;
  width: 22px;
  height: 2px;
  background: currentColor;
}

.nav__burger span[aria-hidden] {
  top: 21px;
}

.nav__burger span[aria-hidden]::before,
.nav__burger span[aria-hidden]::after {
  content: '';
  left: 0;
}

.nav__burger span[aria-hidden]::before {
  top: -7px;
}

.nav__burger span[aria-hidden]::after {
  top: 7px;
}

@media (max-width: 1024px) {
  .nav__burger {
    display: block;
  }

  #menu-principal {
    display: none;
  }
}

@media (max-width: 640px) {
  .nav__cta {
    display: none;
  }
}

.nav-tiroir {
  position: fixed;
  inset: 12px 12px auto auto;
  width: min(420px, calc(100% - 24px));
  height: calc(100% - 24px);
  height: calc(100dvh - 24px);
  max-width: none;
  max-height: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--cream);
  color: var(--brown-900);
  box-shadow: 0 24px 64px rgba(28, 16, 12, 0.24);
}

.nav-tiroir::backdrop {
  background: rgba(28, 16, 12, 0.48);
  backdrop-filter: blur(5px);
}

.nav-tiroir[open] {
  animation: nav-tiroir-entre 0.3s var(--ease-out);
}

@keyframes nav-tiroir-entre {
  from {
    opacity: 0;
    transform: translateX(16px);
  }
}

.nav-tiroir__contenu {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100%;
  padding: 22px clamp(18px, 6vw, 28px);
}

.nav-tiroir__entete {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.nav-tiroir__marque {
  display: flex;
  align-items: center;
  min-height: 44px;
}

.nav-tiroir__logo {
  width: 130px;
  height: 23px;
  background: var(--brown-900);
  -webkit-mask: url('/images/logo-blanc.png') center / contain no-repeat;
  mask: url('/images/logo-blanc.png') center / contain no-repeat;
}

.nav-tiroir__fermer {
  display: grid;
  flex: 0 0 44px;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: var(--paper);
}

.nav-tiroir__titre {
  margin-bottom: 10px;
  color: var(--brown-700);
}

.nav-tiroir__liste {
  border-top: 1px solid var(--line);
}

.nav-tiroir__liste li {
  border-bottom: 1px solid var(--line);
}

.nav-tiroir__liste a,
.nav-tiroir__cta {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.nav-tiroir__liste a {
  min-height: 56px;
  padding: 9px 4px;
  font: 500 clamp(1.5rem, 6vw, 1.875rem) / 1.15 var(--font-display);
  letter-spacing: -0.025em;
}

.nav-tiroir__liste a[aria-current='page'] {
  color: var(--orange-700);
}

.nav-tiroir svg {
  flex-shrink: 0;
}

.nav-tiroir__cta {
  min-height: 52px;
  padding: 12px 16px;
  border-radius: 8px;
  background: var(--orange-500);
  font-weight: 600;
}

.nav-tiroir :is(a, button):focus-visible {
  outline: 2px solid var(--orange-700);
  outline-offset: 2px;
}

.nav-tiroir__signature {
  margin-top: 0;
  padding-top: 12px;
  color: var(--brown-700);
  font-size: 10px;
}

@media (prefers-reduced-motion: reduce) {
  .nav--flottante,
  .nav-tiroir[open] {
    animation: none;
  }
}
</style>
