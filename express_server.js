const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')

function generateRandomString() {
  const chars = '0123456789abcdefghiklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXTZ';
  let str = '';
  for (let i = 0; i < 6; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

app.set("view engine", "ejs");

function getUserByEmail (email) {
  for (const userId in users) {
  if (users[userId].email === email) {
    return users[userId] 
  }
}
return null
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]]
  const templateVars = { 
    user,
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]]
  const templateVars = { 
    user,
    urls: urlDatabase };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  console.log(req.cookies)
  const user = users[req.cookies["user_id"]]
  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const newShortUrl = generateRandomString();
  urlDatabase[newShortUrl] = req.body.longURL;
  res.redirect("/urls/" + newShortUrl); 
});

app.get("/u/:id", (req, res) => {

  res.redirect(urlDatabase[req.params.id]);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id
  delete urlDatabase[id]
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id
  urlDatabase[id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const {email, password } = req.body;
  const user = getUserByEmail(email)
  if (!user) {
    return res.status(403).send("Email is incorrect");
  }
  if (user && password !== user.password) {
    return res.status(403).send("Password is incorrect");
  }
  else {
  res.cookie("user_id", user.id)
  res.redirect("/urls");
}});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const {email, password } = req.body;
  if (getUserByEmail(email)) {
    return res.status(400).send("Email or password are in use");
  }
   if (!email || !password) {
    return res.status(400).send("Email and password are required fields.");  
  }
  else {
  const newId = generateRandomString();
  users[newId] = {
    id: newId,
    email: req.body.email,
    password: req.body.password
  }
    res.cookie("user_id", newId)
  res.redirect("/urls"); 
}});

app.get("/register", (req, res) => {
  res.render("user-registration");
})


app.get("/login", (req, res) => {
  res.render("login");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
