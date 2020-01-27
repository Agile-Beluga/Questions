const cache = require('./index.js');

exports.get = (key) => {
  return cache.getAsync(key);
};

exports.set = (key, values) => {
  cache.setAsync(key, values)
  .catch(err => { throw new Error(err) })
};

exports.delete = (key) => {
  cache.delAsync(key)
  .catch(err => { throw new Error(err) })
};