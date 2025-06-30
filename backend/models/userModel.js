// Dummy user model (veritabanı yok)
const dummyUser = {
  id: '1',
  username: 'admin',
  passwordHash: '$2a$10$Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9QeQ9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9', // 'password' bcrypt hash
  role: 'admin',
  lastLogin: null,
};

module.exports = { dummyUser }; 