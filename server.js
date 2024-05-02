const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3001;

const db = new sqlite3.Database('my_db.db');

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS batches (id INTEGER PRIMARY KEY AUTOINCREMENT, batch TEXT UNIQUE, start_date TEXT)');
});

app.use(cors());
app.use(bodyParser.json());

app.post('/batches', (req, res) => {
  const { batch, startDate } = req.body;

  db.run('INSERT OR REPLACE INTO batches (batch, start_date) VALUES (?, ?)', [batch, startDate], function (error) {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Error saving or updating batch.' });
      return;
    }

    if (this.changes === 1) {
      const id = this.lastID || 'N/A';
      res.status(201).json({ message: 'Batch saved or updated successfully.', id });
    } else {
      res.status(200).json({ message: 'Batch start date updated successfully.' });
    }
  });
});

app.get('/batches', (req, res) => {
  const query = 'SELECT * FROM batches';

  db.all(query, (error, rows) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching batches.' });
      return;
    }

    res.status(200).json(rows);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
