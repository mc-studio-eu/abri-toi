<script setup lang="ts">
import { articleComplet, texteArticle } from '~/utils/contenuPublic'
definePageMeta({ key: (route) => route.path })
const route = useRoute()
const slug = String(route.params.slug)

const article = await useArticle(slug)
if (!article.value) throw createError({ statusCode: 404, statusMessage: 'Article introuvable', fatal: true })
const a = computed(() => article.value!)

const textes = await usePageArticles()
const tous = await useArticles()

const complet = computed(() => articleComplet(a.value))
usePageSeo(() => ({
  titre: `${a.value.titre} | Abri Toi`,
  description: a.value.extrait || a.value.intro || (complet.value ? texteArticle(a.value) : '') || `Article en préparation sur le thème « ${a.value.titre} ». Découvrez les réflexions d’Abri Toi sur l’ombrage et les espaces extérieurs.`,
  image: a.value.illustration || a.value.couverture,
  noindex: !complet.value,
  type: complet.value ? 'article' : 'website',
  fil: [{ nom: 'Articles', chemin: '/articles' }, { nom: a.value.titre, chemin: `/articles/${slug}` }],
  article: complet.value ? { titre: a.value.titre, date: a.value.date, auteur: a.value.auteur?.nom } : undefined,
}))

const hero = computed(() => ({ titre: a.value.titre }))
const corps = ref<{ intertitres: { id: string; titre: string }[] }>()
const sommaire = computed(() => corps.value?.intertitres ?? [])

// Partie en cours de lecture, mise en avant dans le sommaire
const actif = ref('')
let observer: IntersectionObserver | undefined
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && (actif.value = e.target.id)),
    { rootMargin: '0px 0px -70% 0px' },
  )
  document.querySelectorAll('[id^="partie-"]').forEach((el) => observer!.observe(el))
})
onBeforeUnmount(() => observer?.disconnect())

