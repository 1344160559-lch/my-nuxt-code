import { createI18n } from 'vue-i18n'
import { watch } from 'vue'
import zh from '../locales/zh'
import en from '../locales/en'

// 创建 i18n 实例
export default defineNuxtPlugin(({ vueApp }) => {
  // 默认语言为英文
  let savedLocale = 'en'
  
  // 在客户端环境中，从本地存储获取语言设置
  if (import.meta.client) {
    savedLocale = localStorage.getItem('locale') || 'en'
  }
  
  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: savedLocale,
    messages: {
      zh,
      en
    }
  })

  // 在客户端环境中，监听语言变化并保存到本地存储
  if (import.meta.client) {
    watch(i18n.global.locale, (val) => {
      localStorage.setItem('locale', val)
    })
  }

  vueApp.use(i18n)
  
  return {
    provide: {
      i18n: i18n.global
    }
  }
})