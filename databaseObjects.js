const bcrypt = require('bcrypt');
const saltRounds = 10;

const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'colour'
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'test123'
  },
};

const users = {
  'colour': {
    id: 'colour',
    email: 'red@blue.com',
    password: bcrypt.hashSync('purple', saltRounds)
  },
  'mock': {
    id: 'mock',
    email: 'mock@duck.com',
    password: 'duck'
  },
  'test123': {
    id: 'test123',
    email: 'tester@test.com',
    password: bcrypt.hashSync('test', saltRounds)
  }
};

module.exports = { bcrypt, saltRounds, urlDatabase, users };