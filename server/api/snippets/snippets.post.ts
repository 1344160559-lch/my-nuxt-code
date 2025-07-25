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

  const body = await readBody(event)
  const { title, content, description, tagIds } = body

  if (!title || !content) {
    return { success: false, message: '请填写完整信息' }
  }

  // 新建片段
  const [result] = await pool.execute(
    'INSERT INTO snippets (user_id, title, content, description) VALUES (?, ?, ?, ?)',
    [userId, title, content, description || '']
  )
  const snippetId = (result as any).insertId

  // 关联标签
  if (Array.isArray(tagIds) && tagIds.length > 0) {
    for (const tagId of tagIds) {
      await pool.execute(
        'INSERT INTO snippet_tags (snippet_id, tag_id) VALUES (?, ?)',
        [snippetId, tagId]
      )
    }
  }

  return { success: true, id: snippetId }
}) 