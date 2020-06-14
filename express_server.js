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

///////////////////////////////////////////////

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

app.get('/', (req, res) => {
  res.redirect('/urls');
});

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

app.get('/urls/new', (req, res) => {
  
  const user = users[req.session['userCookieID']];

  let templateVars = { user };

  if (!user) {
    res.redirect('/login');

  } else {
    res.render('urls_new', templateVars);
  }

});

app.get('/register', (req, res) => {
  let templateVars = { user: users[req.session['userCookieID']] };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  let templateVars = { user: users[req.session['userCookieID']] };
  res.render('login', templateVars);
});

app.get('/404', (req, res) => {
  let templateVars = { user: users[req.session['userCookieID']] };
  res.render('404', templateVars);
});

app.get('/403', (req, res) => {
  let templateVars = { user: users[req.session['userCookieID']] };
  res.render('403', templateVars);
});

app.get('/401', (req, res) => {
  let templateVars = { user: users[req.session['userCookieID']] };
  res.render('401', templateVars);
});

app.get('/400', (req, res) => {
  let templateVars = { user: users[req.session['userCookieID']] };
  res.render('400', templateVars);
});

app.get('/400/update', (req, res) => {
  let templateVars = { user: users[req.session['userCookieID']] };
  res.render('400-update', templateVars);
});

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

app.post('/urls', (req, res) => {
  const newId = req.session['userCookieID'];
  let newLong = req.body.longURL;

  if (!newLong || !newLong.includes('.')) {
    res.redirect('/400');

  }else if (!newLong.includes('http://www.' || 'https://www.')) {
    newLong = `https://www.${req.body.longURL}`;
    const newShort = addNewUrl(newLong, newId, urlDatabase);
    res.redirect(`/urls/${newShort}`);
  } else if (!newLong.includes('http://' || 'https://')) {
    newLong = `https://${req.body.longURL}`;
    const newShort = addNewUrl(newLong, newId, urlDatabase);
    res.redirect(`/urls/${newShort}`);
  };

});

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

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});


app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  
  if (longURL === undefined) {
    res.redirect('404');
  } else {
    res.redirect(longURL);
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  
  const shortURL = req.params.shortURL;
  const currentUser = users[req.session['userCookieID']];

  if (currentUser.id === urlDatabase[shortURL].userID) {

    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');

  } else {

    es.redirect('403');

  }
  
});

app.post('/urls/:shortURL/update', (req, res) => {

  const shortURL = req.params.shortURL;
  const currentUser = users[req.session['userCookieID']];
  let newLong = req.body.longURL;
  let updatedURL = {};


  if (currentUser.id === urlDatabase[shortURL].userID) {
    if (!newLong || !newLong.includes('.')) {
      res.redirect('/400/update');
    }else if (!newLong.includes('http://www.' || 'https://www.')) {
      newLong = `https://www.${req.body.longURL}`;
      updatedUrl = {longURL: newLong, userID: req.session['userCookieID']};
      
      
    } else if (!newLong.includes('http://' || 'https://')) {
      newLong = `https://${req.body.longURL}`;
      updatedUrl = {longURL: newLong, userID: req.session['userCookieID']};
      
    };
    
    urlDatabase[req.params.shortURL] = updatedUrl;
    res.redirect('/urls');

  } else {

    res.redirect('403');

  }


});
