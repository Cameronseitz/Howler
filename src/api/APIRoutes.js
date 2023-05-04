const express = require('express');
const cookieParser = require('cookie-parser');
const apiRouter = express.Router();
const crypto = require('crypto');


// Comparison function to sort by datetime field reverse
// From https://stackoverflow.com/questions/40965727/sort-array-of-objects-with-date-field-by-date
function compareHowls(a, b) {
  const datetimeA = new Date(a.datetime);
  const datetimeB = new Date(b.datetime);
  return datetimeB - datetimeA;
}

//from lecture
function getFilteredUser(user) {
  return {
    "id": user.id,
    "first_name": user.first_name,
    "last_name": user.last_name,
    "username": user.username,
    "avatar": user.avatar
  }
}

const {TokenMiddleware, generateToken, removeToken} = require('../middleware/TokenMiddleware');

//last id for howls is 100 in data set
let currentHowlId = 101;

/************\
* API ROUTES *
\************/
let follows = require('../data/follows.json');
let howls = require('../data/howls.json');
let users = require('../data/users.json');

apiRouter.use(express.json());
apiRouter.use(cookieParser());

//Create a howl
apiRouter.post('/howls', TokenMiddleware, (req,  res) => {
  let howl = {};
  howl.id = currentHowlId++;
  howl.userId = req.user.id;

  // removing milliseconds from https://stackoverflow.com/questions/53033014/javascript-remove-milliseconds-from-date-object
  let currentDate = new Date();
  currentDate.setMilliseconds(0);
  howl.datetime = currentDate.toISOString().replace(".000Z", "Z");

  howl.text = req.body.message;
  howls.push(howl);
  res.json(howl);
});


//set the current user
apiRouter.post('/users/authenticated', (req,  res) => {
  let username = req.body.username;
  let password = req.body.password;
  let user = users.find(user => user.username == username);
  if (user) { // we found our user
    crypto.pbkdf2(password, user.salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) { //problem computing digest, like hash function not available
        res.status(400).json({error: err});
      }

      const digest = derivedKey.toString('hex');
      if (user.password == digest) {
        sanitized_user = getFilteredUser(user);
        let result = {
          user: sanitized_user
        }
  
        generateToken(req, res, sanitized_user);
  
        res.json(result);
      }
      else {
        res.status(401).json({error: "Invalid username or password"});
      }
    });
  }
  else { // if no user with provided username
    reject({code: 401, message: "No such user"});
  }
});

//current user signs out
apiRouter.post('/users/authenticated/signOut', (req, res) => {
  removeToken(req, res);

  res.json({success: true});
});

//get the current user
apiRouter.get('/users/authenticated', TokenMiddleware, (req,  res) => {
  res.json(req.user);
});

//get howls posted by all users followed by the authenticated user and their own
apiRouter.get('/users/authenticated/howls', TokenMiddleware, (req,  res) => {
  let following = follows[req.user.id].following; 
  if(following) {
    //get howls of people they follow
    let feed = howls.filter(howl => following.includes(howl.userId));
    //add their own howls
    let ownHowls = howls.filter(howl => req.user.id == howl.userId);
    feed = feed.concat(ownHowls);
    //sort by latest howls
    feed.sort(compareHowls);
    res.json(feed);
  }
  else {
    res.status(404).json({error: 'Howls of following not found'});
  }
});

//add the body's user to the authenticated user's following list
apiRouter.put('/users/authenticated/follow', TokenMiddleware, (req,  res) => {
  let userToFollow = req.body;
  let following = follows[req.user.id].following; 
  if(following) {
    if (!following.includes(userToFollow.id)) {
      following.push(userToFollow.id)
    }
    res.json(follows[req.user.id]);
  }
  else {
    res.status(404).json({error: "Following of current user not found"});
  }
});

//remove the body's user from the authenticated user's following list
apiRouter.put('/users/authenticated/unfollow', TokenMiddleware, (req,  res) => {
  let userToUnfollow = req.body;
  let following = follows[req.user.id].following; 
  if(following) {
    if (following.includes(userToUnfollow.id)) {
      let index = following.indexOf(userToUnfollow.id);
      following.splice(index, 1);
    }
    else {
      res.status(404).json({error: "Current user is not following that user"});
    }
    res.json(follows[req.user.id]);
  }
  else {
    res.status(404).json({error: "Following of current user not found"});
  }
});

//Get all users
apiRouter.get('/users', TokenMiddleware, (req,  res) => {
  res.json(users);
});

//Get specific user
apiRouter.get('/users/:userId', TokenMiddleware, (req,  res) => {
  const userId = req.params.userId;
  let user = users.find(user => user.id == userId);
  if(user) {
    res.json(user);
  }
  else {
    res.status(404).json({error: 'User not found'});
  }
});

//get the user, given the username
apiRouter.get('/users/username/:username', TokenMiddleware, (req,  res) => {
  let username = req.params.username;
  let user = users.find(user => user.username == username);
  if(user) {
    res.json(user);
  }
  else {
    res.status(404).json({error: 'User not found'});
  }
});

//Get specific user's howls
apiRouter.get('/users/:userId/howls', TokenMiddleware, (req,  res) => {
  const userId = req.params.userId;
  let howlsFound = howls.filter(howl => howl.userId == userId);
  if(howlsFound) {
    howlsFound.sort(compareHowls);
    res.json(howlsFound);
  }
  else {
    res.status(404).json({error: 'Howls not found'});
  }
});

//Get list of users followed by a specific user
apiRouter.get('/users/:userId/following', TokenMiddleware, (req,  res) => {
  const userId = req.params.userId;
  let following = follows[userId].following; 
  if(following) {
    res.json(following);
  }
  else {
    res.status(404).json({error: 'Users following not found'});
  }
});

module.exports = apiRouter;