const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend API Güncellendi!');
});

app.listen(PORT, () => {
  console.log(`Backend sunucu ${PORT} portunda çalışıyor.`);
}); 