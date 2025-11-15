/**
 * Sistema de fingerprinting de dispositivos
 * Identifica dispositivos mesmo sem cookies
 * 
 * @copyright 2025 AsyncCypher
 */

const crypto = require('crypto');

class FingerprintDispositivo {
  gerar(req) {
    const componentes = {
      userAgent: req.headers['user-agent'] || '',
      idiomaAceito: req.headers['accept-language'] || '',
      codificacaoAceita: req.headers['accept-encoding'] || '',
      aceitar: req.headers['accept'] || '',
      plataforma: this.extrairPlataforma(req),
      resolucaoTela: req.body.resolucaoTela || '',
      fusoHorario: req.body.fusoHorario || '',
      canvas: req.body.fingerprintCanvas || '',
      webgl: req.body.fingerprintWebgl || '',
      fontes: req.body.fontes || [],
      plugins: req.body.plugins || [],
      naoRastrear: req.headers['dnt'] || '',
      cookieHabilitado: req.body.cookieHabilitado || true,
      localStorage: req.body.localStorage || true,
      sessionStorage: req.body.sessionStorage || true,
      indexedDB: req.body.indexedDB || true,
      classeProcessador: req.body.classeProcessador || '',
      concorrenciaHardware: req.body.concorrenciaHardware || 0,
      memoriaDispositivo: req.body.memoriaDispositivo || 0,
      profundidadeCor: req.body.profundidadeCor || 0,
      razaoPixel: req.body.razaoPixel || 0,
      suporteToque: req.body.suporteToque || false,
      contextoAudio: req.body.fingerprintAudio || '',
      bateria: req.body.nivelBateria || null
    };

    const fingerprint = this.criarHash(componentes);

    return {
      fingerprint,
      componentes,
      confidence: this.calcularConfianca(componentes),
      timestamp: Date.now()
    };
  }

  criarHash(componentes) {
    const normalizado = JSON.stringify(componentes, Object.keys(componentes).sort());
    return crypto.createHash('sha256').update(normalizado).digest('hex');
  }

  calcularConfianca(componentes) {
    let pontuacao = 0;
    let pontuacaoMaxima = 0;

    const componentesBasicos = ['userAgent', 'idiomaAceito', 'fusoHorario'];
    componentesBasicos.forEach(chave => {
      pontuacaoMaxima += 1;
      if (componentes[chave]) pontuacao += 1;
    });

    const componentesAvancados = ['canvas', 'webgl', 'contextoAudio'];
    componentesAvancados.forEach(chave => {
      pontuacaoMaxima += 2;
      if (componentes[chave]) pontuacao += 2;
    });

    const componentesHardware = ['concorrenciaHardware', 'memoriaDispositivo', 'profundidadeCor'];
    componentesHardware.forEach(chave => {
      pontuacaoMaxima += 3;
      if (componentes[chave]) pontuacao += 3;
    });

    return pontuacaoMaxima > 0 ? Math.round((pontuacao / pontuacaoMaxima) * 100) : 0;
  }

  extrairPlataforma(req) {
    const userAgent = req.headers['user-agent'] || '';
    
    if (/Windows/.test(userAgent)) return 'Windows';
    if (/Mac OS/.test(userAgent)) return 'macOS';
    if (/Linux/.test(userAgent)) return 'Linux';
    if (/Android/.test(userAgent)) return 'Android';
    if (/iPhone|iPad/.test(userAgent)) return 'iOS';
    
    return 'Desconhecido';
  }

  compararFingerprints(fp1, fp2) {
    if (fp1 === fp2) return 100;

    // Comparação por componentes para similaridade parcial
    const comp1 = JSON.parse(fp1);
    const comp2 = JSON.parse(fp2);
    
    let componentesIguais = 0;
    let totalComponentes = 0;

    for (const chave in comp1) {
      totalComponentes++;
      if (comp1[chave] === comp2[chave]) {
        componentesIguais++;
      }
    }

    return Math.round((componentesIguais / totalComponentes) * 100);
  }

  detectarBot(componentes) {
    const padroesBot = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python-requests/i,
      /headless/i
    ];

    const userAgent = componentes.userAgent || '';
    return padroesBot.some(padrao => padrao.test(userAgent));
  }

  analisarRisco(componentes) {
    let nivelRisco = 'LOW';
    const fatoresRisco = [];

    if (this.detectarBot(componentes)) {
      nivelRisco = 'HIGH';
      fatoresRisco.push('User-Agent suspeito');
    }

    if (!componentes.canvas || !componentes.webgl) {
      nivelRisco = 'MEDIUM';
      fatoresRisco.push('Fingerprinting limitado');
    }

    if (componentes.plugins.length === 0) {
      fatoresRisco.push('Nenhum plugin detectado');
    }

    if (!componentes.cookieHabilitado) {
      fatoresRisco.push('Cookies desabilitados');
    }

    return {
      nivelRisco,
      fatoresRisco,
      pontuacaoRisco: this.calcularPontuacaoRisco(fatoresRisco)
    };
  }

  calcularPontuacaoRisco(fatores) {
    return Math.min(fatores.length * 25, 100);
  }
}

module.exports = new FingerprintDispositivo();