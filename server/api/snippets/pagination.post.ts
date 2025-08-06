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

  const { page = 1, pageSize = 10, search = '' } = await readBody(event);

  try {
    // Use the user ID from the token
    const { snippets, total } = await getSnippetsByUserId(userId, page, pageSize, search);

    return { success: true, data: snippets, total };
  } catch (error) {
    console.error('分页查询出错:', error);
    return { 
      success: false, 
      message: '获取代码片段失败，请稍后再试',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    };
  }
});

//数据库查询函数
async function getSnippetsByUserId(user_id: number, page: number, pageSize: number, search: string) {
  const pageNo = (page - 1) * pageSize;

  try {
    // 不使用事务，直接查询
    let sql = 'SELECT * FROM snippets WHERE user_id = ?';
    const params: any[] = [user_id];

    if (search) {
      sql += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // 在 MySQL 中，LIMIT 参数必须是整数，确保 pageNo 和 pageSize 是数字
    const offset = parseInt(String(pageNo), 10);
    const limit = parseInt(String(pageSize), 10);
    
    // 使用 LIMIT 子句，但确保参数是整数
    sql += ` ORDER BY created_at DESC LIMIT ${offset}, ${limit}`;

    // 使用带有重试功能的执行方法
    const result = await pool.executeWithRetry(sql, params);
    // 确保结果不为undefined
    if (!result) {
      throw new Error('查询结果为空');
    }
    const rows = result[0];
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM snippets WHERE user_id = ?';
    const countParams: any[] = [user_id];

    if (search) {
      countSql += ' AND (title LIKE ? OR content LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    // 使用带有重试功能的执行方法
    const countResultData = await pool.executeWithRetry(countSql, countParams);
    // 确保结果不为undefined
    if (!countResultData) {
      throw new Error('查询总数结果为空');
    }
    const countResult = countResultData[0];
    let total = 0;
    if (Array.isArray(countResult) && countResult.length > 0) {
      const row = countResult[0];
      if (row && typeof row === 'object' && 'total' in row) {
        total = Number(row.total);
      }
    }
    
    return { snippets: rows, total };
  } catch (e) {
    console.error('getSnippetsByUserId error:', e);
    throw e; // 向上抛出错误，让调用者处理
  }
}
