import * as jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import cryptoRandomString from 'crypto-random-string';
import fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

import * as Validators from './validators/AccountValidators';
import * as Utilities from './shared/AccountUtilityFunctions';

import * as Account from '../models/Account';
import * as Responses from '../utilities/Responses';
import * as Strings from '../Strings';

/**
 * Account API Response Methods
 */

/**
 * Handle requests to the /login endpoint
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
export const login = async (request, response) => {
  // Validate all params are present
  const validParams = Validators.validateLogin(request, response);
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
  const token = Utilities.createToken(account._id);

  // Save token to account's Tokens array
  account.tokens.push(token);
  await account.save();
  // console.log(account);

  const user = await Utilities.createUserResponseObject(token);

  // Respond with success message
  Responses.sendDataResponse(
    response,
    Strings.RESPONSE_MESSAGE.LOGIN_SUCCESS,
    { user },
  );
};

/**
 * Handle requests to the /signup endpoint
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
export const signup = async (request, response) => {
  // Validate all params are present
  const validParams = Validators.validateSignup(request, response);
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
  const token = Utilities.createToken(newAccount._id);

  newAccount.tokens.push(token);
  await newAccount.save();

  const user = await Utilities.createUserResponseObject(token);

  // Respond with success message
  Responses.sendDataResponse(
    response,
    Strings.RESPONSE_MESSAGE.SIGNUP_SUCCESS,
    { user },
  );
};

/**
 * Handle requests to the /logout endpoint
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
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

/**
 * Handle requests to the /changePassword endpoint
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
export const changePassword = async (request, response) => {
  const validParams = Validators.validateChangePassword(request, response);
  if (!validParams) { return; }

  const token = request.headers['x-access-token'];
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

  // Respond with success message
  Responses.sendGenericSuccessResponse(
    response,
    Strings.RESPONSE_MESSAGE.CHANGE_PASSWORD_SUCCESS,
  );
};

/**
 * Handle requests to the /forgotPassword endpoint
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
export const forgotPassword = async (request, response) => {
  const validParams = Validators.validateForgotPassword(request, response);
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
  const filePath = path.join(__dirname, '../../email-templates/forgot-password-email.hbs');
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

// TODO: Ensure this method is necessary
/**
 * Handle GET requests to the /validate endpoint
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
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

/**
 * Handle GET requests to the /user
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
export const getUserDetails = async (request, response) => {
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

    const user = await Utilities.createUserResponseObject(token);

    Responses.sendDataResponse(
      response,
      Strings.RESPONSE_MESSAGE.TOKEN_AUTH_SUCCESS,
      { user },
    );

    // If the token wasn't associated with a user account, send an error response
  } catch (err) {
    // console.log(err);
    Responses.sendBadTokenResponse(
      response,
      Strings.RESPONSE_MESSAGE.TOKEN_INVALID_ERROR,
    );
    // return;
  }
};
