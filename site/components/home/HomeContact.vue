<template>
  <section id="contact" class="contact section">
    <div v-reveal class="cta">
      <div class="cta__body">
        <h2 class="display-h2 cta__title">Un projet d’ombrage pour votre commune ?</h2>
        <p class="body-l cta__text">Parlons de votre site. Nous revenons vers vous sous 48 h avec une première orientation.</p>
        <ul class="cta__infos">
          <li>Tél. — <a href="tel:+33648205238">06 48 20 52 38</a></li>
          <li>Mail — <a href="mailto:collaborer@abritoi.com">collaborer@abritoi.com</a></li>
          <li>Bureau — 16 rue Fénelon, 69006 Lyon</li>
        </ul>
      </div>
      <UiButton variant="dark" to="mailto:collaborer@abritoi.com" class="cta__btn" />
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
