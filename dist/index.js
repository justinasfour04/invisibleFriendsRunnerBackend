"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const pg_1 = require("pg");
dotenv.config();
const PORT = process.env.PORT || 5000;
const databaseUrl = process.env.DATABASE_URL;
const pool = new pg_1.Pool({
    connectionString: databaseUrl,
    ssl: {
        rejectUnauthorized: false
    },
});
const app = (0, express_1.default)();
app
    .get('/scores', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM leaderboard;');
        const results = { 'results': (result) ? result.rows : null };
        res.json(results);
        client.release();
    }
    catch (err) {
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
    }
    catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
})
    .post('/scores', async (req, res) => {
    try {
        const client = await pool.connect();
        const { playerName, score, } = req.body;
        const result = await client.query(`
        INSERT INTO leaderboard (player_name, score)
        VALUES(${playerName}, ${score})
        ON CONFLICT (player_name)
        DO 
          UPDATE SET score = ${score};
      `);
        const results = { 'results': (result) ? result.rows : null };
        res.json(results);
        client.release();
    }
    catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
})
    .listen(PORT, () => console.log(`Listening on ${PORT}`));
//# sourceMappingURL=index.js.map