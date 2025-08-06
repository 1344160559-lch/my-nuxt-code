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

  try {
    // 使用事务确保数据一致性
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // 新建片段，使用带有重试功能的执行方法
      const queryResult = await pool.executeWithRetry(
        'INSERT INTO snippets (user_id, title, content, description) VALUES (?, ?, ?, ?)',
        [userId, title, content, description || '']
      );
      
      // 确保结果不为undefined
      if (!queryResult) {
        throw new Error('插入数据失败，未返回结果');
      }
      
      const [result] = queryResult;
      const snippetId = (result as any).insertId;

      // 关联标签
      if (Array.isArray(tagIds) && tagIds.length > 0) {
        for (const tagId of tagIds) {
          await pool.executeWithRetry(
            'INSERT INTO snippet_tags (snippet_id, tag_id) VALUES (?, ?)',
            [snippetId, tagId]
          );
        }
      }

      // 提交事务
      await connection.commit();
      connection.release();
      
      return { success: true, id: snippetId };
    } catch (err) {
      // 回滚事务
      await connection.rollback();
      connection.release();
      throw err;
    }
  } catch (e) {
    console.error('snippets.post.ts error:', e);
    return { success: false, message: '服务器错误，请稍后再试' };
  }
}) 
