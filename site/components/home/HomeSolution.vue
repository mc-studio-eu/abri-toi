<script setup lang="ts">
type GammeId = 'galileo' | 'fotos'
const page = await usePageAccueil()
const noms = await useGammes()
const solution = computed(() => page.value.solution)
const gammeId = ref<GammeId>('galileo')
const gammes = computed(() => (['galileo', 'fotos'] as GammeId[]).map(id => ({
  id, thumb: `/images/figma-home/anatomy/${id}-selector`,
  nom: noms.value[id].nom, ...solution.value[id],
})))
const syncHash = () => {
  if (location.hash === '#fotos' || location.hash === '#galileo') gammeId.value = location.hash.slice(1) as GammeId
}
onMounted(() => {
  syncHash()
  window.addEventListener('hashchange', syncHash)
})
onBeforeUnmount(() => window.removeEventListener('hashchange', syncHash))
function select(id: GammeId) { gammeId.value = id }
function moveTab(event: KeyboardEvent, index: number) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index
  select(next === 0 ? 'galileo' : 'fotos')
  document.getElementById(`gamme-tab-${gammeId.value}`)?.focus()
}
</script>

<template>
  <section id="solution" class="solution section" :class="`solution--${gammeId}`">
    <header class="solution__header">
      <h2 class="display-h2">{{ solution.titre }}<br />{{ solution.titreSuite }}</h2>
      <p class="body-l solution__intro">{{ solution.intro }}</p>
    </header>

    <div id="choix-gamme" class="selector" role="tablist" aria-label="Choisir une gamme">
      <button v-for="(g, index) in gammes" :id="`gamme-tab-${g.id}`" :key="g.id" type="button" role="tab"
        class="selector__option" :class="{ 'selector__option--active': gammeId === g.id }"
        :aria-selected="gammeId === g.id" :tabindex="gammeId === g.id ? 0 : -1" aria-controls="gamme-anatomie"
        @click="select(g.id)" @keydown="moveTab($event, index)">
        <span class="selector__visual">
          <img class="selector__photo" :src="`${g.thumb}-720.webp`" :srcset="`${g.thumb}-720.webp 720w, ${g.thumb}-1440.webp 1440w`" sizes="(min-width: 1440px) 600px, (min-width: 641px) 45vw, calc(100vw - 64px)" :alt="`Abri ${g.nom}`" width="600" height="420" />
          <span class="selector__badge">
            <img v-if="gammeId === g.id" src="/images/figma-home/426-21774-imgIcone.svg" alt="" width="20" height="20" />
            <span v-else class="selector__circle" aria-hidden="true" />
            {{ gammeId === g.id ? 'Gamme affichée' : 'Afficher cette gamme' }}
          </span>
        </span>
        <span class="selector__copy">
          <span class="label-mono selector__tags">{{ g.tags }}</span>
          <span class="display-h2 selector__name">{{ g.nom }}</span>
          <span class="body-l selector__caption">{{ g.legende }}</span>
        </span>
        <span v-if="gammeId === g.id" class="selector__notch" aria-hidden="true"><img src="/images/figma-home/426-21774-imgEncocheVersLaVueEclatee.svg" alt="" /></span>
      </button>
    </div>

    <HomeAnatomy id="gamme-anatomie" :gamme-id="gammeId" role="tabpanel" :aria-labelledby="`gamme-tab-${gammeId}`" />
  </section>
</template>

<style scoped>
.solution { --accent:var(--orange-500); --accent-text:var(--orange-600); --accent-num:var(--orange-700); display:flex; flex-direction:column; gap:56px; padding-top:120px; padding-bottom:64px; }
.solution--fotos { --accent-text:var(--sage-500); --accent-num:var(--sage-500); }
.solution__header { display:flex; flex-direction:column; align-items:center; gap:20px; text-align:center; }
.solution__header h2 { max-width:900px; }
.solution__intro { max-width:620px; color:var(--brown-700); }
.selector { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:24px; scroll-margin-top:96px; }
.selector__option { position:relative; display:flex; flex-direction:column; align-items:stretch; gap:28px; min-width:0; padding:12px 12px 36px; border:1px solid var(--line); border-radius:20px; background:rgba(251,248,243,.55); text-align:left; }
.selector__option--active { border:2px solid var(--accent); padding:11px 11px 35px; background:var(--paper); box-shadow:0 16px 20px rgba(168,79,18,.16); }
.selector__option:focus-visible { outline:3px solid var(--brown-900); outline-offset:5px; }
.selector__visual { position:relative; display:block; height:420px; border-radius:12px; overflow:hidden; background:white; }
.selector__photo, .selector__copy { opacity:.5; transition:opacity .25s ease; }
.selector__option--active .selector__photo, .selector__option--active .selector__copy { opacity:1; }
@media (prefers-reduced-motion:reduce) { .selector__photo, .selector__copy { transition:none; } }
.selector__photo { width:100%; height:100%; object-fit:contain; }
.selector__badge { position:absolute; top:16px; right:16px; display:flex; align-items:center; gap:8px; padding:8px 14px 8px 10px; border:1px solid var(--line); border-radius:999px; background:white; box-shadow:0 4px 12px rgba(63,38,29,.12); font-size:14px; font-weight:500; white-space:nowrap; }
.selector__option--active .selector__badge { border-color:transparent; background:var(--accent); color:var(--paper); }
.selector__circle { width:20px; height:20px; border:1.5px solid var(--line); border-radius:50%; }
.selector__copy { display:flex; flex-direction:column; gap:20px; padding-inline:24px; }
.selector__tags { color:var(--orange-700); }
.selector__caption { color:var(--brown-700); }
.selector__notch { position:absolute; bottom:-14px; left:calc(50% - 12px); display:flex; justify-content:center; align-items:flex-start; width:24px; height:12px; transform:rotate(180deg); }
@media (max-width:1200px) { .selector__visual { height:340px; } }
@media (max-width:900px) { .solution { padding-top:80px; } .selector__visual { height:270px; } .selector__copy { padding-inline:12px; gap:14px; } .selector__name { font-size:36px; } .selector__caption { font-size:16px; } .selector__tags { font-size:10px; } }
@media (max-width:640px) { .selector { grid-template-columns:1fr; } .selector__visual { height:300px; } .selector__option { padding-bottom:28px; } .selector__badge { top:12px; right:12px; } .selector__name { font-size:38px; } .selector__tags { font-size:11px; } }
</style>
