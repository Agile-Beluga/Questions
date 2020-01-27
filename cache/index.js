const redis = require('redis');
const { promisifyAll } = require('bluebird');
  
promisifyAll(redis.RedisClient.prototype);
promisifyAll(redis.Multi.prototype);

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379
});

client.on('connect', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('Connected to Redis');
  }
});
client.on('end', () => console.log('Disconnected from Redis'))
client.on('error', e => console.error(e));

module.exports = client;