/**
 * ASC Zero Config - Inicialização Instantânea
 * Execute: node asc-zero-config.js
 * 
 * O sistema detecta automaticamente:
 * - Porta disponível
 * - Banco de dados (PostgreSQL, MongoDB, MySQL, SQLite ou Memória)
 * - Configurações CORS
 * - Ambiente (desenvolvimento/produção)
 */

require('./src/asc-automatico').iniciar();