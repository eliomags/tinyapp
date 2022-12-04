// helper function to find user by email
function getUserByEmail (email, database) {
  for (const userId in database) {
  if (database[userId].email === email) {
    return database[userId];
  }
}
return undefined
};

// helper to generate randon strings for new short URLS and New Users registration
function generateRandomString() {
  const chars = '0123456789abcdefghiklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXTZ';
  let str = '';
  for (let i = 0; i < 6; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
};

// helper function to filter url dataset by user id 
function urlsForUser(id, urlsData) {
  const filteredKeys = {};
  for (let key in urlsData) {
    if (urlsData[key].userID === id) {
      filteredKeys[key] = urlsData[key]
    }
  }
  return filteredKeys;
}

module.exports = {getUserByEmail, generateRandomString, urlsForUser};