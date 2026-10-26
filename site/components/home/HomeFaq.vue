<script setup lang="ts">
// Réponses rédigées à partir des docs commerciales (voir BRIEF.md) ; garanties à relire avec Paul.
const page = await usePageAccueil()
const faq = computed(() => page.value.faq)

const open = ref<number | null>(0)

function toggle(i: number) {
  open.value = open.value === i ? null : i
}
</script>

<template>
  <section class="faq section">
    <div v-reveal class="faq__aside">
      <h2 class="display-h3">{{ faq.titre }}</h2>
      <p class="body-m faq__intro">{{ faq.intro }}</p>
      <UiButton />
    </div>

    <ul class="faq__list">
      <li v-for="(item, i) in faq.questions" :key="item.question" v-reveal="i * 70" class="faq__item" :class="{ 'faq__item--open': open === i }">
        <h3>
          <button
            :id="`faq-q-${i}`"
            class="faq__question"
            :aria-expanded="open === i"
            :aria-controls="`faq-a-${i}`"
            @click="toggle(i)"
          >
            <span class="display-h4">{{ item.question }}</span>
            <span class="faq__icon" aria-hidden="true">{{ open === i ? '–' : '+' }}</span>
          </button>
        </h3>
        <div
          v-show="open === i"
          :id="`faq-a-${i}`"
          class="body-m faq__answer"
          role="region"
          :aria-labelledby="`faq-q-${i}`"
        >
          {{ item.reponse || '[Réponse à compléter.]' }}
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.faq {
  display: flex;
  align-items: flex-start;
  gap: 96px;
  padding-top: 64px;
  padding-bottom: 120px;
}

.faq__aside {
  flex: 0 0 400px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
}

.faq__intro {
  max-width: 360px;
  color: var(--brown-700);
}

.faq__list {
  flex: 1 1 0;
  min-width: 0;
  border-top: 1px solid var(--line);
}

.faq__item {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 24px 0;
  border-bottom: 1px solid var(--line);
}

.faq__item h3 {
  font: inherit;
}

.faq__question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  text-align: left;
}

.faq__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: var(--paper);
  font-weight: 500;
  font-size: 16px;
  line-height: 1.3;
  transition: background-color 0.2s;
}

.faq__question:hover .faq__icon,
.faq__item--open .faq__icon {
  background: var(--orange-500);
}

.faq__answer {
  max-width: 640px;
  color: var(--brown-700);
}

@media (max-width: 1024px) {
  .faq {
    flex-direction: column;
    gap: 48px;
  }

  .faq__aside {
    flex-basis: auto;
  }

  .faq__list {
    width: 100%;
  }
}
</style>
