<template>
  <div class="register-container">
    <h2>用户注册</h2>
    <form @submit.prevent="onRegister">
      <div class="input-group">
        <input v-model="username" placeholder="请输入用户名" required />
      </div>
      <div class="input-group">
        <input v-model="email" type="email" placeholder="请输入邮箱" required />
      </div>
      <div class="input-group">
        <input v-model="password" type="password" placeholder="请输入密码" required />
      </div>
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
    const res = await $fetch('/api/user/register', {
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
.register-container {
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
  width: 100%;
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
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

.success {
  color: #18c37d;
  margin-top: 12px;
  text-align: center;
  font-size: 14px;
}

.to-login {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 15px;
}

.to-login a {
  color: #18c37d;
  text-decoration: none;
  font-weight: 500;
}

.to-login a:hover {
  text-decoration: underline;
}
</style>
