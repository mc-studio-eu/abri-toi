<script setup lang="ts">
import { limitesDemande, erreurDemande } from '~/utils/demande'
const [page, parametres, produits] = await Promise.all([
  usePageContact(), useParametres(), useProduits(),
])
const route = useRoute()
const chargementInitial = useNuxtApp().isHydrating
const prefixeDemandeFichier = 'Demande de fichier DWG ou 3D\n\n'
const demandeFichier = computed(() => route.query.demande === 'dwg')

onMounted(async () => {
  if (!chargementInitial || window.location.hash !== '#formulaire') return

  // Le chargement des polices peut déplacer le formulaire après le saut initial.
  await document.fonts.ready
  if (window.location.hash === '#formulaire') {
    document.getElementById('formulaire')?.scrollIntoView({ behavior: 'instant' })
  }
})

usePageSeo({
  titre: 'Votre projet d’ombrage : contactez Abri Toi',
  description: 'Un projet d’ombrage pour votre collectivité, école ou entreprise ? Contactez Abri Toi à Lyon pour étudier votre site et choisir une solution adaptée.',
  fil: [{ nom: 'Contact', chemin: '/contact' }],
})

const f = computed(() => page.value.formulaire)
const tel = computed(() => `tel:+33${parametres.value.telephone?.replace(/\D/g, '').replace(/^0/, '')}`)
const catalogue = computed(() => produits.value.filter((produit) => produit.fiche))
const gammeParDefaut = () => f.value.gammes.find((gamme) => gamme === 'Les deux') ?? ''
const libelleGamme = (cle: string) => f.value.gammes.find((gamme) =>
  gamme.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().startsWith(cle),
) ?? ''

const gammesAffichees = computed(() => [
  { valeur: libelleGamme('galileo'), label: 'Galiléo' },
  { valeur: libelleGamme('fotos'), label: 'Fotos' },
  { valeur: gammeParDefaut(), label: 'Les deux' },
].filter((gamme) => gamme.valeur))

const form = reactive({
  profil: f.value.typesClient[0] ?? '',
  prenom: '',
  nom: '',
  organisation: '',
  fonction: '',
  email: '',
  telephone: '',
  gamme: gammeParDefaut(),
  produit: '',
  codePostal: '',
  echeance: f.value.echeances[0] ?? '',
  message: '',
  consentement: false,
  website: '',
})
const etat = ref<'' | 'envoi' | 'ok' | 'erreur'>('')
const erreur = ref('')
const produitSelectionne = computed(() => catalogue.value.find((produit) => produit.slug === form.produit))

let validationPlanifiee = false
function montrerChampInvalide(event: Event) {
  if (validationPlanifiee) return
  const formulaire = event.currentTarget as HTMLFormElement
  validationPlanifiee = true
  // La validation native défile d'abord ; replacer ensuite le champ sous la navigation.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    validationPlanifiee = false
    if (!formulaire.isConnected) return
    const champ = formulaire.querySelector<HTMLElement>('input:invalid, select:invalid, textarea:invalid')
    champ?.focus({ preventScroll: true })
    champ?.scrollIntoView({ block: 'center', behavior: 'instant' })
  }))
}

watch(produitSelectionne, (produit) => {
  if (produit) form.gamme = libelleGamme(produit.gamme)
}, { flush: 'sync' })

watch(() => form.gamme, (gamme) => {
  if (produitSelectionne.value && gamme !== libelleGamme(produitSelectionne.value.gamme)) form.produit = ''
}, { flush: 'sync' })

watch(() => route.query.produit, (slug) => {
  const produit = typeof slug === 'string' ? catalogue.value.find((produit) => produit.slug === slug) : undefined
  form.produit = produit?.slug ?? ''
  form.gamme = produit ? libelleGamme(produit.gamme) : gammeParDefaut()
}, { immediate: true })

