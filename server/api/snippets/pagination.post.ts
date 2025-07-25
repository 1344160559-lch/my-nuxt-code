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
    return { success: false, message: 'Failed to fetch snippets', error };
  }
});

//数据库查询函数
async function getSnippetsByUserId(user_id: number, page: number, pageSize: number, search: string) {
  const pageNo = (page - 1) * pageSize;

  try {
    let sql = 'SELECT * FROM snippets WHERE user_id = ?';
    const params: any[] = [user_id];

    if (search) {
      sql += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ` ORDER BY created_at DESC LIMIT ?, ?`;
    params.push(pageNo, pageSize);

    const [rows] = await pool.execute(sql, params);
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM snippets WHERE user_id = ?';
    const countParams: any[] = [user_id];

    if (search) {
      countSql += ' AND (title LIKE ? OR content LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await pool.execute(countSql, countParams);
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
    return { success: false, message: '服务器错误' };
  }
}
