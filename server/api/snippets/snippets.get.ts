import pool from '../../db'
import { getUserIdFromToken } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // Get user ID from token
  const { userId, error } = getUserIdFromToken(event);
  
  if (!userId) {
    return { 
      success: false, 
      message: error || 'Authentication required', 
      code: error === 'Token expired' ? 'TOKEN_EXPIRED' : 'AUTH_REQUIRED' 
    };
  }

  const query = getQuery(event)
  const { search, tag_id, language } = query

  try {
    let sql = 'SELECT * FROM snippets WHERE user_id = ?'
    const params: any[] = [userId]

    if (search) {
      sql += ' AND (title LIKE ? OR content LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }
    
    sql += ' ORDER BY created_at DESC'

    // 使用带有重试功能的数据库连接
    const result = await pool.executeWithRetry(sql, params, 3)
    // 确保结果不为undefined
    if (!result) {
      return { success: false, message: '查询结果为空' }
    }
    const rows = result[0]
    return { success: true, data: rows }
  } catch (e) {
    console.error('snippets.get.ts error:', e)
    return { success: false, message: '服务器错误' }
  }
}) 
