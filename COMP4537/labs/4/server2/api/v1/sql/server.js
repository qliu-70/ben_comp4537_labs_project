/**
 * Group b5 Ai disclosure:
 * We used Google Gemini to troubleshoot CORS issues 
 * and proper .env setup between admin / guests.
 * 
 * @link https://gemini.google.com/app
 * 
 */

const http = require('http');
const url = require('url');
const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
    admin: {
        host: process.env.DB_HOST,
        user: process.env.DB_ADMIN_USER,
        password: process.env.DB_ADMIN_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        ssl: { rejectUnauthorized: false }
    },

    guest: {
        host: process.env.DB_HOST,
        user: process.env.DB_GUEST_USER,
        password: process.env.DB_GUEST_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        ssl: { rejectUnauthorized: false }
    }
};

class DatabaseHandler {
    constructor() { }

    async handleInserts() {
        const connection = await mysql.createConnection(DB_CONFIG.admin);

        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS patient (
        patientid INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        dateOfBirth DATETIME
    ) ENGINE = InnoDB`;

        const insertDataQuery = `
        INSERT INTO patient (name, dateofBirth) VALUES
        ('Sara Brown', '1901-01-01'),
        ('John Smith', '1941-01-01'),
        ('Jack Ma', '1961-01-30'),
        ('Elon Musk', '1999-01-01');`;

        await connection.execute(createTableQuery);
        await connection.execute(insertDataQuery);
        await connection.end();
        console.log("Data inserted successfully");
        return;
    }

    async handleSelects(sqlQuery) {
        const connection = await mysql.createConnection(DB_CONFIG.guest);
        const [rows] = await connection.execute(sqlQuery);
        await connection.end();
        return rows;
    }
}

class ServerAPI {

    constructor(port) {
        this.port = port;
        this.db = new DatabaseHandler();
        this.server = http.createServer((req, res) => this.handleRequest(req, res));
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`Server is listening on port ${this.port}`);
        });
    }

    setCORS(res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    async handleRequest(req, res) {
        const parsedUrl = url.parse(req.url, true);

        this.setCORS(res);

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        if (req.method === 'POST') {
            try {
                const message = await this.db.handleInserts();
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(message);
            } catch (err) {
                res.writeHead(500);
                res.end('Error: ' + err.message);

            }
        }

        else if (req.method === 'GET') {
            const sqlQuery = decodeURIComponent(parsedUrl.pathname.replace('/api/v1/sql/', ''));
            try {
                const data = await this.db.handleSelects(sqlQuery);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
            } catch (err) {
                res.writeHead(500);
                res.end('Error: ' + err.message);
            }
        }
        else {
            res.writeHead(404);
            res.end("404 Not Found");
        }
    }
}
const port = process.env.PORT || 3000;
const app = new ServerAPI(port);
app.start();
