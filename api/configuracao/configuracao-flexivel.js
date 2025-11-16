/**
 * Configuração Flexível de Segurança
 * Permite ajustar níveis de segurança conforme necessidade
 */

class ConfiguracaoSeguranca {
    constructor() {
        this.configuracoes = {
            // Nível de segurança: 'baixo', 'medio', 'alto', 'critico'
            nivelSeguranca: process.env.NIVEL_SEGURANCA || 'medio',
            
            // Servidor
            servidor: {
                porta: process.env.PORTA || process.env.PORT || 3000,
                host: process.env.HOST || 'localhost'
            },
            
            // Chave secreta (gerada automaticamente se não definida)
            chaveSecreta: process.env.CHAVE_SECRETA || this.gerarChaveSecreta(),
            
            // Configurações de senha
            senha: {
                tamanhoMinimo: 8,
                exigirMaiuscula: true,
                exigirMinuscula: true,
                exigirNumero: true,
                exigirEspecial: true,
                historicoSenhas: 5
            },
            
            // Configurações de token
            token: {
                tempoExpiracao: '24h',
                tempoRefresh: '7d',
                algoritmo: 'HS256'
            },
            
            // Rate limiting
            rateLimiting: {
                login: { tentativas: 5, janela: 15 * 60 * 1000 }, // 5 tentativas em 15min
                registro: { tentativas: 3, janela: 60 * 60 * 1000 }, // 3 tentativas em 1h
                geral: { tentativas: 100, janela: 15 * 60 * 1000 } // 100 req em 15min
            },
            
            // Detecção de anomalias
            anomalias: {
                ativo: true,
                limiteRisco: 0.7,
                bloquearCritico: true
            },
            
            // Proteção CSRF
            csrf: {
                ativo: true,
                tempoExpiracao: 30 * 60 * 1000 // 30 minutos
            },
            
            // Honeypot
            honeypot: {
                ativo: true,
                camposObrigatorios: ['email_confirmacao', 'website', 'numero_telefone']
            },
            
            // Logging
            logging: {
                nivel: 'info',
                arquivarLogs: true,
                retencaoDias: 90
            }
        };
        
        this.aplicarNivelSeguranca();
    }

    aplicarNivelSeguranca() {
        const nivel = this.configuracoes.nivelSeguranca;
        
        switch (nivel) {
            case 'baixo':
                this.configuracoes.senha.tamanhoMinimo = 6;
                this.configuracoes.senha.exigirEspecial = false;
                this.configuracoes.rateLimiting.login.tentativas = 10;
                this.configuracoes.anomalias.ativo = false;
                this.configuracoes.csrf.ativo = false;
                break;
                
            case 'medio':
                // Configurações padrão já aplicadas
                break;
                
            case 'alto':
                this.configuracoes.senha.tamanhoMinimo = 12;
                this.configuracoes.senha.historicoSenhas = 10;
                this.configuracoes.token.tempoExpiracao = '8h';
                this.configuracoes.rateLimiting.login.tentativas = 3;
                this.configuracoes.anomalias.limiteRisco = 0.5;
                break;
                
            case 'critico':
                this.configuracoes.senha.tamanhoMinimo = 16;
                this.configuracoes.senha.historicoSenhas = 20;
                this.configuracoes.token.tempoExpiracao = '4h';
                this.configuracoes.token.tempoRefresh = '24h';
                this.configuracoes.rateLimiting.login.tentativas = 2;
                this.configuracoes.anomalias.limiteRisco = 0.3;
                this.configuracoes.logging.nivel = 'debug';
                break;
        }
    }

    obter(caminho) {
        const partes = caminho.split('.');
        let valor = this.configuracoes;
        
        for (const parte of partes) {
            if (valor && typeof valor === 'object' && parte in valor) {
                valor = valor[parte];
            } else {
                return undefined;
            }
        }
        
        return valor;
    }

    definir(caminho, valor) {
        const partes = caminho.split('.');
        const ultimaChave = partes.pop();
        let objeto = this.configuracoes;
        
        for (const parte of partes) {
            if (!(parte in objeto)) {
                objeto[parte] = {};
            }
            objeto = objeto[parte];
        }
        
        objeto[ultimaChave] = valor;
    }

