<script setup lang="ts">
const pistes = [
  { lieu: 'Étude d’intégration', titre: 'Un salon ouvert et ombragé', gamme: 'Galiléo', image: '/images/produits/espace-salon.jpg', alt: 'Proposition d’aménagement Galiléo en espace salon' },
  { lieu: 'Étude d’intégration', titre: 'Un espace de pause à l’ombre', gamme: 'Galiléo', image: '/images/produits/espace-recreation.jpg', alt: 'Proposition d’aménagement Galiléo avec gradins' },
  { lieu: 'Étude d’intégration', titre: 'Un îlot végétal modulable', gamme: 'Fotos', image: '/images/produits/espace-sequoia.jpg', alt: 'Proposition d’aménagement Fotos végétalisé' },
]
</script>

<template>
  <section class="ideas section">
    <header class="ideas__header">
      <div>
        <h2 class="display-h2">Nos sujets en cours de réflexion.</h2>
      </div>
      <p class="ideas__intro">Quelques pistes d’aménagement actuellement à l’étude, présentées sans nommer les villes concernées.</p>
    </header>
    <ul class="ideas__grid">
      <li v-for="piste in pistes" :key="piste.titre" class="idea">
        <img :src="piste.image" :alt="piste.alt" loading="lazy" />
        <div class="idea__copy">
          <p class="label-mono">{{ piste.lieu }} · {{ piste.gamme }}</p>
          <h3>{{ piste.titre }}</h3>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.ideas { display:flex; flex-direction:column; gap:36px; padding-top:96px; padding-bottom:112px; background:var(--brown-900); color:var(--cream); }
.ideas__header { display:flex; align-items:flex-end; justify-content:space-between; gap:32px; }
.ideas__header .label-mono { margin-bottom:14px; color:var(--orange-500); text-transform:uppercase; }
.ideas__header h2 { max-width:720px; }
.ideas__intro { max-width:420px; color:var(--sand); line-height:1.6; }
.ideas__grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; margin:0; padding:0; list-style:none; }
.idea { overflow:hidden; border-radius:14px; background:var(--brown-800); }
.idea img { display:block; width:100%; height:280px; object-fit:cover; background:#fff; }
.idea__copy { padding:20px; }
.idea__copy .label-mono { color:var(--sand); }
.idea__copy h3 { margin-top:10px; font-size:22px; font-weight:500; }
@media(max-width:760px) { .ideas__header { flex-direction:column; align-items:flex-start; } .ideas__grid { grid-template-columns:1fr; } .idea img { height:240px; } }
</style>
