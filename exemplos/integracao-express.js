/**
 * Integração Express Existente - ASC
 * 
 * @copyright 2025 AsyncCypher
 */

const express = require('express');
const app = express();

// Importar apenas os middlewares necessários
const middlewareAuth = require('../src/middlewares/autenticacao');
const limitadorTaxa = require('../src/middlewares/limitador-taxa');
const validador = require('../src/middlewares/validador');
const Joi = require('joi');

// Usar middlewares globalmente
app.use(express.json());
app.use(limitadorTaxa);

// Incluir rotas de autenticação do ASC
app.use('/api/auth', require('../src/rotas/autenticacao'));

// Suas rotas existentes - agora protegidas
app.get('/api/usuarios', middlewareAuth, (req, res) => {
  res.json({
    usuario: req.usuario,
    dados: 'Seus dados existentes'
  });
});

// Validação em suas rotas
const esquemaProduto = Joi.object({
  nome: Joi.string().required(),
  preco: Joi.number().positive().required()
});

app.post('/api/produtos', 
  middlewareAuth, 
  validador(esquemaProduto), 
  (req, res) => {
    // Sua lógica existente
    res.json({ sucesso: true, produto: req.body });
  }
);

// Middleware de erro
app.use(require('../src/middlewares/tratador-erros'));

app.listen(3000, () => {
  console.log('🚀 App integrado com ASC na porta 3000');
});

module.exports = app;