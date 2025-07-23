<template>
  <div class="login-container">
    <h2>登录</h2>
    <form @submit.prevent="onLogin">
      <input v-model="username" placeholder="用户名" required />
      <input v-model="password" type="password" placeholder="密码" required />
      <button type="submit">登录</button>
      <div v-if="error" class="error">{{ error }}</div>
    </form>
    <div class="to-register">没有账号？<NuxtLink to="/register">去注册</NuxtLink></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const onLogin = async () => {
  error.value = ''
  const res = await $fetch('/api/user/login', {
    method: 'POST',
    body: { username: username.value, password: password.value }
  }) as { success: boolean; token?: string; user?: { id: number; username: string; email: string }; message?: string }
  if (res.success) {
    localStorage.setItem('token', res.token!)
    if (res.user) {
      localStorage.setItem('user', JSON.stringify(res.user))
    }
    router.push('/')
  } else {
    error.value = res.message || '登录失败'
  }
}
</script>

<style scoped>
.login-container { max-width: 400px; margin: 100px auto; padding: 32px 24px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #eee; }
h2 { text-align: center; margin-bottom: 24px; }
input { display: block; width: 100%; margin-bottom: 16px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
button { width: 100%; padding: 10px 0; background: #18c37d; color: #fff; border: none; border-radius: 4px; font-size: 18px; cursor: pointer; }
button:hover { background: #13a06b; }
.error { color: #e74c3c; margin-top: 10px; text-align: center; }
.to-register { text-align: center; margin-top: 18px; color: #888; font-size: 15px; }
</style> 