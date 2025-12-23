const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '!(Anika@#1234',  
  database: 'campuscircle_mart',
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
