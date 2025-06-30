const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3001;
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend API Güncellendi!');
});

// Kullanıcı modeli
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB bağlantısı başarılı');
}).catch((err) => {
  console.error('MongoDB bağlantı hatası:', err);
});

// Kayıt endpointi
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Tüm alanlar zorunlu.' });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Kullanıcı adı veya e-posta zaten kayıtlı.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ username, email, passwordHash });
    await user.save();
    res.status(201).json({ message: 'Kayıt başarılı.' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

// Login endpointi
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Tüm alanlar zorunlu.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Geçersiz e-posta veya şifre.' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz e-posta veya şifre.' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, username: user.username, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend sunucu ${PORT} portunda çalışıyor.`);
}); 