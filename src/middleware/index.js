// Ensure a session for the user exists before completing their request
export const requiresLogin = (request, response, next) => {
  if (!request.session.account) {
    return response.redirect('/');
  }
  return next();
};

export const requiresLogout = (request, response, next) => {
  if (request.session.account) {
    return response.redirect('/');
  }
  return next();
};

// If this function is added to a router request, all http requests will be
// converted to HTTPS requests to ensure transport security.
const requiresSecure = (request, response, next) => {
  if (request.headers['x-forwarded-proto'] !== 'https') {
    return response.redirect(`https://${request.hostname}${request.url}`);
  }
  return next();
};

// Bypass https security for non-production environments
const bypassSecure = (request, response, next) => {
  next();
};

// Use HTTPS or bypass based on NODE_ENV variable
if (process.env.NODE_ENV === 'production') {
  module.exports.requiresSecure = requiresSecure;
} else {
  module.exports.requiresSecure = bypassSecure;
}
