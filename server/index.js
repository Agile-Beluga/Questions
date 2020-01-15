const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const db = require('../db/index.js');
const cache = require('../cache/index.js');
const router = require('./routes/routes.js');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use('/', router);

// Initialization
const port = 80;
httpServer = require('http').createServer(app);
httpServer.listen(port, (e) => {
  if (e) {
    console.error(e);
  } else {
    console.log(`Web server listening on port ${port}...`);
  }
});

// Shutdown
let shutdowns = 0;
const shutdownGracefully = () => {
  if (shutdowns > 0) return;
  shutdowns += 1;

  console.log('Starting shutdown...');
  db.end()
  .then(() => console.log('PostgreSQL pool disconnected'))
  .catch(e => console.error('Error while disconnecting PostgreSQL pool'));
  cache.quit();
  httpServer.close(() => console.log('Server shut down'));
};

process.on('SIGTERM', shutdownGracefully);
process.on('SIGINT', shutdownGracefully);