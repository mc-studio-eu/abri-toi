<script setup lang="ts">
const page = await usePageAccueil()
const sujets = computed(() => page.value.sujets)
</script>

<template>
  <section class="ideas section" aria-labelledby="ideas-title">
    <h2 id="ideas-title" class="ideas__title">{{ sujets.titre }}</h2>
    <p class="ideas__intro">{{ sujets.intro }}</p>
    <ul class="ideas__grid">
      <li v-for="piste in sujets.cartes" :key="piste._key" class="idea">
        <img :src="img(piste.image, 1200, 650)" :srcset="imgSrcset(piste.image, 1600, 867)" sizes="(min-width: 1440px) 411px, (max-width: 640px) calc(100vw - 40px), (max-width: 760px) calc(100vw - 80px), (max-width: 1024px) calc((100vw - 104px) / 2), (max-width: 1100px) calc((100vw - 184px) / 2), calc((100vw - 208px) / 3)" :alt="alt(piste.image)" loading="lazy" />
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
@media(max-width:1100px) { .ideas__grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .idea { height:auto; min-height:532px; } .idea__copy h3 { font-size:26px; } }
@media(max-width:760px) { .ideas__title { font-size:34px; } .ideas__grid { grid-template-columns:1fr; } .idea { min-height:0; } .idea img { height:auto; aspect-ratio: 6 / 5; max-height:320px; } .idea__copy { padding:24px; } }
</style>
