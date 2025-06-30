const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;
const { dummyUser } = require('./models/userModel');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend API Güncellendi!');
});

// POST: Admin Girişi (dummy user ile)
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const bcrypt = require('bcryptjs');
    try {
        if (username !== dummyUser.username) {
            return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
        }
        const isPasswordCorrect = await bcrypt.compare(password, dummyUser.passwordHash);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
        }
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: dummyUser.id, username: dummyUser.username, role: dummyUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Sunucuda bir hata oluştu' });
    }
});

// LOGOUT: (dummy)
app.post('/api/auth/logout', (req, res) => {
    res.json({ message: 'Çıkış yapıldı (dummy)' });
});

app.listen(PORT, () => {
  console.log(`Backend sunucu ${PORT} portunda çalışıyor.`);
}); 