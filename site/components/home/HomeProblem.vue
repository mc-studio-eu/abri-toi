<script setup lang="ts">
const stats = [
  { value: '24,9 °C', text: 'Température moyenne record du mois de juillet 2026.' },
  { value: '53 jours', text: 'De canicule en France entre le 1er juin et le 31 août 2026.' },
  { value: '7 824', text: 'Décès liés à la canicule entre juin et août 2026.' },
]
</script>

<template>
  <section class="problem section">
    <header v-reveal class="problem__header">
      <h2 class="display-h2 problem__title">
        L’année de tous les records.<br />
        Vos places, cours et parcs deviennent invivables.
      </h2>
      <p class="body-l problem__text">
        Sédentarité dans intérieurs climatisés, liens sociaux s’effilochent, parcs désertés au soleil. Seniors et
        enfants, publics fragiles, sont les premiers touchés.
      </p>
    </header>

    <dl class="problem__stats">
      <div v-for="(stat, i) in stats" :key="stat.value" v-reveal="i * 120" class="stat">
        <dt class="display-h2 stat__value">{{ stat.value }}</dt>
        <dd class="body-m stat__text">{{ stat.text }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.problem {
  display: flex;
  flex-direction: column;
  gap: 64px;
  padding-top: 112px;
  padding-bottom: 112px;
  background: var(--brown-900);
}

.problem__header {
  display: flex;
  align-items: flex-end;
  gap: 80px;
}

.problem__title {
  flex: 1 1 0;
  max-width: 720px;
  margin-right: auto;
  color: var(--cream);
}

.problem__text {
  flex: 0 0 440px;
  color: var(--sand);
}

.problem__stats {
  display: flex;
  margin: 0;
}

.stat {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 28px 28px 0;
  border-left: 1px solid var(--brown-700);
}

.stat:first-child {
  padding-left: 0;
  border-left: 0;
}

.stat__value {
  color: var(--orange-500);
  white-space: nowrap;
}

.stat__text {
  max-width: 250px;
  margin: 0;
  color: var(--sand);
}

@media (max-width: 1024px) {
  .problem__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }

  .problem__text {
    flex-basis: auto;
  }
}

@media (max-width: 640px) {
  .problem__stats {
    flex-direction: column;
    gap: 24px;
  }

  .stat {
    padding-left: 0;
    border-left: 0;
    border-top: 1px solid var(--brown-700);
  }
}
</style>
