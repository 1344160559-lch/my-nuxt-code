import pool from '../db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { user_id, title, content, language, description, tagIds } = body

  if (!user_id || !title || !content) {
    return { success: false, message: '请填写完整信息' }
  }

  // 新建片段
  const [result] = await pool.execute(
    'INSERT INTO snippets (user_id, title, content, language, description) VALUES (?, ?, ?, ?, ?)',
    [user_id, title, content, language, description || '']
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