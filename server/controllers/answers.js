const cache = require('../../cache/commands.js');
const answers = require('../../db/models/answers.js');

exports.get = (req, res) => {
  const id = req.params.question_id;
  const count = req.query.count ? Math.floor(req.query.count) : 5;
  const page = req.query.page ? Math.floor(req.query.page) : 0;
  const response = {
    question: id,
    page: page,
    count: count,
    results: []
  };
  answers.findAll(id, count, page)
  .then(data => {
    if (data) response.results = data;
    res.json(response);
  })
  .catch(err => {
    res.sendStatus(404);
    throw new Error(err);
  });
};

exports.post = (req, res) => {
  const id = parseInt(req.params.question_id);
  const answer = req.body;
    
  answers.add(id, answer)
  .then(answerId => answers.addPhotos(answerId, answer.photos))
  .then(() => res.sendStatus(201))
  .catch(err => {
    res.sendStatus(500);
    throw new Error(err);
  });
};

exports.markHelpful = (req, res) => {
  const id = req.params.answer_id;

  answers.markHelpful(id)
  .then(() => res.sendStatus(204))
  .catch(err => {
    res.sendStatus(500);
    throw new Error(err);
  });
};
  
exports.report = (req, res) => {
  const id = parseInt(req.params.answer_id);

  answers.report(id)
  .then(() => res.sendStatus(204))
  .catch(err => {
    res.sendStatus(500);
    throw new Error(err);
  });
};