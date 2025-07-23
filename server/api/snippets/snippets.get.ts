import pool from '../../db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { user_id, search, tag_id, language } = query

  if (!user_id) {
    return { success: false, message: '缺少 user_id' }
  }

  try {
    let sql = 'SELECT * FROM snippets WHERE user_id = ?'
    const params: any[] = [user_id]

    if (search) {
      sql += ' AND (title LIKE ? OR content LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }
    if (language) {
      sql += ' AND language = ?'
      params.push(language)
    }
    sql += ' ORDER BY created_at DESC'

    const [rows] = await pool.execute(sql, params)
    return { success: true, data: rows }
  } catch (e) {
    console.error('snippets.get.ts error:', e)
    return { success: false, message: '服务器错误' }
  }
}) 