<script setup lang="ts">
const parametres = await useParametres()
const tel = computed(() => `tel:+33${parametres.value.telephone?.replace(/\D/g, '').replace(/^0/, '')}`)
</script>

<template>
  <section id="contact" class="contact section">
    <div v-reveal class="cta">
      <div class="cta__body">
        <h2 class="display-h2 cta__title">{{ parametres.contact?.titre }}</h2>
        <p class="body-l cta__text">{{ parametres.contact?.texte }}</p>
        <ul class="cta__infos">
          <li>Tél. — <a :href="tel">{{ parametres.telephone }}</a></li>
          <li>Mail — <a :href="`mailto:${parametres.email}`">{{ parametres.email }}</a></li>
          <li>Bureau — {{ parametres.adresse }}</li>
        </ul>
      </div>
      <UiButton variant="dark" to="/contact" :label="parametres.contact?.bouton" class="cta__btn" />
      <img src="/images/dessin-ombriere-trait.svg" alt="" width="400" height="250" class="cta__drawing float" />
    </div>
  </section>
</template>

<style scoped>
.contact {
  padding-top: 96px;
  padding-bottom: 96px;
}

.cta {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  padding: 64px;
  overflow: hidden;
  border-radius: 24px;
  background: var(--orange-500);
  color: var(--brown-900);
}

.cta__body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cta__title {
  max-width: 520px;
}

.cta__text {
  max-width: 460px;
}

.cta__infos {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 16px;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.3;
}

.cta__infos a:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.cta__btn {
  position: relative;
  z-index: 1;
  flex: none;
}

.cta__drawing {
  position: absolute;
  left: calc(824 / 1280 * 100%);
  top: 40px;
  width: 400px;
  height: 250px;
}

@media (max-width: 1024px) {
  .cta {
    flex-direction: column;
    align-items: flex-start;
    padding: 40px;
  }

  .cta__drawing {
    display: none;
  }
}

@media (max-width: 640px) {
  .contact {
    padding-top: 48px;
    padding-bottom: 48px;
  }

  .cta {
    padding: 28px 24px;
  }
}
</style>
