<script setup lang="ts">
const page = await usePageAPropos()

usePageSeo(() => ({
  titre: 'À propos : concevoir l’ombre à Lyon | Abri Toi',
  description: 'Rencontrez Paul Saraceno, fondateur d’Abri Toi, et découvrez notre démarche de conception de mobilier abrité à Lyon, fabriqué en France.',
  image: page.value.histoire.portrait,
  fil: [{ nom: 'À propos', chemin: '/a-propos' }],
}))
</script>

<template>
  <div>
    <main>
      <PageHero :hero="page.hero" />

      <section class="histoire section">
        <img v-reveal :src="img(page.histoire.portrait, 1000)" :srcset="imgSrcset(page.histoire.portrait, 1200)" sizes="(max-width: 640px) calc(100vw - 40px), 500px" loading="eager" :alt="alt(page.histoire.portrait)" class="histoire__portrait" />
        <div v-reveal="120" class="histoire__texte">
          <h2 class="display-h2">{{ page.histoire.titre }}</h2>
          <div class="histoire__paragraphes">
            <p v-for="(para, i) in page.histoire.paragraphes" :key="i" class="body-l">{{ para }}</p>
          </div>
          <div class="signature">
            <span class="signature__trait" aria-hidden="true" />
            <div>
              <p class="signature__nom">{{ page.histoire.nom }}</p>
              <p class="signature__role">{{ page.histoire.role }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="engagements section">
        <header v-reveal class="entete">
          <h2 class="display-h2 entete__titre">{{ page.engagements.titre }}</h2>
          <p class="body-m entete__intro">{{ page.engagements.intro }}</p>
        </header>
        <ul class="engagements__grille">
          <li v-for="(e, i) in page.engagements.items" :key="e.titre" v-reveal="i * 120" class="engagement">
            <img v-if="e.icone" :src="img(e.icone, 400)" :alt="alt(e.icone) || e.label" class="engagement__icone" />
            <span v-else class="display-h4 engagement__odd">{{ e.numero }}</span>
            <p class="label-mono engagement__label">{{ e.label }}</p>
            <h3 class="display-h3">{{ e.titre }}</h3>
            <p class="engagement__texte">{{ e.texte }}</p>
            <ul class="engagement__preuves">
              <li v-for="preuve in e.preuves" :key="preuve">{{ preuve }}</li>
            </ul>
          </li>
        </ul>
      </section>

      <section class="partenaires section">
        <header v-reveal class="entete">
          <h2 class="display-h2 entete__titre">{{ page.partenaires.titre }}</h2>
          <p class="body-m entete__intro">{{ page.partenaires.intro }}</p>
        </header>
        <ul class="partenaires__grille">
          <li v-for="(p, i) in page.partenaires.items" :key="p.nom" v-reveal="i * 90" class="partenaire">
            <div class="partenaire__logo">
              <img
                :src="img(p.logo, 400)"
                :alt="alt(p.logo) || p.nom"
                :style="{ width: p.largeur ? `${p.largeur}px` : undefined, height: p.hauteur ? `${p.hauteur}px` : undefined }"
              />
            </div>
            <div class="partenaire__texte">
              <p class="label-mono partenaire__role">{{ p.categorie }}</p>
              <h3 class="display-h4">{{ p.nom }}</h3>
              <p class="partenaire__description">{{ p.texte }}</p>
            </div>
          </li>
        </ul>
      </section>

      <section class="terrain section">
        <header v-reveal class="terrain__entete">
          <h2 class="display-h2 entete__titre">{{ page.terrain.titre }}</h2>
          <UiButton pill variant="outline-dark" :label="page.terrain.bouton" to="/realisations" />
        </header>
        <ul class="terrain__photos">
          <li v-for="(photo, i) in page.terrain.photos" :key="i" v-reveal="i * 90">
            <figure>
              <img :src="img(photo.image, 700, 1000)" :srcset="imgSrcset(photo.image, 1200, 1714)" sizes="(min-width: 1440px) 302px, (max-width: 640px) calc(100vw - 40px), (max-width: 1024px) calc((100vw - 104px) / 2), calc((100vw - 232px) / 4)" :alt="photo.legende" loading="lazy" />
              <figcaption class="label-mono">{{ photo.legende }}</figcaption>
            </figure>
          </li>
        </ul>
      </section>

      <ContactCta />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.histoire {
  display: flex;
  align-items: center;
  gap: 96px;
  padding-top: 120px;
  padding-bottom: 120px;
  background: var(--cream);
}

.histoire__portrait {
  width: 500px;
  height: 620px;
  flex: none;
  border-radius: 12px;
  object-fit: cover;
}

.histoire__texte {
  display: flex;
  flex-direction: column;
  gap: 28px;
  min-width: 0;
}

.histoire__paragraphes {
  display: flex;
  flex-direction: column;
  gap: 18px;
  color: var(--brown-700);
}

.signature {
  display: flex;
  align-items: center;
  gap: 16px;
}

.signature__trait {
  width: 32px;
  height: 2px;
  background: var(--orange-500);
}

.signature__nom {
  font-weight: 500;
  font-size: 16px;
  line-height: 1.3;
}

.signature__role {
  font-size: 14px;
  line-height: 1.5;
  color: var(--brown-700);
}

.engagements,
.partenaires,
.terrain {
  display: flex;
  flex-direction: column;
  gap: 56px;
  padding-top: 120px;
  padding-bottom: 120px;
  background: var(--paper);
}

.partenaires {
  background: var(--cream);
}

.entete {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 80px;
}

.entete__titre {
  max-width: 640px;
}

.entete__intro {
  width: 420px;
  flex: none;
  color: var(--brown-700);
}

.engagements__grille {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
}

.engagement {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  padding: 32px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--cream);
  min-width: 0;
  overflow-wrap: anywhere;
}

