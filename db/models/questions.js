const db = require('../index.js');

exports.findAll = (productId, count, initialPosition) => {
  return db.connect()
  .then(client => {
    return client.query(`
      SELECT question_id, question_body, question_date, asker_name, question_helpfulness, reported,
      (
        SELECT COALESCE(json_object_agg(a.id, row_to_json(a)), '{}')
        FROM (
          SELECT id, body, date, answerer_name, helpfulness, (
            SELECT ARRAY(
              SELECT url
              FROM answers_photos
              WHERE answers.id = answers_photos.answer_id
            )) as photos
          FROM answers
          WHERE answers.question_id=questions.question_id AND answers.reported = 0
        ) a
      ) as answers
      FROM questions
      WHERE (product_id = $1 AND reported = 0)
      ORDER BY question_id ASC
      LIMIT $2
      OFFSET $3
    `, [productId, count, initialPosition])
    .then(({ rows }) => rows)
    .finally(() => client.release())
  });
};

exports.add = (productId, question) => {
  const columns = 'product_id, asker_name, asker_email, question_body';
  const values = [productId, question.name, question.email, question.body];
  const query = `
    INSERT INTO questions(${columns}) 
    VALUES($1, $2, $3, $4)`;
    
  return db.connect()
  .then(client => {
    return client.query(query,values)
    .finally(() => client.release())
  })
};

exports.markHelpful = (questionId) => {
  return db.connect()
  .then(client => {
    return client.query(`
      UPDATE questions
      SET question_helpfulness = question_helpfulness + 1
      WHERE question_id = $1
      `, [questionId])
    .catch(err => { throw new Error(err) })
    .finally(() => client.release())
  })
  .catch(err => { throw new Error(err) })
};

exports.report = (questionId) => {
  return db.connect()
  .then(client => {
    return client.query(`
      UPDATE questions
      SET reported = 1
      WHERE question_id = $1
      `, [questionId])
    .catch(err => { throw new Error(err) })
    .finally(() => client.release())
  })
  .catch(err => { throw new Error(err) })
};