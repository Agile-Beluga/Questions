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

exports.deleteAllAnswers = (done) => {
  db.connect()
  .then(client => {
    client.query(`DELETE FROM answers`)
    .finally(() => {
      client.release();
      done();
    });
  });
};