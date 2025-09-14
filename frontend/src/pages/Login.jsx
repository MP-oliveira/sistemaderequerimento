import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ibvaLogo from '../assets/images/ibva-logo.png';
import AlwaysVisiblePWAButton from '../components/AlwaysVisiblePWAButton';
import './Login.css';

export default function Login() {
  const { login, loading: loadingAuth, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedRememberMe && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      
      // Implementar "Lembrar de mim"
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }
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
    <div className="login-page">
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
                className="larger-email-input"
              />
                     <div className="password-input-container" style={{ position: 'relative', marginBottom: '18px' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="larger-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0',
                    margin: '0',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.borderRadius = '4px';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'none';
                  }}
                >
                  {showPassword ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              
              <div style={{ 
                width: '100%', 
                marginBottom: '16px', 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'flex-start',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                fontWeight: '500',
                gap: '10px'
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ 
                    width: '18px',
                    height: '18px',
                    accentColor: '#2563eb',
                    cursor: 'pointer',
                    margin: '0',
                    padding: '0',
                    flexShrink: '0'
                  }}
                />
                <span style={{ 
                  cursor: 'pointer', 
                  userSelect: 'none',
                  lineHeight: '18px'
                }}>
                  Lembrar de mim
                </span>
              </div>
              
              {error && <div className="error">{error}</div>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary login-submit-btn"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
                 <AlwaysVisiblePWAButton />
          </form>
        </div>
      </div>
    </div>
  );
}