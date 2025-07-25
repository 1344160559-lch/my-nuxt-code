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

    const [rows] = await pool.execute(sql, params)
    return { success: true, data: rows }
  } catch (e) {
    console.error('snippets.get.ts error:', e)
    return { success: false, message: '服务器错误' }
  }
}) 