<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug))

const produits = await useProduits()
const gammes = await useGammes()
const textes = await useFicheProduit()
const parametres = await useParametres()

const produit = computed(() => produits.value.find((p) => p.slug === slug.value && p.fiche))
if (!produit.value) throw createError({ statusCode: 404, statusMessage: 'Produit introuvable', fatal: true })

const fiche = computed(() => produit.value!.fiche!)
const gamme = computed(() => gammes.value[produit.value!.gamme])

useHead({ title: () => `${fiche.value.titre} — Abri Toi`, meta: [{ name: 'description', content: () => fiche.value.description }] })

// Galerie : la vignette choisie s'affiche en grand
const choisie = ref(0)
watch(slug, () => (choisie.value = 0))
const photo = computed(() => fiche.value.galerie?.[choisie.value] ?? fiche.value.galerie?.[0])

const similaires = computed(() =>
  (fiche.value.similaires ?? []).map((s) => {
    const cible = produits.value.find((p) => p.slug === s.produit)
    return { ...s, visuel: cible?.carte.visuel, to: lienProduit(cible) }
  }),
)

// Demande de documentation : e-mail obligatoire, puis téléchargement si un PDF est en ligne
const email = ref('')
const etat = ref<'' | 'envoi' | 'ok' | 'erreur'>('')
const lienDoc = ref('')
async function demanderDoc() {
  etat.value = 'envoi'
  try {
    const res = await $fetch<{ documentation?: string }>('/api/demande', {
      method: 'POST',
      body: { type: 'documentation', email: email.value, produit: fiche.value.titre, gamme: produit.value!.gamme },
    })
    lienDoc.value = res.documentation || ''
    etat.value = 'ok'
    if (lienDoc.value) window.open(lienDoc.value, '_blank', 'noopener')
  } catch {
    etat.value = 'erreur'
  }
}
</script>

<template>
  <div>
    <main>
      <section class="entete section">
        <AppNav />
      </section>

      <section class="hero section">
        <div class="galerie">
          <ul class="galerie__vignettes">
            <li v-for="(image, i) in fiche.galerie" :key="i">
              <button
                type="button"
                class="galerie__vignette"
                :class="{ 'galerie__vignette--active': i === choisie }"
                :aria-label="`Voir la photo ${i + 1}`"
                :aria-pressed="i === choisie"
                @click="choisie = i"
              >
                <img :src="img(image, 200, 200)" alt="" />
              </button>
            </li>
          </ul>
          <div class="galerie__photo">
            <Transition name="fondu" mode="out-in">
              <img :key="choisie" :src="img(photo, 1400)" :alt="alt(photo) || fiche.titre" />
            </Transition>
          </div>
        </div>

        <div class="infos">
          <div class="infos__titre">
            <h1 class="infos__nom">{{ fiche.titre }}</h1>
            <p class="display-h4 infos__sous-titre">{{ fiche.sousTitre }}</p>
          </div>
          <p class="body-l infos__description">{{ fiche.description }}</p>
          <div class="infos__actions">
            <UiButton pill :label="textes.boutonDevis" />
            <UiButton pill variant="outline-dark" :label="`Documentation ${gamme.nom}`" to="#documentation" />
          </div>
        </div>
      </section>

      <HomePartners />

      <section class="reassurance section">
        <div v-for="(r, i) in gamme.reassurance" :key="r.titre" v-reveal="i * 100" class="reassurance__item">
          <img :src="img(r.icone, 144)" alt="" width="72" height="72" />
          <h2 class="display-h4">{{ r.titre }}</h2>
          <p class="reassurance__texte">{{ r.texte }}</p>
        </div>
      </section>

      <section class="technique section">
        <div class="caracteristiques">
          <h2 class="display-h3">{{ textes.titreCaracteristiques }}</h2>
          <dl>
            <div v-for="ligne in fiche.caracteristiques" :key="ligne.label" class="caracteristiques__ligne">
              <dt class="label-mono">{{ ligne.label }}</dt>
              <dd class="body-m">{{ ligne.valeur }}</dd>
            </div>
          </dl>
        </div>

        <form id="documentation" class="doc" @submit.prevent="demanderDoc">
          <h2 class="display-h3">{{ textes.documentation.titre }}</h2>
          <p class="body-m doc__texte">{{ textes.documentation.texte }}</p>
          <template v-if="etat !== 'ok'">
            <label class="doc__champ">
              <span class="label-mono">{{ textes.documentation.champ }}</span>
              <input v-model="email" type="email" required autocomplete="email" :placeholder="textes.documentation.placeholder" />
            </label>
            <UiButton submit pill :label="textes.documentation.bouton" :disabled="etat === 'envoi'" />
            <p v-if="etat === 'erreur'" class="doc__message" role="alert">
              L’envoi n’a pas abouti. Écrivez-nous à {{ parametres.email }}.
            </p>
          </template>
          <p v-else class="doc__message" role="status">
            <template v-if="lienDoc">
              Merci ! Le téléchargement a démarré.
              <a :href="lienDoc" target="_blank" rel="noopener">Ouvrir la documentation</a>
            </template>
            <template v-else>Merci ! Nous vous envoyons la documentation par e-mail très vite.</template>
          </p>
        </form>
      </section>

      <section v-if="similaires.length" class="similaires section">
        <div class="similaires__entete">
          <h2 class="display-h3">{{ textes.titreSimilaires }}</h2>
          <UiLink label="Toute la collection" to="/produits" />
        </div>
        <ul class="similaires__grille">
          <li v-for="(s, i) in similaires" :key="i" v-reveal="i * 100">
            <ProduitCarte :titre="s.titre" :description="s.description" :visuel="s.visuel" :to="s.to" />
          </li>
        </ul>
      </section>

      <ContactCta />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.entete {
  padding-top: 20px;
  padding-bottom: 20px;
  background: var(--brown-900);
}

