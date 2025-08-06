// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // 配置服务器端口 (Nuxt 4.0 方式)
  devServer: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    host: process.env.HOST || '0.0.0.0'
  },
  
  // 增加运行时配置
  runtimeConfig: {
    // 服务器端可用的私有键
    dbHost: process.env.DB_HOST,
    dbUser: process.env.DB_USER,
    dbPass: process.env.DB_PASS,
    dbName: process.env.DB_NAME,
    dbPort: process.env.DB_PORT,
    jwtSecret: process.env.JWT_SECRET,
    
    // 客户端可用的公共键
    public: {
      apiBase: '/api'
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
