import pool from '../db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body  

  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE username = ?',
    [username]
  )

  if (!Array.isArray(rows) || rows.length === 0) {
    return { success: false, message: '用户不存在' }
  }
  const user = rows[0] as any

  const valid = await bcrypt.compare(password, user.password)
  
  if (!valid) {
    return { success: false, message: '密码错误' }
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )

  return { success: true, token, user: { id: user.id, username: user.username, email: user.email } }
}) 