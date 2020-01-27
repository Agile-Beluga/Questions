const { Pool } = require('pg');

const database = process.env.NODE_ENV === 'test' ? 'kartify_test' : 'kartify';
const password = process.env.NODE_ENV === 'test' ? null : 'kartify';

const pool = new Pool ({
  user: process.env.PGUSER || 'sebastian',
  password: process.env.PGPASSWORD || password,
  database: process.env.PGDATABASE || database,
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432
});

pool.on('error', e => console.error(e));

module.exports = pool;