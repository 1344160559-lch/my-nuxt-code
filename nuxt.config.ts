// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  
  // 配置服务器端口 (Nuxt 4.0 方式)
  devServer: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    host: process.env.HOST || '0.0.0.0'
  },
  
  // 生产环境服务器配置
  app: {
    // 在 Nuxt 4 中，应用程序基本设置
    baseURL: '/',
    buildAssetsDir: '/_nuxt/',
    cdnURL: ''
  },
  
  // 增加运行时配置
  runtimeConfig: {
    // 环境信息
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // 服务器端可用的私有键
    dbHost: process.env.DB_HOST,
    dbUser: process.env.DB_USER,
    dbPass: process.env.DB_PASS,
    dbName: process.env.DB_NAME,
    dbPort: process.env.DB_PORT,
    port: process.env.PORT,
    host: process.env.HOST,
    
    // 客户端可用的公共键
    public: {
      apiBase: '/api',
      environment: process.env.NODE_ENV || 'development'
    }
  },
  
  // 增加服务器选项
  nitro: {
    routeRules: {
      '/api/**': { cors: true }
    },
    // 增加服务器超时设置
    timing: true
  }
})