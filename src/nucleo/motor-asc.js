/**
 * ASC Motor Principal
 * Núcleo imutável do sistema de autenticação
 * 
 * @copyright 2025 AsyncCypher
 * @license CC-BY-NC-ND-4.0
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class MotorASC {
  constructor() {
    this.chaveSecreta = process.env.CHAVE_SECRETA || this.gerarChaveSecreta();
    this.algoritmo = 'HS256';
    this.tempoExpiracaoToken = '24h';
    this.tempoExpiracaoRefresh = '7d';
  }

  gerarChaveSecreta() {
    return crypto.randomBytes(64).toString('hex');
  }

  async criptografarSenha(senha) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(senha, salt);
  }

  async verificarSenha(senha, hash) {
    return bcrypt.compare(senha, hash);
  }

  gerarToken(payload) {
    return jwt.sign(payload, this.chaveSecreta, {
      algorithm: this.algoritmo,
      expiresIn: this.tempoExpiracaoToken,
      issuer: 'ASC-System',
      audience: 'ASC-Client'
    });
  }

  gerarRefreshToken(payload) {
    return jwt.sign(payload, this.chaveSecreta, {
      algorithm: this.algoritmo,
      expiresIn: this.tempoExpiracaoRefresh,
      issuer: 'ASC-System',
      audience: 'ASC-Refresh'
    });
  }

  verificarToken(token) {
    try {
      return jwt.verify(token, this.chaveSecreta, {
        algorithms: [this.algoritmo],
        issuer: 'ASC-System',
        audience: 'ASC-Client'
      });
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  verificarRefreshToken(token) {
    try {
      return jwt.verify(token, this.chaveSecreta, {
        algorithms: [this.algoritmo],
        issuer: 'ASC-System',
        audience: 'ASC-Refresh'
      });
    } catch (error) {
      throw new Error('Refresh token inválido');
    }
  }

  gerarIdSessao() {
    return crypto.randomUUID();
  }

  gerarSalt() {
    return crypto.randomBytes(32).toString('hex');
  }

  criptografarDados(dados, chave) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', chave);
    let encrypted = cipher.update(JSON.stringify(dados), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  descriptografarDados(dadosCriptografados, chave) {
    const partes = dadosCriptografados.split(':');
    const iv = Buffer.from(partes[0], 'hex');
    const encrypted = partes[1];
    const decipher = crypto.createDecipher('aes-256-cbc', chave);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  }

  gerarFingerprint(dadosDispositivo) {
    const componentes = {
      userAgent: dadosDispositivo.userAgent || '',
      idioma: dadosDispositivo.idioma || '',
      fusoHorario: dadosDispositivo.fusoHorario || '',
      resolucaoTela: dadosDispositivo.resolucaoTela || '',
      plataforma: dadosDispositivo.plataforma || ''
    };

    const normalizado = JSON.stringify(componentes, Object.keys(componentes).sort());
    return crypto.createHash('sha256').update(normalizado).digest('hex');
  }

  validarComplexidadeSenha(senha) {
    const criterios = {
      tamanhoMinimo: senha.length >= 8,
      maiuscula: /[A-Z]/.test(senha),
      minuscula: /[a-z]/.test(senha),
      numero: /\d/.test(senha),
      caracterEspecial: /[!@#$%^&*(),.?":{}|<>]/.test(senha)
    };

    const pontuacao = Object.values(criterios).filter(Boolean).length;
    
    return {
      valida: pontuacao >= 4,
      pontuacao,
      criterios
    };
  }
}

module.exports = new MotorASC();