<script setup lang="ts">
definePageMeta({ key: (route) => route.path })

const route = useRoute()
const slug = String(route.params.slug)
const realisations = await useRealisations()
const realisation = computed(() => realisations.value.find((item) => item.slug === slug))
if (!realisation.value) {
  throw createError({ statusCode: 404, statusMessage: 'Réalisation introuvable', fatal: true })
}
const projet = computed(() => realisation.value!)
const gammes = await useGammes()
const titre = computed(() => projet.value.titre || projet.value.nom)
const infos = computed(() => projet.value.infos?.length
  ? projet.value.infos
  : [{ label: 'Gamme', valeur: gammes.value[projet.value.gamme]?.nom || projet.value.gamme }],
)
const hero = computed(() => ({ titre: titre.value }))
const autresRealisations = computed(() => realisations.value
  .filter((item) => item.slug !== slug)
  .slice(0, 3))

usePageSeo(() => ({
  titre: `${titre.value} | Abri Toi`,
  description: projet.value.description,
  image: projet.value.photo,
  fil: [
    { nom: 'Réalisations', chemin: '/realisations' },
    { nom: projet.value.nomProjet || projet.value.nom, chemin: `/realisations/${slug}` },
  ],
}))
</script>

<template>
  <div>
    <main>
      <PageHero :hero="hero" large />

      <section class="realisation section" aria-label="Détail de la réalisation">
        <nav class="fil label-mono" aria-label="Fil d’Ariane">
          <NuxtLink to="/realisations">Réalisations</NuxtLink>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{{ projet.nomProjet || projet.nom }}</span>
        </nav>

        <RealisationProjet
          :photo="projet.photo"
          :nom-projet="projet.nomProjet || projet.nom"
          :infos="infos"
          :galerie="projet.galerie"
        />

        <div v-if="projet.description || projet.contenu?.length" class="description">
          <p v-if="projet.description" class="body-l">{{ projet.description }}</p>
          <p v-for="(paragraphe, i) in projet.contenu" :key="i" class="body-m">{{ paragraphe }}</p>
        </div>

        <UiLink class="retour" label="Toutes les réalisations" to="/realisations" />
      </section>

      <section v-if="autresRealisations.length" class="autres section" aria-labelledby="autres-realisations">
        <div class="autres__entete">
          <h2 id="autres-realisations" class="display-h2">Autres réalisations</h2>
          <UiLink label="Toutes les réalisations" to="/realisations" />
        </div>
        <ul class="autres__grille">
          <li v-for="item in autresRealisations" :key="item.slug">
            <NuxtLink class="autres__carte" :to="`/realisations/${item.slug}`">
              <img :src="img(item.photo, 800)" :alt="alt(item.photo) || item.nom" loading="lazy" />
              <h3 class="display-h4">{{ item.nom }}</h3>
              <span class="autres__lien">Voir la réalisation <span aria-hidden="true">→</span></span>
            </NuxtLink>
          </li>
        </ul>
      </section>

      <ContactCta />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.realisation {
  display: flex;
  flex-direction: column;
  gap: 48px;
  padding-block: 64px 96px;
  background: var(--paper);
}

.fil {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  color: var(--brown-700);
  overflow-wrap: anywhere;
}

.fil a {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.description {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 820px;
  max-width: 100%;
  color: var(--brown-700);
  overflow-wrap: anywhere;
}

.retour {
  align-self: flex-start;
}

.autres { padding-block: 96px; background: var(--cream); }
.autres__entete { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 48px; }
.autres__grille { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px; list-style: none; padding: 0; margin: 0; }
.autres__carte { display: flex; flex-direction: column; gap: 20px; height: 100%; overflow-wrap: anywhere; }
.autres__carte img { width: 100%; aspect-ratio: 1.55; object-fit: cover; border-radius: 16px; }
.autres__carte:hover h3 { text-decoration: underline; text-decoration-color: var(--orange-500); text-underline-offset: 5px; }
.autres__carte:focus-visible { outline: 2px solid var(--orange-700); outline-offset: 6px; border-radius: 16px; }
.autres__lien { align-self: flex-start; margin-top: auto; border-bottom: 1px solid var(--orange-700); padding-bottom: 6px; }
.autres__lien span { color: var(--orange-700); margin-left: 8px; }
@media (max-width: 1024px) {
  .autres__grille { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .realisation { gap: 32px; padding-block: 32px 64px; }
  .autres { padding-block: 64px; }
  .autres__entete { flex-direction: column; align-items: flex-start; margin-bottom: 32px; }
  .autres__grille { grid-template-columns: 1fr; }
}
</style>
