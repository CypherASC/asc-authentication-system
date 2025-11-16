/**
 * Configurações de Banco de Dados
 * Configurações para diferentes adaptadores de banco
 * 
 * @copyright 2025 AsyncCypher
 */

module.exports = {
  // Configuração padrão
  padrao: {
    tipo: 'memoria',
    timeout: 30000,
    maxConexoes: 10,
    minConexoes: 2
  },

  // PostgreSQL
  postgresql: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'asc_auth',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || '',
    ssl: process.env.DB_SSL === 'true',
    poolMax: parseInt(process.env.DB_POOL_MAX) || 10,
    poolMin: parseInt(process.env.DB_POOL_MIN) || 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    schema: 'public'
  },

  // MySQL
  mysql: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'asc_auth',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    ssl: process.env.DB_SSL === 'true',
    connectionLimit: parseInt(process.env.DB_POOL_MAX) || 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
  },

  // MongoDB
  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/asc_auth',
    database: process.env.MONGO_DB || 'asc_auth',
    maxPoolSize: parseInt(process.env.MONGO_POOL_MAX) || 10,
    minPoolSize: parseInt(process.env.MONGO_POOL_MIN) || 2,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
  },

  // SQLite
  sqlite: {
    filename: process.env.SQLITE_FILE || './data/asc_auth.db',
    mode: 'OPEN_READWRITE | OPEN_CREATE',
    verbose: process.env.NODE_ENV === 'development',
    busyTimeout: 30000
  },

  // Redis (para sessões)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASS || '',
    db: parseInt(process.env.REDIS_DB) || 0,
    keyPrefix: 'asc:',
    retryDelayOnFailover: 100,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
    lazyConnect: true
  },

  // Configurações de migração
  migracao: {
    diretorio: './migrations',
    tabela: 'asc_migrations',
    executarAutomaticamente: process.env.AUTO_MIGRATE === 'true',
    criarTabelasSeNaoExistir: true
  },

  // Configurações de backup
  backup: {
    habilitado: process.env.BACKUP_ENABLED === 'true',
    intervalo: process.env.BACKUP_INTERVAL || '0 2 * * *', // 2h da manhã
    diretorio: process.env.BACKUP_DIR || './backups',
    manterPorDias: parseInt(process.env.BACKUP_KEEP_DAYS) || 30,
    compressao: true
  }
};