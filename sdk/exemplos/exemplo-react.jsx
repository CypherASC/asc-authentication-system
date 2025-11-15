/**
 * Exemplo React - ASC SDK
 * 
 * @copyright 2025 AsyncCypher
 */

import React, { useState, useEffect } from 'react';
import { ASCSDK } from '@asynccypher/asc-sdk';

// Hook personalizado
const useASC = () => {
  const [asc] = useState(() => new ASCSDK({
    baseURL: process.env.REACT_APP_API_URL
  }));
  
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const login = async (email, senha) => {
    setCarregando(true);
    try {
      const sessao = await asc.login(email, senha);
      setUsuario(sessao.usuario);
      return sessao;
    } finally {
      setCarregando(false);
    }
  };

  const logout = async () => {
    await asc.logout();
    setUsuario(null);
  };

  return { asc, usuario, login, logout, carregando };
};

// Componente de Login
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login, carregando } = useASC();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, senha);
      alert('Login realizado com sucesso!');
    } catch (error) {
      alert('Erro no login: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
      </div>
      <div>
        <label>Senha:</label>
        <input 
          type="password" 
          value={senha} 
          onChange={(e) => setSenha(e.target.value)}
          required 
        />
      </div>
      <button type="submit" disabled={carregando}>
        {carregando ? 'Entrando...' : 'Login'}
      </button>
    </form>
  );
};

// Componente principal
const App = () => {
  const { usuario, logout } = useASC();

  return (
    <div>
      <h1>ASC SDK - Exemplo React</h1>
      
      {usuario ? (
        <div>
          <h2>Bem-vindo, {usuario.nome}!</h2>
          <p>Email: {usuario.email}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  );
};

export default App;