.hero {
  display: flex;
  align-items: flex-start;
  gap: 64px;
  padding-top: 72px;
  padding-bottom: 64px;
  background: var(--cream);
}

.galerie {
  display: flex;
  gap: 12px;
  width: 720px;
  max-width: 100%;
  flex: none;
}

.galerie__vignettes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.galerie__vignette {
  display: block;
  width: 96px;
  height: 96px;
  overflow: hidden;
  border: 2px solid transparent;
  border-radius: 8px;
  opacity: 0.75;
  transition: opacity 0.2s, border-color 0.2s;
}

.galerie__vignette:hover {
  opacity: 1;
}

.galerie__vignette--active {
  border-color: var(--orange-500);
  opacity: 1;
}

.galerie__vignette img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.galerie__photo {
  flex: 1;
  height: 520px;
  overflow: hidden;
  border-radius: 12px;
  background: var(--white);
}

.galerie__photo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.fondu-enter-active,
.fondu-leave-active {
  transition: opacity 0.25s;
}

.fondu-enter-from,
.fondu-leave-to {
  opacity: 0;
}

.infos {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

.infos__titre {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.infos__nom {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 68px;
  line-height: 1;
  letter-spacing: -0.03em;
}

.infos__sous-titre,
.infos__description {
  color: var(--brown-700);
}

.infos__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.reassurance {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 48px;
  padding-top: 72px;
  padding-bottom: 72px;
  background: var(--paper);
}

.reassurance__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.reassurance__texte {
  font-size: 14px;
  line-height: 1.5;
  color: var(--brown-700);
}

.technique {
  display: flex;
  align-items: flex-start;
  gap: 80px;
  padding-top: 72px;
  padding-bottom: 72px;
  background: var(--cream);
}

.caracteristiques {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

.caracteristiques dl {
  margin: 0;
}

.caracteristiques__ligne {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  gap: 24px;
  padding: 18px 0;
  border-bottom: 1px solid var(--line);
}

.caracteristiques__ligne dt {
  color: var(--brown-500);
}

.caracteristiques__ligne dd {
  margin: 0;
}

.doc {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  width: 440px;
  flex: none;
  padding: 32px;
  border-radius: 20px;
  background: var(--brown-900);
  color: var(--cream);
  scroll-margin-top: 24px;
}

.doc__texte {
  opacity: 0.8;
}

.doc__champ {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.doc__champ input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(244, 238, 229, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--cream);
  font: inherit;
  font-size: 16px;
}

.doc__champ input::placeholder {
  color: var(--cream);
  opacity: 0.5;
}

.doc__champ input:focus {
  outline: 2px solid var(--orange-500);
  outline-offset: 1px;
}

.doc__message {
  font-size: 15px;
  line-height: 1.5;
}

.doc__message a {
  color: var(--orange-500);
  text-decoration: underline;
}

.similaires {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-top: 72px;
  padding-bottom: 72px;
  background: var(--paper);
}

.similaires__entete {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.similaires__grille {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
}

.similaires__grille > li,
.similaires__grille > li > * {
  height: 100%;
}

@media (max-width: 1200px) {
  .hero {
    flex-direction: column;
  }

  .galerie {
    width: 100%;
  }
}

@media (max-width: 1024px) {
  .technique {
    flex-direction: column;
  }

  .doc {
    width: 100%;
  }

  .reassurance,
  .similaires__grille {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .galerie {
    flex-direction: column-reverse;
  }

  .galerie__vignettes {
    flex-direction: row;
  }

  .galerie__vignette {
    width: 72px;
    height: 72px;
  }

  .galerie__photo {
    height: 320px;
  }

  .infos__nom {
    font-size: 44px;
  }

  .caracteristiques__ligne {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>
