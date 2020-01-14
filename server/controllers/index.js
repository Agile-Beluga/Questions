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
        if (questions) response.results = questions;
        res.send(response);
      })
      .catch(e => {
        res.sendStatus(404);
        console.error(e);
      });
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
      const page = req.query.page ? Math.floor(req.query.page) : 0;
      const response = {
        question: id,
        page: page,
        count: count,
        results: []
      };
      models.answers.findAll(id, count, page)
      .then(answers => {
        if (answers) response.results = answers;
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
        res.sendStatus(500);
        console.error(e);
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