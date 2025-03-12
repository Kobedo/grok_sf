require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const app = express();
const db = new sqlite3.Database('./items.db');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Seed with fdaIngredients
const { fdaIngredients } = require('./ingredientsData');
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS panels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT,
      productName TEXT,
      servingSize TEXT,
      servings TEXT,
      dvIngredients TEXT,
      nonDvIngredients TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      unit TEXT,
      rdi REAL
    )
  `);

  db.get('SELECT COUNT(*) as count FROM ingredients', (err, row) => {
    if (err) {
      console.error('Error checking ingredients count:', err.message);
      return;
    }
    console.log('Ingredients count:', row.count);
    if (row.count === 0) {
      console.log('Seeding ingredients...');
      const stmt = db.prepare('INSERT INTO ingredients (name, unit, rdi) VALUES (?, ?, ?)');
      [
        ...fdaIngredients.Vitamins["Fat-Soluble"],
        ...fdaIngredients.Vitamins["Water-Soluble"],
        ...fdaIngredients.Minerals.Macrominerals,
        ...fdaIngredients.Minerals["Trace Minerals"],
        ...fdaIngredients.Other
      ].forEach(ing => stmt.run(ing.name, ing.unit, ing.rdi));
      stmt.finalize(() => console.log('Seeding completed'));
    } else {
      console.log('Ingredients already seeded');
    }
  });
});

app.get('/api/get-panels', (req, res) => {
  db.all('SELECT * FROM panels', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/save-panel', (req, res) => {
  const { sku, productName, servingSize, servings, dvIngredients, nonDvIngredients } = req.body;
  db.run(
    `INSERT INTO panels (sku, productName, servingSize, servings, dvIngredients, nonDvIngredients)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [sku, productName, servingSize, servings, JSON.stringify(dvIngredients), JSON.stringify(nonDvIngredients)],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

app.get('/api/get-ingredients', (req, res) => {
  db.all('SELECT * FROM ingredients', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch ingredients' });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/add-ingredient', (req, res) => {
  const { name, unit, rdi } = req.body;
  db.run(
    'INSERT OR IGNORE INTO ingredients (name, unit, rdi) VALUES (?, ?, ?)',
    [name, unit || 'mg', rdi],
    (err) => {
      if (err) {
        res.status(500).json({ error: 'Failed to add ingredient' });
        return;
      }
      res.json({ message: 'Ingredient added' });
    }
  );
});

// Keep original endpoints for backward compatibility (optional)
app.get('/get-panels', (req, res) => {
  db.all('SELECT * FROM panels', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/save-panel', (req, res) => {
  const { sku, productName, servingSize, servings, dvIngredients, nonDvIngredients } = req.body;
  db.run(
    `INSERT INTO panels (sku, productName, servingSize, servings, dvIngredients, nonDvIngredients)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [sku, productName, servingSize, servings, JSON.stringify(dvIngredients), JSON.stringify(nonDvIngredients)],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

app.get('/get-ingredients', (req, res) => {
  db.all('SELECT * FROM ingredients', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch ingredients' });
      return;
    }
    res.json(rows);
  });
});

app.post('/add-ingredient', (req, res) => {
  const { name, unit, rdi } = req.body;
  db.run(
    'INSERT OR IGNORE INTO ingredients (name, unit, rdi) VALUES (?, ?, ?)',
    [name, unit || 'mg', rdi],
    (err) => {
      if (err) {
        res.status(500).json({ error: 'Failed to add ingredient' });
        return;
      }
      res.json({ message: 'Ingredient added' });
    }
  );
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));