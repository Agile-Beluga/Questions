const chai = require('chai');
const chaiHTTP = require('chai-http');
const should = chai.should();
const server = require('../server/index.js');
const cache = require('../cache/commands.js');
const questions = require('../db/models/questions.js');
const answers = require('../db/models/answers.js');
const { deleteAllQuestions, deleteAllAnswers } = require('./helpers.js');

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
          res.should.have.status(400);
          done();
        });
    });
  });

  describe('GET /qa/:product_id', () => {

    it('should return an empty array when there are no questions', (done) => {
      const productId = 1;
      const route = `/qa/${productId}`;

      chai.request(server)
      .get(route)
      .end((err, res) => {
        const results = res.body.results;
        res.should.have.status(200);
        results.should.be.a('array');
        results.length.should.equal(0);
        cache.delete(route);
        done();
      });
    });

    it('should get all the questions of a product', (done) => {
      const productId = 1;
      const route = `/qa/${productId}`;
      const question = new Question('Alice', 'alice@test.com', 'This is a not a real question');
      
      questions.add(productId, question)
      .then(() => {
        chai.request(server)
        .get(route)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.results.length.should.equal(1);

          cache.delete(route);
          done();
        });
      });
    });

    it('should be formatted correctly', (done) => {
      const productId = 1;
      const route = `/qa/${productId}`;
      const question = new Question('John', 'john@test.com', 'This is a test!');

      questions.add(productId, question)
      .then(() => {
        chai.request(server)
        .get(route)
        .end((err, res) => {
          const response = res.body;
          response.should.be.a('object');
          response.should.have.property('product_id');
          response.should.have.property('results');

          const questions = res.body.results;
          questions.should.be.a('array');

          const question = questions[0];
          question.should.be.a('object');
          question.should.have.property('question_id');
          question.should.have.property('question_body');
          question.should.have.property('question_date');
          question.should.have.property('asker_name');
          question.should.have.property('question_helpfulness');
          question.should.have.property('reported');
          question.should.have.property('answers');
          question.answers.should.be.a('object');

          cache.delete(route);
          done();
        });
      });
    });
  });
});