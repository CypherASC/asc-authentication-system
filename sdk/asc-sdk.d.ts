/**
 * Definições de tipos TypeScript para ASC SDK
 * 
 * @copyright 2025 AsyncCypher
 */

export interface ConfiguracaoSDK {
  baseURL?: string;
  apiKey?: string;
  timeout?: number;
  token?: string;
}

export interface DadosUsuario {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  configuracoes?: {
    tema?: 'claro' | 'escuro';
    idioma?: 'pt-BR' | 'en-US' | 'es-ES';
    notificacoes?: boolean;
  };
}

export interface DadosLogin {
  email: string;
  senha: string;
  localizacao?: {
    lat?: number;
    lon?: number;
    cidade?: string;
    pais?: string;
  };
  resolucaoTela?: string;
  fusoHorario?: string;
  fingerprintCanvas?: string;
  fingerprintWebgl?: string;
}

export interface RespostaSessao {
  usuario: UsuarioASC;
  token: string;
  refreshToken: string;
  sessao: string;
  analiseSeguranca: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confiancaDispositivo: number;
  };
}

export interface EstatisticasSessao {
  totalSessoes: number;
  sessoesAtivas: number;
  sessoesExpiradas: number;
  ultimoLogin: Date | null;
  dispositivosUnicos: number;
  ipsUnicos: number;
}

export interface CamposHoneypot {
  fields: Array<{
    name: string;
    type: string;
    value: string;
    autocomplete: string;
    tabindex: string;
    style: string;
  }>;
  timestamp: number;
}

export class ASCError extends Error {
  codigo: number;
  dados: any;
  
  constructor(mensagem: string, codigo?: number, dados?: any);
}

export class UsuarioASC {
  id: string;
  email: string;
  nome: string;
  telefone?: string;
  criadoEm: Date;
  atualizadoEm: Date;
  ativo: boolean;
  verificado: boolean;
  
  constructor(dados: any, sdk: ASCSDK);
  
  atualizar(atualizacoes: Partial<DadosUsuario>): Promise<UsuarioASC>;
  alterarSenha(senhaAtual: string, novaSenha: string): Promise<boolean>;
  obterSessoes(): Promise<SessaoASC[]>;
}

export class SessaoASC {
  id: string;
  idUsuario: string;
  ip: string;
  userAgent: string;
  criadaEm: Date;
  atualizadaEm: Date;
  expiresEm: Date;
  ativa: boolean;
  token?: string;
  refreshToken?: string;
  
  constructor(dados: any, sdk: ASCSDK);
  
  encerrar(): Promise<boolean>;
  renovar(): Promise<any>;
  obterEstatisticas(): Promise<EstatisticasSessao>;
}

export class ASCSDK {
  baseURL: string;
  apiKey: string | null;
  timeout: number;
  token: string | null;
  
  constructor(configuracao?: ConfiguracaoSDK);
  
  // Autenticação
  registrar(dadosUsuario: DadosUsuario): Promise<UsuarioASC>;
  login(email: string, senha: string, opcoes?: Partial<DadosLogin>): Promise<SessaoASC>;
  logout(): Promise<boolean>;
  renovarToken(refreshToken: string): Promise<any>;
  
  // Usuário
  obterPerfil(): Promise<UsuarioASC>;
  atualizarPerfil(atualizacoes: Partial<DadosUsuario>): Promise<UsuarioASC>;
  alterarSenha(senhaAtual: string, novaSenha: string): Promise<boolean>;
  
  // Sessão
  obterSessoes(): Promise<SessaoASC[]>;
  encerrarSessao(idSessao: string): Promise<boolean>;
  obterEstatisticasSessao(): Promise<EstatisticasSessao>;
  
  // Segurança
  obterCamposHoneypot(): Promise<CamposHoneypot>;
  
  // Utilitários
  definirToken(token: string): void;
  obterToken(): string | null;
  adicionarInterceptadorRequisicao(interceptador: (config: any) => any): void;
  adicionarInterceptadorResposta(interceptador: (dados: any, resposta: Response) => void): void;
  
  // Método base
  requisicao(endpoint: string, opcoes?: RequestInit): Promise<any>;
}