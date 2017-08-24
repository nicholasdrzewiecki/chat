var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var session = require("express-session");
var MongoStore = require("connect-mongo")(session);
var app = express();
var port = process.env.PORT || 3000;
var server = require("http").Server(app);
var io = require("socket.io")(server);

// Mongoose connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/chat");
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));

// Session middleware
app.use(session({
  secret: "secret",
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection: db})
}));

// Make user id available in templates
app.use(function(request, response, next) {
  response.locals.loggedIn = request.session.userId;
  next();
});

// Parse requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Serve static files
app.use(express.static(__dirname + "/public"));

// View engine
app.set("view engine", "pug");
app.set("views", __dirname + "/views"); // Where to find pug templates

// Routes
var routes = require("./routes/index");
app.use("/", routes);

// 404
app.use(function(request, response, next) {
  var error = new Error("File Not Found");
  error.status = 404;
  next(error);
});

// Error handler
app.use(function(error, request, response, next) {
  response.status(error.status || 500);
  response.render("error", {
    message: error.message,
    status: error.status,
    error: {}
  });
});

io.on("connection", function(socket) {
  socket.on('chat message', function(message) {
    console.log('message: ' + message);
    io.emit('chat message', message);
  });
});

// listen on port 3000
server.listen(port, function() {
  console.log("Listening on port: " + port);
});
