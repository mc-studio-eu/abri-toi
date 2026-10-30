<script setup lang="ts">
// Pages légales : mentions légales, politique de confidentialité, politique de cookies.
const route = useRoute()
const slug = computed(() => String(route.params.slug))
const page = computed(() => pagesLegales.find((p) => p.slug === slug.value) ?? null)
if (!page.value) throw createError({ statusCode: 404, statusMessage: 'Page introuvable', fatal: true })
const l = computed(() => page.value!)

useHead({ title: () => `${l.value.titre} — Abri Toi` })

const corps = ref<{ intertitres: { id: string; titre: string }[] }>()
const sommaire = computed(() => corps.value?.intertitres ?? [])
</script>

<template>
  <div>
    <main>
      <PageHero :hero="{ titre: l.titre, chapo: l.chapo }" />

      <section class="legal section">
        <aside v-if="sommaire.length" class="aside">
          <p class="label-mono aside__titre">Sommaire</p>
          <ol class="aside__sommaire">
            <li v-for="(partie, i) in sommaire" :key="partie.id">
              <a :href="`#${partie.id}`"><span>{{ String(i + 1).padStart(2, '0') }}</span>{{ partie.titre }}</a>
            </li>
          </ol>
        </aside>

        <div class="contenu">
          <ArticleCorps ref="corps" :blocs="l.corps" />
          <p v-if="l.misAJour" class="label-mono contenu__maj">Dernière mise à jour : {{ dateLongue(l.misAJour) }}</p>
        </div>
      </section>
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.legal {
  display: flex;
  align-items: flex-start;
  gap: 120px;
  padding-top: 96px;
  padding-bottom: 120px;
  background: var(--paper);
}

.aside {
  position: sticky;
  top: 32px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 260px;
  flex: none;
}

.aside__titre {
  color: var(--orange-700);
}

.aside__sommaire {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.aside__sommaire a {
  display: flex;
  gap: 12px;
  font-size: 16px;
  line-height: 1.55;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.aside__sommaire a:hover {
  opacity: 1;
}

.contenu {
  display: flex;
  flex-direction: column;
  gap: 48px;
  width: 720px;
  max-width: 100%;
}

.contenu__maj {
  padding-top: 32px;
  border-top: 1px solid rgba(63, 38, 29, 0.15);
  opacity: 0.6;
  text-transform: none;
}

@media (max-width: 1024px) {
  .legal {
    flex-direction: column;
    gap: 48px;
    padding-top: 64px;
    padding-bottom: 80px;
  }

  .aside {
    position: static;
    width: 100%;
  }
}
</style>
