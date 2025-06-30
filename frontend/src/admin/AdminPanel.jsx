import React, { useState, useEffect } from 'react';

function AdminPanel({ token, onLogout }) {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/users/pending', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setPendingUsers(data);
        setLoading(false);
      });
  }, [token]);

  const approveUser = async (id) => {
    setMessage('');
    const res = await fetch(`/api/users/approve/${id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      setPendingUsers(users => users.filter(u => u._id !== id));
      setMessage('Kullanıcı onaylandı.');
    } else {
      setMessage(data.message || 'Hata oluştu.');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Admin Panel</h2>
      <button onClick={onLogout} style={{ float: 'right' }}>Çıkış Yap</button>
      <h3>Onay Bekleyen Kullanıcılar</h3>
      {loading ? <div>Yükleniyor...</div> : (
        <ul>
          {pendingUsers.length === 0 && <li>Bekleyen kullanıcı yok.</li>}
          {pendingUsers.map(user => (
            <li key={user._id} style={{ marginBottom: 8 }}>
              {user.username} ({user.email})
              <button onClick={() => approveUser(user._id)} style={{ marginLeft: 12 }}>Onayla</button>
            </li>
          ))}
        </ul>
      )}
      {message && <div style={{ marginTop: 16, color: 'green' }}>{message}</div>}
    </div>
  );
}

export default AdminPanel; 