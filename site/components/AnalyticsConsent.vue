<script setup lang="ts">
const measurementId = 'G-STB0MGR5RF'
const preferencesOpen = useState('analytics-preferences-open', () => false)
const consent = useCookie<string | null>('abritoi-analytics-consent', {
  maxAge: 60 * 60 * 24 * 180,
  sameSite: 'lax',
  path: '/',
  default: () => null,
})
let loaded = false

function startAnalytics() {
  if (loaded) return
  loaded = true
  const analyticsWindow = window as typeof window & { dataLayer?: unknown[]; gtag?: (...args: any[]) => void }
  analyticsWindow.dataLayer = analyticsWindow.dataLayer || []
  analyticsWindow.gtag = function () { analyticsWindow.dataLayer!.push(arguments) }
  analyticsWindow.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
  analyticsWindow.gtag('js', new Date())
  analyticsWindow.gtag('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_expires: 60 * 60 * 24 * 180,
  })
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)
}

function choose(accepted: boolean) {
  consent.value = accepted ? 'accepted' : 'rejected'
  preferencesOpen.value = false
  if (accepted) {
    startAnalytics()
  } else if (loaded) {
    // Stopper immédiatement la collecte, puis décharger la balise et ses écouteurs.
    ;(window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = true
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.trim().split('=')[0]
      if (name !== '_ga' && !name.startsWith('_ga_')) continue
      const parts = window.location.hostname.split('.')
      document.cookie = `${name}=; Max-Age=0; Path=/`
      for (let i = 0; i < parts.length - 1; i++) {
        document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${parts.slice(i).join('.')}`
      }
    }
    // Écrire le refus avant le rechargement, sans attendre le watcher de useCookie.
    document.cookie = 'abritoi-analytics-consent=rejected; Max-Age=15552000; Path=/; SameSite=Lax'
    window.location.reload()
  }
}

onMounted(() => {
  if (consent.value === 'accepted') startAnalytics()
})
</script>

<template>
  <section v-if="!['accepted', 'rejected'].includes(consent ?? '') || preferencesOpen" class="analytics-consent" aria-label="Préférences de mesure d’audience">
    <p>Avec votre accord, nous utilisons Google Analytics pour mesurer la fréquentation du site. Vous pouvez refuser ou modifier votre choix à tout moment.</p>
    <NuxtLink to="/politique-de-cookies">En savoir plus</NuxtLink>
    <div class="analytics-consent__actions">
      <button type="button" @click="choose(false)">Refuser</button>
      <button type="button" @click="choose(true)">Accepter</button>
    </div>
  </section>
</template>

<style scoped>
.analytics-consent {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
  width: min(460px, calc(100vw - 40px));
  max-height: calc(100dvh - 40px);
  overflow: auto;
  padding: 24px;
  background: var(--paper);
  color: var(--brown-900);
  border: 1px solid var(--brown-700);
  border-radius: 12px;
  box-shadow: 0 4px 24px #0002;
  font-size: 15px;
  line-height: 1.5;
}
.analytics-consent a { display: inline-block; margin-top: 8px; text-decoration: underline; }
.analytics-consent__actions { display: flex; gap: 12px; margin-top: 20px; }
.analytics-consent button {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid currentColor;
  border-radius: 6px;
  cursor: pointer;
  font: inherit;
  color: inherit;
  background: transparent;
}
.analytics-consent button:hover { background: var(--sand); }
</style>
