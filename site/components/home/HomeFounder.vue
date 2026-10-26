<script setup lang="ts">
const page = await usePageAccueil()
const fondateur = computed(() => page.value.fondateur)
</script>

<template>
  <section id="fondateur" class="founder section">
    <img :src="img(fondateur.portrait, 1000)" :alt="alt(fondateur.portrait)" v-reveal class="founder__portrait" />
    <div v-reveal="150" class="founder__body">
      <blockquote class="display-h3 founder__quote">{{ fondateur.citation }}</blockquote>
      <p class="body-l founder__text">{{ fondateur.texte }}</p>
      <div class="founder__sign">
        <span class="founder__dash" aria-hidden="true" />
        <div>
          <p class="founder__name">{{ fondateur.nom }}</p>
          <p class="founder__role">{{ fondateur.role }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.founder {
  display: flex;
  align-items: center;
  gap: 80px;
  padding-top: 120px;
  padding-bottom: 120px;
  background: var(--brown-900);
  color: var(--white);
}

.founder__portrait {
  flex: 0 0 440px;
  width: 440px;
  height: 500px;
  border-radius: 24px;
  object-fit: cover;
}

.founder__body {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 58px;
}

.founder__quote {
  max-width: 700px;
  margin: 0;
}

.founder__text {
  max-width: 620px;
}

.founder__sign {
  display: flex;
  align-items: center;
  gap: 16px;
}

.founder__dash {
  width: 32px;
  height: 2px;
  background: var(--orange-500);
}

.founder__name {
  font-weight: 500;
  font-size: 16px;
  line-height: 1.3;
  margin-bottom: 2px;
}

.founder__role {
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 1024px) {
  .founder {
    flex-direction: column;
    align-items: flex-start;
    gap: 48px;
  }

  .founder__portrait {
    flex-basis: auto;
    width: 100%;
    max-width: 440px;
    height: auto;
    aspect-ratio: 440 / 500;
  }

  .founder__body {
    gap: 32px;
  }
}
</style>
