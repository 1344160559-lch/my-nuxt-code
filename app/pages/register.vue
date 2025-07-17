<template>
  <div class="register-container">
    <h2>注册</h2>
    <form @submit.prevent="onRegister">
      <input v-model="username" placeholder="用户名" required />
      <input v-model="email" type="email" placeholder="邮箱" required />
      <input v-model="password" type="password" placeholder="密码" required />
      <button type="submit">注册</button>
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="success" class="success">{{ success }}</div>
    </form>
    <div class="to-login">已有账号？<NuxtLink to="/login">去登录</NuxtLink></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const username = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const success = ref('')

const onRegister = async () => {
  error.value = ''
  success.value = ''
  try {
    const res = await $fetch('/api/register', {
      method: 'POST',
      body: { username: username.value, email: email.value, password: password.value }
    }) as { success: boolean; message?: string }
    if (res.success) {
      success.value = '注册成功，请前往登录！'
      username.value = ''
      email.value = ''
      password.value = ''
    } else {
      error.value = res.message || '注册失败'
    }
  } catch (e) {
    error.value = '注册失败，服务器错误'
  }
}
</script>

<style scoped>
.register-container { max-width: 400px; margin: 100px auto; padding: 32px 24px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #eee; }
h2 { text-align: center; margin-bottom: 24px; }
input { display: block; width: 100%; margin-bottom: 16px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
button { width: 100%; padding: 10px 0; background: #18c37d; color: #fff; border: none; border-radius: 4px; font-size: 18px; cursor: pointer; }
button:hover { background: #13a06b; }
.error { color: #e74c3c; margin-top: 10px; text-align: center; }
.success { color: #18c37d; margin-top: 10px; text-align: center; }
.to-login { text-align: center; margin-top: 18px; color: #888; font-size: 15px; }
</style> 