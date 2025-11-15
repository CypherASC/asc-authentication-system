/**
 * Rotas de Teste
 * Endpoints para auxiliar nos testes (apenas desenvolvimento)
 * 
 * @copyright 2025 AsyncCypher
 */

const express = require('express');
const router = express.Router();

// Endpoint para limpar dados de teste
router.post('/limpar', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      sucesso: false,
      mensagem: 'Endpoint não disponível em produção'
    });
  }

  try {
    // Limpar adaptador global se existir
    if (global.adaptadorASC) {
      global.adaptadorASC.limparTodos();
    }

    res.json({
      sucesso: true,
      mensagem: 'Dados de teste limpos com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao limpar dados de teste',
      erro: error.message
    });
  }
});

// Endpoint para obter estatísticas do adaptador
router.get('/estatisticas', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      sucesso: false,
      mensagem: 'Endpoint não disponível em produção'
    });
  }

  try {
    const estatisticas = global.adaptadorASC ? 
      global.adaptadorASC.obterEstatisticas() : 
      { usuarios: 0, sessoes: 0, logsAuditoria: 0 };

    res.json({
      sucesso: true,
      dados: estatisticas
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao obter estatísticas',
      erro: error.message
    });
  }
});

module.exports = router;