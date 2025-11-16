/**
 * Sistema de detecção de anomalias baseado em ML
 * Detecta comportamentos suspeitos em tempo real
 * 
 * @copyright 2025 AsyncCypher
 */

class DetectorAnomalias {
  constructor() {
    this.perfisComportamentais = new Map();
    this.limiteAnomalias = 0.7;
  }

  async analisarTentativaLogin(idUsuario, dadosLogin) {
    const perfil = this.obterPerfilUsuario(idUsuario);
    const pontuacaoAnomalias = this.calcularPontuacaoAnomalias(perfil, dadosLogin);

    const analise = {
      isAnomalous: pontuacaoAnomalias > this.limiteAnomalias,
      anomalyScore: pontuacaoAnomalias,
      reasons: [],
      riskLevel: this.obterNivelRisco(pontuacaoAnomalias)
    };

    if (this.localizacaoIncomum(perfil, dadosLogin.localizacao)) {
      analise.reasons.push({
        type: 'LOCALIZACAO_INCOMUM',
        description: 'Login de localização não usual',
        confidence: 0.85
      });
    }

    if (this.horarioIncomum(perfil, dadosLogin.timestamp)) {
      analise.reasons.push({
        type: 'HORARIO_INCOMUM',
        description: 'Login em horário atípico',
        confidence: 0.75
      });
    }

    if (this.dispositivoNovo(perfil, dadosLogin.fingerprint)) {
      analise.reasons.push({
        type: 'DISPOSITIVO_NOVO',
        description: 'Dispositivo não reconhecido',
        confidence: 0.90
      });
    }

    if (this.viagemImpossivel(perfil, dadosLogin)) {
      analise.reasons.push({
        type: 'VIAGEM_IMPOSSIVEL',
        description: 'Viagem geograficamente impossível',
        confidence: 0.95
      });
    }

    if (!analise.isAnomalous) {
      this.atualizarPerfilUsuario(idUsuario, dadosLogin);
    }

    return analise;
  }

  calcularPontuacaoAnomalias(perfil, dadosLogin) {
    if (!perfil || perfil.contadorLogins < 5) {
      return 0.3;
    }

    let pontuacao = 0;
    let fatores = 0;

    const pontuacaoDistancia = this.calcularDesvioLocalizacao(perfil, dadosLogin.localizacao);
    pontuacao += pontuacaoDistancia;
    fatores++;

    const pontuacaoTempo = this.calcularDesvioTempo(perfil, dadosLogin.timestamp);
    pontuacao += pontuacaoTempo;
    fatores++;

    if (this.dispositivoNovo(perfil, dadosLogin.fingerprint)) {
      pontuacao += 0.8;
      fatores++;
    }

    if (!perfil.userAgents.includes(dadosLogin.userAgent)) {
      pontuacao += 0.6;
      fatores++;
    }

    return fatores > 0 ? pontuacao / fatores : 0;
  }

  viagemImpossivel(perfil, dadosLogin) {
    const ultimoLogin = perfil.ultimoLogin;
    if (!ultimoLogin || !ultimoLogin.localizacao) return false;

    const distancia = this.calcularDistancia(
      ultimoLogin.localizacao,
      dadosLogin.localizacao
    );

    const diferencaTempo = (dadosLogin.timestamp - ultimoLogin.timestamp) / 1000 / 3600;
    const velocidade = distancia / diferencaTempo;

    return velocidade > 1000;
  }

  calcularDistancia(loc1, loc2) {
    const R = 6371;
    const dLat = this.paraRad(loc2.lat - loc1.lat);
    const dLon = this.paraRad(loc2.lon - loc1.lon);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.paraRad(loc1.lat)) *
        Math.cos(this.paraRad(loc2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  paraRad(graus) {
    return graus * (Math.PI / 180);
  }

  obterPerfilUsuario(idUsuario) {
    return this.perfisComportamentais.get(idUsuario) || {
      contadorLogins: 0,
      localizacoes: [],
      horariosTypicos: [],
      dispositivos: [],
      userAgents: [],
      ultimoLogin: null
    };
  }

  atualizarPerfilUsuario(idUsuario, dadosLogin) {
    const perfil = this.obterPerfilUsuario(idUsuario);

    perfil.contadorLogins++;
    perfil.ultimoLogin = {
      timestamp: dadosLogin.timestamp,
      localizacao: dadosLogin.localizacao,
      fingerprint: dadosLogin.fingerprint
    };

    if (perfil.localizacoes.length >= 10) {
      perfil.localizacoes.shift();
    }
    perfil.localizacoes.push(dadosLogin.localizacao);

    const hora = new Date(dadosLogin.timestamp).getHours();
    perfil.horariosTypicos.push(hora);

    if (!perfil.dispositivos.includes(dadosLogin.fingerprint)) {
      perfil.dispositivos.push(dadosLogin.fingerprint);
    }

    if (!perfil.userAgents.includes(dadosLogin.userAgent)) {
      perfil.userAgents.push(dadosLogin.userAgent);
    }

    this.perfisComportamentais.set(idUsuario, perfil);
  }

  obterNivelRisco(pontuacao) {
    if (pontuacao < 0.3) return 'LOW';
    if (pontuacao < 0.6) return 'MEDIUM';
    if (pontuacao < 0.8) return 'HIGH';
    return 'CRITICAL';
  }

  calcularDesvioLocalizacao(perfil, localizacao) {
    if (perfil.localizacoes.length === 0) return 0;

    const distanciaMedia =
      perfil.localizacoes.reduce((soma, loc) => {
        return soma + this.calcularDistancia(loc, localizacao);
      }, 0) / perfil.localizacoes.length;

    return Math.min(distanciaMedia / 500, 1);
  }

  calcularDesvioTempo(perfil, timestamp) {
    if (perfil.horariosTypicos.length === 0) return 0;

    const hora = new Date(timestamp).getHours();
    const horaMedia =
      perfil.horariosTypicos.reduce((soma, h) => soma + h, 0) /
      perfil.horariosTypicos.length;

    const diferenca = Math.abs(hora - horaMedia);
    return Math.min(diferenca / 6, 1);
  }

  localizacaoIncomum(perfil, localizacao) {
    return this.calcularDesvioLocalizacao(perfil, localizacao) > 0.7;
  }

  horarioIncomum(perfil, timestamp) {
    return this.calcularDesvioTempo(perfil, timestamp) > 0.7;
  }

  dispositivoNovo(perfil, fingerprint) {
    return !perfil.dispositivos.includes(fingerprint);
  }
}

module.exports = new DetectorAnomalias();