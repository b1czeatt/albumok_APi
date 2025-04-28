const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


const db = new sqlite3.Database('./albums_db.sqlite', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Database connected.');
  }
});


db.run(`
  CREATE TABLE IF NOT EXISTS albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    band_name TEXT,
    album_title TEXT,
    release_year INTEGER,
    genre TEXT
  )
`);


app.get('/albums', (req, res) => {
  db.all('SELECT * FROM albums', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching albums' });
      return;
    }
    res.json(rows);
  });
});


app.post('/albums', (req, res) => {
  const { band_name, album_title, release_year, genre } = req.body;
  if (!band_name || !album_title || !release_year || !genre) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = 'INSERT INTO albums (band_name, album_title, release_year, genre) VALUES (?, ?, ?, ?)';
  db.run(sql, [band_name, album_title, release_year, genre], function (err) {
    if (err) {
      res.status(500).json({ error: 'Failed to add album' });
      return;
    }
    res.status(201).json({ id: this.lastID, message: 'Album added successfully' });
  });
});


app.get('/albums/:id', (req, res) => {
  const sql = 'SELECT * FROM albums WHERE id = ?';
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch album' });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Album not found' });
      return;
    }
    res.json(row);
  });
});


app.put('/albums/:id', (req, res) => {
  const { band_name, album_title, release_year, genre } = req.body;
  const sql = 'UPDATE albums SET band_name = ?, album_title = ?, release_year = ?, genre = ? WHERE id = ?';
  db.run(sql, [band_name, album_title, release_year, genre, req.params.id], function (err) {
    if (err) {
      res.status(500).json({ error: 'Failed to update album' });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Album not found' });
      return;
    }
    res.status(200).json({ message: 'Album updated successfully' });
  });
});


app.delete('/albums/:id', (req, res) => {
  const sql = 'DELETE FROM albums WHERE id = ?';
  db.run(sql, [req.params.id], function (err) {
    if (err) {
      res.status(500).json({ error: 'Failed to delete album' });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Album not found' });
      return;
    }
    res.status(200).json({ message: 'Album deleted successfully' });
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
