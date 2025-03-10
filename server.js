const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// SQLite Database Setup
const dbPath = process.env.DB_PATH || 'items.db'; // Use /data/items.db on Render, items.db locally
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
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
        nonDVIngredients TEXT,
        timestamp TEXT
      )
    `);
  }
});

// API Endpoint to Save Panel
app.post('/save-panel', (req, res) => {
  const { id, sku, productName, servingSize, servings, dvIngredients, nonDVIngredients, timestamp } = req.body;
  
  if (id) {
    // Update existing panel
    const stmt = db.prepare(`
      UPDATE panels 
      SET sku = ?, productName = ?, servingSize = ?, servings = ?, dvIngredients = ?, nonDVIngredients = ?, timestamp = ?
      WHERE id = ?
    `);
    stmt.run(
      sku,
      productName,
      servingSize,
      servings,
      JSON.stringify(dvIngredients),
      JSON.stringify(nonDVIngredients),
      timestamp,
      id,
      (err) => {
        if (err) {
          res.status(500).json({ message: 'Error updating panel: ' + err.message });
        } else {
          res.json({ message: 'Panel updated successfully!' });
        }
      }
    );
    stmt.finalize();
  } else {
    // Insert new panel
    const stmt = db.prepare(`
      INSERT INTO panels (sku, productName, servingSize, servings, dvIngredients, nonDVIngredients, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      sku,
      productName,
      servingSize,
      servings,
      JSON.stringify(dvIngredients),
      JSON.stringify(nonDVIngredients),
      timestamp,
      (err) => {
        if (err) {
          res.status(500).json({ message: 'Error saving panel: ' + err.message });
        } else {
          res.json({ message: 'Panel saved successfully!' });
        }
      }
    );
    stmt.finalize();
  }
});

// API Endpoint to Get Panels
app.get('/get-panels', (req, res) => {
  const { id } = req.query;
  let query = 'SELECT * FROM panels';
  let params = [];

  if (id) {
    query += ' WHERE id = ?';
    params.push(id);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ message: 'Error fetching panels: ' + err.message });
    } else {
      res.json(rows);
    }
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});