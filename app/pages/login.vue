<template>
  <div class="login-container">
    <h2>用户登录</h2>
    <form @submit.prevent="onLogin">
      <div class="input-group">
        <input v-model="username" placeholder="请输入用户名" id="user" required />
      </div>
      <div class="input-group">
        <input v-model="password" type="password" placeholder="请输入密码" id="password" required />
      </div>
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
.login-container {
  max-width: 400px;
  margin: 100px auto;
  padding: 32px 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
  font-size: 24px;
}

input {
  display: block;
  width: calc(100% - 26px);
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #18c37d;
}

button {
  width: 100%;
  padding: 12px 0;
  background: #18c37d;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background: #13a06b;
}

.error {
  color: #e74c3c;
  margin-top: 12px;
  text-align: center;
  font-size: 14px;
}

.to-register {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 15px;
}

.to-register a {
  color: #18c37d;
  text-decoration: none;
  font-weight: 500;
}

.to-register a:hover {
  text-decoration: underline;
}
</style>
