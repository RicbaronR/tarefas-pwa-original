<template>
  <main class="register-page">
    <section class="register-card">

      <div class="register-logo">
        +
      </div>

      <div class="register-header">
        <h1>Criar conta</h1>
        <p>Crie sua conta para começar</p>
      </div>

      <div
        v-if="errorMessage"
        class="message error-message"
      >
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleRegister">

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
            placeholder="Digite sua senha"
            required
            autocomplete="new-password"
          />
        </div>

        <div class="field">
          <label for="confirm-password">
            Confirmar senha
          </label>

          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            placeholder="Digite sua senha novamente"
            required
            autocomplete="new-password"
          />
        </div>

        <button
          class="register-button"
          type="submit"
          :disabled="loading"
        >
          {{ loading ? 'Criando conta...' : 'Criar conta' }}
        </button>

      </form>

      <div class="login-area">
        <span>Já possui uma conta?</span>

        <RouterLink to="/login">
          Entrar
        </RouterLink>
      </div>

    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authApi from '../api/authApi';

const router = useRouter();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const errorMessage = ref('');
const loading = ref(false);

async function handleRegister() {
  errorMessage.value = '';

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'As senhas não coincidem.';
    return;
  }

  loading.value = true;

  try {
    await authApi.register(
      email.value,
      password.value,
    );

    router.push({
      name: 'login',
      query: {
        registered: 'true',
      },
    });
  } catch (error) {
    if (error.response?.status === 400) {
      errorMessage.value =
        error.response.data?.detail ??
        'Email já cadastrado.';
    } else if (error.response?.status === 422) {
      errorMessage.value =
        'Preencha os campos corretamente.';
    } else {
      errorMessage.value =
        'Não foi possível criar a conta. Tente novamente.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-page {
  min-height: calc(100vh - 90px);
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 40px 20px;
  box-sizing: border-box;
}

.register-card {
  width: 100%;
  max-width: 400px;

  padding: 38px;
  box-sizing: border-box;

  background: #ffffff;

  border: 1px solid #e5e7eb;
  border-radius: 16px;

  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.register-logo {
  width: 52px;
  height: 52px;

  margin: 0 auto 18px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: #4a90d9;
  color: white;

  font-size: 27px;
  font-weight: 400;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  margin: 0;

  color: #4a90d9;

  font-size: 1.7rem;
  font-weight: 700;
}

.register-header p {
  margin: 7px 0 0;

  color: #777;

  font-size: 0.9rem;
}

.field {
  margin-bottom: 18px;
}

.field label {
  display: block;

  margin-bottom: 7px;

  color: #333;

  font-size: 0.9rem;
  font-weight: 600;
}

.field input {
  display: block;

  width: 100%;
  height: 46px;

  padding: 0 13px;
  box-sizing: border-box;

  border: 1px solid #d6d6d6;
  border-radius: 8px;

  background: #fff;
  color: #333;

  font-size: 0.95rem;

  outline: none;

  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.field input:focus {
  border-color: #4a90d9;

  box-shadow:
    0 0 0 3px rgba(74, 144, 217, 0.15);
}

.register-button {
  width: 100%;
  height: 46px;

  margin-top: 5px;

  border: none;
  border-radius: 8px;

  background: #4a90d9;
  color: white;

  font-size: 0.95rem;
  font-weight: 600;

  cursor: pointer;

  transition:
    background 0.2s,
    transform 0.1s;
}

.register-button:hover {
  background: #357abd;
}

.register-button:active {
  transform: scale(0.99);
}

.register-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.login-area {
  margin-top: 25px;

  text-align: center;

  color: #777;

  font-size: 0.88rem;
}

.login-area a {
  margin-left: 5px;

  color: #4a90d9;

  font-weight: 600;

  text-decoration: none;
}

.login-area a:hover {
  text-decoration: underline;
}

.message {
  margin-bottom: 20px;

  padding: 11px 13px;

  border-radius: 8px;

  font-size: 0.88rem;
}

.error-message {
  background: #fff1f1;

  color: #c62828;

  border: 1px solid #ffcdd2;
}
</style>