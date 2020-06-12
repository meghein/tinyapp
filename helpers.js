const { bcrypt, saltRounds } = require('./databaseObjects');

const generateRandomString = () => {
  return Math.random().toString(36).substr(6);
};

const addNewUser = (email, password, users) => {

  if (email && password && users) {
    const userID = generateRandomString();
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const newUser = {
      id: userID,
      email,
      password: hashedPassword,
    };

    users[userID] = newUser;

    return userID;
   
  } else {
    return undefined;
  }
};

const addNewUrl = (longURL, userID, urlDatabase) => {
  
  if (longURL) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL, userID };
    return shortURL;
  } else {
    return undefined;
  }
  
};

const findUserByEmail = (email, users) => {
  for (let userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
};

const authenticateUser = (email, password, users) => {

  const user = findUserByEmail(email, users);

  if ((user && bcrypt.compareSync(password, user.password)) || (user && password === user.password)) {
    return user;
  }
};

const findUrl = (shortURL, urlDatabase) => {
  for (let url in urlDatabase) {
    if (url === shortURL) {
      return url;
    }
  }
};

const findUserUrls = (uniqueID, urlDatabase) => {
  const userDatabase = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === uniqueID) {
      userDatabase[shortURL] = urlDatabase[shortURL];
    }
  }
  return userDatabase;
};

module.exports = {
  addNewUrl,
  addNewUser,
  findUserByEmail,
  findUrl,
  findUserUrls,
  authenticateUser
};