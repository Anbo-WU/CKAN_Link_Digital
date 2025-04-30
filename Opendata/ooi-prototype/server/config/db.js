const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log('MySQL Pool created.');

// Test connection (optional)
pool.getConnection()
    .then(connection => {
        console.log('MySQL Connected!');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to MySQL:', err.message);
        // Exit if cannot connect? Consider retry logic for production
        // process.exit(1);
    });


module.exports = pool;