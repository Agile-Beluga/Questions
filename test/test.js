const chai = require('chai');
const chaiHTTP = require('chai-http');
const should = chai.should();
const server = require('../server/index.js');
const models = require('../server/models/index.js');
const { deleteAllQuestions } = require('./helpers.js');

chai.use(chaiHTTP);

// CONSTRUCTORS
const Question = function (name, email, body) {
  this.name = name;
  this.email = email;
  this.body = body;
};

const Answer = function (name, email, body, photos) {
  this.name	= name;
  this.email = email;
  this.body = body;
  this.photos	= photos;
};


describe('Questions', () => {

  beforeEach((done) => {
    deleteAllQuestions(done);
  });

  describe('POST /qa/:product_id', () => {
    it('should add a question', (done) => {
      const productId = 1;
      const body = new Question('Alice', 'alice@test.com', 'This is a not a real question');
      chai.request(server)
        .post(`/qa/${productId}`)
        .send(body)
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });

    it('should not add a question without the body field', (done) => {
      const productId = 1;
      const body = {
        name: 'Alice',
        email: 'alice@test.com'
      };
      chai.request(server)
        .post(`/qa/${productId}`)
        .send(body)
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });

  describe('GET /qa/:product_id', () => {
    it('should get all the questions of a product', (done) => {
      const productId = 1;
      const question = new Question('Alice', 'alice@test.com', 'This is a not a real question');
      models.questions.add(productId, question)
      .then(() => {
        chai.request(server)
        .get(`/qa/${productId}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('product_id');
          res.body.should.have.property('results');
          res.body.results.should.be.a('array');
          done();
        });
      });
    });

    it('should have all the required information', (done) => {
      const productId = 1;
      const question = new Question('Alice', 'alice@test.com', 'This is a not a real question');
      models.questions.add(productId, question)
      .then(() => {
        chai.request(server)
        .get(`/qa/${productId}`)
        .end((err, res) => {
          const questions = res.body.results;
          if (questions.length > 0) {
            const question = questions[0];
            question.should.be.a('object');
            question.should.have.property('question_id');
            question.should.have.property('question_body');
            question.should.have.property('question_date');
            question.should.have.property('asker_name');
            question.should.have.property('question_helpfulness');
            question.should.have.property('reported');
            question.should.have.property('answers');
          }
          done();
        });
      });
    });
  });
});