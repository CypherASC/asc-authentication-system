# ASC (AsyncSystemCaption) - Sistema de Autenticação Empresarial

Sistema Avançado de Segurança e Autenticação para Aplicações Empresariais desenvolvido por AsyncCypher.

## Visão Geral

O ASC é uma solução completa de autenticação que combina segurança avançada com facilidade de integração. Desenvolvido especificamente para aplicações empresariais que necessitam de proteção robusta contra ameaças modernas, o sistema oferece recursos como detecção de anomalias baseada em machine learning, proteção contra bots e fingerprinting de dispositivos.

## Características Principais

### Segurança Avançada
O sistema implementa múltiplas camadas de proteção, incluindo detecção de anomalias que identifica comportamentos suspeitos em tempo real, sistema honeypot para capturar bots automaticamente, e fingerprinting de dispositivos que permite identificação única sem depender de cookies. A proteção contra ataques de força bruta é implementada através de limitação de taxa progressiva, enquanto todos os dados sensíveis são protegidos com criptografia AES-256.

### Integração Universal
Projetado para máxima compatibilidade, o ASC oferece adaptadores para os principais bancos de dados incluindo PostgreSQL, MySQL, MongoDB, SQLite e Redis. A API RESTful completa fornece endpoints padronizados e bem documentados, enquanto o sistema de middlewares modulares facilita a integração com Express.js e frameworks similares. A validação robusta de dados utiliza Joi com sanitização automática.

### Monitoramento e Auditoria
Sistema completo de logging centralizado e estruturado registra todas as atividades do sistema. A auditoria completa rastreia todas as ações dos usuários, fornecendo métricas de segurança em tempo real sobre tentativas de ataque. Alertas automáticos notificam sobre atividades suspeitas, permitindo resposta rápida a possíveis ameaças.

## Arquitetura do Sistema

```
src/
├── nucleo/                    # Componentes fundamentais do sistema
│   ├── motor-asc.js          # Motor principal de autenticação
│   ├── verificador-integridade.js
│   └── validador-licenca.js
├── adaptadores/              # Interfaces de banco de dados
│   ├── AdaptadorBancoDados.js
│   ├── AdaptadorMemoria.js
│   └── postgresql/
├── servicos/                 # Lógica de negócio
│   ├── ServicoAutenticacao.js
│   ├── ServicoToken.js
│   └── ServicoSessao.js
├── seguranca/               # Módulos de segurança avançada
│   ├── detector-anomalias.js
│   ├── sistema-honeypot.js
│   └── fingerprint-dispositivo.js
├── middlewares/             # Middlewares Express
│   ├── autenticacao.js
│   ├── limitador-taxa.js
│   └── validador.js
└── rotas/                   # Endpoints da API
    ├── autenticacao.js
    ├── usuario.js
    └── sessao.js
```

## Instalação e Configuração

### Requisitos
- Node.js versão 16 ou superior
- Banco de dados suportado (opcional para desenvolvimento)

### Instalação Básica

```bash
git clone https://github.com/CypherASC/asc-authentication-system.git
cd asc-authentication-system
npm install
```

### Configuração Inicial
O sistema funciona imediatamente após a instalação usando um adaptador de memória para desenvolvimento. Para produção, configure as variáveis de ambiente apropriadas.

## Uso da API

### Exemplo Básico

```javascript
// Registro de usuário
const resposta = await fetch('/api/autenticacao/registro', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'João Silva',
    email: 'joao@exemplo.com',
    senha: 'MinhaSenh@123'
  })
});

// Login
const login = await fetch('/api/autenticacao/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'joao@exemplo.com',
    senha: 'MinhaSenh@123'
  })
});

const { token } = await login.json();

// Usar token em requisições protegidas
const perfil = await fetch('/api/usuario/perfil', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Endpoints Disponíveis

### Autenticação
- `POST /api/autenticacao/registro` - Registrar novo usuário
- `POST /api/autenticacao/login` - Fazer login
- `POST /api/autenticacao/logout` - Fazer logout
- `POST /api/autenticacao/renovar` - Renovar token
- `GET /api/autenticacao/honeypot` - Obter campos honeypot

### Usuário
- `GET /api/usuario/perfil` - Obter perfil do usuário
- `PUT /api/usuario/perfil` - Atualizar perfil
- `POST /api/usuario/alterar-senha` - Alterar senha
- `GET /api/usuario/sessoes` - Listar sessões ativas
- `DELETE /api/usuario/sessoes/:id` - Encerrar sessão específica

### Sessão
- `GET /api/sessao/info` - Informações da sessão atual
- `POST /api/sessao/renovar-tempo` - Renovar tempo de expiração
- `GET /api/sessao/estatisticas` - Estatísticas de sessões
- `GET /api/sessao/dispositivos` - Listar dispositivos únicos

## Configuração Avançada

### Variáveis de Ambiente

```bash
# Servidor
PORTA=3000
NODE_ENV=production

