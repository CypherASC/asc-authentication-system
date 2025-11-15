# Guia de Integração ASC

Este guia apresenta diferentes formas de integrar o sistema ASC em suas aplicações existentes, desde implementações simples até integrações avançadas com frameworks modernos.

## Integração Básica

### Express.js Simples
A forma mais direta de proteger suas rotas existentes é através do middleware de autenticação:

```javascript
const middlewareAuth = require('./src/middlewares/autenticacao');
app.use('/api/protegido/*', middlewareAuth);
```

Esta implementação protege automaticamente todas as rotas que começam com `/api/protegido/`, exigindo um token JWT válido para acesso.

### Cliente JavaScript
Para aplicações frontend, a integração segue o padrão REST tradicional:

```javascript
// Autenticação do usuário
const resposta = await fetch('/api/autenticacao/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, senha })
});

// Uso do token em requisições subsequentes
const dados = await fetch('/api/dados-protegidos', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Integrações Avançadas

### SDK (Recomendado)
O ASC SDK oferece uma interface orientada a objetos que simplifica drasticamente a integração. Com classes especializadas para usuários e sessões, interceptadores para requisições, tratamento automático de erros, e suporte completo ao TypeScript.

### React
A integração com React utiliza Context API para gerenciamento global do estado de autenticação, hooks personalizados para facilitar o uso em componentes, e componentes pré-construídos para formulários de login.

### Vue.js
Para Vue.js, fornecemos um store reativo que mantém o estado de autenticação, plugin global que disponibiliza funcionalidades em toda a aplicação, e composables que seguem as melhores práticas do Vue 3.

### Express Existente
Aplicações Express existentes podem integrar o ASC através de middlewares modulares que não interferem na arquitetura atual, sistema de validação automática que pode ser aplicado seletivamente, e tratamento centralizado de erros.

## Processo de Integração

### Usando SDK (Recomendado)
1. Instale o SDK via NPM: `npm install @asynccypher/asc-sdk`
2. Inicialize com sua configuração: `new ASCSDK({ baseURL: 'sua-api' })`
3. Use os métodos orientados a objetos: `asc.login()`, `asc.obterPerfil()`
4. Aproveite o tratamento automático de erros e interceptadores

### Usando API Direta
1. Selecione o exemplo apropriado para sua arquitetura
2. Configure as URLs de acordo com seu ambiente
3. Importe os middlewares necessários
4. Teste a integração em ambiente de desenvolvimento

## Recursos Incluídos

O sistema oferece validação automática de dados de entrada, limitação de taxa para prevenir ataques, detecção de anomalias baseada em machine learning, logs completos de auditoria, proteção contra bots através de honeypots, e fingerprinting avançado de dispositivos.

## Suporte Técnico

Para questões técnicas, consulte a documentação completa ou entre em contato através de contato.asynccypher@gmail.com. O repositório oficial está disponível em https://github.com/CypherASC/asc-authentication-system.