//jshint esversion: 6

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const mongoose = require("mongoose");
const {User} = require("./models/user.js");
const {authenticate} = require("./models/authenticate.js");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');

mongoose.connect('mongodb+srv://admin-alex:test@cluster0-zntbd.mongodb.net/avalar_db?retryWrites=true', {
  useNewUrlParser: true,
  useCreateIndex: true
});


// Requests

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/browse", function(req, res) {
  res.render("browse");
});

app.get("/submit", function(req, res) {
  res.render("submit");
});

app.get("/community", function(req, res) {
  res.render("community");
});

app.post("/register", function(req, res) {
  let user = new User(req.body);
  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header("x-auth", token).send(user);
  }).catch((e) => {
    res.status(400).send(e.message);
  });
});

app.get("/users/me", authenticate, function(req, res) {
  console.log(req);
  res.send(req.user);
});


// Start app

app.listen(process.env.PORT || 3000, function() {
  console.log("Server is running on port 3000.");
});
