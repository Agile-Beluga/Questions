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

## Endpoints

### Questions

#### Get list of questions
  `GET /qa/:product_id`

#### Add a question
  `POST /qa/:product_id`

####  Mark question as helpful
  `PUT /qa/question/:question_id/helpful`

#### Report question
  `PUT /qa/question/:question_id/report`

### Answers

#### Get list of answers
  `GET /qa/:question_id/answers`

#### Add an answer
  `POST /qa/:question_id/answers`

#### Mark answers as helpful
  `PUT /qa/answer/:answer_id/helpful`

#### Report answer
  `PUT /qa/answer/:answer_id/report`

## Getting Started
