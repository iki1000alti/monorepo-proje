const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
      };
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Yetki yok, token geçersiz' });
    }
  } else {
    return res.status(401).json({ message: 'Yetki yok, token bulunamadı' });
  }
};

module.exports = { protect }; 