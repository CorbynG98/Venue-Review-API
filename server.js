require('dotenv').config();
const db = require('./config/db');
const express = require('./config/express');

const app = express();
const port = 443;

// Test connection to MySQL on start-up
async function testDbConnection() {
    try {
        await db.createPool();
        await db.getPool().getConnection((err, connection) => {
            if (err) throw err;
            console.log('Database connected!');
            connection.release();
        });
    } catch (err) {
        console.error(`Unable to connect to MySQL: ${err.message}`);
        process.exit(1);
    }
}

testDbConnection()
    .then(function () {
        app.listen(port, function () {
            console.log(`Listening on port: ${port}`);
        });
    });
