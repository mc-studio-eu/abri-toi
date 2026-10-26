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
const ouvert = ref(false)
watch(() => route.fullPath, () => (ouvert.value = false))

// Au-delà du haut de page, la barre se détache et reste visible en haut de l'écran
const flottante = ref(false)
const surveiller = () => (flottante.value = window.scrollY > 80)
onMounted(() => {
  surveiller()
  window.addEventListener('scroll', surveiller, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', surveiller))
</script>

<template>
  <div class="nav-place">
    <header class="nav" :class="{ 'nav--ouvert': ouvert, 'nav--flottante': flottante }">
      <div class="nav__gauche">
        <NuxtLink to="/" aria-label="Abri Toi — accueil">
          <img src="/images/logo-blanc.png" alt="Abri Toi" width="130" height="23" class="nav__logo" />
        </NuxtLink>
        <nav id="menu-principal" aria-label="Navigation principale">
          <ul class="nav__menu">
            <li v-for="lien in liens" :key="lien.to">
              <NuxtLink :to="lien.to" :class="{ 'nav__lien--actif': actif(lien.to) }" :aria-current="actif(lien.to) ? 'page' : undefined">
                {{ lien.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
      <div class="nav__droite">
        <NuxtLink to="/contact" class="nav__cta">{{ parametres.boutonNav }}</NuxtLink>
        <button
          type="button"
          class="nav__burger"
          :aria-expanded="ouvert"
          aria-controls="menu-principal"
          @click="ouvert = !ouvert"
        >
          <span class="visually-hidden">Menu</span>
          <span aria-hidden="true" />
        </button>
      </div>
    </header>
  </div>
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
  top: 12px;
  left: max(8px, calc(max(var(--gutter), (100% - var(--page-max)) / 2 + var(--gutter)) - 20px));
  right: max(8px, calc(max(var(--gutter), (100% - var(--page-max)) / 2 + var(--gutter)) - 20px));
  height: 64px;
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
  transition: transform 0.2s;
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
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    padding: 20px 24px;
    border-radius: 12px;
    background: var(--brown-900);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  }

  .nav--ouvert #menu-principal {
    display: block;
  }

  .nav__menu {
    flex-direction: column;
    gap: 16px;
    font-size: 18px;
  }
}

@media (max-width: 640px) {
  .nav__cta {
    display: none;
  }
}
</style>
