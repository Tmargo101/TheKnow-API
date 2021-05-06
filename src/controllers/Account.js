import * as jwt from 'jsonwebtoken';

import * as Account from '../models/Account';
import * as Responses from '../utilities/Responses';
import * as Strings from '../Strings';

const createUserResponseObject = async (token) => {
  const userData = await Account.AccountModel.findByToken(token);
  const user = userData.toObject();
  user.token = token;
  // eslint-disable-next-line prefer-destructuring
  user.tokenCount = user.tokens[0];
  delete user.tokens;
  return user;
};

const validateLogin = (request, response) => {
  if (!request.body.email || !request.body.password) {
    Responses.sendGenericErrorResponse(response, Strings.RESPONSE_MESSAGE.VALIDATION_FAILED);
    return false;
  }
  return true;
};

const validateSignup = (request, response) => {
  if (
    !request.body.email
    || !request.body.firstname
    || !request.body.lastname
    || !request.body.pass
    || !request.body.pass2
  ) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.VALIDATION_FAILED,
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

  const email = `${request.body.email}`;
  const password = `${request.body.password}`;

  // Run authentication with the AccountModel
  const account = await Account.AccountModel.authenticate(email, password);

  if (account === null) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.WRONG_USERNAME_PASSWORD,
    );
    return;
  }

  // Create JSON Web Token
  const token = createToken(account._id);

  // Save token to account's Tokens array
  account.tokens.push(token);
  await account.save();
  console.log(account);

  const user = await createUserResponseObject(token);

  // Respond with success message
  Responses.sendDataResponse(
    response,
    Strings.RESPONSE_MESSAGE.LOGIN_SUCCESS,
    { user },
  );
};

export const signup = async (request, response) => {
  const validParams = validateSignup(request, response);
  if (!validParams) { return; }

  const newPassword = `${request.body.pass}`;

  // Generate salt & hash
  const encryptedPassword = await Account.AccountModel.generateHash(newPassword);

  // Create new account object
  const newAccountData = {
    email: request.body.email,
    name: {
      first: request.body.firstname,
      last: request.body.lastname,
    },
    password: encryptedPassword.hash,
    salt: encryptedPassword.salt,
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

  // Generate new token
  const token = createToken(newAccount._id);

  newAccount.tokens.push(token);
  await newAccount.save();

  const user = await createUserResponseObject(token);
  // const user = {
  //   token,
  //   id: newAccount._id,
  // };

  // Respond with success message
  Responses.sendDataResponse(
    response,
    Strings.RESPONSE_MESSAGE.SIGNUP_SUCCESS,
    { user },
  );
};

export const logout = async (request, response) => {
  // Decode token for User ID
  const token = request.headers[Strings.HEADERS.TOKEN];
  const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
  const { id } = decodedToken;

  // Remove token from
  const tokensRemoved = await Account.AccountModel.removeToken(id, token);
  Responses.sendDataResponse(
    response,
    Strings.RESPONSE_MESSAGE.LOGOUT_SUCCESS,
    { removed: tokensRemoved },
  );
  // request.session.destroy();
  // response.redirect('/');
};

export const validateToken = async (request, response) => {
  const token = request.headers[Strings.HEADERS.TOKEN];
  if (!token) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.NO_TOKEN_ERROR,
    );
    return;
  }

  try {
    // Decode the JWT & check if it's assocated with a user in the database
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
    const idAssociatedWithToken = await Account.AccountModel.verifyToken(token);

    // If the token was associated with the user,
    // and the associated user matches the JWT's userID, continue
    if (idAssociatedWithToken === 0 || idAssociatedWithToken !== decodedToken.id) {
      Responses.sendBadTokenResponse(
        response,
        Strings.RESPONSE_MESSAGE.TOKEN_INVALID_ERROR,
      );
      return;
    }
    request.userId = decodedToken.id;

    // If the token wasn't associated with a user account, send an error response
  } catch (err) {
    console.log(err);
    Responses.sendBadTokenResponse(
      response,
      Strings.RESPONSE_MESSAGE.TOKEN_INVALID_ERROR,
    );
    return;
  }
  Responses.sendGenericSuccessResponse(
    response,
    Strings.RESPONSE_MESSAGE.TOKEN_AUTH_SUCCESS,
  );
};

export const getUser = async (request, response) => {
  const token = request.headers[Strings.HEADERS.TOKEN];
  if (!token) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.NO_TOKEN_ERROR,
    );
    return;
  }

  try {
    // Decode the JWT & check if it's assocated with a user in the database
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
    const idAssociatedWithToken = await Account.AccountModel.verifyToken(token);

    // If the token was associated with the user,
    // and the associated user matches the JWT's userID, continue
    if (idAssociatedWithToken === 0 || idAssociatedWithToken !== decodedToken.id) {
      Responses.sendBadTokenResponse(
        response,
        Strings.RESPONSE_MESSAGE.TOKEN_INVALID_ERROR,
      );
      return;
    }
    request.userId = decodedToken.id;

    const user = await createUserResponseObject(token);

    Responses.sendDataResponse(
      response,
      Strings.RESPONSE_MESSAGE.TOKEN_AUTH_SUCCESS,
      { user },
    );

    // If the token wasn't associated with a user account, send an error response
  } catch (err) {
    console.log(err);
    Responses.sendBadTokenResponse(
      response,
      Strings.RESPONSE_MESSAGE.TOKEN_INVALID_ERROR,
    );
    // return;
  }
};
