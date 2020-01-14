const db = require('../../db/index.js');

// const query = async (text, values, cb) => {
//   const client = await db.connect();
//   client.query(text, values) 
  
// }
  
//   db.connect((err, client, release) => {
//     if (err) {
//       return err;
//     } 
//     return client.query(text, values)
//     .then()
//     .catch()
//     .finally(() => release())
//      (err, result) => {
//       release()
//       if (err) {
//         return console.error('Error executing query', err.stack)
//       }
//       console.log(result.rows)
//     })
//   })
  
// };

module.exports = {
  questions: {
    findAll: (productId, count, page) => {
      return db.connect()
      .then(client => {
        return client.query(`
          SELECT question_id, question_body, question_date, asker_name, question_helpfulness, reported,
          (
            SELECT COALESCE(array_to_json(array_agg(row_to_json(a))), '[]')
            FROM (
              SELECT id, body, date, answerer_name, helpfulness, (
                SELECT ARRAY(
                  SELECT url
                  FROM answers_photos
                  WHERE answers.id = answers_photos.answer_id
                )) as photos
              FROM answers
              WHERE answers.question_id=questions.question_id
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
      });
    },
    add: (productId, question) => {
      const columns = 'product_id, asker_name, asker_email, question_body';
      const values = [productId, question.name, question.email, question.body];
      const query = `
        INSERT INTO questions(${columns}) 
        VALUES($1, $2, $3, $4)`;
      
      return db.query(query, values);
    },
    addTest: (productId, question) => {
      const columns = 'product_id, asker_name, asker_email, question_body';
      const values = [productId, question.name, question.email, question.body];
      const query = `
        INSERT INTO questions(${columns}) 
        VALUES($1, $2, $3, $4)`;
      
      return (
        db.connect()
        .then(client => {
          client.query(query, values)
          .then(({rows}) => {
            client.release()
            return rows;
          })
        }));
      ;
    },
    markAsHelpful: (questionId) => {
      return db.query( `
        UPDATE questions
        SET question_helpfulness = question_helpfulness + 1
        WHERE question_id = ${questionId}
      `);
    },
    report: (questionId) => {
      return db.query( `
        UPDATE questions
        SET reported = 1
        WHERE question_id = ${questionId}
      `);
    }
  },

  answers: {
    findAll: (questionId) => {
      return db.connect()
      .then(client => {
        client.query(`
        SELECT id, body, date, answerer_name, helpfulness 
        FROM answers 
        WHERE question_id = ${questionId}`)
        .then(() => client.release())
      });
    },
    findAnswerPhotos: (answerId) => {
      const text = 'SELECT url FROM answers_photos WHERE answer_id = $1';
      const values = [answerId];
      return db.connect()
      .then(client => {
        client.query(text, values)
        .then(client.release())
      })
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
      return db.query( `
        UPDATE questions
        SET question_helpfulness = question_helpfulness + 1
        WHERE question_id = ${answerId}
      `);
    },
    report: (answerId) => {
      return db.query( `
        UPDATE questions
        SET reported = 1
        WHERE question_id = ${answerId}
    `);
    }
  }
};