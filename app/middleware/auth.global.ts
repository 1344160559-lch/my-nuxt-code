import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'

export default defineNuxtRouteMiddleware((to) => {
  // 允许未登录访问登录页和注册页
  if (to.path === '/login' || to.path === '/register') {
    if (process.client && localStorage.getItem('token') && to.path === '/login') {
      return navigateTo('/')
    }
    return
  }
  // 其他页面，未登录则跳转到登录页
  if (process.client && !localStorage.getItem('token')) {
    return navigateTo('/login')
  }
})