// Include required packages
var express = require("express");
var mongodb = require("mongodb");

var path = require("path");
var bodyParser = require("body-parser");
var crypto = require("crypto");

// Intialize the express and mongodb package
var app = express();
var new_db = "mongodb://localhost:27017/signup_nodejs";

// Create the server and set the default routes
app
  .get("/", function (req, res) {
    res.set({
      "Access-Control-Allow-Origin": "*",
    });
    return res.redirect("/public/index.html");
  })
  .listen(3000);

console.log("Server listening at : 3000");
app.use("/public", express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

// Perform HMAC on password, use phone as key
var getHash = (pass, phone) => {
  var hmac = crypto.createHmac("sha512", phone);

  // pass the data to be hashed
  var data = hmac.update(pass);

  // create the hmac in the required format
  var gen_hmac = data.digest("hex");

  // print output
  console.log("hmac : " + gen_hmac);
  return gen_hmac;
};

// Receive request from the front and store in database
// Sign-up function starts
app.post("/sign_up", function (req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var pass = req.body.password;
  var phone = req.body.phone;
  var password = getHash(pass, phone);

  var data = {
    name,
    email,
    password,
    phone,
  };

  mongodb.MongoClient.connect(
    new_db,
    { useNewUrlParser: true },
    (error, client) => {
      if (error) throw error;

      console.log("Connected to database successfully");

      client
        .db("signup_nodejs")
        .collection("details")
        .insertOne(data, (err, collection) => {
          if (err) throw err;

          console.log("Record inserted successfully");

          console.log(collection);
        });
    }
  );

  console.log("DATA is " + JSON.stringify(data));
  res.set({
    "Access-Control-Allow-Origin": "*",
  });
  return res.redirect("/public/success.html");
});
