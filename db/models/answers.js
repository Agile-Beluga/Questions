const db = require('../index.js');

exports.findAll = (questionId, count, page) => {
  return db.connect()
  .then(client => {
    return client.query(`
      SELECT id AS question_id, body, date, answerer_name, helpfulness,
      (
        SELECT COALESCE(array_to_json(array_agg(row_to_json(p))), '[]')
        FROM (
          SELECT id, url
          FROM answers_photos
          WHERE answers.id = answers_photos.answer_id
        ) as p
      ) as photos
      FROM answers
      WHERE (question_id = $1 AND reported = 0)
      ORDER BY id ASC
      LIMIT $2
      OFFSET $3
    `, [questionId, count, count * page])
    .then(({ rows }) => rows)
    .catch(err => { throw new Error(err) })
    .finally(() => client.release())
  .catch(err => { throw new Error(err) })
  });
};

exports.add = (questionId, answer) => {
  const columns = 'question_id, answerer_name, answerer_email, body';
  const values = [questionId, answer.name, answer.email, answer.body];
  const query = `
      INSERT INTO answers (${columns}) 
      VALUES ($1, $2, $3, $4)
      RETURNING id`;

  return db.connect()
  .then(client => {
    return client.query(query, values)
    .then(({ rows }) => rows[0].id)
    .catch(err => { throw new Error(err) })
    .finally(() => client.release())
  });
};

exports.addPhotos = (answerId, photos) => {
  const parsedPhotos = photos.map((p) => `'${p}'`).join(',');
  const columns = 'answer_id, url';
  const query = `
    DO
    $do$
    DECLARE
      photo text;
      photos text[] := array[${parsedPhotos}];
    BEGIN 
      FOREACH photo IN ARRAY photos
      LOOP
        INSERT INTO answers_photos (${columns}) VALUES (${answerId}, photo);
      END LOOP;
    END
    $do$`;

  return db.connect()
  .then(client => {
    return client.query(query)
    .finally(() => client.release())
  });
};

exports.markHelpful = (answerId) => {
  return db.connect()
  .then(client => {
    return client.query(`
      UPDATE answers
      SET helpfulness = helpfulness + 1
      WHERE id = $1`, [answerId])
    .catch(err => { throw new Error(err) })
    .finally(() => client.release())
  })
  .catch(err => { throw new Error(err) })
};

exports.report = (answerId) => {
  return db.connect()
  .then(client => {
    return client.query(`
      UPDATE answers
      SET reported = 1
      WHERE id = $1`, [answerId])
    .catch(err => { throw new Error(err) })
    .finally(() => client.release())
  })
  .catch(err => { throw new Error(err) })
};