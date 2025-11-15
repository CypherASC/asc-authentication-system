# Documentação Completa - Sistema ASC

**Sistema Avançado de Segurança e Autenticação para Aplicações Empresariais**

Desenvolvido por **AsyncCypher** | Versão 1.0.0

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Recursos de Segurança](#recursos-de-segurança)
4. [Instalação e Configuração](#instalação-e-configuração)
5. [Métodos de Integração](#métodos-de-integração)
6. [API Reference](#api-reference)
7. [SDK Oficial](#sdk-oficial)
8. [Configurações Avançadas](#configurações-avançadas)
9. [Monitoramento e Logs](#monitoramento-e-logs)
10. [Limitações e Restrições](#limitações-e-restrições)
11. [Melhorias e Extensões](#melhorias-e-extensões)
12. [Troubleshooting](#troubleshooting)
13. [Licenciamento](#licenciamento)

---

## Visão Geral

O ASC (AsyncSystemCaption) é uma solução empresarial completa de autenticação que combina segurança de nível militar com facilidade de integração. Projetado para aplicações que exigem proteção robusta contra ameaças modernas, oferece recursos únicos como detecção de anomalias baseada em machine learning, sistema honeypot anti-bot e fingerprinting avançado de dispositivos.

### Características Principais

**Segurança Multicamada**
- Detecção de anomalias com algoritmos de machine learning
- Sistema honeypot para identificação automática de bots
- Fingerprinting de dispositivos sem dependência de cookies
- Proteção contra ataques de força bruta com rate limiting progressivo
- Criptografia AES-256 para todos os dados sensíveis

**Integração Universal**
- Adaptadores para PostgreSQL, MySQL, MongoDB, SQLite e Redis
- API RESTful padronizada com documentação OpenAPI
- SDK oficial com suporte a TypeScript
- Middlewares modulares para Express.js e frameworks similares
- Compatibilidade com React, Vue.js, Angular e vanilla JavaScript

**Monitoramento Empresarial**
- Sistema de logging estruturado em JSON
- Auditoria completa de todas as operações
- Métricas de segurança em tempo real
- Alertas automáticos para atividades suspeitas
- Dashboard de monitoramento (roadmap)

---

## Arquitetura do Sistema

### Estrutura Modular

```
ASC/
├── Núcleo Imutável
│   ├── Motor ASC (criptografia, JWT, validações)
│   ├── Verificador de Integridade
│   └── Validador de Licença
├── Camada de Segurança
│   ├── Detector de Anomalias (ML)
│   ├── Sistema Honeypot
│   └── Fingerprinting de Dispositivos
├── Camada de Dados
│   ├── Adaptadores Universais
│   ├── Migrações Automáticas
│   └── Backup e Recuperação
├── Camada de Aplicação
│   ├── Controladores RESTful
│   ├── Serviços de Negócio
│   └── Middlewares de Segurança
└── Camada de Interface
    ├── API RESTful
    ├── SDK Oficial
    └── Documentação Interativa
```

### Fluxo de Autenticação

1. **Requisição de Login**
   - Validação de dados com Joi
   - Verificação de campos honeypot
   - Rate limiting por IP e email

2. **Processamento de Segurança**
   - Fingerprinting do dispositivo
   - Análise de anomalias comportamentais
   - Verificação de IPs bloqueados

3. **Autenticação**
   - Validação de credenciais
   - Geração de tokens JWT
   - Criação de sessão segura

4. **Resposta**
   - Token de acesso (24h)
   - Refresh token (7 dias)
   - Análise de risco da sessão

---

## Recursos de Segurança

### Detecção de Anomalias com Machine Learning

O sistema analisa continuamente padrões comportamentais dos usuários:

**Fatores Analisados:**
- Localização geográfica dos logins
- Horários típicos de acesso
- Dispositivos utilizados historicamente
- Padrões de navegação
- Velocidade de deslocamento geográfico

**Algoritmo de Pontuação:**
```javascript
// Exemplo de análise de anomalia
const analise = {
  isAnomalous: false,
  anomalyScore: 0.3, // 0-1 (0 = normal, 1 = altamente suspeito)
  riskLevel: 'LOW', // LOW, MEDIUM, HIGH, CRITICAL
  reasons: [
    {
      type: 'UNUSUAL_LOCATION',
      confidence: 0.85,
      description: 'Login de localização não usual'
    }
  ]
};
```

### Sistema Honeypot Anti-Bot

Implementação de armadilhas invisíveis para detectar automação:

**Campos Honeypot:**
- Campos invisíveis via CSS
- Nomes que atraem bots (email_confirm, website)
- Validação de tempo de preenchimento
- Detecção de padrões sequenciais

**Exemplo de Implementação:**
```html
<!-- Campo invisível para capturar bots -->
<input name="email_confirm" 
       type="text" 
       style="position: absolute; left: -9999px;" 
       tabindex="-1" 
       autocomplete="off">
```

### Fingerprinting Avançado de Dispositivos

Identificação única baseada em múltiplos fatores:

**Componentes Coletados:**
- User-Agent e cabeçalhos HTTP
- Resolução de tela e configurações de display
- Fuso horário e configurações regionais
- Fingerprints de Canvas e WebGL
- Características de hardware (CPU, memória)
- Plugins e fontes instaladas

**Nível de Confiança:**
- 90-100%: Identificação altamente confiável
- 70-89%: Identificação moderada
- 50-69%: Identificação básica
- <50%: Identificação insuficiente

---

## Instalação e Configuração

### Requisitos do Sistema

**Mínimos:**
- Node.js 16.0.0 ou superior
- 512MB RAM disponível
- 100MB espaço em disco

**Recomendados:**
- Node.js 18.0.0 ou superior
- 2GB RAM disponível
- 1GB espaço em disco
- Banco de dados dedicado

### Instalação Rápida

```bash
# Clonar repositório
git clone https://github.com/CypherASC/asc-authentication-system.git
cd asc-authentication-system

# Instalar dependências
npm install

# Gerar chaves criptográficas
npm run gerar-chaves

# Verificar integridade
npm run verificar-integridade

# Iniciar servidor
npm run iniciar
```

### Configuração de Produção

**Variáveis de Ambiente Essenciais:**
```bash
# Servidor
NODE_ENV=production
PORTA=3000

# Segurança
CHAVE_SECRETA=sua-chave-super-segura-64-caracteres-minimo
NIVEL_LOG=info

# Banco de Dados
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=asc_production
DB_USER=asc_user
DB_PASS=senha-super-segura

# Rate Limiting
RATE_LIMIT_ENABLED=true
MAX_TENTATIVAS_LOGIN=5
TEMPO_BLOQUEIO_IP=900000

# Monitoramento
LOGS_ENABLED=true
AUDIT_ENABLED=true
METRICS_ENABLED=true
```

---

## Métodos de Integração

### 1. SDK Oficial (Recomendado)

**Instalação:**
```bash
npm install @asynccypher/asc-sdk
```

**Uso Básico:**
```javascript
import { ASCSDK } from '@asynccypher/asc-sdk';

const asc = new ASCSDK({
  baseURL: 'https://sua-api.com',
  timeout: 30000
});

// Login
const sessao = await asc.login('user@example.com', 'password');
console.log('Token:', asc.obterToken());

// Operações autenticadas
const perfil = await asc.obterPerfil();
await perfil.atualizar({ nome: 'Novo Nome' });
```

### 2. API RESTful Direta

**Autenticação:**
```javascript
const response = await fetch('/api/autenticacao/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    senha: 'password',
    // Campos de segurança
    localizacao: { lat: -23.5505, lon: -46.6333 },
    fusoHorario: 'America/Sao_Paulo'
  })
});

const { dados } = await response.json();
const token = dados.token;
```

**Requisições Autenticadas:**
```javascript
const response = await fetch('/api/usuario/perfil', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### 3. Middlewares Express

**Proteção de Rotas:**
```javascript
const middlewareAuth = require('./src/middlewares/autenticacao');

// Proteger rota específica
app.get('/api/dados-protegidos', middlewareAuth, (req, res) => {
  res.json({
    usuario: req.usuario,
    dados: 'Informações sensíveis'
  });
});

// Proteger grupo de rotas
app.use('/api/admin/*', middlewareAuth);
```

### 4. Integração com Frameworks

**React Hook:**
```javascript
import { useState, useEffect } from 'react';
import { ASCSDK } from '@asynccypher/asc-sdk';

export const useAuth = () => {
  const [asc] = useState(() => new ASCSDK({
    baseURL: process.env.REACT_APP_API_URL
  }));
  
  const [usuario, setUsuario] = useState(null);
  
  const login = async (email, senha) => {
    const sessao = await asc.login(email, senha);
    setUsuario(sessao.usuario);
    return sessao;
  };
  
  return { asc, usuario, login };
};
```

**Vue.js Composable:**
```javascript
import { ref, reactive } from 'vue';
import { ASCSDK } from '@asynccypher/asc-sdk';

export function useAuth() {
  const asc = new ASCSDK({
    baseURL: import.meta.env.VITE_API_URL
  });
  
  const usuario = ref(null);
  
  const login = async (email, senha) => {
    const sessao = await asc.login(email, senha);
    usuario.value = sessao.usuario;
    return sessao;
  };
  
  return { asc, usuario, login };
}
```

---

## API Reference

### Endpoints de Autenticação

#### POST /api/autenticacao/registro
Registra um novo usuário no sistema.

**Request Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "senha": "MinhaSenh@123",
  "telefone": "+5511999999999",
  "configuracoes": {
    "tema": "escuro",
    "idioma": "pt-BR",
    "notificacoes": true
  }
}
```

**Response (201):**
```json
{
  "sucesso": true,
  "mensagem": "Usuário registrado com sucesso",
  "dados": {
    "id": "uuid-do-usuario",
    "email": "joao@exemplo.com",
    "nome": "João Silva"
  }
}
```

#### POST /api/autenticacao/login
Autentica um usuário e retorna tokens de acesso.

**Request Body:**
```json
{
  "email": "joao@exemplo.com",
  "senha": "MinhaSenh@123",
  "localizacao": {
    "lat": -23.5505,
    "lon": -46.6333,
    "cidade": "São Paulo",
    "pais": "Brasil"
  },
  "fusoHorario": "America/Sao_Paulo",
  "resolucaoTela": "1920x1080"
}
```

**Response (200):**
```json
{
  "sucesso": true,
  "mensagem": "Login realizado com sucesso",
  "dados": {
    "usuario": {
      "id": "uuid-do-usuario",
      "email": "joao@exemplo.com",
      "nome": "João Silva"
    },
    "token": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "sessao": "uuid-da-sessao",
    "analiseSeguranca": {
      "riskLevel": "LOW",
      "confiancaDispositivo": 95
    }
  }
}
```

### Endpoints de Usuário

#### GET /api/usuario/perfil
Retorna dados do perfil do usuário autenticado.

**Headers:**
```
Authorization: Bearer jwt-access-token
```

**Response (200):**
```json
{
  "sucesso": true,
  "dados": {
    "id": "uuid-do-usuario",
    "email": "joao@exemplo.com",
    "nome": "João Silva",
    "telefone": "+5511999999999",
    "criadoEm": "2025-01-15T10:30:00.000Z",
    "atualizadoEm": "2025-01-15T15:45:00.000Z",
    "ativo": true,
    "verificado": true
  }
}
```

#### PUT /api/usuario/perfil
Atualiza dados do perfil do usuário.

**Request Body:**
```json
{
  "nome": "João Silva Santos",
  "telefone": "+5511888888888",
  "configuracoes": {
    "tema": "claro",
    "notificacoes": false
  }
}
```

### Endpoints de Sessão

#### GET /api/sessao/estatisticas
Retorna estatísticas das sessões do usuário.

**Response (200):**
```json
{
  "sucesso": true,
  "dados": {
    "totalSessoes": 15,
    "sessoesAtivas": 3,
    "sessoesExpiradas": 12,
    "ultimoLogin": "2025-01-15T15:45:00.000Z",
    "dispositivosUnicos": 4,
    "ipsUnicos": 6
  }
}
```

### Códigos de Erro

| Código | Descrição | Ação Recomendada |
|--------|-----------|------------------|
| 400 | Dados inválidos | Verificar formato dos dados |
| 401 | Não autorizado | Fazer login novamente |
| 403 | Acesso negado | Verificar permissões |
| 409 | Conflito de dados | Email já existe |
| 429 | Muitas requisições | Aguardar e tentar novamente |
| 500 | Erro interno | Contatar suporte |

---

## SDK Oficial

### Instalação e Configuração

```bash
npm install @asynccypher/asc-sdk
```

### Configuração Avançada

```javascript
import { ASCSDK } from '@asynccypher/asc-sdk';

const asc = new ASCSDK({
  baseURL: 'https://api.exemplo.com',
  timeout: 30000,
  apiKey: 'sua-api-key', // Opcional
  token: 'jwt-existente' // Opcional
});

// Interceptadores
asc.adicionarInterceptadorRequisicao((config) => {
  config.headers['X-Custom-Header'] = 'valor';
  return config;
});

asc.adicionarInterceptadorResposta((dados, resposta) => {
  console.log('Status:', resposta.status);
});
```

### Métodos Disponíveis

**Autenticação:**
- `registrar(dadosUsuario)` - Registrar usuário
- `login(email, senha, opcoes)` - Fazer login
- `logout()` - Fazer logout
- `renovarToken(refreshToken)` - Renovar token

**Usuário:**
- `obterPerfil()` - Obter perfil
- `atualizarPerfil(dados)` - Atualizar perfil
- `alterarSenha(atual, nova)` - Alterar senha

**Sessão:**
- `obterSessoes()` - Listar sessões
- `encerrarSessao(id)` - Encerrar sessão
- `obterEstatisticasSessao()` - Estatísticas

**Segurança:**
- `obterCamposHoneypot()` - Campos honeypot

### Classes do SDK

**UsuarioASC:**
```javascript
const usuario = await asc.obterPerfil();

// Métodos da instância
await usuario.atualizar({ nome: 'Novo Nome' });
await usuario.alterarSenha('atual', 'nova');
const sessoes = await usuario.obterSessoes();
```

**SessaoASC:**
```javascript
const sessoes = await asc.obterSessoes();
const sessao = sessoes[0];

// Métodos da instância
await sessao.encerrar();
await sessao.renovar();
const stats = await sessao.obterEstatisticas();
```

---

## Configurações Avançadas

### Adaptadores de Banco de Dados

#### PostgreSQL
```javascript
const configuracao = {
  host: 'localhost',
  port: 5432,
  database: 'asc_auth',
  user: 'postgres',
  password: 'senha',
  ssl: true,
  poolMax: 20,
  poolMin: 5
};
```

#### MongoDB
```javascript
const configuracao = {
  uri: 'mongodb://localhost:27017/asc_auth',
  maxPoolSize: 20,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000
};
```

### Configurações de Segurança

```javascript
// src/configuracao/seguranca.js
module.exports = {
  jwt: {
    tempoExpiracaoToken: '24h',
    tempoExpiracaoRefresh: '7d'
  },
  senha: {
    tamanhoMinimo: 8,
    exigirMaiuscula: true,
    exigirNumero: true,
    exigirCaracterEspecial: true
  },
  anomalias: {
    limiteAnomalias: 0.7,
    velocidadeMaximaKmh: 1000
  },
  rateLimiting: {
    autenticacao: {
      janela: 15 * 60 * 1000,
      maxTentativas: 5
    }
  }
};
```

### Headers de Segurança

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true
  }
}));
```

---

## Monitoramento e Logs

### Estrutura de Logs

```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "nivel": "INFO",
  "mensagem": "Login realizado com sucesso",
  "idUsuario": "uuid-do-usuario",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "riskLevel": "LOW",
  "anomalias": [],
  "fingerprint": "hash-do-dispositivo",
  "localizacao": {
    "cidade": "São Paulo",
    "pais": "Brasil"
  }
}
```

### Tipos de Log

**Auditoria:**
- LOGIN_SUCESSO
- LOGIN_FALHA
- REGISTRO_USUARIO
- ALTERACAO_SENHA
- ENCERRAMENTO_SESSAO

**Segurança:**
- ANOMALIA_DETECTADA
- BOT_DETECTADO
- IP_BLOQUEADO
- TENTATIVA_VIOLACAO

**Performance:**
- TEMPO_RESPOSTA
- MEMORIA_UTILIZADA
- CONEXOES_ATIVAS

### Métricas Disponíveis

- Tentativas de login por minuto
- Taxa de sucesso de autenticação
- IPs únicos por período
- Anomalias detectadas
- Dispositivos únicos
- Sessões ativas
- Tempo médio de resposta

---

## Limitações e Restrições

### Limitações Técnicas

**Performance:**
- Máximo 1000 requisições/minuto por IP (configurável)
- Máximo 100 sessões simultâneas por usuário
- Logs mantidos por 90 dias (configurável)
- Fingerprints válidos por 24 horas

**Funcionalidades:**
- Detecção de anomalias requer mínimo 5 logins históricos
- Sistema honeypot não funciona com JavaScript desabilitado
- Fingerprinting limitado em navegadores com privacidade extrema
- Rate limiting pode afetar testes automatizados

### Restrições de Licença

**Uso Permitido:**
- Projetos educacionais e acadêmicos
- Desenvolvimento pessoal não comercial
- Contribuições open source
- Análise e estudo do código

**Uso Restrito:**
- Comercialização sem licença apropriada
- Remoção de avisos de copyright
- Modificação dos sistemas de proteção
- Redistribuição com alterações não autorizadas

### Limitações de Segurança

**Não Protege Contra:**
- Ataques de engenharia social
- Comprometimento de credenciais válidas
- Ataques físicos ao servidor
- Vulnerabilidades de aplicações integradas

**Requer Configuração Adicional:**
- HTTPS obrigatório em produção
- Firewall adequadamente configurado
- Backup regular dos dados
- Monitoramento de infraestrutura

---

## Melhorias e Extensões

### Roadmap Oficial

**Versão 1.1 (Q2 2025):**
- Dashboard web de administração
- Suporte a OAuth 2.0 / OpenID Connect
- Integração com provedores externos (Google, Microsoft)
- API GraphQL

**Versão 1.2 (Q3 2025):**
- Autenticação multifator (2FA/MFA)
- Biometria via WebAuthn
- Análise comportamental avançada
- Machine learning aprimorado

**Versão 2.0 (Q4 2025):**
- Arquitetura de microserviços
- Suporte a Kubernetes
- Métricas com Prometheus/Grafana
- Compliance LGPD/GDPR

### Extensões Possíveis

**Adaptadores Adicionais:**
```javascript
// Exemplo: Adaptador para DynamoDB
class AdaptadorDynamoDB extends AdaptadorBancoDados {
  constructor(configuracao) {
    super(configuracao);
    this.dynamodb = new AWS.DynamoDB.DocumentClient();
  }
  
  async criarUsuario(dadosUsuario) {
    // Implementação específica do DynamoDB
  }
}
```

**Middlewares Personalizados:**
```javascript
// Exemplo: Middleware de geolocalização
const middlewareGeolocalizacao = (req, res, next) => {
  const ip = req.ip;
  const localizacao = obterLocalizacaoPorIP(ip);
  req.localizacao = localizacao;
  next();
};
```

**Plugins de Segurança:**
```javascript
// Exemplo: Plugin de análise de comportamento
class PluginComportamento {
  analisar(usuario, acao) {
    // Análise personalizada
    return { suspeito: false, confianca: 0.95 };
  }
}
```

### Contribuições da Comunidade

**Como Contribuir:**
1. Fork do repositório oficial
2. Criar branch para nova funcionalidade
3. Implementar com testes adequados
4. Documentar mudanças
5. Enviar Pull Request

**Áreas Prioritárias:**
- Novos adaptadores de banco de dados
- Melhorias no algoritmo de detecção de anomalias
- Otimizações de performance
- Correções de bugs
- Documentação e exemplos

---

## Troubleshooting

### Problemas Comuns

#### Erro: "Token inválido"
**Causa:** Token expirado ou malformado
**Solução:**
```javascript
try {
  await asc.obterPerfil();
} catch (error) {
  if (error.codigo === 401) {
    // Tentar renovar token
    await asc.renovarToken(refreshToken);
  }
}
```

#### Erro: "Muitas tentativas"
**Causa:** Rate limiting ativado
**Solução:**
- Aguardar tempo especificado
- Implementar backoff exponencial
- Verificar configurações de rate limiting

#### Erro: "Usuário não encontrado"
**Causa:** Dados não persistindo entre requisições
**Solução:**
```javascript
// Verificar se adaptador está configurado corretamente
if (!global.adaptadorASC) {
  global.adaptadorASC = new AdaptadorMemoria();
  await global.adaptadorASC.conectar();
}
```

#### Erro: "Atividade suspeita detectada"
**Causa:** Sistema honeypot detectou bot
**Solução:**
```javascript
// Incluir campos honeypot vazios
const dadosLogin = {
  email: 'user@example.com',
  senha: 'password',
  email_confirmacao: '', // Campo honeypot
  website: '', // Campo honeypot
  timestamp: (Date.now() - 3000).toString() // 3s atrás
};
```

### Logs de Debug

**Habilitar Debug:**
```bash
NODE_ENV=development
NIVEL_LOG=debug
DEBUG=asc:*
```

**Analisar Logs:**
```bash
# Filtrar logs de erro
grep "ERROR" logs/$(date +%Y-%m-%d).log

# Monitorar em tempo real
tail -f logs/$(date +%Y-%m-%d).log | grep "LOGIN"
```

### Performance

**Otimizações Recomendadas:**
- Usar Redis para sessões em produção
- Implementar cache de consultas frequentes
- Configurar pool de conexões adequado
- Monitorar uso de memória

**Métricas de Performance:**
```javascript
// Middleware de timing
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
});
```

---

## Licenciamento

### Licença Base

Este projeto opera sob **Creative Commons BY-NC-ND 4.0** com termos adicionais específicos.

### Uso Comercial

Para uso comercial, licenças empresariais estão disponíveis com:
- Suporte técnico dedicado
- Atualizações prioritárias
- Consultoria de implementação
- Garantias de funcionamento
- Suporte legal

**Contato para Licenças Comerciais:**
- Email: contato.asynccypher@gmail.com
- Resposta em até 24 horas úteis
- Propostas personalizadas disponíveis

### Proteção de Propriedade Intelectual

O sistema inclui mecanismos automatizados de proteção que:
- Monitoram integridade dos arquivos críticos
- Detectam modificações não autorizadas
- Registram tentativas de violação
- Podem degradar funcionamento se adulterado

### Compliance e Certificações

**Padrões Seguidos:**
- OWASP Top 10 Security Guidelines
- ISO 27001 Information Security
- NIST Cybersecurity Framework
- LGPD/GDPR Privacy Requirements

---

## Suporte e Comunidade

### Canais de Suporte

**Suporte Técnico:**
- Email: contato.asynccypher@gmail.com
- GitHub Issues: Para bugs e solicitações de recursos
- Documentação: Guias e tutoriais completos

**Comunidade:**
- GitHub Discussions: Discussões técnicas
- Stack Overflow: Tag `asc-authentication`
- Discord: Comunidade de desenvolvedores (em breve)

### Recursos Adicionais

**Documentação:**
- API Reference completa
- Guias de integração por framework
- Exemplos práticos de implementação
- Melhores práticas de segurança

**Ferramentas:**
- SDK oficial com TypeScript
- Postman Collection para testes
- Docker images para desenvolvimento
- Helm charts para Kubernetes

---

**Desenvolvido com excelência por AsyncCypher**  
**Versão da Documentação:** 1.0.0  
**Última Atualização:** Novembro 2025

Para mais informações, visite: https://github.com/CypherASC/asc-authentication-system