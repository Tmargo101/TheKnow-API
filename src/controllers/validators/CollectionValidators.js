import { Types } from 'mongoose';
import * as Responses from '../../utilities/Responses';
import * as Strings from '../../Strings';

export const validateAddCollection = (request, response) => {
  if (!request.body.name || !request.body.owner || !Types.ObjectId.isValid(request.body.owner)) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.VALIDATION_FAILED,
    );
    return false;
  }
  return true;
};

export const validateGetCollection = (request, response) => {
  if (!request.params.id || !Types.ObjectId.isValid(request.params.id)) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.VALIDATION_FAILED,
    );
    return false;
  }
  // Valid data
  return true;
};

export const validateGetCollections = (request, response) => {
  if (!request.query.user || !Types.ObjectId.isValid(request.query.user)) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.VALIDATION_FAILED,
    );
    return false;
  }
  // Valid data
  return true;
};

export const validateAddMemberToCollection = (request, response) => {
  if (!request.params.id || !request.body.email || !Types.ObjectId.isValid(request.params.id)) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.VALIDATION_FAILED,
    );
    return false;
  }
  return true;
};
