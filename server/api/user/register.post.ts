import pool from '../../db'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, email, password } = body

  if (!username || !email || !password) {
    return { success: false, message: '请填写完整信息' }
  }

  // 检查用户名或邮箱是否已存在
  const result = await pool.executeWithRetry(
    'SELECT id FROM users WHERE username = ? OR email = ?',
    [username, email]
  )
  
  // 确保结果不为undefined
  if (!result) {
    return { success: false, message: '服务器错误，请稍后再试' }
  }
  
  const [users] = result
  if (Array.isArray(users) && users.length > 0) {
    return { success: false, message: '用户名或邮箱已存在' }
  }

  // 加密密码
  const password_hash = await bcrypt.hash(password, 10)

  // 插入新用户
  const insertResult = await pool.executeWithRetry(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, password_hash]
  )
  
  // 确保结果不为undefined
  if (!insertResult) {
    return { success: false, message: '注册失败，请稍后再试' }
  }

  return { success: true }
}) 