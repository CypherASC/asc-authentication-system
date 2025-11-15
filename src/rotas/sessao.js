/**
 * Rotas de Sessão
 * Endpoints para gerenciamento de sessões
 * 
 * @copyright 2025 AsyncCypher
 */

const express = require('express');
const router = express.Router();

/**
 * GET /api/sessao/info
 * Obter informações da sessão atual
 */
router.get('/info', async (req, res, next) => {
  try {
    const AdaptadorMemoria = require('../adaptadores/AdaptadorMemoria');
    const adaptador = new AdaptadorMemoria();

    // Buscar sessão atual
    const sessoes = await adaptador.buscarSessoesUsuario(req.usuario.id);
    const sessaoAtual = sessoes.find(s => 
      s.fingerprint === req.usuario.fingerprint && s.ativa
    );

    if (!sessaoAtual) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Sessão não encontrada'
      });
    }

    // Informações da sessão (sem dados sensíveis)
    const infoSessao = {
      id: sessaoAtual.id,
      ip: sessaoAtual.ip,
      userAgent: sessaoAtual.userAgent,
      criadaEm: sessaoAtual.criadaEm,
      atualizadaEm: sessaoAtual.atualizadaEm,
      expiresEm: sessaoAtual.expiresEm,
      tempoRestante: new Date(sessaoAtual.expiresEm) - new Date(),
      ativa: sessaoAtual.ativa
    };

    res.json({
      sucesso: true,
      dados: infoSessao
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/sessao/renovar-tempo
 * Renovar tempo de expiração da sessão
 */
router.post('/renovar-tempo', async (req, res, next) => {
  try {
    const AdaptadorMemoria = require('../adaptadores/AdaptadorMemoria');
    const adaptador = new AdaptadorMemoria();

    // Buscar sessão atual
    const sessoes = await adaptador.buscarSessoesUsuario(req.usuario.id);
    const sessaoAtual = sessoes.find(s => 
      s.fingerprint === req.usuario.fingerprint && s.ativa
    );

    if (!sessaoAtual) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Sessão não encontrada'
      });
    }

    // Renovar por mais 24 horas
    const novaExpiracao = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await adaptador.atualizarSessao(sessaoAtual.id, {
      expiresEm: novaExpiracao,
      atualizadaEm: new Date()
    });

    // Log de auditoria
    await adaptador.criarLogAuditoria({
      idUsuario: req.usuario.id,
      acao: 'RENOVACAO_SESSAO',
      ip: req.ip,
      sessaoId: sessaoAtual.id,
      novaExpiracao,
      timestamp: new Date()
    });

    res.json({
      sucesso: true,
      mensagem: 'Sessão renovada com sucesso',
      dados: {
        novaExpiracao,
        tempoRestante: novaExpiracao - new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sessao/estatisticas
 * Obter estatísticas de sessões do usuário
 */
router.get('/estatisticas', async (req, res, next) => {
  try {
    const AdaptadorMemoria = require('../adaptadores/AdaptadorMemoria');
    const adaptador = new AdaptadorMemoria();

    const sessoes = await adaptador.buscarSessoesUsuario(req.usuario.id);
    
    const estatisticas = {
      totalSessoes: sessoes.length,
      sessoesAtivas: sessoes.filter(s => s.ativa).length,
      sessoesExpiradas: sessoes.filter(s => !s.ativa).length,
      ultimoLogin: sessoes.length > 0 ? 
        Math.max(...sessoes.map(s => new Date(s.criadaEm).getTime())) : null,
      dispositivosUnicos: new Set(sessoes.map(s => s.fingerprint)).size,
      ipsUnicos: new Set(sessoes.map(s => s.ip)).size
    };

    // Converter timestamp para data
    if (estatisticas.ultimoLogin) {
      estatisticas.ultimoLogin = new Date(estatisticas.ultimoLogin);
    }

    res.json({
      sucesso: true,
      dados: estatisticas
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sessao/dispositivos
 * Listar dispositivos únicos do usuário
 */
router.get('/dispositivos', async (req, res, next) => {
  try {
    const AdaptadorMemoria = require('../adaptadores/AdaptadorMemoria');
    const adaptador = new AdaptadorMemoria();

    const sessoes = await adaptador.buscarSessoesUsuario(req.usuario.id);
    
    // Agrupar por fingerprint
    const dispositivosMap = new Map();
    
    sessoes.forEach(sessao => {
      const fingerprint = sessao.fingerprint;
      
      if (!dispositivosMap.has(fingerprint)) {
        dispositivosMap.set(fingerprint, {
          fingerprint,
          primeiroUso: sessao.criadaEm,
          ultimoUso: sessao.criadaEm,
          totalSessoes: 0,
          sessoesAtivas: 0,
          ips: new Set(),
          userAgents: new Set()
        });
      }
      
      const dispositivo = dispositivosMap.get(fingerprint);
      dispositivo.totalSessoes++;
      
      if (sessao.ativa) {
        dispositivo.sessoesAtivas++;
      }
      
      dispositivo.ips.add(sessao.ip);
      dispositivo.userAgents.add(sessao.userAgent);
      
      // Atualizar datas
      if (new Date(sessao.criadaEm) < new Date(dispositivo.primeiroUso)) {
        dispositivo.primeiroUso = sessao.criadaEm;
      }
      
      if (new Date(sessao.criadaEm) > new Date(dispositivo.ultimoUso)) {
        dispositivo.ultimoUso = sessao.criadaEm;
      }
    });
    
    // Converter para array e limpar Sets
    const dispositivos = Array.from(dispositivosMap.values()).map(dispositivo => ({
      ...dispositivo,
      ips: Array.from(dispositivo.ips),
      userAgents: Array.from(dispositivo.userAgents),
      atual: dispositivo.fingerprint === req.usuario.fingerprint
    }));

    res.json({
      sucesso: true,
      dados: dispositivos
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;