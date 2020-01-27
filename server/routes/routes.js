const router = require('express').Router();
const questions = require('../controllers/questions.js');
const answers = require('../controllers/answers.js');

// QUESTIONS
router.get('/qa/:product_id', questions.get);
router.post('/qa/:product_id', questions.post);
router.put('/qa/question/:question_id/helpful', questions.markHelpful);
router.put('/qa/question/:question_id/report', questions.report);

// ANSWERS
router.get('/qa/:question_id/answers', answers.get);
router.post('/qa/:question_id/answers', answers.post);
router.put('/qa/answer/:answer_id/helpful', answers.markHelpful);
router.put('/qa/answer/:answer_id/report', answers.report);

// TEST
router.get('/loaderio-27727094b7ac3dbc9fc77923a20f52ac/', (req, res) => {
  res.send('loaderio-27727094b7ac3dbc9fc77923a20f52ac');
});

module.exports = router;