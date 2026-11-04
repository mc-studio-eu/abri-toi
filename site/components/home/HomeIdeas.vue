<script setup lang="ts">
const pistes = [
  { titre: 'Des solutions pour les espaces artificiels', texte: 'Fréquentez de nouveau les rues et espaces publics de votre commune.', image: '/images/figma-home/426-19739-imgVisuel.png', alt: 'Abri végétalisé dans une place publique' },
  { titre: 'Travailler en plein air', texte: 'Une nouvelle manière d’imaginer vos réunions ou un nouvel endroit pour déjeuner entre collègues.', image: '/images/figma-home/426-19739-imgVisuel1.png', alt: 'Abris Galiléo installés dans le jardin d’un lieu de travail' },
  { titre: 'Valoriser l’existant', texte: 'Intégrez de la brumisation à votre ombrière et créez un véritable espace d’ombrage.', image: '/images/figma-home/426-19739-imgVisuel2.png', alt: 'Espace de détente ombragé et brumisé au bord d’un jardin' },
]
</script>

<template>
  <section class="ideas section" aria-labelledby="ideas-title">
    <h2 id="ideas-title" class="ideas__title">Nos sujets en cours de réflexion</h2>
    <p class="ideas__intro">Des pistes d’aménagement pour nourrir la réflexion. Chaque étude d’intégration est adaptée au lieu et à ses usages.</p>
    <ul class="ideas__grid">
      <li v-for="piste in pistes" :key="piste.titre" class="idea">
        <img :src="piste.image" :alt="piste.alt" loading="lazy" />
        <div class="idea__copy">
          <h3 class="display-h3">{{ piste.titre }}</h3>
          <p>{{ piste.texte }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.ideas { display:flex; flex-direction:column; gap:30px; padding-top:80px; padding-bottom:80px; background:var(--brown-900); color:var(--cream); }
.ideas__title { max-width:900px; font-family:var(--font-display); font-size:48px; font-weight:500; line-height:normal; }
.ideas__intro { max-width:838px; color:var(--sand); font-size:16px; }
.ideas__grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:24px; }
.idea { min-height:532px; overflow:hidden; border:1px solid var(--line); border-radius:16px; background:var(--paper); color:var(--brown-900); }
.idea img { display:block; width:100%; height:300px; object-fit:cover; }
.idea__copy { display:flex; flex-direction:column; gap:14px; padding:24px 28px 28px; }
.idea__copy p { color:var(--brown-700); font-size:14px; line-height:1.5; }
@media(max-width:1100px) { .idea { height:auto; min-height:532px; } .idea__copy h3 { font-size:26px; } }
@media(max-width:760px) { .ideas__title { font-size:34px; } .ideas__grid { grid-template-columns:1fr; } .idea { min-height:0; } .idea img { height:280px; } }
</style>
