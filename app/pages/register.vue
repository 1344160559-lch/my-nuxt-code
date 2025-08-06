<template>
  <div class="register-container">
    <div class="language-switcher">
      <select v-model="locale">
        <option value="zh">{{ t('common.chinese') }}</option>
        <option value="en">{{ t('common.english') }}</option>
      </select>
    </div>
    <h2>{{ t('register.title') }}</h2>
    <form @submit.prevent="onRegister">
      <div class="input-group">
        <input v-model="username" :placeholder="t('register.usernamePlaceholder')" required />
      </div>
      <div class="input-group">
        <input v-model="email" type="email" :placeholder="t('register.emailPlaceholder')" required />
      </div>
      <div class="input-group">
        <input v-model="password" type="password" :placeholder="t('register.passwordPlaceholder')" required />
      </div>
      <button type="submit">{{ t('register.registerButton') }}</button>
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="success" class="success">{{ success }}</div>
    </form>
    <div class="to-login">{{ t('register.hasAccount') }}<NuxtLink to="/login">{{ t('register.goLogin') }}</NuxtLink></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const username = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const success = ref('')
const { t, locale } = useI18n()

const onRegister = async () => {
  error.value = ''
  success.value = ''
  try {
    const res = await $fetch('/api/user/register', {
      method: 'POST',
      body: { username: username.value, email: email.value, password: password.value }
    }) as { success: boolean; message?: string; code?: string }
    if (res.success) {
      success.value = t('register.registerSuccess')
      username.value = ''
      email.value = ''
      password.value = ''
    } else {
      // 根据错误代码返回对应的国际化文本
      if (res.code === 'USER_EXISTS') {
        error.value = t('register.userExist')
      } else if (res.code === 'INCOMPLETE_INFO') {
        error.value = t('register.fillAllFields')
      } else if (res.code === 'SERVER_ERROR') {
        error.value = t('register.serverError')
      } else if (res.code === 'REGISTER_FAILED') {
        error.value = t('register.registerFailed')
      } else {
        error.value = t('register.registerFailed')
      }
    }
  } catch (e) {
    error.value = t('register.serverError')
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