# ASC SDK - Kit de Desenvolvimento de Software

SDK oficial para integração com o sistema ASC de autenticação empresarial. Fornece uma interface simplificada e orientada a objetos para todas as funcionalidades do sistema ASC.

## Instalação

### NPM
```bash
npm install @asynccypher/asc-sdk
```

### CDN (Browser)
```html
<script src="https://cdn.jsdelivr.net/npm/@asynccypher/asc-sdk@1.0.0/asc-sdk.js"></script>
```

### Download Direto
Baixe o arquivo `asc-sdk.js` e inclua em seu projeto.

## Configuração Inicial

### Node.js
```javascript
const { ASCSDK } = require('@asynccypher/asc-sdk');

const asc = new ASCSDK({
  baseURL: 'https://sua-api.com',
  timeout: 30000
});
```

### Browser
```javascript
const asc = new ASCSDK({
  baseURL: 'https://sua-api.com',
  timeout: 30000
});
```

### TypeScript
```typescript
import { ASCSDK, ConfiguracaoSDK } from '@asynccypher/asc-sdk';

const config: ConfiguracaoSDK = {
  baseURL: 'https://sua-api.com',
  timeout: 30000
};

const asc = new ASCSDK(config);
```

## Uso Básico

### Autenticação

#### Registro de Usuário
```javascript
try {
  const usuario = await asc.registrar({
    nome: 'João Silva',
    email: 'joao@exemplo.com',
    senha: 'MinhaSenh@123'
  });
  
  console.log('Usuário registrado:', usuario.email);
} catch (error) {
  console.error('Erro no registro:', error.message);
}
```

#### Login
```javascript
try {
  const sessao = await asc.login('joao@exemplo.com', 'MinhaSenh@123');
  
  console.log('Login realizado com sucesso');
  console.log('Token:', asc.obterToken());
  console.log('Usuário:', sessao.usuario.nome);
} catch (error) {
  console.error('Erro no login:', error.message);
}
```

#### Logout
```javascript
try {
  await asc.logout();
  console.log('Logout realizado com sucesso');
} catch (error) {
  console.error('Erro no logout:', error.message);
}
```

### Gerenciamento de Usuário

#### Obter Perfil
```javascript
try {
  const usuario = await asc.obterPerfil();
  console.log('Perfil do usuário:', usuario);
} catch (error) {
  console.error('Erro ao obter perfil:', error.message);
}
```

#### Atualizar Perfil
```javascript
try {
  const usuario = await asc.atualizarPerfil({
    nome: 'João Silva Santos',
    telefone: '+5511999999999'
  });
  
  console.log('Perfil atualizado:', usuario.nome);
} catch (error) {
  console.error('Erro ao atualizar perfil:', error.message);
}
```

#### Alterar Senha
```javascript
try {
  await asc.alterarSenha('senhaAtual123', 'novaSenha456');
  console.log('Senha alterada com sucesso');
} catch (error) {
  console.error('Erro ao alterar senha:', error.message);
}
```

### Gerenciamento de Sessões

#### Listar Sessões Ativas
```javascript
try {
  const sessoes = await asc.obterSessoes();
  
  sessoes.forEach(sessao => {
    console.log(`Sessão ${sessao.id}:`);
    console.log(`- IP: ${sessao.ip}`);
    console.log(`- Criada em: ${sessao.criadaEm}`);
    console.log(`- Ativa: ${sessao.ativa}`);
  });
} catch (error) {
  console.error('Erro ao obter sessões:', error.message);
}
```

#### Encerrar Sessão Específica
```javascript
try {
  await asc.encerrarSessao('id-da-sessao');
  console.log('Sessão encerrada com sucesso');
} catch (error) {
  console.error('Erro ao encerrar sessão:', error.message);
}
```

#### Obter Estatísticas de Sessão
```javascript
try {
  const stats = await asc.obterEstatisticasSessao();
  
  console.log('Estatísticas de sessão:');
  console.log(`- Total de sessões: ${stats.totalSessoes}`);
  console.log(`- Sessões ativas: ${stats.sessoesAtivas}`);
  console.log(`- Dispositivos únicos: ${stats.dispositivosUnicos}`);
} catch (error) {
  console.error('Erro ao obter estatísticas:', error.message);
}
```

## Recursos Avançados

### Interceptadores

#### Interceptador de Requisição
```javascript
asc.adicionarInterceptadorRequisicao((config) => {
  console.log('Enviando requisição para:', config.url);
  
  // Adicionar cabeçalhos personalizados
  config.headers['X-Custom-Header'] = 'valor';
  
  return config;
});
```

#### Interceptador de Resposta
```javascript
asc.adicionarInterceptadorResposta((dados, resposta) => {
  console.log('Resposta recebida:', resposta.status);
  
  // Log de auditoria personalizado
  if (dados.sucesso) {
    console.log('Operação realizada com sucesso');
  }
});
```

### Tratamento de Erros

