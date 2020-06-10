const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const generateRandomString = () => {
  return Math.random().toString(36).substr(6);
};

const addNewUser = (email, password) => {

  const userID = generateRandomString();

  const newUser = {
    id: userID,
    email,
    password,
  };

  users[userID] = newUser;

  return userID;
};

const findUserByEmail = email => {

  for (let userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_ID"]] };
  console.log(templateVars.user)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies["user_ID"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/register", (req, res) => {
  let templateVars = { user: users[req.cookies["user_ID"]] };
  res.render("urls_register", templateVars);
});

app.get("/u/urls/404", (req, res) => {
  let templateVars = { user: users[req.cookies["user_ID"]] };
  res.render("urls_404", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_ID"]]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const newShort = generateRandomString()
  console.log(req.body)
  const newLong = req.body.longURL
  urlDatabase[newShort] = 'http://' + newLong;
  res.redirect(`urls/${newShort}`);
});

app.post("/login", (req, res) => {
  // const username = req.body.username
  // res.cookie("username", username)
  // res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_ID")
  res.redirect("/urls")
})

app.post("/urls/register", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;

  const newUser = findUserByEmail(email);
  if (!email || !password) {
    res.status(400).send('Please enter a valid email/password')
  }
  if (!newUser) {
    res.cookie('user_ID', addNewUser(email, password));
    console.log('user_ID')
    console.log(users)
    res.redirect('/urls');

  } else {
    res.status(400).send('User is already registered!');
  }

  console.log(users)
  
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL === undefined) {
    res.redirect('urls/404')
  } else {
    res.redirect(longURL);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})

app.post("/urls/:shortURL/update", (req, res) => {
  const newURL = req.body.longURL
  const shortURL = req.params.shortURL
  urlDatabase[shortURL] = 'http://' + newURL
  res.redirect("/urls")
})
