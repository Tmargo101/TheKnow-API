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

  request.session.account = Account.AccountModel.toAPI(account);

  // Respond with success message
  Responses.sendGenericSuccessResponse(
    response,
    Strings.RESPONSE_MESSAGE.LOGIN_SUCCESS,
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

  // Send success response
  Responses.sendGenericSuccessResponse(
    response,
    Strings.RESPONSE_MESSAGE.SIGNUP_SUCCESS,
  );
};

export const logout = (request, response) => {
  request.session.destroy();
  response.redirect('/');
};