let messagePrefill = ''
watch([demandeFichier, produitSelectionne], ([fichier, produit]) => {
  const message = fichier
    ? `Bonjour, je souhaite recevoir le fichier DWG ou 3D${produit ? ` du produit ${produit.fiche?.titre}` : ''}.`
    : ''
  if (!form.message || form.message === messagePrefill) form.message = message
  messagePrefill = message
}, { immediate: true })

async function envoyer() {
  if (etat.value === 'envoi') return
  etat.value = 'envoi'
  erreur.value = ''
  try {
    await $fetch('/api/demande', {
      method: 'POST',
      body: { type: 'contact', ...form, produit: produitSelectionne.value?.fiche?.titre ?? '', message: demandeFichier.value ? `${prefixeDemandeFichier}${form.message}` : form.message },
    })
    etat.value = 'ok'
  } catch (error) {
    erreur.value = erreurDemande(error) ?? 'L’envoi n’a pas abouti. Vous pouvez réessayer ou nous contacter ci-dessous.'
    etat.value = 'erreur'
  }
}
</script>

<template>
  <div>
    <main>
      <PageHero :hero="page.hero" />

      <section class="contact section">
        <div id="formulaire" class="formulaire">
          <div v-if="etat === 'ok'" class="merci" role="status">
            <h2 class="display-h3">Merci !</h2>
            <p class="body-l">{{ f.confirmation }}</p>
          </div>

          <form v-else @submit.prevent="envoyer" @invalid.capture="montrerChampInvalide">
            <label class="form-trap" aria-hidden="true">
              Laisser ce champ vide
              <input v-model="form.website" name="website" tabindex="-1" autocomplete="off" :maxlength="limitesDemande.website" />
            </label>
            <div class="formulaire__entete">
              <h2 class="formulaire__titre">{{ demandeFichier ? 'Recevoir un fichier DWG ou 3D' : f.titre }}</h2>
              <p class="formulaire__aide">{{ f.sousTitre }}</p>
              <p v-if="produitSelectionne" class="formulaire__produit" role="status">
                {{ demandeFichier ? 'Demande de fichier DWG ou 3D pour :' : 'Votre demande concerne :' }} {{ produitSelectionne.fiche?.titre }}
              </p>
            </div>

            <fieldset class="choix">
              <legend class="champ__label">Vous êtes *</legend>
              <div class="choix__options choix__options--profils">
                <label v-for="option in f.typesClient" :key="option" class="puce">
                  <input v-model="form.profil" type="radio" name="profil" :value="option" required />
                  <span>{{ option }}</span>
                </label>
              </div>
            </fieldset>

            <div class="ligne">
              <label class="champ">
                <span class="champ__label">Prénom *</span>
                <input v-model="form.prenom" :maxlength="limitesDemande.prenom" required autocomplete="given-name" placeholder="Camille" />
              </label>
              <label class="champ">
                <span class="champ__label">Nom *</span>
                <input v-model="form.nom" :maxlength="limitesDemande.nom" required autocomplete="family-name" placeholder="Martin" />
              </label>
            </div>

            <div class="ligne">
              <label class="champ">
                <span class="champ__label">Collectivité ou organisation *</span>
                <input v-model="form.organisation" :maxlength="limitesDemande.organisation" required autocomplete="organization" placeholder="Mairie de Villeurbanne" />
              </label>
              <label class="champ">
                <span class="champ__label">Fonction</span>
                <input v-model="form.fonction" :maxlength="limitesDemande.fonction" autocomplete="organization-title" placeholder="Responsable espaces verts" />
              </label>
            </div>

            <div class="ligne">
              <label class="champ">
                <span class="champ__label">E-mail *</span>
                <input v-model="form.email" :maxlength="limitesDemande.email" type="email" required autocomplete="email" placeholder="prenom.nom@mairie.fr" />
              </label>
              <label class="champ">
                <span class="champ__label">Téléphone</span>
                <input v-model="form.telephone" :maxlength="limitesDemande.telephone" type="tel" autocomplete="tel" placeholder="06 00 00 00 00" />
              </label>
            </div>

            <fieldset class="choix">
              <legend class="champ__label">Gamme qui vous intéresse</legend>
              <div class="choix__options">
                <label v-for="option in gammesAffichees" :key="option.valeur" class="puce">
                  <input v-model="form.gamme" type="radio" name="gamme" :value="option.valeur" />
                  <span>{{ option.label }}</span>
                </label>
              </div>
            </fieldset>

            <label class="champ">
              <span class="champ__label">Produit concerné</span>
              <select v-model="form.produit" name="produit">
                <option value="">Aucun / Je ne sais pas encore</option>
                <option v-for="produit in catalogue" :key="produit.slug" :value="produit.slug">{{ produit.fiche?.titre }}</option>
              </select>
            </label>

            <div class="ligne">
              <label class="champ">
                <span class="champ__label">Code postal du site</span>
                <input v-model="form.codePostal" :maxlength="limitesDemande.codePostal" inputmode="numeric" autocomplete="postal-code" placeholder="69100" />
              </label>
              <label class="champ">
                <span class="champ__label">Échéance souhaitée</span>
                <select v-model="form.echeance">
                  <option value="">Choisir…</option>
                  <option v-for="option in f.echeances" :key="option">{{ option }}</option>
                </select>
              </label>
            </div>

            <label class="champ">
              <span class="champ__label">{{ demandeFichier ? 'Votre demande de fichier *' : 'Votre projet *' }}</span>
              <textarea
                v-model="form.message"
                :maxlength="limitesDemande.message - (demandeFichier ? prefixeDemandeFichier.length : 0)"
                required
                rows="5"
                placeholder="Décrivez le lieu à équiper : une cour d’école, une place, un parc… Nombre de places, surface, contraintes d’ancrage ou d’eau."
              />
            </label>

            <label class="consentement">
              <input v-model="form.consentement" type="checkbox" required />
              <span>{{ f.consentement }}</span>
            </label>

            <div class="envoi">
              <UiButton submit pill :label="f.bouton" :disabled="etat === 'envoi'" />
              <p class="envoi__delai">{{ f.delai }}</p>
            </div>
            <p v-if="etat === 'erreur'" class="erreur" role="alert">
              {{ erreur }} Écrivez-nous à
              <a :href="`mailto:${parametres.email}`">{{ parametres.email }}</a> ou appelez le {{ parametres.telephone }}.
            </p>
          </form>
        </div>

        <div class="coordonnees">
          <dl class="contacts">
            <div class="contacts__ligne">
              <dt class="label-mono">Téléphone</dt>
              <dd><a :href="tel">{{ parametres.telephone }}</a></dd>
            </div>
            <div class="contacts__ligne">
              <dt class="label-mono">E-mail</dt>
              <dd><a :href="`mailto:${parametres.email}`">{{ parametres.email }}</a></dd>
            </div>
            <div class="contacts__ligne">
              <dt class="label-mono">Bureau</dt>
              <dd>{{ parametres.adresse }}</dd>
            </div>
          </dl>

          <div class="ensuite">
            <p class="label-mono ensuite__titre">{{ page.etapes.titre }}</p>
            <ol>
              <li v-for="(etape, i) in page.etapes.items" :key="i">
                <span class="ensuite__num">{{ String(i + 1).padStart(2, '0') }}</span>
                <span>{{ etape }}</span>
              </li>
            </ol>
          </div>
        </div>
      </section>
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

