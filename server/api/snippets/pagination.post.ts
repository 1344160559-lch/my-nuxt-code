import pool from '../../db'

export default defineEventHandler(async (event) => {
  const { user_id, page = 1, pageSize = 10, search = '' } = await readBody(event);

  if (!user_id) {
    return { success: false, message: 'User ID is required' };
  }

  try {
    // 假设你有一个数据库查询函数，根据 user_id 和分页参数获取数据
    const { snippets, total } = await getSnippetsByUserId(user_id, page, pageSize, search);

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
