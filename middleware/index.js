function requiresLogout(request, response, next) {
  if (request.session && request.session.userId) {
    response.redirect('/user');
  }
  return next();
}

function requiresLogin(request, response, next) {
  if (request.session && request.session.userId) {
    return next();
  } else {
    var error = new Error("You must be logged in to view this page");
    error.status = 401;
    return next(error);
  }
}

module.exports.requiresLogout = requiresLogout;

module.exports.requiresLogin = requiresLogin;
