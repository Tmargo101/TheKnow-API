import * as jwt from 'jsonwebtoken';

import * as Responses from '../utilities/Responses';
import * as Strings from '../Strings';

export const validateToken = async (request, response, next) => {
  const token = request.headers['x-access-token'];
  if (!token) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.NO_TOKEN_ERROR,
    );
    return;
  }

  try {
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
    request.userId = decodedToken.id;
  } catch (err) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.TOKEN_INVALID_ERROR,
    );
    return;
  }

  next();
};

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
