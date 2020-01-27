const { Pool } = require('pg');

const pool = new Pool ({
  user: process.env.PGUSER || 'sebastian',
  password: process.env.PGPASSWORD || 'kartify',
  database: process.env.PGDATABASE || 'kartify',
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432
});

pool.on('error', e => console.error(e));

module.exports = pool;