```javascript
try {
  await asc.login('email@invalido.com', 'senhaErrada');
} catch (error) {
  if (error instanceof ASCError) {
    console.log('Código do erro:', error.codigo);
    console.log('Mensagem:', error.message);
    console.log('Dados adicionais:', error.dados);
    
    switch (error.codigo) {
      case 401:
        console.log('Credenciais inválidas');
        break;
      case 429:
        console.log('Muitas tentativas, tente novamente mais tarde');
        break;
      case 500:
        console.log('Erro interno do servidor');
        break;
    }
  }
}
```

### Configuração de Segurança

#### Campos Honeypot
```javascript
try {
  const honeypot = await asc.obterCamposHoneypot();
  
  // Adicionar campos invisíveis ao formulário
  honeypot.fields.forEach(campo => {
    const input = document.createElement('input');
    input.name = campo.name;
    input.type = campo.type;
    input.style.cssText = campo.style;
    input.tabIndex = campo.tabindex;
    
    document.getElementById('formulario').appendChild(input);
  });
} catch (error) {
  console.error('Erro ao obter honeypot:', error.message);
}
```

## Integração com Frameworks

### React Hook
```javascript
import { useState, useEffect } from 'react';
import { ASCSDK } from '@asynccypher/asc-sdk';

const useASC = () => {
  const [asc] = useState(() => new ASCSDK({
    baseURL: process.env.REACT_APP_API_URL
  }));
  
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const login = async (email, senha) => {
    setCarregando(true);
    try {
      const sessao = await asc.login(email, senha);
      setUsuario(sessao.usuario);
      return sessao;
    } finally {
      setCarregando(false);
    }
  };

  const logout = async () => {
    await asc.logout();
    setUsuario(null);
  };

  return { asc, usuario, login, logout, carregando };
};

export default useASC;
```

### Vue Composable
```javascript
import { ref, reactive } from 'vue';
import { ASCSDK } from '@asynccypher/asc-sdk';

export function useASC() {
  const asc = new ASCSDK({
    baseURL: import.meta.env.VITE_API_URL
  });

  const usuario = ref(null);
  const carregando = ref(false);

  const login = async (email, senha) => {
    carregando.value = true;
    try {
      const sessao = await asc.login(email, senha);
      usuario.value = sessao.usuario;
      return sessao;
    } finally {
      carregando.value = false;
    }
  };

  const logout = async () => {
    await asc.logout();
    usuario.value = null;
  };

  return {
    asc,
    usuario,
    login,
    logout,
    carregando
  };
}
```

## Configurações Avançadas

### Timeout Personalizado
```javascript
const asc = new ASCSDK({
  baseURL: 'https://api.exemplo.com',
  timeout: 60000 // 60 segundos
});
```

### API Key
```javascript
const asc = new ASCSDK({
  baseURL: 'https://api.exemplo.com',
  apiKey: 'sua-api-key-aqui'
});
```

### Token Pré-existente
```javascript
const asc = new ASCSDK({
  baseURL: 'https://api.exemplo.com',
  token: 'jwt-token-existente'
});
```

## Tratamento de Renovação Automática

```javascript
// Configurar renovação automática de token
asc.adicionarInterceptadorResposta(async (dados, resposta) => {
  if (resposta.status === 401 && dados.codigo === 'TOKEN_EXPIRED') {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      try {
        const novoToken = await asc.renovarToken(refreshToken);
        localStorage.setItem('token', novoToken.token);
        localStorage.setItem('refreshToken', novoToken.refreshToken);
        
        // Repetir requisição original
        return asc.requisicao(resposta.url, {
          method: resposta.method
        });
      } catch (error) {
        // Redirecionar para login
        window.location.href = '/login';
      }
    }
  }
});
```

## Métodos Disponíveis

### Autenticação
- `registrar(dadosUsuario)` - Registrar novo usuário
- `login(email, senha, opcoes)` - Fazer login
- `logout()` - Fazer logout
- `renovarToken(refreshToken)` - Renovar token de acesso

### Usuário
- `obterPerfil()` - Obter dados do perfil
- `atualizarPerfil(atualizacoes)` - Atualizar perfil
- `alterarSenha(senhaAtual, novaSenha)` - Alterar senha

### Sessão
- `obterSessoes()` - Listar sessões ativas
- `encerrarSessao(idSessao)` - Encerrar sessão específica
- `obterEstatisticasSessao()` - Obter estatísticas

### Segurança
- `obterCamposHoneypot()` - Obter campos honeypot

### Utilitários
- `definirToken(token)` - Definir token manualmente
- `obterToken()` - Obter token atual
- `requisicao(endpoint, opcoes)` - Fazer requisição personalizada

## Suporte e Documentação

Para documentação completa, exemplos adicionais e suporte técnico:

**Email:** contato.asynccypher@gmail.com  
**Repositório:** https://github.com/CypherASC/asc-authentication-system  
**Documentação:** https://docs.asynccypher.com/asc-sdk

## Licença

Este SDK está licenciado sob Creative Commons BY-NC-ND 4.0. Para uso comercial, entre em contato através de contato.asynccypher@gmail.com.