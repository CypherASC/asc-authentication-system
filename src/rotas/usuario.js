/**
 * Rotas de Usuário
 * Endpoints para gerenciamento de usuários
 * 
 * @copyright 2025 AsyncCypher
 */

const express = require('express');
const Joi = require('joi');
const ControladorUsuario = require('../controladores/ControladorUsuario');
const validadorMiddleware = require('../middlewares/validador');
const { verificarPermissao } = require('../middlewares/autenticacao');

const router = express.Router();

// Esquemas de validação
const esquemaAtualizacaoUsuario = Joi.object({
  nome: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  telefone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  configuracoes: Joi.object({
    tema: Joi.string().valid('claro', 'escuro').optional(),
    idioma: Joi.string().valid('pt-BR', 'en-US', 'es-ES').optional(),
    notificacoes: Joi.boolean().optional()
  }).optional()
});

const esquemaAlteracaoSenha = Joi.object({
  senhaAtual: Joi.string().required(),
  novaSenha: Joi.string().min(8).required(),
  confirmarSenha: Joi.string().valid(Joi.ref('novaSenha')).required()
});

/**
 * GET /api/usuario/perfil
 * Obter perfil do usuário autenticado
 */
// Usar instância compartilhada do adaptador
let controladorUsuario;

router.use(async (req, res, next) => {
  if (!controladorUsuario) {
    // Obter a mesma instância usada nas rotas de autenticação
    const rotasAuth = require('./autenticacao');
    const AdaptadorMemoria = require('../adaptadores/AdaptadorMemoria');
    
    // Criar nova instância se não existir
    if (!global.adaptadorASC) {
      global.adaptadorASC = new AdaptadorMemoria();
      await global.adaptadorASC.conectar();
    }
    
    controladorUsuario = new ControladorUsuario(global.adaptadorASC);
  }
  next();
});

router.get('/perfil', (req, res, next) => controladorUsuario.obterPerfil(req, res, next));

/**
 * PUT /api/usuario/perfil
 * Atualizar perfil do usuário
 */
router.put('/perfil', validadorMiddleware(esquemaAtualizacaoUsuario), (req, res, next) => controladorUsuario.atualizarPerfil(req, res, next));

/**
 * POST /api/usuario/alterar-senha
 * Alterar senha do usuário
 */
router.post('/alterar-senha', validadorMiddleware(esquemaAlteracaoSenha), (req, res, next) => controladorUsuario.alterarSenha(req, res, next));

/**
 * GET /api/usuario/sessoes
 * Listar sessões ativas do usuário
 */
router.get('/sessoes', (req, res, next) => controladorUsuario.obterSessoes(req, res, next));

/**
 * DELETE /api/usuario/sessoes/:id
 * Encerrar sessão específica
 */
router.delete('/sessoes/:id', (req, res, next) => controladorUsuario.encerrarSessao(req, res, next));

/**
 * DELETE /api/usuario/sessoes
 * Encerrar todas as outras sessões
 */
router.delete('/sessoes', async (req, res, next) => {
  const sessoes = await global.adaptadorASC.buscarSessoesUsuario(req.usuario.id);
  let sessoesEncerradas = 0;

  for (const sessao of sessoes) {
    if (sessao.fingerprint !== req.usuario.fingerprint && sessao.ativa) {
      await global.adaptadorASC.atualizarSessao(sessao.id, {
        ativa: false,
        finalizadaEm: new Date()
      });
      sessoesEncerradas++;
    }
  }

  res.json({
    sucesso: true,
    mensagem: `${sessoesEncerradas} sessões encerradas com sucesso`
  });
});

/**
 * GET /api/usuario/atividades
 * Obter histórico de atividades do usuário
 */
router.get('/atividades', (req, res, next) => controladorUsuario.obterAtividades(req, res, next));

module.exports = router;