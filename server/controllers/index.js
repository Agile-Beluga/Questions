const models = require('../models/index.js');

module.exports = {
  questions: {
    get: (req, res) => {
      const id = req.params.product_id;
      const count = req.query.count ? Math.floor(req.query.count) : 5;
      const page = req.query.page ? Math.floor(req.query.page) : 0;
      const response = {
        product_id: id,
        results: []
      };
      models.questions.findAll(id, count, page * count)
      .then(questions => {
        if (questions) {
        response.results = questions;
        }
        res.json(response);
      })
      .catch(e => {
        res.sendStatus(404);
        console.error(e);
      })
    },
    post: (req, res) => {
      const id = req.params['product_id'];
      const question = req.body;

      models.questions.add(id, question)
      .then(() => {
        res.sendStatus(201);
      })
      .catch(e =>{
        res.sendStatus(500);
        console.error(e);
      });
    },
    postTest: (req, res) => {
      const id = req.params['product_id'];
      const question = req.body;

      models.questions.addTest(id, question)
      .then(() => {
        res.sendStatus(201);
      })
      .catch(e =>{
        res.sendStatus(500);
        console.error(e);
      });
    },
    putHelpful: (req, res) => {
      const id = parseInt(req.params.question_id);

      models.questions.markAsHelpful(id)
      .then(() => res.sendStatus(204))
      .catch(e => {
        res.sendStatus(500);
        console.error(e);
      });
    },
    putReport: (req, res) => {
      const id = parseInt(req.params.question_id);

      models.questions.report(id)
      .then(() => res.sendStatus(204))
      .catch(e => {
        res.sendStatus(500);
        console.error(e);
      });
    }
  },

  answers: {
    get: (req, res) => {
      const id = req.params.question_id;
      const count = req.query.count ? Math.floor(req.query.count) : 5;
      const page = req.query.page ? Math.floor(req.query.page) : 1;

      const response = {
        question: id,
        page: page,
        count: count,
        results: []
      };

      models.answers.findAll(id)
      .then(({rows:answers}) => {
        const start = count * (page - 1);
        const end = start + count > answers.length ? answers.length : start + count;

        if (answers.length === 0 || start < 0) {
          res.json(response);
        }

        for (let i = start; i < end; i++) {
          let answer = answers[i];
          answer.answer_id = answer.id;
          answer.photos = [];
          delete answer.id;
          response.results.push(answer);
        }
        res.json(response);
      })
      .catch(e => {
        res.sendStatus(404);
        console.error(e);
      })
    },
    post: (req, res) => {
      const id = parseInt(req.params.question_id);
      const answer = req.body;

      models.answers.add(id, answer)
      .then(({rows}) => models.answers.addPhotos(rows[0].id, answer.photos))
      .then(() => res.sendStatus(201))
      .catch(e => {
        res.sendStatus(500)
        console.error(e)
      });
    },
    putHelpful: (req, res) => {
      const id = req.params.answer_id;

      models.answers.markAsHelpful(id)
      .then(() => res.sendStatus(204))
      .catch(e => console.error(e));
    },
    putReport: (req, res) => {
      const id = parseInt(req.params.answer_id);

      models.answers.report(id)
      .then(() => res.sendStatus(204))
      .catch(e => {
        res.sendStatus(500);
        console.error(e);
      });
    }
  }
};