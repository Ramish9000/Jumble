var passport = require("passport");
var User     = require('../models/user');
var secret   = require('../config/config').secret 
var jwt      = require('jsonwebtoken');

function register(req, res, next) {
  var localStrategy = passport.authenticate('local-signup', function(err, user, info) {
    if (err) return res.status(500).json({ message: 'Something went wrong!' });
    if (info) return res.status(401).json({ message: info.message });
    if (!user) return res.status(401).json({ message: 'User already exists!' });

    // User has authenticated so issue token 
    var token = jwt.sign(user, secret, { expiresIn: 60*60*24 });

    // Send back the token to the front-end to store
    return res.status(200).json({ 
      success: true,
      message: "Thank you for authenticating",
      token: token,
      user: user
    });
  });

  return localStrategy(req, res, next);
};

// function register(req, res, next) {
//   // Add your local-signup strategy here
//   var signupStrategy = passport.authenticate('local-signup');
//   //this is defined in config passport. to pass over the password to deal with the
//   //encryption of it.

//   // return signupStrategy(req, res);


//   // Create a new token using JWT - jwt.sign(user, secret, { expiresIn: 60*60*24 });

//   // if(user.authenticate(req.body.email)) {
//     var info = {
//       email: req.body.email,
//       password: req.body.password,
//     };
//     var token = jwt.sign(info, secret, { expiresIn: '30m'});
//   // Once you have signed up a user, return the token to the client with the user as JSON
//     res.status(200).json({ token: token, user: info});
//     return signupStrategy(req, res);


// }; 


// function login(req, res, next) {
//   User.findOne({
//     "local.email": req.body.email
//   }, function(err, user) {
//     if (err) return res.status(500).json(err);
//     if (!user) return res.status(403).json({ message: 'No user found.' });
//     if (!user.validPassword(req.body.password)) return res.status(403).json({ message: 'Authentication failed.' });

//     var token = jwt.sign(user, secret, { expiresIn: 60*60*24 });

//     return res.status(200).json({
//       success: true,
//       message: 'Welcome!',
//       token: token,
//       user: user
//     });
//   });
// };

function login(req, res, next) {
  // You need to search your database for a user with a "local.email" as the req.body.email

  User.findOne({ "local.email": req.body.email }, function(err, user) {
    if(err) return res.status(500).json({ message: "access denied"});
    if(!user) return res.status(403).json({message: "no user found"});
  
    if(!user.validPassword(req.body.password)) return res.status(403).json({message:"authentication failed"});


    var info = {
      email: req.body.email,
    };
    var token = jwt.sign(info, secret, { expiresIn: 60*60*24 });
    // Once you have signed up a user, return the token to the client with the user as JSON
      return res.status(200).json({ success: true, message: "Welcome!", token: token, user: user});
      // return loginStrategy(req, res);
  }); 
}

module.exports = {
  login: login,
  register: register
}