import { computed, toValue, type MaybeRefOrGetter } from 'vue'

export function usePagination(nombre: MaybeRefOrGetter<number>, parPage = 9) {
  const route = useRoute()
  const pages = computed(() => Math.max(1, Math.ceil(toValue(nombre) / parPage)))
  const courante = computed(() => {
    const valeur = typeof route.query.page === 'string' ? route.query.page : ''
    const demandee = /^[1-9]\d*$/.test(valeur) ? Number(valeur) : 1
    return Math.min(pages.value, Number.isSafeInteger(demandee) ? demandee : 1)
  })
  const debut = computed(() => (courante.value - 1) * parPage)
  const lien = (numero: number) => numero > 1 ? `${route.path}?page=${numero}` : route.path
  return { courante, pages, debut, lien, parPage }
}
