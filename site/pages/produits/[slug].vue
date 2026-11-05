<script setup lang="ts">
import { limitesDemande, erreurDemande } from '~/utils/demande'
import { galeriesProduits } from '~/content/galeriesProduits'
definePageMeta({ key: (route) => route.path })
const route = useRoute()
const slug = computed(() => String(route.params.slug))

const [produits, gammes, textes, parametres] = await Promise.all([
  useProduits(), useGammes(), useFicheProduit(), useParametres(),
])

const produit = computed(() => produits.value.find((p) => p.slug === slug.value && p.fiche))
if (!produit.value) throw createError({ statusCode: 404, statusMessage: 'Produit introuvable', fatal: true })

const fiche = computed(() => {
  const base = produit.value!.fiche!
  // La carte et la première vue de la fiche représentent toujours la même configuration.
  const principale = produit.value!.carte.visuel
  const vues = [principale, ...(base.galerie ?? []), ...(galeriesProduits[slug.value] ?? [])]
  const dejaVues = new Set<string>()
  return {
    ...base,
    galerie: vues.filter((image) => {
      // Une image CMS sans fichier ne doit pas créer de miniature vide.
      const source = image as typeof image & { asset?: { _ref?: string } }
      if (!source || !(source.src?.trim() || source.asset?._ref)) return false
      const cle = JSON.stringify(image, ['src', 'asset', '_ref', 'crop', 'hotspot', 'left', 'top', 'right', 'bottom', 'x', 'y', 'width', 'height'])
      if (dejaVues.has(cle)) return false
      dejaVues.add(cle)
      return true
    }),
  }
})
const gamme = computed(() => gammes.value[produit.value!.gamme])

usePageSeo(() => ({
  titre: ({
    'banc-galileo': 'Banc Galiléo avec toiture d’ombrage | Abri Toi',
    'banc-fotos': 'Banc Fotos avec pergola végétalisée | Abri Toi',
  } as Record<string, string>)[slug.value] || `${fiche.value.titre} : mobilier ombragé | Abri Toi`,
  description: fiche.value.description || `${produit.value!.nom} : découvrez cette configuration de mobilier abrité ${gamme.value.nom}, conçue pour vos espaces extérieurs.`,
  image: produit.value!.carte.visuel,
  fil: [{ nom: 'Produits', chemin: '/produits' }, { nom: fiche.value.titre, chemin: `/produits/${slug.value}` }],
}))

// Galerie : la vignette choisie s'affiche en grand
const choisie = ref(0)
watch(() => route.fullPath, () => (choisie.value = 0))
const photo = computed(() => fiche.value.galerie?.[choisie.value] ?? fiche.value.galerie?.[0])

const similaires = computed(() =>
  (fiche.value.similaires ?? []).flatMap((s) => {
    const cible = produits.value.find((p) => p.slug === s.produit)
    if (!cible?.fiche || cible.slug === produit.value!.slug) return []
    return [{ titre: cible.nom, description: cible.carte.description, visuel: cible.carte.visuel, to: lienProduit(cible) }]
  }),
)

// Le téléchargement reste disponible si le service d'e-mail est indisponible.
const email = ref('')
const website = ref('')
const erreur = ref('')
const etat = ref<'' | 'envoi' | 'emailed' | 'download-only' | 'erreur'>('')
const documentsRecus = ref<{ label: string; url: string }[] | null>(null)
const pdfs = computed(() => documentsRecus.value ?? [
  { label: `Documentation ${gamme.value.nom}`, url: gamme.value.documentation },
  { label: `Fiches techniques ${gamme.value.nom}`, url: gamme.value.ficheTechnique },
].filter((p) => p.url))
watch(slug, () => { etat.value = ''; documentsRecus.value = null })
async function demanderDoc() {
  if (etat.value === 'envoi') return
  etat.value = 'envoi'
  erreur.value = ''
  try {
    const result = await $fetch<{ delivery: 'emailed' | 'download-only'; documents: { label: string; url: string }[] }>('/api/demande', {
      method: 'POST',
      body: { type: 'documentation', email: email.value, website: website.value, produit: fiche.value.titre, gamme: produit.value!.gamme },
    })
    documentsRecus.value = result.documents
    etat.value = result.delivery
  } catch (error) {
    const refus = erreurDemande(error)
    erreur.value = refus ?? `L’envoi n’a pas abouti. Écrivez-nous à ${parametres.value.email}.`
    etat.value = refus ? 'erreur' : pdfs.value.length ? 'download-only' : 'erreur'
  }
}
</script>

