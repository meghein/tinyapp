const PORT = 8080;

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

// const cookieParser = require('cookie-parser'); // ===> REPLACED WITH cookie-session
// app.use(cookieParser());

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['raccoon', 'party'],
}));

const bcrypt = require('bcrypt');
const saltRounds = 10; //for bcrypt


app.set('view engine', 'ejs');

///////////////////////////////////////////////

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
    return user;
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
  
  const userId = req.session['user_id'];
  const user = users[userId];
  const userDatabase = findUserUrls(userId);

  let templateVars = { urls: urlDatabase, userUrls: userDatabase, user };

  console.log('\n\n/urls userDb', userDatabase)
  console.log('\n\n/url user', user)
  console.log(userId)

  if (!user) {
    res.redirect('/login');

  } else {
    res.render('urls_index', templateVars);
  }

});

app.get('/urls/new', (req, res) => {
  const user = users[req.session['user_id']];

  let templateVars = { user };

  if (!user) {
    res.redirect('/login');

  } else {
    res.render('urls_new', templateVars);
  }

});

app.get('/register', (req, res) => {
  let templateVars = { user: users[req.session['user_id']] };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  let templateVars = { user: users[req.session['user_id']] };
  res.render('login', templateVars);
});

app.get('/404', (req, res) => {
  let templateVars = { user: users[req.session['user_id']] };
  res.render('404', templateVars);
});

app.get('/403', (req, res) => {
  let templateVars = { user: users[req.session['user_id']] };
  res.render('403', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const definedURL = findUrl(shortURL);
  const currentUser = users[req.session['user_id']];

  if (!definedURL) {
    
    res.redirect('/404');

  } else if (currentUser.id === urlDatabase[shortURL].userID && definedURL) {
    
    let templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      user: users[req.session['user_id']]
    };
    res.render('urls_show', templateVars);

  } else {
    
    res.status(400).send('This URL doesn\'t belong to you!');

  }
  
});

app.post('/urls', (req, res) => {
  const newLong = req.body.longURL;
  const newId = req.session['user_id'];
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
    req.session['user_id'] = addNewUser(email, password)
    console.log(users)

    res.redirect('/urls');

  } else {
    res.status(400).send('User is already registered!');
  }
  
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = authenticateUser(email, password);
  
  if (user) {
    req.session['user_id'] = user.id
    res.redirect('/urls');
    console.log("\n\nuser", user);
    console.log("\n\nuser.id", users.id)
  } else {
    res.status(403).send('Please enter valid email/password');
  }

});

app.post('/logout', (req, res) => {
  req.session = null;
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
  const currentUser = users[req.session['user_id']];

  if (currentUser.id === urlDatabase[shortURL].userID) {

    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');

  } else {

    res.status(400).send('This URL doesn\'t belong to you!');

  }
  
});

app.post('/urls/:shortURL/update', (req, res) => {

  const shortURL = req.params.shortURL;
  const currentUser = users[req.session['user_id']];

  if (currentUser.id === urlDatabase[shortURL].userID) {

    const updatedUrl = {longURL: req.body.longURL, userID: req.session['user_id']};
  
    urlDatabase[req.params.shortURL] = updatedUrl;

    res.redirect('/urls');

  } else {

    res.status(400).send('This URL doesn\'t belong to you!');

  }


});