.engagement__odd {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 8px;
  background: var(--brown-900);
  color: var(--cream);
}

.engagement__icone {
  width: 128px;
  height: 128px;
  border-radius: 8px;
}

.engagement__label {
  color: var(--orange-700);
}

.engagement__texte {
  font-size: 14px;
  line-height: 1.5;
  color: var(--brown-700);
}

.engagement__preuves {
  width: 100%;
}

.engagement__preuves li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid var(--line);
  font-weight: 500;
  font-size: 14px;
  line-height: 1.3;
}

.engagement__preuves li::before {
  content: '';
  width: 6px;
  height: 6px;
  flex: none;
  background: var(--orange-500);
}

.partenaires__grille {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 24px;
}

.partenaire {
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--paper);
}

.partenaire__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 140px;
  border-bottom: 1px solid var(--line);
}

.partenaire__logo img {
  max-width: 80%;
  object-fit: contain;
}

.partenaire__texte {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 24px 24px 28px;
  overflow-wrap: anywhere;
}

.partenaire__role {
  color: var(--orange-700);
}

.partenaire__description {
  font-size: 14px;
  line-height: 1.5;
  color: var(--brown-700);
}

.terrain__entete {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
}

.terrain__photos {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}

.terrain__photos figure {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0;
}

.terrain__photos img {
  width: 100%;
  height: 400px;
  border-radius: 12px;
  object-fit: cover;
}

.terrain__photos figcaption {
  color: var(--brown-700);
}

@media (max-width: 1200px) {
  .partenaires__grille {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1024px) {
  .histoire {
    flex-direction: column;
    gap: 48px;
    padding-top: 80px;
    padding-bottom: 80px;
  }

  .histoire__portrait {
    width: 100%;
    max-width: 500px;
    height: 480px;
  }

  .entete,
  .terrain__entete {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .entete__intro {
    width: auto;
  }

  .terrain__photos,
  .partenaires__grille {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .engagements__grille {
    grid-template-columns: 1fr;
  }

  .engagements,
  .partenaires,
  .terrain {
    padding-top: 80px;
    padding-bottom: 80px;
  }
}

@media (max-width: 640px) {
  .histoire {
    align-items: flex-start;
    gap: 40px;
    padding-block: 64px;
  }

  .histoire__portrait {
    max-width: none;
    height: auto;
    aspect-ratio: 350 / 434;
  }

  .engagements,
  .partenaires,
  .terrain {
    gap: 32px;
    padding-block: 64px;
  }

  .entete {
    gap: 40px;
  }

  .engagement {
    padding-inline: 24px;
  }

  .partenaires__grille,
  .terrain__photos {
    grid-template-columns: 1fr;
  }

  .partenaire__logo {
    min-height: 120px;
    padding-block: 20px;
  }

  .terrain__photos img {
    height: auto;
    aspect-ratio: 4 / 3;
  }

  .terrain__entete {
    align-items: flex-end;
    gap: 24px;
  }
}
</style>
