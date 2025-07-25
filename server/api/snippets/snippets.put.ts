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

  const { id, title, language, content, description } = await readBody(event)
  
  if (!id) {
    return {
      statusCode: 400,
      body: { success: false, message: 'Snippet ID is required' }
    }
  }

  // First verify that the snippet belongs to the authenticated user
  try {
    const [rows] = await pool.execute('SELECT user_id FROM snippets WHERE id = ?', [id]);
    const snippets = rows as any[];
    
    if (snippets.length === 0) {
      return {
        statusCode: 404,
        body: { success: false, message: 'Snippet not found' }
      }
    }
    
    if (snippets[0].user_id !== userId) {
      return {
        statusCode: 403,
        body: { success: false, message: 'You do not have permission to update this snippet' }
      }
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: { success: false, message: 'Failed to verify snippet ownership: ' + (error instanceof Error ? error.message : String(error)) }
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
      body: { success: false, message: 'No fields to update' }
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
        body: { success: false, message: 'Snippet not found' }
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
      body: { success: false, message: 'Failed to update snippet: ' + (error instanceof Error ? error.message : String(error)) }
    }
  }
})
