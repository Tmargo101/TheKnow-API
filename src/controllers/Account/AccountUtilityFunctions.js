import * as Account from '../../models/Account';
import * as jwt from 'jsonwebtoken';
import * as Responses from '../../utilities/Responses';
import * as Strings from '../../Strings';

/**
 * AccountController Utility Methods
 */

export const createToken = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: 7776000, // Expires in 90 days
  });
  return token;
};

export const createUserResponseObject = async (token) => {
  const userData = await Account.AccountModel.findByToken(token);
  const user = userData.toObject();
  user.token = token;
  // eslint-disable-next-line prefer-destructuring
  user.tokenCount = user.tokens[0];
  delete user.tokens;
  return user;
};

export const passwordsMatch = (request, response) => {
  // Get password from request object
  const pass = request.body.pass || request.body.newPass;
  const pass2 = request.body.pass2 || request.body.newPass2;

  // Check if the passwords match
  if (pass !== pass2) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.PASSWORDS_DONT_MATCH,
    );
    return false;
  }

  // Passwords match
  return true;
};

export const passwordIsStrongEnough = (response, password) => {
  // Ensure password meets complexity requirements
  if (
    password.length < 8
  ) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.PASSWORD_NOT_STRONG_ENOUGH,
    );
    return false;
  }

  // Password is strong enough
  return true;
};

