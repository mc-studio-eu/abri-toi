import { cheminPublic } from '~/utils/routesPubliques'

export default defineNuxtRouteMiddleware((to) => {
  const path = cheminPublic(to.path)
  if (path !== to.path) return navigateTo({ path, query: to.query, hash: to.hash }, { redirectCode: 308, replace: true })
})
