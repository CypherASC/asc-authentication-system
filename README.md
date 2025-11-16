# ASC (AsyncSystemCaption) - Sistema de Autenticação Empresarial

<img width="1000" height="1200" alt="asc23" src="https://github.com/user-attachments/assets/d7a690e2-d49f-4a0f-b591-f7ff9532eb4e" />

Sistema Avançado de Segurança e Autenticação para Aplicações Empresariais desenvolvido por AsyncCypher.

## Início Rápido

```bash
# 1. Clone e instale
git clone https://github.com/CypherASC/asc-authentication-system.git
cd asc-authentication-system
npm install

# 2. Execute (funciona sem configuração)
npm start

# 3. Teste
curl http://localhost:3000/status
```

## Índice

- [Visão Geral](#visão-geral)
- [Instalação](#instalação)
- [Modos de Operação](#modos-de-operação)
- [API Completa](#api-completa)
- [SDK Cliente](#sdk-cliente)
- [Configuração](#configuração)
- [Segurança](#segurança)
- [Arquitetura](#arquitetura)

## Visão Geral

O ASC é uma solução completa de autenticação que combina segurança avançada com facilidade de integração. Oferece dois modos de operação: **ASC Simples** para controle total e **ASC Automático** para configuração zero.

### Características Principais

- **Segurança Avançada**: Detecção de anomalias, sistema honeypot, fingerprinting de dispositivos
- **Integração Universal**: Adaptadores para PostgreSQL, MySQL, MongoDB, SQLite, Redis
- **Zero Configuração**: Modo automático que detecta e configura o ambiente
- **API RESTful**: Endpoints padronizados e bem documentados
- **SDK Cliente**: JavaScript/TypeScript para frontend
- **Monitoramento**: Logs estruturados e métricas de segurança

## Instalação

### Requisitos
- Node.js 16+ 
- Banco de dados (opcional - usa memória por padrão)

### Instalação Básica
```bash
git clone https://github.com/CypherASC/asc-authentication-system.git
cd asc-authentication-system
npm install
```

### Scripts Disponíveis
```bash
npm start          # Inicia servidor principal (porta 3000)
npm run dev        # Modo desenvolvimento com nodemon
npm run auto       # Modo automático (zero configuração)
npm run configurar # Script de configuração interativa
```

## Modos de Operação

### ASC Simples - Controle Total

Para projetos que precisam de configuração específica:

```javascript
const ASCSimples = require('./api/asc-simples');

// Configuração personalizada
const asc = new ASCSimples({
  porta: 3000,
  cors: true,
  logs: true
});

// Iniciar servidor
await asc.iniciarServidor();
```

#### Métodos Disponíveis

##### `constructor(opcoes)`
Cria nova instância do ASC Simples.
```javascript
const opcoes = {
  porta: 3000,        // Porta do servidor (padrão: 3000)
  cors: true,         // Habilitar CORS (padrão: true)
  logs: true          // Habilitar logs (padrão: true)
};
```

##### `async registrar(email, senha, nome, req)`
Registra novo usuário no sistema.
```javascript
const resultado = await asc.registrar(
  'usuario@exemplo.com',
  'MinhaSenh@123',
  'João Silva',
  { ip: '192.168.1.1', headers: req.headers }
);
// Retorna: { id, email, token, refreshToken }
```

##### `async login(email, senha, req)`
Autentica usuário existente.
```javascript
const resultado = await asc.login(
  'usuario@exemplo.com',
  'MinhaSenh@123',
  { ip: '192.168.1.1', headers: req.headers }
);
// Retorna: { token, refreshToken, usuario }
```

##### `async verificarToken(token)`
Verifica validade de token JWT.
```javascript
const verificacao = await asc.verificarToken('jwt-token-aqui');
// Retorna: { valido: true/false, usuario: {...}, erro?: string }
```

##### `async logout(token, req)`
Revoga token e encerra sessão.
```javascript
await asc.logout('jwt-token-aqui', { ip: '192.168.1.1' });
// Retorna: { sucesso: true }
```

##### `async renovarToken(refreshToken, req)`
Renova token usando refresh token.
```javascript
const novoToken = await asc.renovarToken('refresh-token-aqui', req);
// Retorna: { token, refreshToken }
```

##### `middleware()`
Middleware Express para proteger rotas.
```javascript
const app = express();
app.get('/protegida', asc.middleware(), (req, res) => {
  // req.usuario contém dados do usuário autenticado
  res.json({ usuario: req.usuario });
});
```

### ASC Automático - Zero Configuração

Para deploy rápido e desenvolvimento:

```javascript
const ASCAutomatico = require('./api/asc-automatico');

// Inicialização automática
await ASCAutomatico.iniciar();
```

#### Detecção Automática

O ASC Automático detecta automaticamente:

- **Banco de Dados**: PostgreSQL, MongoDB, MySQL, SQLite ou Memória
- **Porta**: `PORT`, `PORTA`, `SERVER_PORT` ou 3000
- **CORS**: Baseado no ambiente (dev/prod)
- **SSL**: Certificados ou variáveis de ambiente

#### Variáveis de Ambiente Suportadas
```bash
# Banco de dados
DATABASE_URL=postgresql://user:pass@host:5432/db
MONGODB_URI=mongodb://localhost:27017/asc
MYSQL_URL=mysql://user:pass@host:3306/db

# Servidor
PORT=3000
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# SSL
SSL_CERT=/path/to/cert.pem
SSL_KEY=/path/to/key.pem
HTTPS=true
```

## API Completa

### Endpoints de Autenticação

#### `POST /registro`
Registra novo usuário.
```javascript
// Requisição
{
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "senha": "MinhaSenh@123"
}

// Resposta
{
  "sucesso": true,
  "dados": {
    "id": "uuid-do-usuario",
    "email": "joao@exemplo.com",
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

#### `POST /login`
Autentica usuário.
```javascript
// Requisição
{
  "email": "joao@exemplo.com",
  "senha": "MinhaSenh@123"
}

// Resposta
{
  "sucesso": true,
  "dados": {
    "token": "jwt-token",
    "refreshToken": "refresh-token",
    "usuario": {
      "id": "uuid",
      "email": "joao@exemplo.com",
      "nome": "João Silva"
    }
  }
}
```

#### `POST /logout`
Encerra sessão (requer token).
```javascript
// Headers
Authorization: Bearer jwt-token

// Resposta
{
  "sucesso": true,
  "mensagem": "Logout realizado"
}
```

#### `POST /renovar`
Renova token usando refresh token.
```javascript
// Requisição
{
  "refreshToken": "refresh-token-aqui"
}

// Resposta
{
  "sucesso": true,
  "dados": {
    "token": "novo-jwt-token",
    "refreshToken": "novo-refresh-token"
  }
}
```

### Endpoints Protegidos

#### `GET /perfil`
Obtém perfil do usuário autenticado.
```javascript
// Headers
Authorization: Bearer jwt-token

// Resposta
{
  "sucesso": true,
  "usuario": {
    "id": "uuid",
    "email": "joao@exemplo.com",
    "nome": "João Silva"
  }
}
```

### Endpoints Utilitários

#### `GET /status`
Verifica status do sistema.
```javascript
// Resposta
{
  "sucesso": true,
  "status": "ativo",
  "versao": "1.0.0",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "sistema": "ASC - AsyncSystemCaption"
}
```

#### `GET /honeypot`
Obtém campos honeypot para formulários.
```javascript
// Resposta
{
  "sucesso": true,
  "dados": {
    "email_confirmacao": "",
    "website": "",
    "numero_telefone": ""
  }
}
```

## SDK Cliente

### Instalação
```bash
npm install ./sdk
```

### Uso Básico
```javascript
const ASCSDK = require('asc-sdk');

const asc = new ASCSDK({
  baseURL: 'http://localhost:3000'
});

// Registro
const registro = await asc.registrar({
  nome: 'João Silva',
  email: 'joao@exemplo.com',
  senha: 'MinhaSenh@123'
});

// Login
const login = await asc.login('joao@exemplo.com', 'MinhaSenh@123');

// Usar token automaticamente
const perfil = await asc.obterPerfil();

// Logout
await asc.logout();
```

### Métodos do SDK

#### `async registrar(dados)`
```javascript
const resultado = await asc.registrar({
  nome: 'Nome Completo',
  email: 'email@exemplo.com',
  senha: 'SenhaSegura123'
});
```

#### `async login(email, senha)`
```javascript
const resultado = await asc.login('email@exemplo.com', 'senha');
// Token é armazenado automaticamente
```

#### `async obterPerfil()`
```javascript
const perfil = await asc.obterPerfil();
// Usa token armazenado automaticamente
```

#### `async logout()`
```javascript
await asc.logout();
// Remove token armazenado
```

#### `async renovarToken()`
```javascript
const novoToken = await asc.renovarToken();
// Atualiza token automaticamente
```

## Configuração

### Desenvolvimento
Funciona sem configuração:
```bash
npm start  # Funciona direto na porta 3000
```

### Produção
Configuração obrigatória por segurança:
```bash
# Criar arquivo .env
CHAVE_SECRETA=sua-chave-secreta-de-64-caracteres-minimo
DATABASE_URL=postgresql://user:pass@host:5432/database
NODE_ENV=production

# Iniciar
npm start
```

### Variáveis de Ambiente
```bash
# Essenciais
CHAVE_SECRETA=chave-jwt-secreta
NODE_ENV=development|production

# Banco de dados
DATABASE_URL=postgresql://...
MONGODB_URI=mongodb://...
MYSQL_URL=mysql://...

# Servidor
PORTA=3000
CORS_ORIGIN=http://localhost:3000

# Segurança
SSL_CERT=/path/to/cert.pem
SSL_KEY=/path/to/key.pem
```

## Segurança

### Recursos de Proteção

#### Detecção de Anomalias
- Logins de localizações incomuns
- Acessos em horários atípicos
- Dispositivos não reconhecidos
- Viagens geograficamente impossíveis

#### Sistema Honeypot
- Campos invisíveis em formulários
- Detecção de bots automatizados
- Preenchimento excessivamente rápido
- IPs maliciosos conhecidos

#### Fingerprinting de Dispositivos
- User-Agent e cabeçalhos HTTP
- Resolução de tela e fuso horário
- Fingerprints Canvas e WebGL
- Características de hardware

### Logs de Segurança
```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "nivel": "INFO",
  "mensagem": "Login realizado com sucesso",
  "idUsuario": "uuid-do-usuario",
  "ip": "192.168.1.100",
  "nivelRisco": "BAIXO",
  "anomalias": []
}
```

## Arquitetura

### Estrutura do Projeto
```
api seguranca/
├── api/                    # Código principal
│   ├── nucleo/            # Motor ASC e verificador
│   ├── servicos/          # Lógica de negócio
│   ├── adaptadores/       # Interfaces de banco
│   ├── seguranca/         # Módulos de segurança
│   ├── middlewares/       # Middlewares Express
│   ├── rotas/             # Endpoints da API
│   ├── controladores/     # Controladores
│   ├── configuracao/      # Configurações
│   └── utilitarios/       # Utilitários
├── exemplos/              # Exemplos de uso
├── scripts/               # Scripts de configuração
├── sdk/                   # SDK cliente
├── logs/                  # Arquivos de log
└── servidor.js           # Ponto de entrada
```

### Adaptadores de Banco

#### PostgreSQL
```javascript
const AdaptadorPostgreSQL = require('./api/adaptadores/postgresql/PostgreSQLAdapter');
const adaptador = new AdaptadorPostgreSQL({
  host: 'localhost',
  port: 5432,
  database: 'asc_auth',
  user: 'usuario',
  password: 'senha'
});
```

#### MongoDB
```javascript
const AdaptadorMongoDB = require('./api/adaptadores/mongodb/MongoDBAdapter');
const adaptador = new AdaptadorMongoDB({
  uri: 'mongodb://localhost:27017/asc_auth'
});
```

#### Memória (Padrão)
```javascript
const AdaptadorMemoria = require('./api/adaptadores/AdaptadorMemoria');
const adaptador = new AdaptadorMemoria();
// Dados perdidos ao reiniciar - apenas desenvolvimento
```

## Exemplos de Integração

### Express.js Básico
```javascript
const express = require('express');
const ASCSimples = require('./api/asc-simples');

const app = express();
const asc = new ASCSimples();

// Rota protegida
app.get('/admin', asc.middleware(), (req, res) => {
  res.json({ 
    mensagem: 'Área administrativa',
    usuario: req.usuario 
  });
});

await asc.iniciarServidor();
```

### React Frontend
```javascript
import ASCSDK from 'asc-sdk';

const asc = new ASCSDK({
  baseURL: 'http://localhost:3000'
});

// Componente de login
const Login = () => {
  const handleLogin = async (email, senha) => {
    try {
      const resultado = await asc.login(email, senha);
      console.log('Login realizado:', resultado);
    } catch (error) {
      console.error('Erro no login:', error);
    }
  };
};
```

## Contribuição

1. Fork do projeto
2. Crie branch para funcionalidade: `git checkout -b nova-funcionalidade`
3. Commit das mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para branch: `git push origin nova-funcionalidade`
5. Abra Pull Request

## Licenciamento

Este projeto está licenciado sob Creative Commons BY-NC-ND 4.0 com termos adicionais específicos.

**Uso Permitido:**
- Educacional e acadêmico
- Pessoal não comercial
- Contribuições ao projeto

**Uso Comercial:** Requer licença específica

Para detalhes completos, consulte o arquivo [LICENSE](LICENSE). Para licenciamento comercial: contato.asynccypher@gmail.com

## Suporte

**Desenvolvedor:** AsyncCypher  
**Email:** contato.asynccypher@gmail.com  
**Repositório:** https://github.com/CypherASC/asc-authentication-system

Para questões técnicas, abra uma issue no repositório.