import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setMessage('Giriş başarılı!');
      } else {
        setMessage(data.message || 'Giriş başarısız.');
      }
    } catch (err) {
      setMessage('Sunucu hatası.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Giriş Yap</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 12 }}>
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
          {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>
      {message && <div style={{ marginTop: 16, color: message.includes('başarılı') ? 'green' : 'red' }}>{message}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);