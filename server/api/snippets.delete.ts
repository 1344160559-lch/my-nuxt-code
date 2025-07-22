import { defineEventHandler } from 'h3'
import pool from '../db'

export default defineEventHandler(async (event) => {
  const { id } = await readBody(event)
  
  if (!id) {
    return {
      statusCode: 400,
      body: { error: 'Snippet ID is required' }
    }
  }

  try {
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
      body: { error: 'Failed to delete snippet: ' + (error instanceof Error ? error.message : String(error)) }
    }
  }
})