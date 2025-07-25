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
    // First verify that the snippet belongs to the authenticated user
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
        body: { success: false, message: 'You do not have permission to delete this snippet' }
      }
    }
    
    // Delete the snippet
    const result = await pool.execute('DELETE FROM snippets WHERE id = ?', [id])
    
    return {
      statusCode: 200,
      body: { 
        success: true,
        message: 'Snippet deleted successfully',
        affectedRows: result
      }
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: { success: false, message: 'Failed to delete snippet: ' + (error instanceof Error ? error.message : String(error)) }
    }
  }
})
