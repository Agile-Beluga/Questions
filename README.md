# Shop.ly API - Questions & Answers

## Overview
The Shop.ly API is a back-end system for an e-commerce platform. It is designed for efficiency and scalability, with the ability to handle a high volume of traffic. It currently serves more than a million records related to product's questions and answers.

__Tech Stack:__ 
* Node.js
* Express
* Redis
* PostgreSQL
* Docker
* AWS
* Mocha/Chai

## Table of Contents
* [Endpoints](#endpoints)
* [Getting Started](#getting-started)

### Endpoints
#### Questions
__Get list of questions__
  `GET /qa/:product_id`

__Add a question__
  `POST /qa/:product_id`

__Mark question as helpful__
  `PUT /qa/question/:question_id/helpful`

__Report question__ 
  `PUT /qa/question/:question_id/report`

#### Answers
__Get list of answers__
  `GET /qa/:question_id/answers`

__Add an answer__
  `POST /qa/:question_id/answers`

__Mark answers as helpful__
  `PUT /qa/answer/:answer_id/helpful`

__Report answer__ 
  `PUT /qa/answer/:answer_id/report`

### Getting Started
