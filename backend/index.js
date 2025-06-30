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
  isAdmin: { type: Boolean, default: false },
  isSuperAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
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

// Otomatik süper admin oluşturma
async function createSuperAdmin() {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const passwordHash = await bcrypt.hash('Admin1234!', 10);
    await User.create({
      username: 'superadmin',
      email: 'admin@aksumetal.com',
      passwordHash,
      isAdmin: true,
      isSuperAdmin: true,
      isActive: true
    });
    console.log('Süper admin oluşturuldu: admin@aksumetal.com / Admin1234!');
  }
}
createSuperAdmin();

// Süper admin yetkisi kontrolü için middleware
function superAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token gerekli.' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    User.findById(req.userId).then(user => {
      if (user && user.isSuperAdmin) {
        next();
      } else {
        res.status(403).json({ message: 'Yetkisiz.' });
      }
    });
  } catch {
    res.status(401).json({ message: 'Geçersiz token.' });
  }
}

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
    const user = new User({ username, email, passwordHash, isActive: false });
    await user.save();
    res.status(201).json({ message: 'Kayıt başarılı. Onay için yöneticiye başvurun.' });
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
    if (!user.isActive) {
      return res.status(403).json({ message: 'Hesabınız henüz onaylanmadı.' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz e-posta veya şifre.' });
    }
    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin, isSuperAdmin: user.isSuperAdmin }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, username: user.username, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

// Bekleyen kullanıcıları listele (süper admin)
app.get('/api/users/pending', superAdminAuth, async (req, res) => {
  const users = await User.find({ isActive: false });
  res.json(users);
});

// Kullanıcıyı onayla (süper admin)
app.post('/api/users/approve/:id', superAdminAuth, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: true });
  if (user) {
    res.json({ message: 'Kullanıcı onaylandı.' });
  } else {
    res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend sunucu ${PORT} portunda çalışıyor.`);
}); 