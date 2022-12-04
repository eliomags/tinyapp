const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const helpers = require("./helpers.js")
const {users, urlDatabase2} = require("./Datasets.js")

app.set("view engine", "ejs");



//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["source", "zon", "marketplace"],

  maxAge: 24 * 60 * 60 * 1000
}))

//Landing page 
app.get("/", (req, res) => {
  res.send("Hello!");
});

//strigified urls dataset
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase2);
});

//Some Hello World page
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Get....rendering urls data set at the server side in a urls_index.ejs template 
app.get("/urls", (req, res) => {
  const ID = req.session["user_id"]
  const user = users[ID]
  const templateVars = { 
    user,
    urls: helpers.urlsForUser(ID, urlDatabase2)};
  res.render("urls_index", templateVars);
});

//Get...entering new URL into the urls_new.ejs template to get the short url...permission based (only for loggedin/registered users)***
app.get("/urls/new", (req, res) => {
  if (req.session["user_id"]) {
  const user = users[req.session["user_id"]]
  const templateVars = { 
    user,
    urls: urlDatabase2 };
  res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  }
});

//Get...for an individual url page in a urls_show.ejs template
// user can access only his/her urls
app.get("/urls/:id", (req, res) => {
  const ID = req.session["user_id"]
  const user = users[ID]
  if (!urlDatabase2[req.params.id]) {
    return res.status(404).send("This id doesn't exist")
  } 
  else if (urlDatabase2[req.params.id].userID !== ID) {
    return res.status(401).send("You are not authorized to access this URL")
  } 
  else {
  const templateVars = {
    user,
    id: req.params.id,
    longURL: helpers.urlsForUser(ID, urlDatabase2)[req.params.id].longURL,
  };
  res.render("urls_show", templateVars);
}
});

//Post....assigning randomized short URL to the submitted long URL...permission based (only for loggedin/registered users)***
app.post("/urls", (req, res) => {
if (req.session["user_id"]) {
  const newShortUrl = helpers.generateRandomString();
  urlDatabase2[newShortUrl] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"]
  };
  res.redirect("/urls/" + newShortUrl);
  } else {
      res.send("Error: Only for Registered and Loggedin users \n");
    res.redirect("/login")
  } 
});

//Get...to see long url by clicking to short url...limiting access to only existing short urls in dataset
app.get("/u/:id", (req, res) => {
  const shortId = req.params.id
  if (!urlDatabase2[shortId]) {
    return res.send("Error: ID not found");
  } else {
  res.redirect(urlDatabase[req.params.id].longURL)
  };
});

//Post....to delete one of the data points from urls dataset
// users can delete only urls from their dataset
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id
  const ID = req.session["user_id"]
  if (!req.session["user_id"]) {
    return res.status(401).send("Please login or register to access resource")
  }
  else if (!urlDatabase2[req.params.id]) {
    return res.status(404).send("This id doesn't exist")
  } 
  else if (urlDatabase2[req.params.id].userID !== ID) {
    return res.status(401).send("You are not authorized to access and delete this URL")
  } 
  else {
  delete helpers.urlsForUser(ID, urlDatabase2)[id]
  res.redirect("/urls");
}
});

//Post...to update data point with new long url
//Only authorized users can update url
app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id
  if (!req.session["user_id"]) {
    return res.status(401).send("Please login or register to access resource")
  }
  else if (!urlDatabase2[id]) {
    return res.status(404).send("This id doesn't exist")
  } 
  else if (urlDatabase2[id].userID !== ID) {
    return res.status(401).send("You are not authorized to access and delete this URL")
  } 
  else {
  urlDatabase2[id].longURL = req.body.longURL;
  res.redirect("/urls");
  }
});

//Post...submitting login request and checking if email exists, password is correct 
app.post("/login", (req, res) => {
  const {email, password } = req.body;
  const user = helpers.getUserByEmail(email, users)
  if (!user) {
    return res.status(403).send("Email is incorrect");
  }
  if (user && !bcrypt.compareSync(password, user.hashedPassword)) {
    return res.status(403).send("Password is incorrect");
  }
  else {
  req.session["user_id"] = user.id;
  res.redirect("/urls");
}});

//Post...submitting logout request and clrearing user_id cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//Post...submitting registration form and checking if user already exists
app.post("/register", (req, res) => {
  const {email, password } = req.body;
  if (helpers.getUserByEmail(email, users)) {
    return res.status(400).send("Email is in use");
  }
   if (!email || !password) {
    return res.status(400).send("Email and password are required fields.");  
  }
  else {
  const newId = helpers.generateRandomString();
  users[newId] = {
    id: newId,
    email: req.body.email,
    hashedPassword: bcrypt.hashSync(req.body.password, 10) // hashing password
  }
  req.session["user_id"] = newId;
  res.redirect("/urls"); 
  console.log(users)
}});

//Get to open Registration form...redirects to /urls if user signed in
app.get("/register", (req, res) => {
  if (req.session["user_id"]) {
    res.redirect("/urls")
  } else {
  const user = users[req.session["user_id"]]
  const templateVars = {
    user
  };
  res.render("user-registration", templateVars);
  }
});

//Get to open login page..redirects to /urls if user signed in
app.get("/login", (req, res) => {
  if (req.session["user_id"]) {
    res.redirect("/urls")
  } else {
  const user = users[req.session["user_id"]]
  const templateVars = {
    user
  };
  res.render("login", templateVars);
}
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
