# Testes do Sistema ASC

Sistema completo de testes para validar todas as funcionalidades do ASC sem comprometer dados reais.

## Tipos de Teste

### Testes Unitários
Testam componentes individuais do sistema:
- Motor ASC (criptografia, tokens, validações)
- Detector de Anomalias
- Sistema Honeypot
- Fingerprinting de Dispositivos

### Testes da API
Testam endpoints completos da API:
- Registro e login de usuários
- Gerenciamento de perfil
- Controle de sessões
- Funcionalidades de segurança

## Execução dos Testes

### Executar Todos os Testes
```bash
node testes/executar-testes.js
```

### Executar Apenas Testes Unitários
```bash
node testes/teste-unitario.js
```

### Executar Apenas Testes da API
```bash
# Primeiro, inicie o servidor
npm run iniciar

# Em outro terminal
node testes/teste-api.js
```

## Dados de Teste

Todos os testes utilizam dados completamente fictícios:
- **Email**: teste@exemplo-ficticio.com
- **Nome**: Usuario Teste
- **Senha**: SenhaSegura123!

Nenhum dado real ou pessoal é utilizado nos testes.

## Segurança dos Testes

### Proteções Implementadas
- Dados fictícios em todos os testes
- Arquivo .gitignore para proteger dados locais
- Nenhuma informação sensível no código
- Testes isolados que não afetam dados reais

### Arquivos Protegidos
O .gitignore protege automaticamente:
- Logs de teste
- Configurações locais
- Dados personalizados
- Credenciais e tokens

## Estrutura dos Testes

```
testes/
├── teste-unitario.js      # Testes de componentes individuais
├── teste-api.js          # Testes completos da API
├── executar-testes.js    # Executor principal
├── .gitignore           # Proteção de dados sensíveis
└── README.md           # Esta documentação
```

## Interpretação dos Resultados

### Símbolos
- ✓ Teste passou
- ✗ Teste falhou

### Relatório Final
- **Taxa de Sucesso**: Percentual de testes aprovados
- **Duração**: Tempo total de execução
- **Detalhes**: Informações específicas sobre falhas

## Resolução de Problemas

### Servidor Não Disponível
Se os testes da API falharem por servidor indisponível:
1. Inicie o servidor: `npm run iniciar`
2. Verifique se está rodando na porta 3000
3. Execute os testes novamente

### Falhas de Teste
Se algum teste falhar:
1. Verifique a mensagem de erro específica
2. Confirme se todas as dependências estão instaladas
3. Verifique se não há conflitos de porta

## Adicionando Novos Testes

Para adicionar novos testes:
1. Use sempre dados fictícios
2. Siga o padrão de nomenclatura existente
3. Adicione ao executor principal se necessário
4. Documente o novo teste neste README

## Contato

Para questões sobre os testes:
- **Email**: contato.asynccypher@gmail.com
- **Repositório**: https://github.com/CypherASC/asc-authentication-system