//users dataset
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
    hashedPassword: "$2a$10$EIe8tgmYghULtStk3D63puhe7wlU7DwX/1zAXoFpGyDJE5NEsKJ4C"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
    hashedPassword: "$2a$10$hD1N7Xfk298awjf3k0mWke2/twmVaB7rzUrJx.SH9eTl4/IY95B8u"
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

module.exports = {users, urlDatabase2}