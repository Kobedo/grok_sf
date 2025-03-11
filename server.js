require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'dist')));

const db = new sqlite3.Database('items.db', (err) => {
  if (err) console.error('Error opening database:', err.message);
  else console.log('Connected to SQLite database.');
  db.run(`CREATE TABLE IF NOT EXISTS panels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT,
    productName TEXT,
    servingSize TEXT,
    servings TEXT,
    dvIngredients TEXT,
    nonDVIngredients TEXT,
    timestamp TEXT
  )`);
});

app.post('/save-panel', (req, res) => {
  req.on('data', (data) => {
    const { id, sku, productName, servingSize, servings, dvIngredients, nonDvIngredients, timestamp } = JSON.parse(data);
    const stmt = id
      ? db.prepare('UPDATE panels SET sku = ?, productName = ?, servingSize = ?, servings = ?, dvIngredients = ?, nonDvIngredients = ?, timestamp = ? WHERE id = ?')
      : db.prepare('INSERT INTO panels (sku, productName, servingSize, servings, dvIngredients, nonDvIngredients, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const params = id
      ? [sku, productName, servingSize, servings, JSON.stringify(dvIngredients), JSON.stringify(nonDvIngredients), timestamp, id]
      : [sku, productName, servingSize, servings, JSON.stringify(dvIngredients), JSON.stringify(nonDvIngredients), timestamp];
    stmt.run(params, (err) => {
      if (err) res.status(500).json({ message: 'Error saving panel: ' + err.message });
      else res.json({ message: id ? 'Panel updated!' : 'Panel saved!' });
      stmt.finalize();
    });
  });
});

app.get('/get-panels', (req, res) => {
  const { id } = req.query;
  let query = 'SELECT * FROM panels';
  let params = [];
  if (id) {
    query += ' WHERE id = ?';
    params.push(id);
  }
  db.all(query, params, (err, rows) => {
    if (err) res.status(500).json({ message: 'Error fetching panels: ' + err.message });
    else res.json(rows || []);
  });
});

app.listen(port, () => console.log(`Server running on port ${port}`));