<script setup lang="ts">
const parametres = await useParametres()
const tel = computed(() => `tel:+33${parametres.value.telephone?.replace(/\D/g, '').replace(/^0/, '')}`)

const columns = [
  {
    title: 'Produits',
    links: [
      { label: 'Gamme Galiléo', to: '/produits#galileo' },
      { label: 'Gamme Fotos', to: '/produits#fotos' },
      { label: 'Comparer les gammes', to: '/produits#comparatif' },
      { label: 'Sur-mesure', to: '/contact' },
    ],
  },
  {
    title: 'Abri Toi',
    links: [
      { label: 'Réalisations', to: '/realisations' },
      { label: 'À propos', to: '/a-propos' },
      { label: 'Articles', to: '/articles' },
      { label: 'Contact', to: '/contact' },
    ],
  },
]
</script>

<template>
  <footer class="footer section">
    <div class="footer__top">
      <div class="footer__brand">
        <img src="/images/logo-blanc.png" alt="Abri Toi" width="160" height="28" class="footer__logo" />
        <p class="body-m footer__pitch">{{ parametres.pitch }}</p>
      </div>

      <div class="footer__cols">
        <nav v-for="col in columns" :key="col.title" class="footer__col" :aria-label="col.title">
          <p class="label-mono footer__head">{{ col.title }}</p>
          <ul>
            <li v-for="link in col.links" :key="link.label">
              <NuxtLink :to="link.to">{{ link.label }}</NuxtLink>
            </li>
          </ul>
        </nav>
        <div class="footer__col">
          <p class="label-mono footer__head">Contact</p>
          <ul>
            <li><a :href="tel">{{ parametres.telephone }}</a></li>
            <li><a :href="`mailto:${parametres.email}`">{{ parametres.email }}</a></li>
            <li v-if="parametres.linkedin"><a :href="parametres.linkedin" target="_blank" rel="noopener">LinkedIn</a></li>
            <li v-if="parametres.youtube"><a :href="parametres.youtube" target="_blank" rel="noopener">YouTube</a></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="label-mono footer__bottom">
      <p>{{ parametres.mentions }}</p>
      <p class="footer__legal">Mentions légales · Cookies · Plan du site</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  display: flex;
  flex-direction: column;
  gap: 56px;
  padding-top: 72px;
  padding-bottom: 40px;
  background: var(--brown-900);
}

.footer__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 48px;
}

.footer__brand {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.footer__logo {
  width: 160px;
  height: 28px;
  object-fit: contain;
  object-position: left;
}

.footer__pitch {
  max-width: 320px;
  color: var(--sand);
}

.footer__cols {
  display: flex;
  gap: 96px;
  white-space: nowrap;
}

.footer__col ul {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer__col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer__head {
  color: var(--sand);
}

.footer__col li {
  font-size: 16px;
  line-height: 1.55;
  color: var(--cream);
}

.footer__col a:hover {
  color: var(--orange-500);
}

.footer__bottom {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid var(--brown-700);
  color: var(--sand);
  text-transform: none;
}

.footer__legal {
  text-transform: none;
}

@media (max-width: 1024px) {
  .footer__top {
    flex-direction: column;
  }

  .footer__cols {
    flex-wrap: wrap;
    gap: 40px 64px;
  }

  .footer__bottom {
    flex-direction: column;
  }
}
</style>
