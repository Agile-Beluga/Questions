const cache = require('./index.js');

module.exports = {
  get: (key) => {
    return cache.getAsync(key)
  },
  set: (key, values) => {
    cache.setAsync(key, values)
    .then(() => console.log(`Inserted key: ${key}`))
    .catch(e => console.error(e))
  }
};