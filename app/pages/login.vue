<template>
  <div class="login-container">
    <div class="language-switcher">
      <select v-model="locale">
        <option value="zh">{{ t('common.chinese') }}</option>
        <option value="en">{{ t('common.english') }}</option>
      </select>
    </div>
    <h2>{{ t('login.title') }}</h2>
    <form @submit.prevent="onLogin">
      <div class="input-group">
        <input v-model="username" :placeholder="t('login.usernamePlaceholder')" required />
      </div>
      <div class="input-group">
        <input v-model="password" type="password" :placeholder="t('login.passwordPlaceholder')" required />
      </div>
      <button type="submit">{{ t('login.loginButton') }}</button>
      <div v-if="error" class="error">{{ error }}</div>
    </form>
    <div class="to-register">{{ t('login.noAccount') }}<NuxtLink to="/register">{{ t('login.goRegister') }}</NuxtLink></div>
  </div>
  
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const username = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()
const { t, locale } = useI18n()

const onLogin = async () => {
  error.value = ''
  const res = await $fetch('/api/user/login', {
    method: 'POST',
    body: { username: username.value, password: password.value }
  }) as { success: boolean; token?: string; user?: { id: number; username: string; email: string }; message?: string; code?: string }
  if (res.success) {
    localStorage.setItem('token', res.token!)
    if (res.user) {
      localStorage.setItem('user', JSON.stringify(res.user))
    }
    router.push('/')
  } else {
    // 根据错误代码返回对应的国际化文本
    if (res.code === 'USER_NOT_EXIST') {
      error.value = t('login.userNotExist')
    } else if (res.code === 'WRONG_PASSWORD') {
      error.value = t('login.wrongPassword')
    } else if (res.code === 'SERVER_ERROR') {
      error.value = t('login.serverError')
    } else {
      error.value = t('login.loginFailed')
    }
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
  position: relative;
}

.language-switcher {
  position: absolute;
  top: 10px;
  right: 10px;
}

.language-switcher select {
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: #fff;
  font-size: 14px;
  cursor: pointer;
  outline: none;
}

.language-switcher select:focus {
  border-color: #18c37d;
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