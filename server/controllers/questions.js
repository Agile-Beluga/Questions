const cache = require('../../cache/commands.js');
const questions = require('../../db/models/questions.js');

exports.get = (req, res) => {
  const cacheKey = req.url;
  const id = req.params.product_id;
  const count = req.query.count ? Math.floor(req.query.count) : 5;
  const page = req.query.page ? Math.floor(req.query.page) : 0;
  const response = {
    product_id: id,
    results: []
  };
  
  cache.get(cacheKey)
  .then(data => {
    if (data === null) {
      questions.findAll(id, count, page * count)
      .then(questions => {
        response.results = questions;
        res.json(response);
        cache.set(cacheKey, JSON.stringify(response));
      })
      .catch(err => {
        res.sendStatus(404);
        throw new Error(err);
      });
    } else {
      res.json(JSON.parse(data));
    }
  })
  .catch(err => { 
    res.sendStatus(500);
    throw new Error(err);
  });
};

exports.post = (req, res) => {
  const id = req.params['product_id'];
  const question = req.body;

  if (!question.body) {
    res.sendStatus(400);
  } else {
    questions.add(id, question)
    .then(() => res.sendStatus(201))
    .catch(err =>{
      res.sendStatus(500);
      throw new Error(err);
    });
  }
};

exports.markHelpful = (req, res) => {
  const id = parseInt(req.params.question_id);

  questions.markHelpful(id)
  .then(() => res.sendStatus(204))
  .catch(err => {
    res.sendStatus(500);
    throw new Error(err);
  });
};

exports.report = (req, res) => {
  const id = parseInt(req.params.question_id);

  questions.report(id)
  .then(() => res.sendStatus(204))
  .catch(err => {
    res.sendStatus(500);
    throw new Error(err);
  });
};