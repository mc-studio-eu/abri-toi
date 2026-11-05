<template>
  <NuxtLoadingIndicator color="#ed7b1b" :throttle="0" />
  <!-- Les pages asynchrones doivent pouvoir se monter sans attendre une transition de sortie. -->
  <NuxtPage :transition="false" />
  <ClientOnly><AnalyticsConsent /></ClientOnly>
</template>
