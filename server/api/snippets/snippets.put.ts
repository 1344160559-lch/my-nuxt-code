import { defineEventHandler } from 'h3'
import pool from '../../db'

export default defineEventHandler(async (event) => {
  const { id, title, language, content, description } = await readBody(event)
  
  if (!id) {
    return {
      statusCode: 400,
      body: { error: 'Snippet ID is required' }
    }
  }

  const updates = []
  const params = []

  if (title !== undefined) {
    updates.push('title = ?')
    params.push(title)
  }

  if (language !== undefined) {
    updates.push('language = ?')
    params.push(language)
  }

  if (content !== undefined) {
    updates.push('content = ?')
    params.push(content)
  }

  if (description !== undefined) {
    updates.push('description = ?')
    params.push(description)
  }

  if (updates.length === 0) {
    return {
      statusCode: 400,
      body: { error: 'No fields to update' }
    }
  }

  params.push(id)

  try {
    const sql = `UPDATE snippets SET ${updates.join(', ')} WHERE id = ?`
    const result = await pool.execute(sql, params) as any
    console.log(result);
    
    if (result === 0) {
      return {
        statusCode: 404,
        body: { error: 'Snippet not found' }
      }
    }

    return {
      statusCode: 200,
      body: { 
        success: true,
        message: 'Snippet updated successfully',
        affectedRows: "修改成功"
      }
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: { error: 'Failed to update snippet: ' + (error instanceof Error ? error.message : String(error)) }
    }
  }
})