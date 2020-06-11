const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
const saltRounds = 10; //for bcrypt

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
// app.use(bcrypt());

app.set('view engine', 'ejs');

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
  'test123': {
    id: 'test123',
    email: 'tester@test.com',
    password: bcrypt.hashSync('test', saltRounds)
  }
};

const generateRandomString = () => {
  return Math.random().toString(36).substr(6);
};

const addNewUser = (email, password) => {

  const userID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, saltRounds);

  const newUser = {
    id: userID,
    email,
    password: hashedPassword,
  };

  users[userID] = newUser;

  return userID;
};

const addNewUrl = (longURL, userID) => {
  const shortURL = generateRandomString();

  const newUrl = {
    longURL: `http://${longURL}`,
    userID
  };

  urlDatabase[shortURL] = newUrl;

  return shortURL;
};

const findUserByEmail = email => {
  for (let userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
};

const authenticateUser = (email, password) => {

  const user = findUserByEmail(email);

  if (user && bcrypt.compareSync(password, user.password)) {
    return user.id;
  }
};

const findUrl = (shortURL) => {
  for (let url in urlDatabase) {
    if (url === shortURL) {
      return url;
    }
  }
};

const findUserUrls = (uniqueID) => {
  const userDatabase = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === uniqueID) {
      userDatabase[shortURL] = urlDatabase[shortURL];
    }
  }
  return userDatabase;
};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const user = users[req.cookies['user_ID']];
  const userDatabase = findUserUrls(req.cookies['user_ID']);

  let templateVars = { urls: urlDatabase, userUrls: userDatabase, user };

  if (!user) {
    res.redirect('/login');

  } else {
    res.render('urls_index', templateVars);
  }

});

app.get('/urls/new', (req, res) => {
  const user = users[req.cookies['user_ID']];

  let templateVars = { user };

  if (!user) {
    res.redirect('/login');

  } else {
    res.render('urls_new', templateVars);
  }

});

app.get('/register', (req, res) => {
  let templateVars = { user: users[req.cookies['user_ID']] };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  let templateVars = { user: users[req.cookies['user_ID']] };
  res.render('login', templateVars);
});

app.get('/404', (req, res) => {
  let templateVars = { user: users[req.cookies['user_ID']] };
  res.render('404', templateVars);
});

app.get('/403', (req, res) => {
  let templateVars = { user: users[req.cookies['user_ID']] };
  res.render('403', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const definedURL = findUrl(shortURL);
  const currentUser = users[req.cookies['user_ID']];

  if (!definedURL) {
    
    res.redirect('/404');

  } else if (currentUser.id === urlDatabase[shortURL].userID && definedURL) {
    
    let templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      user: users[req.cookies['user_ID']]
    };
    res.render('urls_show', templateVars);

  } else {
    
    res.status(400).send('This URL doesn\'t belong to you!');

  }
  
});

app.post('/urls', (req, res) => {
  const newLong = req.body.longURL;
  const newId = req.cookies['user_ID'];
  const newShort = addNewUrl(newLong, newId);
  
  res.redirect(`urls/${newShort}`);
});

app.post('/register', (req, res) => {

  const email = req.body.email;
  const password = req.body.password;

  const newUser = findUserByEmail(email);

  if (!email || !password) {
    res.status(400).send('Please enter a valid email/password');
  }
  if (!newUser) {
    res.cookie('user_ID', addNewUser(email, password));
    console.log(users)

    res.redirect('/urls');

  } else {
    res.status(400).send('User is already registered!');
  }
  
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const userId = authenticateUser(email, password);

  if (userId) {
    res.cookie('user_ID', userId);
    res.redirect('/urls');
  } else {
    res.status(403).send('Please enter valid email/password');
  }

});

app.post('/logout', (req, res) => {
  res.clearCookie('user_ID');
  res.redirect('/urls');
});


app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  
  if (longURL === undefined) {
    res.redirect('urls/404');
  } else {
    res.redirect(longURL);
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  
  const shortURL = req.params.shortURL;
  const currentUser = users[req.cookies['user_ID']];

  if (currentUser.id === urlDatabase[shortURL].userID) {

    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');

  } else {

    res.status(400).send('This URL doesn\'t belong to you!');

  }
  
});

app.post('/urls/:shortURL/update', (req, res) => {

  const shortURL = req.params.shortURL;
  const currentUser = users[req.cookies['user_ID']];

  if (currentUser.id === urlDatabase[shortURL].userID) {

    const updatedUrl = {longURL: req.body.longURL, userID: res.cookies['user_ID']};
  
    urlDatabase[req.params.shortURL] = updatedUrl;

    res.redirect('/urls');

  } else {

    res.status(400).send('This URL doesn\'t belong to you!');

  }


});
