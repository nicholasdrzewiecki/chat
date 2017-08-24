var express = require("express");
var router = express.Router();
var middleware = require("../middleware");
var User = require("../models/user");

// GET /
router.get("/", function(request, response, next) {
  return response.render("index", {title: "Home"});
});

// Request info from client, response data from user, express onto next function after callback
router.get("/register", middleware.requiresLogout, function(request, response, next) {
  return response.render("register", {title: "Register"});
});

router.post("/register", function(request, response, next) {
  if (request.body.email && request.body.username && request.body.password && request.body.confirm) {
    if (request.body.password !== request.body.confirm) {
      var error = new Error("Passwords do not match");
      error.status = 400;
      return next(error);
    };

    var userData = {
      email: request.body.email,
      username: request.body.username,
      password: request.body.password
    };

    // Use schema"s "create" method to insert document into Mongo
    User.create(userData, function(error, user) {
      if (error) {
        return next(error)
      } else {
        request.session.userId = user._id;
        return response.redirect("/account");
      }
    });

  } else {
    var error = new Error("All fields required");
    error.status = 400; // Bad request, server not understood due to bad syntax
    return next(error);
  }
});

router.get("/login", middleware.requiresLogout, function(request, response, next) {
  return response.render("login", {title: "Login"});
});

router.post("/login", function(request, response, next) {
  if (request.body.email && request.body.password) {
    User.authenticate(request.body.email, request.body.password, function(error, user) {
      if (error || !user) {
        var error = new Error("Wrong email or password");
        error.status = 401;
        return next(error);
      } else {
        request.session.userId = user._id;
        return response.redirect("/account");
      }
    });
  } else {
    var error = new Error("Email and password are required");
    error.status = 401;
    next(error);
  }
});

router.get("/logout", function(request, response, next) {
  if (request.session) {
    request.session.destroy(function(error) {
      if (error) {
        return next(error);
      } else {
        return response.redirect("/")
      }
    })
  }
});

router.get("/account", middleware.requiresLogin, function(request, response, next) {
  User.findById(request.session.userId).exec(function(error, user) {
    if (error) {
      return next(error);
    } else {
      return response.render("account", {
        title: "Account",
        username: user.username,
        email: user.email
      })
    }
  });
});

router.get("/chat", middleware.requiresLogin, function(request, response, next) {
  User.find(function(error, result) {
    if (error) {
      return next(error);
    } else {
      return response.render("chat", {
        title: "Chat",
        users: result
      });
    }
  });
});

module.exports = router;
