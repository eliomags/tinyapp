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

// helper function to find user by email
function getUserByEmail (email) {
  for (const userId in users) {
  if (users[userId].email === email) {
    return users[userId] 
  }
}
return null
};

// helper function to filter url dataset by user id 
function urlsForUser(id) {
  const filteredKeys = {};
  for (let key in urlDatabase2) {
    if (urlDatabase2[key].userID === id) {
      filteredKeys[key] = urlDatabase2[key]
    }
  }
  return filteredKeys;
}

//users dataset
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

//urls Old dataset
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
// urls New Dataset Structure with id as a key to an object
const urlDatabase2 = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "user2RandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

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
  const ID = req.cookies["user_id"]
  const user = users[req.cookies["user_id"]]
  console.log(urlsForUser(ID))
  const templateVars = { 
    user,
    urls: urlsForUser(ID)};
  res.render("urls_index", templateVars);
});

//Get...entering new URL into the urls_new.ejs template to get the short url...permission based (only for loggedin/registered users)***
app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
  const user = users[req.cookies["user_id"]]
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
  const ID = req.cookies["user_id"]
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
    longURL: urlsForUser(ID)[req.params.id].longURL,
  };
  res.render("urls_show", templateVars);
}
});

//Post....assigning randomized short URL to the submitted long URL...permission based (only for loggedin/registered users)***
app.post("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
  const newShortUrl = generateRandomString();
  urlDatabase2[newShortUrl] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
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
  const ID = req.cookies["user_id"]
  if (!req.cookies["user_id"]) {
    return res.status(401).send("Please login or register to access resource")
  }
  else if (!urlDatabase2[req.params.id]) {
    return res.status(404).send("This id doesn't exist")
  } 
  else if (urlDatabase2[req.params.id].userID !== ID) {
    return res.status(401).send("You are not authorized to access and delete this URL")
  } 
  else {
  delete urlsForUser(ID)[id]
  res.redirect("/urls");
}
});

//Post...to update data point with new long url
//Only authorized users can update url
app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id
  if (!req.cookies["user_id"]) {
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

//Post...submitting logout request and clrearing user_id cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/login");
});

//Post...submitting registration form and checking if user already exists
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

//Get to open Registration form...redirects to /urls if user signed in
app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls")
  } else {
  const user = users[req.cookies["user_id"]]
  const templateVars = {
    user
  };
  res.render("user-registration", templateVars);
  }
})

//Get to open login page..redirects to /urls if user signed in
app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls")
  } else {
  const user = users[req.cookies["user_id"]]
  const templateVars = {
    user
  };
  res.render("login", templateVars);
}
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
