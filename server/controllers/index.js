const models = require('../models/index.js');
const cache = require('../../cache/commands.js');
const answers = require('../../db/models/answers.js');

module.exports = {
  questions: {
    get: (req, res) => {
      const id = req.params.product_id;
      const count = req.query.count ? Math.floor(req.query.count) : 5;
      const page = req.query.page ? Math.floor(req.query.page) : 1;
      const response = {
        product_id: id,
        results: []
      };

      models.questions.findAll1(id)
      .then(questions => {

        if (questions.length === 0) {
          res.json(response);
        }
         
        const start = count * (page - 1);
        const end = start + count > questions.length ? questions.length : start + count;
        const totalQuestions = end - start;
        
        if (totalQuestions <= 0 || start < 0) {
          res.json(response);
        }
        
        let questionsDone = 0;
        let totalAnswers = 0;
        let answersDone = 0;

        for (let i = start; i < end; i++) {
          let question = questions[i];
          question.answers = {};
          response.results.push(question);

          models.answers.findAll1(question.question_id)
          .then(answers => {
            questionsDone += 1;
            totalAnswers += answers.length; 

            if (questionsDone === totalQuestions && totalAnswers === 0) {
              res.json(response);
            }

            for (let answer of answers) {
              question.answers[answer.id] = answer;
              question.answers[answer.id].photos = [];
              models.answers.findAnswerPhotos(answer.id)
              .then(photos => {
                answersDone += 1;
                for (let photo of photos) {
                  answer.photos.push(photo.url);
                }
                if (answersDone === totalAnswers && questionsDone === totalQuestions) {
                  res.json(response);
                } 
              })
              .catch(e => {
                console.error(e);
                res.sendStatus(404);
              })
            }
          })
          .catch(e => {
            console.error(e);
            res.sendStatus(404);
          })
        }
      })
      .catch(e => {
        console.error(e);
        res.sendStatus(404);
      })
    },
    get2: (req, res) => {
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
          models.questions.findAll(id, count, page * count)
          .then(questions => {
            if (questions) response.results = questions;
            res.json(response);
            cache.set(cacheKey, JSON.stringify(response));
          })
          .catch(e => {
            res.sendStatus(404);
            console.error(e);
          });
        } else {
          res.json(JSON.parse(data));
        }
      })
      .catch(e => {
        res.sendStatus(500);
        console.error(e);
      });
    },
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
        if(process.env.NODE_ENV !== 'test') console.error(e);
      });
    },
    putHelpful: (req, res) => {
      const id = parseInt(req.params.question_id);

      models.questions.markAsHelpful(id)
      .then(() => res.sendStatus(204))
      .catch(e => {
        res.sendStatus(500);
        if(process.env.NODE_ENV !== 'test') console.error(e);
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
      answers.findAll(id, count, page)
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
      
      answers.add(id, answer)
      .then(answerId => models.answers.addPhotos(answerId, answer.photos))
      .then(() => res.sendStatus(201))
      .catch(e => {
        res.sendStatus(500);
        console.error(e);
      });
    },
    putHelpful: (req, res) => {
      const id = req.params.answer_id;

      answers.markHelpful(id)
      .then(() => res.sendStatus(204))
      .catch(e => console.error(e));
    },
    putReport: (req, res) => {
      const id = parseInt(req.params.answer_id);

      answers.report(id)
      .then(() => res.sendStatus(204))
      .catch(e => {
        res.sendStatus(500);
        console.error(e);
      });
    }
  }
};