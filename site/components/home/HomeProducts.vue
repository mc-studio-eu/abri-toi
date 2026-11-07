<script setup lang="ts">
const gammes = [
  {
    nom: 'Galiléo',
    promesse: 'Ombrage immédiat · Brumisation en option',
    description: 'Un abri ancré au sol, relié à l’eau, pour apporter de l’ombre et de la fraîcheur dès la pose.',
    image: '/images/produits/galileo-banc.jpg',
    alt: 'Abri Galiléo avec assise sous une toiture perforée',
    href: '/produits/banquette-galileo',
  },
  {
    nom: 'Fotos',
    promesse: 'Végétation · Déplaçable · Eau de pluie',
    description: 'Un abri végétal autostable qui récupère l’eau de pluie et peut être déplacé au chariot élévateur.',
    image: '/images/produits/fotos-banc.jpg',
    alt: 'Banc Fotos sous une pergola végétale',
    href: '/produits/banc-fotos',
  },
]

</script>

<template>
  <section class="home-products section">
    <header class="home-products__header">
      <p class="label-mono">À 10 degrés de vous sentir bien dehors.</p>
      <h2 class="display-h2">À l’ombre, on a envie de rester dehors.</h2>
    </header>
    <div class="home-products__grid">
      <NuxtLink v-for="gamme in gammes" :key="gamme.nom" :to="gamme.href" class="home-products__card">
        <div class="home-products__image"><img :src="gamme.image" :alt="gamme.alt" loading="lazy" /></div>
        <div class="home-products__copy">
          <div>
            <p class="label-mono">{{ gamme.promesse }}</p>
            <h3 class="display-h3">{{ gamme.nom }}</h3>
            <p class="home-products__description">{{ gamme.description }}</p>
          </div>
          <span class="home-products__link">Découvrir la gamme <span aria-hidden="true">↗</span></span>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.home-products { display:flex; flex-direction:column; gap:48px; padding-top:112px; padding-bottom:112px; background:var(--paper); }
.home-products__header { display:grid; gap:14px; max-width:760px; }
.home-products__header .label-mono { color:var(--orange-700); text-transform:uppercase; }
.home-products__grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:24px; }
.home-products__card { display:grid; grid-template-columns:1fr 1fr; min-height:350px; overflow:hidden; border:1px solid var(--line); border-radius:16px; background:var(--cream); color:var(--brown-900); text-decoration:none; transition:transform .3s ease,box-shadow .3s ease; }
.home-products__card:hover { transform:translateY(-4px); box-shadow:0 18px 45px #3f261d14; }
.home-products__image { display:flex; align-items:center; justify-content:center; min-width:0; background:#fff; }
.home-products__image img { width:100%; height:100%; min-height:300px; object-fit:contain; }
.home-products__copy { display:flex; flex-direction:column; justify-content:space-between; gap:22px; padding:28px; }
.home-products__copy .label-mono { color:var(--brown-500); }
.home-products__copy h3 { margin-top:12px; font-size:clamp(32px,3vw,48px); }
.home-products__description { margin-top:14px; color:var(--brown-700); line-height:1.6; }
.home-products__link { display:flex; justify-content:space-between; gap:12px; padding-top:18px; border-top:1px solid var(--line); font-weight:500; }
@media(max-width:1100px) { .home-products__grid { grid-template-columns:1fr; } }
@media(max-width:560px) { .home-products__card { grid-template-columns:1fr; } .home-products__image img { min-height:230px; max-height:300px; } .home-products__copy { padding:22px; } }
</style>
