import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';

import readRoutineDataFromExcelByBatch from './readFile.js'

const app = express();
const port = 3001;

const db = new sqlite3.Database('test_1.db');

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS batches (id INTEGER PRIMARY KEY AUTOINCREMENT, batch TEXT UNIQUE, start_date TEXT)');
  db.run('CREATE TABLE IF NOT EXISTS off_days (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT UNIQUE)');

  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Tables:', tables);
    }
  });
  
  db.all("SELECT * FROM off_days", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Data of off_days:', data);
    }
  });
  
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
      console.log("Successful")
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
    console.log("Successful")
    res.status(200).json(rows);
  });
});


// console.log(readRoutineDataFromExcelByBatch())
app.get('/routine-data', (req, res) => {
  const data = readRoutineDataFromExcelByBatch();
  res.json(data);
});


app.post('/save-off-days', (req, res) => {
  const { startDate, endDate } = req.body;
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    return res.status(400).send('Invalid date range');
  }
  console.log(startDate,endDate)
  const dates = [];
  for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    dates.push([new Date(dt).toISOString().slice(0, 10)]);
  }

  const placeholders = dates.map(() => '(?)').join(',');
  const query = `INSERT OR IGNORE INTO off_days (date) VALUES ${placeholders}`;
  console.log("dates", dates)
  db.run(query, dates.flat(), function (error) {
    if (error) {
      console.error(error);
      res.status(500).send('Error saving off days');
      return;
    }
    console.log("Successful")
    res.status(200).send('Off days saved successfully');
  });
});

app.get('/get-off-days', (req, res) => {
  const query = 'SELECT date FROM off_days';
  
  db.all(query, (error, rows) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error fetching off days');
      return;
    }
    console.log("Successful")
    res.status(200).json(rows.map(row => row.date));
  });
});


app.delete('/reset-off-days', (req, res) => {
  db.run('DELETE FROM off_days', function (error) {
    if (error) {
      console.error(error);
      res.status(500).send('Error resetting off days');
      return;
    }
    console.log("Successful")
    res.status(200).send('Off days reset successfully');
  });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
