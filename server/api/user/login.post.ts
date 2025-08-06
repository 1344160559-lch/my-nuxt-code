import pool from '../../db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body  

  // 使用带有重试功能的执行方法
  const result = await pool.executeWithRetry(
    'SELECT * FROM users WHERE username = ?',
    [username]
  )
  
  // 确保结果不为undefined
  if (!result) {
    return { 
      success: false, 
      message: '服务器错误，请稍后再试',
      code: 'SERVER_ERROR'
    }
  }
  
  const [rows] = result

  if (!Array.isArray(rows) || rows.length === 0) {
    return { 
      success: false, 
      message: '用户不存在',
      code: 'USER_NOT_EXIST'
    }
  }
  const user = rows[0] as any

  const valid = await bcrypt.compare(password, user.password)
  
  if (!valid) {
    return { 
      success: false, 
      message: '密码错误',
      code: 'WRONG_PASSWORD'
    }
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  return { success: true, token, user: { id: user.id, username: user.username, email: user.email } }
})
