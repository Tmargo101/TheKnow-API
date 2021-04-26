import * as jwt from 'jsonwebtoken';

import * as Account from '../models/Account';
import * as Responses from '../utilities/Responses';
import * as Strings from '../Strings';

const validateLogin = (request, response) => {
  if (!request.body.username || !request.body.password) {
    Responses.sendGenericErrorResponse(response, Strings.RESPONSE_MESSAGE.MISSING_REQUIRED_FIELDS);
    return false;
  }
  return true;
};

const validateSignup = (request, response) => {
  if (!request.body.username || !request.body.pass || !request.body.pass2) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.MISSING_REQUIRED_FIELDS,
    );
    return false;
  }

  if (request.body.pass !== request.body.pass2) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.PASSWORDS_DONT_MATCH,
    );
    return false;
  }
  // Valid signup data
  return true;
};

const createToken = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: 7776000, // Expires in 90 days
  });
  return token;
};

export const login = async (request, response) => {
  const validParams = validateLogin(request, response);
  if (!validParams) { return; }

  const username = `${request.body.username}`;
  const password = `${request.body.password}`;

  // Run authentication with the AccountModel
  const account = await Account.AccountModel.authenticate(username, password);

  if (account === null) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.WRONG_USERNAME_PASSWORD,
    );
    return;
  }

  // request.session.account = Account.AccountModel.toAPI(account);

  // Create JSON Web Token
  const token = createToken(account._id);

  // Save token to account's Tokens array
  account.tokens.push(token);
  await account.save();

  // Create Response object
  const responseObject = {
    token,
    id: account._id,
  };

  // Respond with success message
  Responses.sendDataResponse(
    response,
    Strings.RESPONSE_MESSAGE.LOGIN_SUCCESS,
    responseObject,
  );
};

export const signup = async (request, response) => {
  const validParams = validateSignup(request, response);
  if (!validParams) { return; }

  const newUsername = `${request.body.username}`;
  const newPassword = `${request.body.pass}`;

  // Generate salt & hash
  const encryptedPassword = await Account.AccountModel.generateHash(newPassword);

  // Create new account object
  const newAccountData = {
    username: newUsername,
    salt: encryptedPassword.salt,
    password: encryptedPassword.hash,
  };

  // convert account
  const newAccount = new Account.AccountModel(newAccountData);

  try {
    await newAccount.save();
  } catch (err) {
    if (err.code === 11000) {
      Responses.sendGenericErrorResponse(
        response,
        Strings.RESPONSE_MESSAGE.USERNAME_ALREADY_EXISTS,
      );
      return;
    }
  } // catch

  request.session.account = Account.AccountModel.toAPI(newAccount);

  // Generate new token
  const token = createToken(newAccount._id);

  newAccount.tokens.push(token);
  await newAccount.save();

  const responseObject = {
    token,
    id: newAccount._id,
  };

  // Respond with success message
  Responses.sendDataResponse(
    response,
    Strings.RESPONSE_MESSAGE.SIGNUP_SUCCESS,
    responseObject,
  );
};

export const logout = async (request, response) => {
  // Decode token for User ID
  const token = request.headers['x-access-token'];
  const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
  const { id } = decodedToken;

  // Remove token from
  const tokensRemoved = await Account.AccountModel.removeToken(id, token);
  Responses.sendDataResponse(
    response,
    Strings.RESPONSE_MESSAGE.LOGOUT_SUCCESSFUL,
    { removed: tokensRemoved },
  );
  // request.session.destroy();
  // response.redirect('/');
};
