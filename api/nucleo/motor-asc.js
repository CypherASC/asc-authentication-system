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
    this.algoritmo = process.env.JWT_ALGORITMO || 'HS256';
    this.tempoExpiracaoToken = process.env.TEMPO_EXPIRACAO_TOKEN || '24h';
    this.tempoExpiracaoRefresh = process.env.TEMPO_EXPIRACAO_REFRESH || '7d';
    this.issuer = process.env.JWT_ISSUER || 'ASC-System';
    this.audience = process.env.JWT_AUDIENCE || 'ASC-Client';
    this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  }

  gerarChaveSecreta() {
    return crypto.randomBytes(64).toString('hex');
  }

  async criptografarSenha(senha) {
    try {
      if (!senha || typeof senha !== 'string') {
        throw new Error('Senha inválida');
      }
      const salt = await bcrypt.genSalt(this.saltRounds);
      return await bcrypt.hash(senha, salt);
    } catch (error) {
      throw new Error('Erro ao criptografar senha: ' + error.message);
    }
  }

  async verificarSenha(senha, hash) {
    try {
      if (!senha || !hash) {
        return false;
      }
      return await bcrypt.compare(senha, hash);
    } catch (error) {
      return false;
    }
  }

  gerarToken(payload) {
    try {
      if (!payload || typeof payload !== 'object') {
        throw new Error('Payload inválido');
      }
      return jwt.sign(payload, this.chaveSecreta, {
        algorithm: this.algoritmo,
        expiresIn: this.tempoExpiracaoToken,
        issuer: this.issuer,
        audience: this.audience
      });
    } catch (error) {
      throw new Error('Erro ao gerar token: ' + error.message);
    }
  }

  gerarRefreshToken(payload) {
    try {
      if (!payload || typeof payload !== 'object') {
        throw new Error('Payload inválido');
      }
      return jwt.sign(payload, this.chaveSecreta, {
        algorithm: this.algoritmo,
        expiresIn: this.tempoExpiracaoRefresh,
        issuer: this.issuer,
        audience: process.env.JWT_REFRESH_AUDIENCE || 'ASC-Refresh'
      });
    } catch (error) {
      throw new Error('Erro ao gerar refresh token: ' + error.message);
    }
  }

  verificarToken(token) {
    try {
      return jwt.verify(token, this.chaveSecreta, {
        algorithms: [this.algoritmo],
        issuer: this.issuer,
        audience: this.audience
      });
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  verificarRefreshToken(token) {
    try {
      return jwt.verify(token, this.chaveSecreta, {
        algorithms: [this.algoritmo],
        issuer: this.issuer,
        audience: process.env.JWT_REFRESH_AUDIENCE || 'ASC-Refresh'
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
    try {
      if (!dados || !chave) {
        throw new Error('Dados ou chave inválidos');
      }
      const iv = crypto.randomBytes(16);
      const algoritmo = process.env.CRYPTO_ALGORITMO || 'aes-256-cbc';
      const salt = process.env.CRYPTO_SALT || 'salt';
      const cipher = crypto.createCipheriv(algoritmo, crypto.scryptSync(chave, salt, 32), iv);
      let encrypted = cipher.update(JSON.stringify(dados), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      throw new Error('Erro ao criptografar dados: ' + error.message);
    }
  }

  descriptografarDados(dadosCriptografados, chave) {
    try {
      if (!dadosCriptografados || !chave) {
        throw new Error('Dados criptografados ou chave inválidos');
      }
      const partes = dadosCriptografados.split(':');
      if (partes.length !== 2) {
        throw new Error('Formato de dados inválido');
      }
      const iv = Buffer.from(partes[0], 'hex');
      const encrypted = partes[1];
      const algoritmo = process.env.CRYPTO_ALGORITMO || 'aes-256-cbc';
      const salt = process.env.CRYPTO_SALT || 'salt';
      const decipher = crypto.createDecipheriv(algoritmo, crypto.scryptSync(chave, salt, 32), iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error('Erro ao descriptografar dados: ' + error.message);
    }
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
    const tamanhoMinimo = parseInt(process.env.SENHA_TAMANHO_MINIMO) || 8;
    const exigirMaiuscula = process.env.SENHA_EXIGIR_MAIUSCULA !== 'false';
    const exigirMinuscula = process.env.SENHA_EXIGIR_MINUSCULA !== 'false';
    const exigirNumero = process.env.SENHA_EXIGIR_NUMERO !== 'false';
    const exigirEspecial = process.env.SENHA_EXIGIR_ESPECIAL !== 'false';
    const caracteresEspeciais = process.env.SENHA_CARACTERES_ESPECIAIS || '!@#$%^&*(),.?":{}|<>';
    
    const criterios = {
      tamanhoMinimo: senha.length >= tamanhoMinimo,
      maiuscula: !exigirMaiuscula || /[A-Z]/.test(senha),
      minuscula: !exigirMinuscula || /[a-z]/.test(senha),
      numero: !exigirNumero || /\d/.test(senha),
      caracterEspecial: !exigirEspecial || new RegExp(`[${caracteresEspeciais.replace(/[\-\[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`).test(senha)
    };

    const pontuacao = Object.values(criterios).filter(Boolean).length;
    const pontuacaoMinima = parseInt(process.env.SENHA_PONTUACAO_MINIMA) || 4;
    
    return {
      valida: pontuacao >= pontuacaoMinima,
      pontuacao,
      criterios
    };
  }
}

module.exports = new MotorASC();