const db = require('../../db/index.js');

module.exports = {
  questions: {
    findAll1: (productId) => {
      return db.connect()
      .then(client => {
        return client.query(`
        SELECT question_id, question_body, question_date, asker_name, question_helpfulness, reported
        FROM questions 
        WHERE (product_id = ${productId} AND reported = 0)
        `)
        .then(({rows}) => {
          client.release();
          return rows;
        })
        .catch(e => {
          client.release();
          console.error(e);
        })
      })
    },
    findAll: (productId, count, page) => {
      return db.connect()
      .then(client => {
        return client.query(`
          SELECT question_id, question_body, question_date, asker_name, question_helpfulness, reported,
          (
            SELECT COALESCE(json_object_agg(a.id, row_to_json(a)), '[]')
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
          WHERE (product_id = ${productId} AND reported = 0)
          ORDER BY question_id ASC
          LIMIT ${count}
          OFFSET ${count * page}
        `)
        .then(({rows}) => {
          client.release();
          return rows;
        })
        .catch(e => {
          client.release();
          console.error(e);
        })
      .catch(e => console.error(e))
      });
    },
    add: (productId, question) => {
      const columns = 'product_id, asker_name, asker_email, question_body';
      const values = [productId, question.name, question.email, question.body];
      const query = `
        INSERT INTO questions(${columns}) 
        VALUES($1, $2, $3, $4)`;
      
      return (
        db.connect()
        .then(client => {
          return client.query(query,values).finally(() => client.release())
        })
      );
    },
    markAsHelpful: (questionId) => {
      return db.connect()
      .then(client => {
        return client.query(`
          UPDATE questions
          SET question_helpfulness = question_helpfulness + 1
          WHERE question_id = ${questionId}`)
        .then(() => {
          client.release();
        })
        .catch(e => {
          client.release();
          console.error(e);
        })
      });
    },
    report: (questionId) => {
      return db.connect()
      .then(client => {
        return client.query(`
          UPDATE questions
          SET reported = 1
          WHERE question_id = ${questionId}`)
        .then(() => {
          client.release();
        })
        .catch(e => {
          client.release();
          console.error(e);
        })
      });
    }
  },
  answers: {
    findAll1: (questionId) => {
      return db.connect()
      .then(client => {
        return client.query(`
        SELECT id, body, date, answerer_name, helpfulness 
        FROM answers 
        WHERE question_id = ${questionId}
      `)
      .then(({rows}) => {
        client.release();
        return rows;
      })
      .catch(e => {
        client.release();
        console.error(e);
      })
    .catch(e => console.error(e))
    });
    },
    findAnswerPhotos: (answerId) => {
      const text = 'SELECT url FROM answers_photos WHERE answer_id = $1';
      const values = [answerId];
      return db.connect()
      .then(client => {
        return client.query(text, values)
        .then(({rows}) => {
          client.release();
          return rows;
        })
        .catch(e => {
          client.release();
          console.error(e);
        })
      })
      
    },
    findAll: (questionId, count, page) => {
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
          WHERE (question_id = ${questionId} AND reported = 0)
          ORDER BY id ASC
          LIMIT ${count}
          OFFSET ${count * page}
        `)
        .then(({rows}) => {
          client.release();
          return rows;
        })
        .catch(e => {
          client.release();
          console.error(e);
        })
      .catch(e => console.error(e))
      });
    },
    add: (questionId, answer) => {
      const columns = 'question_id, answerer_name, answerer_email, body';
      const values = [questionId, answer.name, answer.email, answer.body];
      const query = `
          INSERT INTO answers (${columns}) 
          VALUES ($1, $2, $3, $4)
          RETURNING id`;

      return db.query(query, values);
    },
    addPhotos: (answerId, photos) => {
      const columns = 'answer_id, url';
      const parsedPhotos = photos.map((p) => `'${p}'`).join(',');
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

      return db.query(query);
    },
    markAsHelpful: (answerId) => {
      return db.connect()
      .then(client => {
        return client.query(`
          UPDATE answers
          SET helpfulness = helpfulness + 1
          WHERE id = ${answerId}`)
        .then(() => {
          client.release();
        })
        .catch(e => {
          client.release();
          console.error(e);
        })
      });
    },
    report: (answerId) => {
      return db.connect()
      .then(client => {
        return client.query(`
          UPDATE answers
          SET reported = 1
          WHERE id = ${answerId}`)
        .then(() => {
          client.release();
        })
        .catch(e => {
          client.release();
          console.error(e);
        })
      });
    }
  }
};