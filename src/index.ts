import express from 'express';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const PORT = process.env.PORT || 5000;
const databaseUrl = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  },
});
const app = express();

app
  .use(bodyParser.json()) // for parsing application/json
  .get('/scores', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM leaderboard;');
      const results = { 'results': (result) ? result.rows : null };
      res.json(results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .get('/scores/search/:player_name', async (req, res) => {
    try {
      const client = await pool.connect();
      const playerName = req.params.player_name;
      const result = await client.query(`SELECT * FROM leaderboard WHERE player_name LIKE '${playerName}%' ORDER BY player_name;`);
      const results = { 'results': (result) ? result.rows : null };
      res.json(results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .post('/scores', async (req, res) => {
    try {
      const client = await pool.connect();
      const {
        playerName,
        score,
      } = req.body as { playerName: string, score: number };
      const result = await client.query(`
        INSERT INTO leaderboard(player_name, score)
        VALUES ('${playerName}', ${score})
        ON CONFLICT (player_name)
        DO 
          UPDATE SET score = ${score};
      `);
      res.status(result?.rowCount === 1 ? 200 : 500);
      res.send();
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));