const url = useRequestURL()
const partage = computed(() => ({
  linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url.href)}`,
  email: `mailto:?subject=${encodeURIComponent(a.value.titre)}&body=${encodeURIComponent(url.href)}`,
}))
const copie = ref(false)
async function copierLien() {
  await navigator.clipboard.writeText(location.href)
  copie.value = true
  setTimeout(() => (copie.value = false), 2000)
}

const aLire = computed(() => tous.value.filter((x) => x.slug !== slug).slice(0, 3))
</script>

<template>
  <div>
    <main>
      <PageHero :hero="hero" large>
        <template #chapo>
          <p class="body-l meta">
            <span v-if="a.auteur?.nom">Par {{ a.auteur.nom }}, fondateur d’Abri Toi</span><br />
            <span>Publié le {{ dateLongue(a.date) }}</span>
          </p>
        </template>
      </PageHero>

      <section class="couverture section">
        <ArticleCouverture :article="a" :image="a.illustration" loading="eager" :sizes="taillesImageSection" :full-width="slug === 'brumisation-haute-pression'" class="couverture__visuel" :class="{ 'couverture__visuel--illu': a.illustration }" />
        <p v-if="a.legendeIllustration" class="label-mono couverture__legende">{{ a.legendeIllustration }}</p>
      </section>

      <section class="article section">
        <aside class="aside">
          <template v-if="sommaire.length">
            <p class="label-mono aside__titre">Sommaire</p>
            <ol class="aside__sommaire">
              <li v-for="(partie, i) in sommaire" :key="partie.id">
                <a :href="`#${partie.id}`" :class="{ 'aside__lien--actif': actif === partie.id || (!actif && i === 0) }">
                  <span>{{ String(i + 1).padStart(2, '0') }}</span>{{ partie.titre }}
                </a>
              </li>
            </ol>
            <hr class="aside__trait" />
          </template>
          <p class="label-mono aside__titre">Partager</p>
          <div class="aside__partage">
            <a :href="partage.linkedin" target="_blank" rel="noopener">LinkedIn</a>
            <a :href="partage.email">E-mail</a>
            <button type="button" @click="copierLien">{{ copie ? 'Lien copié' : 'Copier le lien' }}</button>
          </div>
        </aside>

        <div class="contenu">
          <p v-if="a.intro" class="contenu__intro">{{ a.intro }}</p>
          <ArticleCorps ref="corps" :blocs="a.corps" />
          <div v-if="a.auteur?.nom" class="auteur">
            <img v-if="a.auteur.photo" :src="img(a.auteur.photo, 112, 112)" loading="lazy" width="56" height="56" alt="" class="auteur__photo" />
            <img v-else src="/images/figma-secondary/paul-saraceno.png" loading="lazy" alt="" width="56" height="56" class="auteur__photo" />
            <div>
              <p class="auteur__nom">{{ a.auteur.nom }}</p>
              <p class="body-m">{{ a.auteur.bio }}</p>
            </div>
          </div>
        </div>
      </section>

      <section v-if="aLire.length" class="a-lire section">
        <div class="a-lire__entete">
          <h2 class="display-h2">{{ textes.titreALireAussi }}</h2>
          <UiLink label="Tous les articles" to="/articles" />
        </div>
        <ul class="a-lire__grille">
          <li v-for="(x, i) in aLire" :key="x.slug" v-reveal="i * 100">
            <ArticleCarte :article="x" />
          </li>
        </ul>
      </section>

      <ContactCta />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.meta {
  opacity: 0.85;
}

.couverture {
  display: flex;
  flex-direction: column;
  gap: 48px;
  padding-top: 64px;
  background: var(--paper);
}

.couverture__visuel {
  height: 560px;
}

.couverture__visuel--illu {
  height: auto;
}

.couverture__visuel--illu :deep(.couv__illu) {
  position: relative;
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
}

.couverture__legende {
  opacity: 0.6;
}

.article {
  display: flex;
  align-items: flex-start;
  gap: 120px;
  padding-top: 96px;
  padding-bottom: 96px;
  background: var(--paper);
}

.aside {
  position: sticky;
  top: var(--nav-content-offset);
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

.aside__sommaire a:hover,
.aside__sommaire .aside__lien--actif {
  opacity: 1;
}

.aside__trait {
  width: 100%;
  margin: 0;
  border: 0;
  border-top: 1px solid rgba(63, 38, 29, 0.15);
}

.aside__partage {
  display: flex;
  flex-wrap: wrap;
  gap: 0 16px;
  font-size: 16px;
  line-height: 1.55;
}

.aside__partage a,
.aside__partage button {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
}

.aside__partage a:hover,
.aside__partage button:hover {
  text-decoration: underline;
}

.contenu {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 720px;
  max-width: 100%;
  min-width: 0;
  overflow-wrap: anywhere;
}

.contenu__intro {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 24px;
  line-height: 1.4;
}

.auteur {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 32px;
  border-top: 1px solid rgba(63, 38, 29, 0.15);
}

.auteur__photo {
  width: 56px;
  height: 56px;
  flex: none;
  border-radius: 50%;
  object-fit: cover;
}

.auteur__nom {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 20px;
  line-height: 1.25;
}

.auteur > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.a-lire {
  display: flex;
  flex-direction: column;
  gap: 48px;
  padding-top: 96px;
  padding-bottom: 96px;
  background: var(--cream);
}

.a-lire__entete {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.a-lire__grille {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

@media (max-width: 1024px) {
  .article {
    flex-direction: column;
    gap: 48px;
  }

  .aside {
    position: static;
    width: 100%;
  }

  .couverture__visuel {
    height: 400px;
  }

  .couverture__visuel--illu {
    height: auto;
  }

  .a-lire__grille {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .aside__sommaire a {
    min-height: 44px;
    align-items: baseline;
    padding-block: 6px;
  }
}

@media (max-width: 640px) {
  .couverture {
    gap: 32px;
    padding-top: 48px;
  }

  .couverture__visuel {
    height: auto;
    aspect-ratio: 1280 / 560;
  }

  .couverture__visuel--illu {
    aspect-ratio: auto;
  }

  .article,
  .a-lire {
    padding-block: 64px;
  }

  .article {
    gap: 40px;
  }

  .aside__trait {
    width: 260px;
    max-width: 100%;
  }

  .contenu__intro {
    font-size: 24px;
  }

  .a-lire {
    gap: 32px;
  }

  .a-lire__grille {
    grid-template-columns: 1fr;
  }

  .a-lire__entete {
    flex-direction: column;
    align-items: flex-end;
  }

  .a-lire__entete h2 {
    align-self: flex-start;
  }
}
</style>
