import { defineEventHandler } from 'h3'
import pool from '../../db'
import { getUserIdFromToken } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // Get user ID from token
  const { userId, error } = getUserIdFromToken(event);
  
  if (!userId) {
    return {
      statusCode: 401,
      body: { 
        success: false, 
        message: error || 'Authentication required', 
        code: error === 'Token expired' ? 'TOKEN_EXPIRED' : 'AUTH_REQUIRED' 
      }
    };
  }

  const { id } = await readBody(event)
  
  if (!id) {
    return {
      statusCode: 400,
      body: { success: false, message: 'Snippet ID is required' }
    }
  }

  try {
    // 使用事务确保数据一致性
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // 使用带有重试功能的执行方法验证片段所有权
      const queryResult = await pool.executeWithRetry('SELECT user_id FROM snippets WHERE id = ?', [id]);
      
      // 确保结果不为undefined
      if (!queryResult) {
        throw new Error('查询结果为空');
      }
      
      const [rows] = queryResult;
      const snippets = rows as any[];
      
      if (snippets.length === 0) {
        await connection.rollback();
        connection.release();
        return {
          statusCode: 404,
          body: { success: false, message: 'Snippet not found' }
        }
      }
      
      if (snippets[0].user_id !== userId) {
        await connection.rollback();
        connection.release();
        return {
          statusCode: 403,
          body: { success: false, message: 'You do not have permission to delete this snippet' }
        }
      }
      
      // 删除片段
      const deleteResult = await pool.executeWithRetry('DELETE FROM snippets WHERE id = ?', [id]);
      
      // 确保结果不为undefined
      if (!deleteResult) {
        throw new Error('删除结果为空');
      }
      
      const result = deleteResult[0];
      
      // 提交事务
      await connection.commit();
      connection.release();
      
      return {
        statusCode: 200,
        body: { 
          success: true,
          message: 'Snippet deleted successfully',
          affectedRows: result
        }
      }
    } catch (err) {
      // 回滚事务
      await connection.rollback();
      connection.release();
      throw err;
    }
  } catch (error) {
    console.error('删除片段时出错:', error);
    return {
      statusCode: 500,
      body: { 
        success: false, 
        message: '删除片段失败，请稍后再试',
        error: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      }
    }
  }
})
