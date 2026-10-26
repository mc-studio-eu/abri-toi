<script setup lang="ts">
const page = await usePageContact()
const parametres = await useParametres()

useHead({ title: 'Contact — Abri Toi' })

const f = computed(() => page.value.formulaire)
const tel = computed(() => `tel:+33${parametres.value.telephone?.replace(/\D/g, '').replace(/^0/, '')}`)

const form = reactive({
  profil: '',
  prenom: '',
  nom: '',
  organisation: '',
  fonction: '',
  email: '',
  telephone: '',
  gamme: '',
  codePostal: '',
  echeance: '',
  message: '',
  consentement: false,
})
const etat = ref<'' | 'envoi' | 'ok' | 'erreur'>('')

async function envoyer() {
  etat.value = 'envoi'
  try {
    const { consentement: _, ...champs } = form
    await $fetch('/api/demande', { method: 'POST', body: { type: 'contact', ...champs } })
    etat.value = 'ok'
  } catch {
    etat.value = 'erreur'
  }
}
</script>

<template>
  <div>
    <main>
      <PageHero :hero="page.hero" />

      <section class="contact section">
        <div class="formulaire">
          <div v-if="etat === 'ok'" class="merci" role="status">
            <h2 class="display-h3">Merci !</h2>
            <p class="body-l">{{ f.confirmation }}</p>
          </div>

          <form v-else @submit.prevent="envoyer">
            <div class="formulaire__entete">
              <h2 class="formulaire__titre">{{ f.titre }}</h2>
              <p class="formulaire__aide">{{ f.sousTitre }}</p>
            </div>

            <fieldset class="choix">
              <legend class="champ__label">Vous êtes *</legend>
              <div class="choix__options">
                <label v-for="option in f.typesClient" :key="option" class="puce">
                  <input v-model="form.profil" type="radio" name="profil" :value="option" required />
                  <span>{{ option }}</span>
                </label>
              </div>
            </fieldset>

            <div class="ligne">
              <label class="champ">
                <span class="champ__label">Prénom *</span>
                <input v-model="form.prenom" required autocomplete="given-name" placeholder="Camille" />
              </label>
              <label class="champ">
                <span class="champ__label">Nom *</span>
                <input v-model="form.nom" required autocomplete="family-name" placeholder="Martin" />
              </label>
            </div>

            <div class="ligne">
              <label class="champ">
                <span class="champ__label">Collectivité ou organisation *</span>
                <input v-model="form.organisation" required autocomplete="organization" placeholder="Mairie de Villeurbanne" />
              </label>
              <label class="champ">
                <span class="champ__label">Fonction</span>
                <input v-model="form.fonction" autocomplete="organization-title" placeholder="Responsable espaces verts" />
              </label>
            </div>

            <div class="ligne">
              <label class="champ">
                <span class="champ__label">E-mail *</span>
                <input v-model="form.email" type="email" required autocomplete="email" placeholder="prenom.nom@mairie.fr" />
              </label>
              <label class="champ">
                <span class="champ__label">Téléphone</span>
                <input v-model="form.telephone" type="tel" autocomplete="tel" placeholder="06 00 00 00 00" />
              </label>
            </div>

            <fieldset class="choix">
              <legend class="champ__label">Gamme qui vous intéresse</legend>
              <div class="choix__options">
                <label v-for="option in f.gammes" :key="option" class="puce">
                  <input v-model="form.gamme" type="radio" name="gamme" :value="option" />
                  <span>{{ option }}</span>
                </label>
              </div>
            </fieldset>

            <div class="ligne">
              <label class="champ">
                <span class="champ__label">Code postal du site</span>
                <input v-model="form.codePostal" inputmode="numeric" autocomplete="postal-code" placeholder="69100" />
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
              <span class="champ__label">Votre projet *</span>
              <textarea
                v-model="form.message"
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
              L’envoi n’a pas abouti. Écrivez-nous à
              <a :href="`mailto:${parametres.email}`">{{ parametres.email }}</a> ou appelez le {{ parametres.telephone }}.
            </p>
          </form>
        </div>

        <div class="coordonnees">
          <div class="rdv">
            <p class="label-mono rdv__label">{{ page.rendezVous.label }}</p>
            <h2 class="rdv__titre">{{ page.rendezVous.titre }}</h2>
            <p class="rdv__texte">{{ page.rendezVous.texte }}</p>
            <UiButton pill :label="page.rendezVous.bouton" :to="page.rendezVous.lien || tel" />
          </div>

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

.ligne {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.champ {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.rdv {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  padding: 40px 32px;
  border-radius: 20px;
  background: var(--brown-900);
  color: var(--cream);
}

.rdv__label {
  color: var(--orange-500);
}

.rdv__titre {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 28px;
  line-height: 1.15;
}

.rdv__texte {
  font-size: 16px;
  line-height: 1.5;
  color: rgba(244, 238, 229, 0.8);
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

  .coordonnees {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .formulaire {
    padding: 28px 20px;
  }

  .ligne {
    grid-template-columns: 1fr;
  }
}
</style>
