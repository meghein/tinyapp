const { assert } = require('chai');

const { addNewUrl, addNewUser, findUserByEmail, findUrl, findUserUrls, authenticateUser } = require('../helpers');
const { urlDatabase, users } = require('../databaseObjects');


describe('addNewUrl', () => {
  it('should return a newly generated shortURL', () => {
    const shortURL = addNewUrl('www.example.com', 'testID', urlDatabase);
    const expectedOutput = 'randomString';

    assert.isString(shortURL, expectedOutput);
  });

  it('should return undefined if a falsy value is passed in as longURL', () => {
    const shortURL = addNewUser(null, 'testID', urlDatabase);
    const expectedOutput = undefined;

    assert.equal(shortURL, expectedOutput);
  });

});

describe('addNewUser', () => {
  it('should return a newly generated userID', () => {
    const userID = addNewUser('test@test.com', 'testPassword', users);
    const expectedOutput = 'randomString';

    assert.isString(userID, expectedOutput);
  });

  it('should return undefined if a falsy value is passed in as an email', () => {
    const userID = addNewUser(null, 'testPassword', users);
    const expectedOutput = undefined;

    assert.equal(userID, expectedOutput);
  });

  it('should return undefined if a falsy value is passed in as a password', () => {
    const userID = addNewUser('test@test.com', undefined, users);
    const expectedOutput = undefined;

    assert.equal(userID, expectedOutput);
  });

});

describe('findUserByEmail', () => {
  it('should return the user associated to the email provided', () => {
    const user = findUserByEmail('mock@duck.com', users);
    const expectedOutput = users['mock'];

    assert.equal(user.email, expectedOutput.email);
  });

  it('should return undefined if an invalid email is provided', () => {
    const user = findUserByEmail('foo@foobar.com', users);
    const expectedOutput = undefined;

    assert.equal(user, expectedOutput);
  });
});

describe('findUrl', () => {
  it('should return the shortURL if it is in the database', () => {
    const url = findUrl('b2xVn2', urlDatabase);
    const expectedOutput = 'b2xVn2';

    assert.equal(url, expectedOutput);
  });

  it('should return undefined if the shortURL is not in the database', () => {
    const url = findUrl('foo', urlDatabase);
    const expectedOutput = undefined;

    assert.equal(url, expectedOutput);
  });
});

describe('findUserUrls', () => {
  it('should return an object with only the urls assosicated to the user', () => {
    const obj = findUserUrls('test123', urlDatabase);
    const expectedOutput = { '9sm5xK': { longURL: 'http://www.google.com', userID: 'test123' } };

    assert.deepEqual(obj, expectedOutput);
  });

  it('should return an empty object if the user has no urls in the database', () => {
    const obj = findUserUrls('foo', urlDatabase);
    const expectedOutput = {};

    assert.deepEqual(obj, expectedOutput);
  });
});

describe('authenticateUser', () => {
  it('should return a user if the email and password match', () => {
    const user = authenticateUser('mock@duck.com', 'duck', users);
    const expectedOutput = {
      id: 'mock',
      email: 'mock@duck.com',
      password: 'duck'
    };

    assert.deepEqual(user, expectedOutput);
  });

  it('should return undefined if the email and password do not match', () => {
    const user = authenticateUser('tester@test.com', 'duck', users);
    const expectedOutput = undefined;

    assert.equal(user, expectedOutput);
  });

  
});