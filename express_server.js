const PORT = 8080;

const { addNewUrl, addNewUser, findUserByEmail, findUrl, findUserUrls, authenticateUser } = require('./helpers');
const { urlDatabase, users } = require('./databaseObjects');

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['raccoon', 'party'],
}));

app.set('view engine', 'ejs');

////////////////////////////////////////////////////////////////////

// Homepage redirect to '/urls'
app.get('/', (req, res) => {
  res.redirect('/urls');
});

// Homepage render if client is logged in, else redirect to login page
app.get('/urls', (req, res) => {
  const userId = req.session['userCookieID'];
  const user = users[userId];
  const userDatabase = findUserUrls(userId, urlDatabase);
  let templateVars = { urls: urlDatabase, userUrls: userDatabase, user };
  if (!user) {
    res.redirect('/login');
  } else {
    res.render('urls_index', templateVars);
  }
});

// Page to create a new tiny url render if client is logged in, else redirect to login page
app.get('/urls/new', (req, res) => {
  const user = users[req.session['userCookieID']];
  let templateVars = { user };
  if (!user) {
    res.redirect('/login');
  } else {
    res.render('urls_new', templateVars);
  }
});

//Login page render
app.get('/login', (req, res) => {
  let templateVars = { user: users[req.session['userCookieID']] };
  res.render('login', templateVars);
});

// Post request for client login page
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = authenticateUser(email, password, users);
  if (user) {
    req.session['userCookieID'] = user.id;
    res.redirect('/urls');
  } else {
    res.redirect('401');
  }
});

// Post request to log out client, clear all cookies and redirect to login page
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// Register page render
app.get('/register', (req, res) => {
  let templateVars = { user: users[req.session['userCookieID']] };
  res.render('register', templateVars);
});

// Post request for new client register page
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const newUser = findUserByEmail(email, users);
  if (!email || !password) {
    res.redirect('401');
  }
  if (!newUser) {
    req.session['userCookieID'] = addNewUser(email, password, users);
    res.redirect('/urls');
  } else {
    res.redirect('401');
  }
});

// 400 client error redirect pages for invalid new url entry
app.get('/400', (req, res) => {
  let templateVars = { user: users[req.session['userCookieID']] };
  res.status(400).render('400', templateVars);

});

// 400 client error redirect pages for invalid url entry update
app.get('/400/update', (req, res) => {
  let templateVars = { user: users[req.session['userCookieID']] };
  res.status(400).render('400-update', templateVars);
});

// 401 client error redirect pages for invalid client authentication
app.get('/401', (req, res) => {
  let templateVars = { user: users[req.session['userCookieID']] };
  res.status(401).render('401', templateVars);
});

// 403 client error redirect pages for denied access to a tiny url (wrong client credentials)
app.get('/403', (req, res) => {
  let templateVars = { user: users[req.session['userCookieID']] };
  res.status(403).render('403', templateVars);
});

// 404 client error redirect pages for non-existing page
app.get('/404', (req, res) => {
  let templateVars = { user: users[req.session['userCookieID']] };
  res.status(404).render('404', templateVars);
});

// Unique Tiny URL page render if valid url and correct client is logged in,
// else - redirect to  404 error page for invalid url or 403 error page for invalid client
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const definedURL = findUrl(shortURL, urlDatabase);
  const currentUser = users[req.session['userCookieID']];
  if (!definedURL) {
    res.redirect('/404');
  } else if (currentUser.id === urlDatabase[shortURL].userID && definedURL) {
    let templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      user: users[req.session['userCookieID']]
    };
    res.render('urls_show', templateVars);
  } else {
    res.redirect('403');
  }
});

// Post a new Tiny url if client is logged in, append url with correct http prefix if not provided by client,
// else - redirect to  404 error page for invalid url or 403 error page for invalid client
app.post('/urls', (req, res) => {
  const newId = req.session['userCookieID'];
  let newLong = req.body.longURL;
  let newShort = {};
  if (Object.keys(users).includes(newId)) {
    if (!newLong || !newLong.includes('.')) {
      res.redirect('/400');
    } else if (newLong.includes('http://') || newLong.includes('https://')) {
      newShort = addNewUrl(newLong, newId, urlDatabase);
    } else if (!newLong.includes('www.')) {
      newLong = `https://www.${newLong}`;
      newShort = addNewUrl(newLong, newId, urlDatabase);
    } else {
      newLong = `https://${newLong}`;
      newShort = addNewUrl(newLong, newId, urlDatabase);
    }
    res.redirect(`/urls/${newShort}`);
  } else {
    res.redirect('/403');
  }
});

// Update a Tiny url from the database if client is logged in, append url with correct http prefix if not provided by client,
// else - redirect to  404 error page for invalid url or 403 error page for invalid client
app.post('/urls/:shortURL/update', (req, res) => {
  const shortURL = req.params.shortURL;
  const currentUser = users[req.session['userCookieID']];
  let newLong = req.body.longURL;
  if (currentUser.id === urlDatabase[shortURL].userID) {
    if (!newLong || !newLong.includes('.')) {
      res.redirect('/400');
    } else if (newLong.includes('http://') || newLong.includes('https://')) {
      urlDatabase[shortURL].longURL = newLong;
    } else if (!newLong.includes('www.')) {
      newLong = `https://www.${newLong}`;
      urlDatabase[shortURL].longURL = newLong;
    } else {
      newLong = `https://${newLong}`;
      urlDatabase[shortURL].longURL = newLong;
    }
    res.redirect('/urls');
  } else {
    res.redirect('403');
  }
});

// Delete a Tiny url from database if correct client is logged in,
// else - redirect to 403 error page for invalid client
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const currentUser = users[req.session['userCookieID']];
  if (currentUser.id === urlDatabase[shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('403');
  }
});

////////////////////////////////////////////////////////////////////

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
