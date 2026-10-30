<script setup lang="ts">
// Texte doublé qui défile vers le haut au survol du bouton parent (effet repris de mc-studio.eu)
defineProps<{ text?: string }>()
</script>

<template>
  <span class="text-slide">
    <span class="visually-hidden">{{ text }}</span>
    <span class="text-slide__box" aria-hidden="true">
      <span class="text-slide__wrap">
        <span class="text-slide__text">{{ text }}</span>
        <span class="text-slide__text">{{ text }}</span>
      </span>
    </span>
  </span>
</template>
