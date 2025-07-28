import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ibvaLogo from '../assets/images/ibva-logo.png';
import './Login.css';

export default function Login() {
  const { login, loading: loadingAuth, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
    } catch (err) {
      setError(err.message || 'E-mail ou senha inválidos');
    }

    setLoading(false);
  };

  if (loadingAuth) {
    return (
      <div className="login-bg">
        <div className="login-loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="login-bg">
      <div
        className="login-watermark"
        style={{ backgroundImage: `url(${ibvaLogo})` }}
      ></div>
      <div className="login-card">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-content">
            <h2>Login</h2>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && <div className="error">{error}</div>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary login-submit-btn"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}