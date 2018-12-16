//jshint esversion: 6

const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

let UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} is not a valid email"
    }
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true
  },
  pass: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.toJSON = function() {
  let user = this;
  let userObject = user.toObject();
  return _.pick(userObject, ["_id", "email"]);
};

UserSchema.methods.generateAuthToken = function() {
  let user = this;
  let access = 'auth';
  let token = jwt.sign({
    _id: user._id.toHexString(),
    access
  }, "test").toString();

  user.tokens = user.tokens.concat([{
    access,
    token
  }]);
  return user.save().then(() => {
    return token;
  });
};

UserSchema.statics.findByToken = function(token) {
  let User = this;
  let decoded;
  try {
    decoded = jwt.verify(token, 'test');
  } catch (e) {
    return Promise.reject();
  }
  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

UserSchema.pre('save', function(next) {
  let user = this;
  if (user.isModified("pass")){
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.pass, salt, (err, hash) => {
        user.pass = hash;
        next();
      });
    });
  } else {
    //next();
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = {User};
