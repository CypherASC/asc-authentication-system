/**
 * Sistema Honeypot para detectar e bloquear bots
 * Usa campos invisíveis que humanos não preenchem
 * 
 * @copyright 2025 AsyncCypher
 */

class SistemaHoneypot {
  constructor() {
    this.ipsCapturados = new Set();
    this.atividadesSuspeitas = new Map();
  }

  gerarCamposHoneypot() {
    return {
      fields: [
        {
          name: 'email_confirmacao',
          type: 'text',
          value: '',
          autocomplete: 'off',
          tabindex: '-1',
          style: 'position: absolute; left: -9999px;'
        },
        {
          name: 'website',
          type: 'url',
          value: '',
          autocomplete: 'off',
          tabindex: '-1',
          style: 'display: none;'
        },
        {
          name: 'numero_telefone',
          type: 'tel',
          value: '',
          autocomplete: 'off',
          tabindex: '-1',
          style: 'opacity: 0; position: absolute;'
        }
      ],
      timestamp: Date.now()
    };
  }

  validarSubmissao(dados, ip) {
    const violacoes = [];

    if (dados.email_confirmacao || dados.website || dados.numero_telefone) {
      violacoes.push({
        type: 'HONEYPOT_PREENCHIDO',
        severity: 'HIGH',
        description: 'Campos honeypot foram preenchidos'
      });
    }

    const tempoPreenchimento = Date.now() - parseInt(dados.timestamp || 0);
    if (tempoPreenchimento < 2000) {
      violacoes.push({
        type: 'MUITO_RAPIDO',
        severity: 'MEDIUM',
        description: `Formulário preenchido em ${tempoPreenchimento}ms`,
        tempoPreenchimento
      });
    }

    if (this.padraoSequencial(dados)) {
      violacoes.push({
        type: 'PADRAO_SEQUENCIAL',
        severity: 'MEDIUM',
        description: 'Padrão de preenchimento automático detectado'
      });
    }

    if (this.ipsCapturados.has(ip)) {
      violacoes.push({
        type: 'BOT_CONHECIDO',
        severity: 'CRITICAL',
        description: 'IP previamente identificado como bot'
      });
    }

    if (violacoes.length > 0) {
      this.marcarIPSuspeito(ip, violacoes);
    }

    return {
      isBot: violacoes.length > 0,
      violations: violacoes,
      trustScore: this.calcularPontuacaoConfianca(violacoes)
    };
  }

  padraoSequencial(dados) {
    const campos = Object.keys(dados);
    const ordemPreenchimento = campos.filter(f => dados[f] !== '');
    return ordemPreenchimento.length === campos.length;
  }

  marcarIPSuspeito(ip, violacoes) {
    if (!this.atividadesSuspeitas.has(ip)) {
      this.atividadesSuspeitas.set(ip, []);
    }

    this.atividadesSuspeitas.get(ip).push({
      timestamp: Date.now(),
      violacoes
    });

    const atividades = this.atividadesSuspeitas.get(ip);
    if (atividades.length >= 3) {
      this.ipsCapturados.add(ip);
    }
  }

  calcularPontuacaoConfianca(violacoes) {
    if (violacoes.length === 0) return 100;

    let pontuacao = 100;

    violacoes.forEach(v => {
      switch (v.severity) {
        case 'LOW':
          pontuacao -= 10;
          break;
        case 'MEDIUM':
          pontuacao -= 25;
          break;
        case 'HIGH':
          pontuacao -= 50;
          break;
        case 'CRITICAL':
          pontuacao -= 100;
          break;
      }
    });

    return Math.max(pontuacao, 0);
  }

  ipCapturado(ip) {
    return this.ipsCapturados.has(ip);
  }

  liberarIP(ip) {
    this.ipsCapturados.delete(ip);
    this.atividadesSuspeitas.delete(ip);
  }

  obterEstatisticas() {
    return {
      ipsCapturados: this.ipsCapturados.size,
      ipsSuspeitos: this.atividadesSuspeitas.size,
      totalViolacoes: Array.from(this.atividadesSuspeitas.values())
        .reduce((soma, ativs) => soma + ativs.length, 0)
    };
  }
}

module.exports = new SistemaHoneypot();