/**
 * Integração React - ASC
 * 
 * @copyright 2025 AsyncCypher
 */

import React, { useState, useContext, createContext } from 'react';

// Context de Autenticação
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = async (email, senha) => {
    const res = await fetch('/api/autenticacao/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    
    const dados = await res.json();
    if (dados.sucesso) {
      setToken(dados.dados.token);
      setUsuario(dados.dados.usuario);
      localStorage.setItem('token', dados.dados.token);
    }
    return dados;
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
export const useAuth = () => useContext(AuthContext);

// Componente de Login
export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, senha);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email" 
      />
      <input 
        type="password" 
        value={senha} 
        onChange={(e) => setSenha(e.target.value)}
        placeholder="Senha" 
      />
      <button type="submit">Login</button>
    </form>
  );
};

// Hook para chamadas autenticadas
export const useAPI = () => {
  const { token } = useAuth();

  const chamar = async (endpoint, opcoes = {}) => {
    return fetch(endpoint, {
      ...opcoes,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...opcoes.headers
      }
    }).then(res => res.json());
  };

  return { chamar };
};