<template>
  <div>
    <main>
      <section class="entete section">
        <AppNav class="entete__nav" />
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
                <img :src="img(image, 200)" alt="" loading="lazy" />
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
            <UiButton pill label="Demander un devis" :to="`/contact?produit=${encodeURIComponent(produit.slug)}`" />
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

        <div class="documents">
        <form id="documentation" class="doc" @submit.prevent="demanderDoc">
          <h2 class="display-h3">{{ textes.documentation.titre }}</h2>
          <p class="body-m doc__texte">{{ textes.documentation.texte }}</p>
          <template v-if="etat !== 'emailed' && etat !== 'download-only'">
            <label class="form-trap" aria-hidden="true">
              Laisser ce champ vide
              <input v-model="website" name="website" tabindex="-1" autocomplete="off" :maxlength="limitesDemande.website" />
            </label>
            <label class="doc__champ">
              <span class="label-mono">{{ textes.documentation.champ }}</span>
              <input v-model="email" type="email" required :maxlength="limitesDemande.email" autocomplete="email" :placeholder="textes.documentation.placeholder" />
            </label>
            <UiButton submit pill :label="textes.documentation.bouton" :disabled="etat === 'envoi'" />
            <p v-if="etat === 'erreur'" class="doc__message" role="alert">
              {{ erreur }}
            </p>
          </template>
          <div v-else class="doc__message" role="status">
            <template v-if="pdfs.length">
              <p v-if="etat === 'emailed'">Merci ! Vos documents ont été envoyés à {{ email }}. Vous pouvez aussi les télécharger :</p>
              <p v-else>L’envoi par e-mail n’a pas pu être confirmé. Téléchargez vos documents ici :</p>
              <ul class="doc__pdfs">
                <li v-for="p in pdfs" :key="p.url">
                  <a :href="p.url" target="_blank" rel="noopener" download>{{ p.label }} (PDF)</a>
                </li>
              </ul>
            </template>
            <p v-else>L’envoi n’a pas pu être confirmé. Écrivez-nous à {{ parametres.email }}.</p>
          </div>
        </form>
        <aside class="doc" aria-labelledby="titre-fichiers">
          <h2 id="titre-fichiers" class="display-h3">Recevez le fichier DWG ou 3D</h2>
          <UiButton pill label="Recevoir le fichier" :to="`/contact?demande=dwg&amp;produit=${encodeURIComponent(slug)}#formulaire`" />
        </aside>
        </div>
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
.form-trap {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.entete {
  padding-top: 20px;
  padding-bottom: 20px;
  background: var(--brown-900);
}

/* Même position que la nav de l'accueil */
.entete__nav {
  margin-inline: 0;
}

@media (max-width: 1024px) {
  .entete__nav {
    margin-inline: 0;
  }
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
  max-height: 520px;
  overflow-y: auto;
  flex-shrink: 0;
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
  padding: 0;
  background: var(--white);
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
  object-fit: contain;
}

.galerie__photo {
  flex: 1;
  min-width: 0;
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

.documents { display:flex; flex-direction:column; gap:24px; width:440px; flex:none; }

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

.doc__pdfs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
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

  .documents, .doc {
    width: 100%;
  }

  .reassurance,
  .similaires__grille {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .hero, .reassurance, .technique, .similaires {
    padding-top: 48px;
    padding-bottom: 48px;
  }

  .hero, .technique { gap: 40px; }
  .reassurance { gap: 32px; }

  .galerie {
    flex-direction: column-reverse;
    gap: 10px;
  }

  .galerie__vignettes {
    max-height: none;
    overflow-x: auto;
    overflow-y: hidden;
    flex-direction: row;
    gap: 10px;
    width: 100%;
  }

  .galerie__vignette {
    width: min(80px, calc((100vw - 70px) / 4));
    height: min(80px, calc((100vw - 70px) / 4));
  }

  .galerie__photo {
    flex: none;
    width: 100%;
    height: 520px;
  }

  .infos__nom {
    font-size: 40px;
  }

  .infos__actions { flex-direction: column; align-items: flex-start; gap: 24px; }
  .caracteristiques { width: 100%; }
  .caracteristiques > h2, .doc > h2, .similaires__entete > h2 { font-size: 26px; }

  .caracteristiques__ligne {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .doc { padding: 24px; }
  .similaires__entete { flex-direction: column; align-items: stretch; gap: 24px; }
  .similaires__entete :deep(.link) { align-self: flex-end; }
}
</style>
