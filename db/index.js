const { Pool } = require('pg');

const database = process.env.NODE_ENV === 'test' ? 'kartify_test' : 'kartify';
const password = process.env.NODE_ENV === 'test' ? null : 'kartify';

const pool = new Pool ({
  user: process.env.PG_USER || 'sebastian',
  password: process.env.PG_PASSWORD || password,
  database: process.env.PG_DATABASE || database,
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432
});

pool.on('error', e => console.error(e));

module.exports = pool;