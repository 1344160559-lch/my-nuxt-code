import { defineEventHandler, H3Error } from 'h3'

// 扩展错误类型，包含网络错误的code属性
interface NetworkError extends Error {
  code?: string;
}

export default defineEventHandler((event) => {
  // 捕获并处理未处理的错误
  event.res.on('error', (error: NetworkError) => {
    console.error('未捕获的服务器错误:', error)
    
    // 防止连接重置错误导致应用崩溃
    if (error.code === 'ECONNRESET') {
      console.warn('检测到连接重置错误，正在优雅处理')
      // 不做任何操作，让请求自然结束
      return
    }
  })
})
