const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'dist')));

// Database setup
const db = new sqlite3.Database('./items.db', (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.run(`
      CREATE TABLE IF NOT EXISTS panels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT,
        productName TEXT,
        servingSize TEXT,
        servings TEXT,
        dvIngredients TEXT,
        nonDvIngredients TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
});

// API Endpoints
app.get('/get-panels', (req, res) => {
  db.all('SELECT * FROM panels ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching panels:', err.message);
      res.status(500).json({ error: 'Failed to fetch panels' });
    } else {
      res.json(rows);
    }
  });
});

app.post('/save-panel', (req, res) => {
  const {
    id,
    sku,
    productName,
    servingSize,
    servings,
    dvIngredients,
    nonDvIngredients,
  } = req.body;

  const dvIngredientsStr = JSON.stringify(dvIngredients);
  const nonDvIngredientsStr = JSON.stringify(nonDvIngredients);

  if (id) {
    // Update existing panel
    db.run(
      `UPDATE panels SET sku = ?, productName = ?, servingSize = ?, servings = ?, dvIngredients = ?, nonDvIngredients = ? WHERE id = ?`,
      [sku, productName, servingSize, servings, dvIngredientsStr, nonDvIngredientsStr, id],
      function (err) {
        if (err) {
          console.error('Error updating panel:', err.message);
          res.status(500).json({ error: 'Failed to update panel' });
        } else {
          res.json({ message: 'Panel updated', id });
        }
      }
    );
  } else {
    // Insert new panel
    db.run(
      `INSERT INTO panels (sku, productName, servingSize, servings, dvIngredients, nonDvIngredients) VALUES (?, ?, ?, ?, ?, ?)`,
      [sku, productName, servingSize, servings, dvIngredientsStr, nonDvIngredientsStr],
      function (err) {
        if (err) {
          console.error('Error saving panel:', err.message);
          res.status(500).json({ error: 'Failed to save panel' });
        } else {
          res.json({ message: 'Panel saved', id: this.lastID });
        }
      }
    );
  }
});

// Catch-all route for client-side routing (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});