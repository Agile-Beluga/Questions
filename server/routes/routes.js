const router = require('express').Router();
const controllers = require('../controllers/index.js');

// QUESTIONS
router.get('/qa/:product_id', controllers.questions.get);
router.post('/qa/:product_id', controllers.questions.post);
router.put('/qa/question/:question_id/helpful', controllers.questions.putHelpful);
router.put('/qa/question/:question_id/report', controllers.questions.putReport);

// ANSWERS
router.get('/qa/:question_id/answers', controllers.answers.get);
router.post('/qa/:question_id/answers', controllers.answers.post);
router.put('/qa/answer/:answer_id/helpful', controllers.answers.putHelpful);
router.put('/qa/answer/:answer_id/report', controllers.answers.putReport);

// TEST
router.get('/loaderio-27727094b7ac3dbc9fc77923a20f52ac/', (req, res) => {
  res.send('loaderio-27727094b7ac3dbc9fc77923a20f52ac');
});

module.exports = router;