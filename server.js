const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'dist')));

const db = new sqlite3.Database(process.env.DB_PATH || 'items.db', (err) => {
  if (err) console.error('Error opening database:', err.message);
  else {
    console.log('Connected to SQLite database.');
    db.run(`
      CREATE TABLE IF NOT EXISTS panels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT,
        productName TEXT,
        servingSize TEXT,
        servings TEXT,
        dvIngredients TEXT,
        nonDVIngredients TEXT,
        timestamp TEXT
      )
    `);
  }
});

app.post('/save-panel', (req, res) => {
    console.log('Received /save-panel request:', req.body);
    const { id, sku, productName, servingSize, servings, dvIngredients, nonDvIngredients, timestamp } = req.body; // Fixed case
    const stmt = id
      ? db.prepare('UPDATE panels SET sku = ?, productName = ?, servingSize = ?, servings = ?, dvIngredients = ?, nonDvIngredients = ?, timestamp = ? WHERE id = ?')
      : db.prepare('INSERT INTO panels (sku, productName, servingSize, servings, dvIngredients, nonDvIngredients, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const params = id
      ? [sku, productName, servingSize, servings, JSON.stringify(dvIngredients), JSON.stringify(nonDvIngredients), timestamp, id] // Fixed case
      : [sku, productName, servingSize, servings, JSON.stringify(dvIngredients), JSON.stringify(nonDvIngredients), timestamp]; // Fixed case
    stmt.run(params, function(err) {
      if (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ message: 'Error saving panel: ' + err.message });
      } else {
        console.log('Panel saved/updated, id:', this.lastID || id);
        res.json({ message: id ? 'Panel updated successfully!' : 'Panel saved successfully!' });
      }
      stmt.finalize();
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
    else res.json(rows);
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => console.log(`Server running on port ${port}`));