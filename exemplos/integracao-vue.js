/**
 * Integração Vue.js - ASC
 * 
 * @copyright 2025 AsyncCypher
 */

import { createApp, reactive } from 'vue';

// Store de autenticação
export const authStore = reactive({
  usuario: null,
  token: localStorage.getItem('token'),
  
  async login(email, senha) {
    const res = await fetch('/api/autenticacao/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    
    const dados = await res.json();
    if (dados.sucesso) {
      this.token = dados.dados.token;
      this.usuario = dados.dados.usuario;
      localStorage.setItem('token', dados.dados.token);
    }
    return dados;
  },

  logout() {
    this.token = null;
    this.usuario = null;
    localStorage.removeItem('token');
  },

  async chamarAPI(endpoint, opcoes = {}) {
    return fetch(endpoint, {
      ...opcoes,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...opcoes.headers
      }
    }).then(res => res.json());
  }
});

// Plugin Vue
export const ASCPlugin = {
  install(app) {
    app.config.globalProperties.$auth = authStore;
    app.provide('auth', authStore);
  }
};

// Composable
export function useAuth() {
  return authStore;
}

// Componente de Login
export const LoginComponent = {
  template: `
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="Email" required>
      <input v-model="senha" type="password" placeholder="Senha" required>
      <button type="submit">Login</button>
    </form>
  `,
  data() {
    return {
      email: '',
      senha: ''
    };
  },
  methods: {
    async handleLogin() {
      await this.$auth.login(this.email, this.senha);
    }
  }
};