    // Configurações específicas para desenvolvimento
    modoDevelopment() {
        this.configuracoes.nivelSeguranca = 'baixo';
        this.configuracoes.logging.nivel = 'debug';
        this.configuracoes.csrf.ativo = false;
        this.configuracoes.honeypot.ativo = false;
        this.aplicarNivelSeguranca();
    }

    // Configurações para produção
    modoProducao() {
        this.configuracoes.nivelSeguranca = 'alto';
        this.configuracoes.logging.nivel = 'warn';
        this.aplicarNivelSeguranca();
        
        // CRÍTICO: Validar segurança em produção
        this.validarSegurancaProducao();
    }
    
    // Validar configurações de segurança para produção
    validarSegurancaProducao() {
        const errosSeguranca = [];
        
        // Verificar se chave secreta foi definida manualmente
        if (!process.env.CHAVE_SECRETA) {
            errosSeguranca.push('CHAVE_SECRETA deve ser definida em produção');
        }
        
        // Verificar se banco de dados foi configurado
        if (!process.env.DB_HOST && !process.env.DATABASE_URL) {
            errosSeguranca.push('Banco de dados deve ser configurado em produção (DB_HOST ou DATABASE_URL)');
        }
        
        // Verificar configurações mínimas de segurança
        if (process.env.NIVEL_SEGURANCA === 'baixo') {
            errosSeguranca.push('Nível de segurança "baixo" não é permitido em produção');
        }
        
        if (errosSeguranca.length > 0) {
            console.error('\n🚨 ERRO DE SEGURANÇA EM PRODUÇÃO:');
            errosSeguranca.forEach(erro => console.error(`❌ ${erro}`));
            console.error('\n📋 Para corrigir, crie um arquivo .env com:');
            console.error('CHAVE_SECRETA=sua-chave-super-secreta-de-64-caracteres-aqui');
            console.error('DB_HOST=seu-servidor-banco');
            console.error('NIVEL_SEGURANCA=alto');
            console.error('\n🔒 A API não iniciará até que essas configurações sejam definidas.\n');
            
            process.exit(1);
        }
    }

    // Validar configurações
    validar() {
        const erros = [];
        
        if (!['baixo', 'medio', 'alto', 'critico'].includes(this.configuracoes.nivelSeguranca)) {
            erros.push('Nível de segurança inválido');
        }
        
        if (this.configuracoes.senha.tamanhoMinimo < 4) {
            erros.push('Tamanho mínimo de senha muito baixo');
        }
        
        if (this.configuracoes.rateLimiting.login.tentativas < 1) {
            erros.push('Número de tentativas de login deve ser maior que 0');
        }
        
        return {
            valido: erros.length === 0,
            erros
        };
    }

    // Gerar chave secreta segura
    gerarChaveSecreta() {
        const crypto = require('crypto');
        const chave = crypto.randomBytes(64).toString('hex');
        
        // Avisar sobre chave temporária em desenvolvimento
        if (process.env.NODE_ENV !== 'production') {
            console.log('\n⚠️  AVISO: Usando chave secreta temporária para desenvolvimento');
            console.log('🔑 Para produção, defina CHAVE_SECRETA no .env');
            console.log(`💡 Sugestão: CHAVE_SECRETA=${chave}\n`);
        }
        
        return chave;
    }
    
    // Exportar configurações para uso
    exportar() {
        return JSON.parse(JSON.stringify(this.configuracoes));
    }
    
    // Obter configurações do servidor
    obterServidor() {
        return {
            porta: this.configuracoes.servidor.porta,
            host: this.configuracoes.servidor.host
        };
    }
    
    // Obter chave secreta
    obterChaveSecreta() {
        return this.configuracoes.chaveSecreta;
    }
}

// Instância global
const configuracao = new ConfiguracaoSeguranca();

// Aplicar configurações baseadas no ambiente
if (process.env.NODE_ENV === 'development') {
    configuracao.modoDevelopment();
} else if (process.env.NODE_ENV === 'production') {
    configuracao.modoProducao();
}

module.exports = configuracao;