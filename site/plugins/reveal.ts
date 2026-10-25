// Apparition au scroll façon Brickwise : fondu + légère montée quand l'élément entre dans l'écran.
// Usage : v-reveal ou v-reveal="120" (délai en ms, pour décaler les éléments d'une même rangée).
import type { Directive } from 'vue'

const pending = new Set<HTMLElement>()
let frame = 0

// On compare directement la position au scroll plutôt qu'avec un IntersectionObserver :
// après un saut d'ancre ou un rechargement en milieu de page, les blocs déjà dépassés
// s'affichent aussi, au lieu de rester invisibles au-dessus de l'écran.
function check() {
  frame = 0
  const limit = window.innerHeight * 0.9
  for (const el of pending) {
    if (el.getBoundingClientRect().top > limit) continue
    // Attribut plutôt que classe : un :class Vue sur l'élément l'effacerait au prochain rendu.
    el.setAttribute('data-revealed', '')
    pending.delete(el)
  }
  if (!pending.size) stop()
}

const schedule = () => {
  frame ||= requestAnimationFrame(check)
}

function start() {
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
}

function stop() {
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
}

const delayStyle = (delay?: number) => (delay ? { '--reveal-delay': `${delay}ms` } : undefined)

const reveal: Directive<HTMLElement, number | undefined> = {
  getSSRProps: (binding) => ({ 'data-reveal': '', style: delayStyle(binding.value) }),
  mounted(el, binding) {
    el.setAttribute('data-reveal', '')
    if (binding.value) el.style.setProperty('--reveal-delay', `${binding.value}ms`)
    if (!pending.size) start()
    pending.add(el)
    schedule()
  },
  unmounted(el) {
    pending.delete(el)
    if (!pending.size) stop()
  },
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', reveal)
})
