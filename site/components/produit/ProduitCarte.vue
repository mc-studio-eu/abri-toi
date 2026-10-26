<script setup lang="ts">
import type { Img } from '~/content/commun'

defineProps<{ titre: string; description?: string; visuel?: Img; to: string }>()
</script>

<template>
  <article class="carte">
    <NuxtLink :to="to" class="carte__visuel" tabindex="-1" aria-hidden="true">
      <img :src="img(visuel, 900)" :alt="alt(visuel)" loading="lazy" />
    </NuxtLink>
    <div class="carte__contenu">
      <h3 class="display-h3 carte__nom">{{ titre }}</h3>
      <p v-if="description" class="carte__description">{{ description }}</p>
      <div class="carte__lien">
        <UiLink :to="to" />
      </div>
    </div>
  </article>
</template>

<style scoped>
.carte {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--paper);
  transition: box-shadow 0.3s, transform 0.3s;
}

.carte:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 32px rgba(63, 38, 29, 0.08);
}

.carte__visuel {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  padding: 24px 0 16px;
  background: var(--white);
}

.carte__visuel img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.carte__contenu {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  padding: 24px 28px 28px;
}

.carte__description {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  color: var(--brown-700);
}

.carte__lien {
  padding-top: 8px;
}
</style>
