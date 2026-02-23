import * as jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import cryptoRandomString from 'crypto-random-string';
import fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

import * as Account from '../models/Account';
import * as Responses from '../utilities/Responses';
import * as Strings from '../Strings';

const createUserResponseObject = async (token) => {
  const userData = await Account.AccountModel.findByToken(token);
  const user = userData.toObject();
  // eslint-disable-next-line prefer-destructuring
  user.tokenCount = user.tokens[0];
  delete user.tokens;
  return user;
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7776000 * 1000,
};

const validateLogin = (request, response) => {
  if (!request.body.email || !request.body.password) {
    Responses.sendGenericErrorResponse(response, Strings.RESPONSE_MESSAGE.VALIDATION_FAILED);
    return false;
  }
  return true;
};

const passwordIsStrongEnough = (response, password) => {
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

const passwordsMatch = (request, response) => {
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

const validateSignup = (request, response) => {
  // Ensure all required data is present
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

  // Ensure passwords match
  if (!passwordsMatch(request, response)) {
    return false;
  }

  // Ensure password is strong enough
  if (!passwordIsStrongEnough(response, request.body.pass)) {
    return false;
  }

  // Valid signup data
  return true;
};

const validateChangePassword = (request, response) => {
  // Ensure all required data is present
  if (
    !request.body.oldPass
    || !request.body.newPass
    || !request.body.newPass2
  ) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.VALIDATION_FAILED,
    );
    return false;
  }

  // Ensure passwords match
  if (!passwordsMatch(request, response)) {
    return false;
  }

  // Ensure password is strong enough
  if (!passwordIsStrongEnough(response, request.body.newPass)) {
    return false;
  }

  // Valid password change data
  return true;
};

const validateForgotPassword = (request, response) => {
  if (!request.body.email) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.VALIDATION_FAILED,
    );
    return false;
  }
  // Valid forgotPassword data
  return true;
};

const createToken = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: 7776000, // Expires in 90 days
  });
  return token;
};

export const login = async (request, response) => {
  // Validate all params are present
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
  // console.log(account);

  const user = await createUserResponseObject(token);

  response.cookie('token', token, cookieOptions);

  // Respond with success message
  Responses.sendDataResponse(
    response,
    Strings.RESPONSE_MESSAGE.LOGIN_SUCCESS,
    { user },
  );
};

export const signup = async (request, response) => {
  // Validate all params are present
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

  response.cookie('token', token, cookieOptions);

  // Respond with success message
  Responses.sendDataResponse(
    response,
    Strings.RESPONSE_MESSAGE.SIGNUP_SUCCESS,
    { user },
  );
};

export const logout = async (request, response) => {
  // Decode token for User ID
  const token = request.cookies?.token || request.headers[Strings.HEADERS.TOKEN];
  const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
  const { id } = decodedToken;

  // Remove token from account
  const tokensRemoved = await Account.AccountModel.removeToken(id, token);
  response.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
  Responses.sendDataResponse(
    response,
    Strings.RESPONSE_MESSAGE.LOGOUT_SUCCESS,
    { removed: tokensRemoved },
  );
};

export const changePassword = async (request, response) => {
  const validParams = validateChangePassword(request, response);
  if (!validParams) { return; }

  const token = request.cookies?.token || request.headers['x-access-token'];
  const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

  const account = await Account.AccountModel.findOne({ _id: decodedToken.id }).exec();
  if (await Account.AccountModel.validatePassword(account, request.body.oldPass) === false) {
    // console.log(`oldPass incorrect for ${decodedToken.id}`);
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.PASSWORD_INCORRECT,
    );
    return;
  }
  const newPassword = `${request.body.newPass}`;

  // Generate salt & hash
  const newEncryptedPassword = await Account.AccountModel.generateHash(newPassword);

  account.password = newEncryptedPassword.hash;
  account.salt = newEncryptedPassword.salt;

  // Revoke all existing sessions, issue a fresh token
  const newToken = createToken(account._id);
  account.tokens = [newToken];

  try {
    await account.save();
  } catch (err) {
    if (err.code === 11000) {
      Responses.sendGenericErrorResponse(
        response,
        Strings.RESPONSE_MESSAGE.USERNAME_ALREADY_EXISTS,
      );
      return;
    }
  } // catch

  response.cookie('token', newToken, cookieOptions);

  // Respond with success message
  Responses.sendGenericSuccessResponse(
    response,
    Strings.RESPONSE_MESSAGE.CHANGE_PASSWORD_SUCCESS,
  );
};

export const forgotPassword = async (request, response) => {
  const validParams = validateForgotPassword(request, response);
  if (!validParams) return;

  // Find the account to reset the password for
  const account = await Account.AccountModel.findByEmail(request.body.email);
  if (account === null) {
    Responses.sendGenericSuccessResponse(
      response,
      Strings.RESPONSE_MESSAGE.FORGOT_PASSWORD_RESPONSE,
    );
    return;
  }

  // Reset the password for the account
  const tempPassword = cryptoRandomString(12);

  // Generate salt & hash
  const newEncryptedPassword = await Account.AccountModel.generateHash(tempPassword);

  account.password = newEncryptedPassword.hash;
  account.salt = newEncryptedPassword.salt;

  try {
    await account.save();
  } catch (err) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.NOT_SAVED,
    );
  } // catch
  const fullName = `${account.name.first} ${account.name.last}`;
  const filePath = path.join(__dirname, '../email-templates/forgot-password-email.hbs');
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);
  const replacements = {
    fullName,
    tempPassword,
  };
  const forgotPasswordHtml = template(replacements);

  // Send email with temp password
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_SERVER,
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  // Send mail
  const info = await transporter.sendMail({
    from: 'no-reply@langslow.site', // sender address
    to: request.body.email, // list of receivers
    subject: 'TheKnow - Forgot Password', // Subject line
    text: `Hello ${account.email},\nYour new temporary password is: ${tempPassword}\nUse this password to login to your account, then follow the steps to reset your password.\nBest,\nTheKnow Team`, // plain text body
    html: forgotPasswordHtml,
  });

  console.log('Message sent: %s', info.messageId);

  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

  // Respond with success message
  Responses.sendGenericSuccessResponse(
    response,
    Strings.RESPONSE_MESSAGE.FORGOT_PASSWORD_RESPONSE,
  );
};

export const validateToken = async (request, response) => {
  const token = request.cookies?.token || request.headers[Strings.HEADERS.TOKEN];
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
    // console.log(err);
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
  const token = request.cookies?.token || request.headers[Strings.HEADERS.TOKEN];
  if (!token) {
    Responses.sendGenericErrorResponse(response, Strings.RESPONSE_MESSAGE.NO_TOKEN_ERROR);
    return;
  }
  try {
    const user = await createUserResponseObject(token);
    Responses.sendDataResponse(response, Strings.RESPONSE_MESSAGE.TOKEN_AUTH_SUCCESS, { user });
  } catch (err) {
    Responses.sendBadTokenResponse(response, Strings.RESPONSE_MESSAGE.TOKEN_INVALID_ERROR);
  }
};
