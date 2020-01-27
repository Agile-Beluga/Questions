process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHTTP = require('chai-http');
const should = chai.should();
const server = require('../server/index.js');

chai.use(chaiHTTP);

describe('/GET Questions', () => {
  it('should GET all the questions', () => {
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
});