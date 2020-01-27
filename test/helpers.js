const db = require('../db/index.js');

exports.deleteAllQuestions = (done) => {
  db.connect()
  .then(client => {
    client.query(`DELETE FROM questions`)
    .finally(() => {
      client.release();
      done();
    });
  });
};