<script setup lang="ts">
defineProps<{ courante: number; pages: number; lien: (numero: number) => string }>()
</script>

<template>
  <nav v-if="pages > 1" class="pagination" aria-label="Pagination">
    <NuxtLink v-if="courante > 1" :to="lien(courante - 1)" rel="prev">← Précédent</NuxtLink>
    <span aria-current="page">Page {{ courante }} sur {{ pages }}</span>
    <NuxtLink v-if="courante < pages" :to="lien(courante + 1)" rel="next">Suivant →</NuxtLink>
  </nav>
</template>

<style scoped>
.pagination { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 16px; }
.pagination a { display: inline-flex; align-items: center; min-height: 44px; padding: 10px 18px; border: 1px solid currentColor; border-radius: 999px; }
.pagination a:hover { background: rgba(63, 38, 29, .06); }
</style>
