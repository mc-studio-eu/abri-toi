<script setup lang="ts">
withDefaults(
  defineProps<{
    to?: string
    label?: string
    tone?: 'light' | 'dark'
  }>(),
  { to: '#', label: 'Voir le produit', tone: 'light' },
)
</script>

<template>
  <NuxtLink :to="to" class="link" :class="`link--${tone}`">
    <span>{{ label }}</span>
    <img
      :src="tone === 'dark' ? '/images/arrow-orange-500.svg' : '/images/arrow-orange-700.svg'"
      alt=""
      width="16"
      height="16"
      class="link__icon"
    />
  </NuxtLink>
</template>

<style scoped>
.link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 4px;
  border-bottom: 1.5px solid;
  font-weight: 500;
  font-size: 16px;
  white-space: nowrap;
}

.link--light {
  color: var(--brown-900);
  border-color: var(--orange-700);
}

.link--dark {
  color: var(--paper);
  border-color: var(--orange-500);
}

.link__icon {
  transition: transform 0.2s;
}

.link:hover .link__icon {
  transform: translateX(3px);
}
</style>
