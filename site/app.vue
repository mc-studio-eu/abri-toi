<template>
  <NuxtPage :page-key="(route) => route.fullPath" :transition="{ name: 'page', mode: 'out-in' }" />
  <ClientOnly><AnalyticsConsent /></ClientOnly>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 140ms ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
