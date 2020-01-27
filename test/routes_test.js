const chai = require('chai');
const chaiHTTP = require('chai-http');
const should = chai.should();
const server = require('../server/index.js');

chai.use(chaiHTTP);

describe('/GET Questions', () => {
  it('should GET all the questions of a product', () => {
    const productId = Math.round(Math.random() * 500);
    chai.request(server)
      .get(`/qa/${productId}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('product_id');
        res.body.should.have.property('results');
        res.body.results.should.be.a('array');
      })
  });
  it('should have all the required information', () => {
    const productId = Math.round(Math.random() * 500);
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
      })
  });
  it('should have all the answers for the questions', () => {
    const productId = Math.round(Math.random() * 500);
    chai.request(server)
      .get(`/qa/${productId}`)
  });
});