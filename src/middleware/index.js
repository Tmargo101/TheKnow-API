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
// converted to HTTPS requests to ensure transport security if the NODE_ENV var is set to production
export const requiresSecure = (request, response, next) => {
  if (!process.env.NODE_ENV === 'production') {
    return next();
  }

  if (request.headers['x-forwarded-proto'] !== 'https') {
    return response.redirect(`https://${request.hostname}${request.url}`);
  }
  return next();
};
