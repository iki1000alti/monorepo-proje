import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import AdminPanel from './admin/AdminPanel';
import UserLogin from './user/UserLogin';

const API_URL = import.meta.env.VITE_API_URL;

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      const payload = parseJwt(token);
      setIsAdmin(payload && (payload.isAdmin || payload.isSuperAdmin));
    } else {
      setIsAdmin(false);
    }
  }, [token]);

  const handleLogin = async (email, password) => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setMessage('Giriş başarılı!');
      } else {
        setMessage(data.message || 'Giriş başarısız.');
      }
    } catch (err) {
      setMessage('Sunucu hatası.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setIsAdmin(false);
    setMessage('');
  };

  if (token && isAdmin) {
    return <AdminPanel token={token} onLogout={handleLogout} />;
  }

  return <UserLogin onLogin={handleLogin} message={message} loading={loading} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);