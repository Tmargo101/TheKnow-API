import * as Responses from '../../utilities/Responses';
import * as Strings from '../../Strings';
import * as AccountUtilities from './AccountUtilityFunctions';


export const validateLogin = (request, response) => {
  if (!request.body.email || !request.body.password) {
    Responses.sendGenericErrorResponse(response, Strings.RESPONSE_MESSAGE.VALIDATION_FAILED);
    return false;
  }
  return true;
};

export const validateSignup = (request, response) => {
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
  if (!AccountUtilities.passwordsMatch(request, response)) {
    return false;
  }

  // Ensure password is strong enough
  if (!AccountUtilities.passwordIsStrongEnough(response, request.body.pass)) {
    return false;
  }

  // Valid signup data
  return true;
};

export const validateChangePassword = (request, response) => {
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
  if (!AccountUtilities.passwordsMatch(request, response)) {
    return false;
  }

  // Ensure password is strong enough
  if (!AccountUtilities.passwordIsStrongEnough(response, request.body.newPass)) {
    return false;
  }

  // Valid password change data
  return true;
};

export const validateForgotPassword = (request, response) => {
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