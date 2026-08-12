<template>
  <div class="login-container">
    <form class="login-form" @submit.prevent="handleLogin">
      <h1>Entrar</h1>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="field">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="seu@email.com"
          required
          autocomplete="email"
        />
      </div>

      <div class="field">
        <label for="password">Senha</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="••••••••"
          required
          autocomplete="current-password"
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>

      <p class="register-link">
        Não possui uma conta?
        <router-link to="/register">Criar conta</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

async function handleLogin() {
  loading.value = true;
  errorMessage.value = '';
  try {
    await authStore.login(email.value, password.value);
    router.push('/');
  } catch (err) {
    errorMessage.value =
      err.response?.data?.detail ??
      'Erro ao entrar. Verifique suas credenciais.';
  } finally {
    loading.value = false;
  }
}
</script>
<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f4f7fb;
  padding: 20px;
  box-sizing: border-box;
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 32px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
}

.login-form h1 {
  margin: 0 0 28px;
  text-align: center;
  color: #333;
  font-size: 28px;
  font-weight: 700;
}

.error-message {
  margin-bottom: 20px;
  padding: 11px 13px;
  border-radius: 8px;
  background: #fdecec;
  color: #d93025;
  border: 1px solid #f5c2c0;
  font-size: 14px;
  text-align: center;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 18px;
}

.field label {
  font-size: 14px;
  font-weight: 600;
  color: #444;
}

.field input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: #fff;
  color: #333;
  font-size: 16px;
  outline: none;
  transition: 0.2s;
}

.field input::placeholder {
  color: #aaa;
}

.field input:focus {
  border-color: #4a90d9;
  box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.12);
}

.login-form button {
  width: 100%;
  padding: 13px;
  margin-top: 4px;
  border: none;
  border-radius: 8px;
  background: #4a90d9;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.login-form button:hover:not(:disabled) {
  background: #357abd;
}

.login-form button:active:not(:disabled) {
  transform: scale(0.98);
}

.login-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-link {
  margin: 20px 0 0;
  text-align: center;
  color: #777;
  font-size: 14px;
}

.register-link a {
  margin-left: 4px;
  color: #4a90d9;
  font-weight: 600;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }

  .login-form {
    padding: 24px;
  }

  .login-form h1 {
    font-size: 24px;
  }
}
</style>