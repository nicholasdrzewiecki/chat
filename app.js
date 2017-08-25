var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var session = require("express-session");
var MongoStore = require("connect-mongo")(session);
var app = express();
var port = process.env.PORT || 3000;
var server = require("http").Server(app);
var io = require("socket.io")(server);

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/chat");
var database = mongoose.connection;
database.on("error", console.error.bind(console, "connection error"));

app.use(session({
  secret: "qwerty",
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection: database})
}));

app.use(function(request, response, next) {
  response.locals.loggedIn = request.session.userId;
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(__dirname + "/public"));

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

var routes = require("./routes/index")(io);
app.use("/", routes);

app.use(function(request, response, next) {
  var error = new Error("File Not Found");
  error.status = 404;
  next(error);
});

app.use(function(error, request, response, next) {
  response.status(error.status || 500);
  response.render("error", {
    message: error.message,
    status: error.status,
    error: {}
  });
});

server.listen(port, function() {
  console.log("Listening on port: " + port);
});
