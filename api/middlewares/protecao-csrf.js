const crypto = require('crypto');

class ProtecaoCSRF {
    constructor() {
        this.tokens = new Map();
        this.tempoExpiracao = 30 * 60 * 1000; // 30 minutos
    }

    gerarToken(req) {
        const token = crypto.randomBytes(32).toString('hex');
        const chave = req.ip + (req.headers['user-agent'] || '');
        
        this.tokens.set(chave, {
            token,
            expira: Date.now() + this.tempoExpiracao
        });

        this.limparTokensExpirados();
        return token;
    }

    validarToken(req, tokenRecebido) {
        const chave = req.ip + (req.headers['user-agent'] || '');
        const dadosToken = this.tokens.get(chave);

        if (!dadosToken || Date.now() > dadosToken.expira) {
            return false;
        }

        return dadosToken.token === tokenRecebido;
    }

    limparTokensExpirados() {
        const agora = Date.now();
        for (const [chave, dados] of this.tokens.entries()) {
            if (agora > dados.expira) {
                this.tokens.delete(chave);
            }
        }
    }

    middleware() {
        return (req, res, next) => {
            if (req.method === 'GET') {
                req.csrfToken = this.gerarToken(req);
                return next();
            }

            const token = req.headers['x-csrf-token'] || req.body.csrfToken;
            
            if (!this.validarToken(req, token)) {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: 'Token CSRF inválido'
                });
            }

            next();
        };
    }
}

module.exports = new ProtecaoCSRF();