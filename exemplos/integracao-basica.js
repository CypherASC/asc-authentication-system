/**
 * Integração Básica - ASC
 * 
 * @copyright 2025 AsyncCypher
 */

const express = require('express');

// 1. INTEGRAÇÃO ULTRA SIMPLES
const app = express();
const middlewareAuth = require('../src/middlewares/autenticacao');

// Proteger qualquer rota
app.use('/protegido/*', middlewareAuth);

app.get('/protegido/dados', (req, res) => {
  res.json({
    usuario: req.usuario.email,
    dados: 'Dados protegidos'
  });
});

app.listen(4000);

// 2. CLIENTE JAVASCRIPT (Frontend)
const cliente = {
  async login(email, senha) {
    const res = await fetch('/api/autenticacao/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    const dados = await res.json();
    localStorage.setItem('token', dados.dados.token);
    return dados;
  },

  async chamarAPI(endpoint) {
    const token = localStorage.getItem('token');
    const res = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
};

module.exports = { app, cliente };