# Segurança
CHAVE_SECRETA=sua-chave-secreta-super-segura
NIVEL_LOG=info

# Banco de Dados (exemplo PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=asc_auth
DB_USER=usuario
DB_PASS=senha
```

### Adaptadores de Banco de Dados

```javascript
// PostgreSQL
const AdaptadorPostgreSQL = require('./src/adaptadores/postgresql/PostgreSQLAdapter');
const adaptador = new AdaptadorPostgreSQL({
  host: 'localhost',
  port: 5432,
  database: 'asc_auth',
  user: 'usuario',
  password: 'senha'
});

// MongoDB
const AdaptadorMongoDB = require('./src/adaptadores/mongodb/MongoDBAdapter');
const adaptador = new AdaptadorMongoDB({
  uri: 'mongodb://localhost:27017/asc_auth'
});
```

## Recursos de Segurança

### Detecção de Anomalias
O sistema analisa continuamente padrões de comportamento dos usuários, identificando automaticamente logins de localizações incomuns, acessos em horários atípicos, dispositivos não reconhecidos, e viagens geograficamente impossíveis. Algoritmos de machine learning detectam padrões de comportamento suspeitos em tempo real.

### Sistema Honeypot
Implementação de campos invisíveis em formulários que detectam bots automatizados, preenchimento excessivamente rápido de formulários, padrões sequenciais de preenchimento, e IPs previamente identificados como maliciosos.

### Fingerprinting de Dispositivos
Identificação única de dispositivos baseada em múltiplos fatores incluindo User-Agent e cabeçalhos HTTP, resolução de tela e configurações de fuso horário, fingerprints de Canvas e WebGL, características específicas de hardware, e plugins e fontes instaladas no sistema.

## Monitoramento e Logs

### Estrutura de Logs
O sistema gera logs estruturados em formato JSON para facilitar análise e integração com ferramentas de monitoramento:
```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "nivel": "INFO",
  "mensagem": "Login realizado com sucesso",
  "idUsuario": "uuid-do-usuario",
  "ip": "192.168.1.100",
  "riskLevel": "LOW",
  "anomalias": []
}
```

### Métricas de Segurança
Acompanhamento em tempo real de tentativas de login por minuto, IPs bloqueados automaticamente, anomalias detectadas pelo sistema, tokens revogados por motivos de segurança, e sessões ativas por usuário.

## Contribuição

Contribuições são bem-vindas através de Pull Requests. Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua funcionalidade
3. Implemente as mudanças com testes apropriados
4. Envie um Pull Request com descrição detalhada

## Licenciamento

Este projeto está licenciado sob Creative Commons BY-NC-ND 4.0, permitindo uso educacional e pessoal, mas restringindo uso comercial sem autorização. Para licenças comerciais, entre em contato através de contato.asynccypher@gmail.com.

## Suporte e Contato

**Desenvolvedor:** AsyncCypher  
**Email:** contato.asynccypher@gmail.com  
**Repositório:** https://github.com/CypherASC/asc-authentication-system  

Para questões técnicas, abra uma issue no repositório. Para licenças comerciais e suporte dedicado, entre em contato diretamente por email.

## Roadmap de Desenvolvimento

Funcionalidades planejadas incluem suporte a OAuth 2.0 e OpenID Connect, integração com provedores de identidade externos, dashboard web para administração, suporte a autenticação multifator, API GraphQL, métricas avançadas com Prometheus, e containerização com Docker e Kubernetes.