.contact {
  display: flex;
  align-items: flex-start;
  gap: 64px;
  padding-top: 96px;
  padding-bottom: 120px;
  background: var(--cream);
}

.formulaire {
  flex: 1;
  min-width: 0;
  scroll-margin-top: var(--nav-content-offset);
  padding: 48px;
  border-radius: 20px;
  background: var(--white);
}

form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.formulaire__entete {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.formulaire__titre {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 32px;
}

.formulaire__aide {
  font-size: 15px;
  color: rgba(63, 38, 29, 0.65);
}

.formulaire__produit {
  margin-top: 8px;
  font-weight: 500;
}

.ligne {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.champ {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.champ__label {
  padding: 0;
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(63, 38, 29, 0.8);
}

.champ input,
.champ select,
.champ textarea {
  width: 100%;
  padding: 15px 16px;
  border: 1px solid rgba(63, 38, 29, 0.18);
  border-radius: 8px;
  background: var(--paper);
  color: var(--brown-900);
  font: inherit;
  font-size: 16px;
}

.champ textarea {
  min-height: 150px;
  resize: vertical;
}

.champ input,
.champ select,
.champ textarea {
  min-width: 0;
}

.champ ::placeholder {
  color: rgba(63, 38, 29, 0.4);
}

.champ input:focus,
.champ select:focus,
.champ textarea:focus,
.puce input:focus-visible + span {
  outline: 2px solid var(--orange-500);
  outline-offset: 1px;
}

.choix {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  border: 0;
  min-inline-size: 0;
}

.choix legend {
  margin-bottom: 12px;
}

.choix__options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.puce input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.puce span {
  display: inline-block;
  min-height: 44px;
  max-width: 100%;
  padding: 10px 18px;
  border: 1px solid rgba(63, 38, 29, 0.22);
  border-radius: 999px;
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.puce span:hover {
  border-color: var(--brown-900);
}

.puce input:checked + span {
  border-color: var(--brown-900);
  background: var(--brown-900);
  color: var(--cream);
}

.consentement {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 14px;
  line-height: 1.4;
  color: rgba(63, 38, 29, 0.75);
}

.consentement input {
  width: 20px;
  height: 20px;
  flex: none;
  margin: 0;
  accent-color: var(--brown-900);
}

.envoi {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
}

.envoi__delai {
  font-size: 14px;
  color: rgba(63, 38, 29, 0.6);
}

.erreur {
  color: #b8321a;
  font-size: 15px;
}

.erreur a {
  text-decoration: underline;
}

.merci {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.coordonnees {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 440px;
  flex: none;
}

.contacts {
  margin: 0;
  padding: 8px 32px;
  border-radius: 20px;
  background: var(--white);
}

.contacts__ligne {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px 0;
  border-bottom: 1px solid rgba(63, 38, 29, 0.12);
}

.contacts__ligne:last-child {
  border-bottom: 0;
}

.contacts dt {
  color: rgba(63, 38, 29, 0.7);
}

.contacts dd {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 20px;
  overflow-wrap: anywhere;
}

.contacts a:hover {
  color: var(--orange-700);
}

.ensuite {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 32px;
  border-radius: 20px;
  background: #dde3d3;
}

.ensuite__titre {
  color: var(--sage-500);
}

.ensuite ol {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ensuite li {
  display: flex;
  gap: 16px;
  font-size: 16px;
  line-height: 1.45;
}

.ensuite__num {
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: 14px;
  color: var(--sage-500);
}

@media (max-width: 1100px) {
  .contact {
    flex-direction: column;
  }

  .formulaire,
  .coordonnees {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .contact {
    gap: 40px;
    padding-block: 64px;
  }

  .formulaire {
    width: 100%;
    padding: 48px 24px;
  }

  .formulaire__titre {
    font-size: 26px;
  }

  .choix__options {
    row-gap: 16px;
  }

  .choix__options--profils {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .choix__options--profils .puce span {
    width: 100%;
  }

  .ligne {
    grid-template-columns: 1fr;
  }

  .envoi {
    flex-direction: column;
    align-items: stretch;
  }

  .contacts,
  .ensuite {
    padding-inline: 24px;
  }

}
</style>
