import { Types } from 'mongoose';

import * as Responses from '../../utilities/Responses';
import * as Strings from '../../Strings';

/**
 * Ensure all needed params are present before creating a new place.
 * If any params are not present, respond with an error message.
 * @param request
 * @param response
 * @returns {boolean}
 */
export const validateNewPlace = (request, response) => {
  // Validate that all params needed are included
  if (
    !request.body.name
    || !request.body.recommendedBy
    || !request.body.addedBy
    || !request.body.collectionId
    || !request.body.been
  ) {
    // Return a generic error that not all parameters have been included
    // with the request
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.VALIDATION_FAILED,
    );
    return false;
  }
  return true;
};

/**
 * Ensure all needed params are present before getting a place.
 * If any params are not present, respond with an error message.
 * @param request
 * @param response
 * @returns {boolean}
 */
export const validateGetPlace = (request, response) => {
  if (!request.params.id || !Types.ObjectId.isValid(request.params.id)) {
    // Return a generic error that not all parameters have been included
    // with the request
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.VALIDATION_FAILED,
    );
    return false;
  }
  // Valid data
  return true;
};

/**
 * Ensure all needed params are present before getting all the places in a collection.
 * If any params are not present, respond with an error message.
 * @param request
 * @param response
 * @returns {boolean}
 */
export const validateGetPlaces = (request, response) => {
  let noAddedBy = false;
  let noCollection = false;
  if (!request.query.addedBy || !Types.ObjectId.isValid(request.query.addedBy)) {
    noAddedBy = true;
  }
  if (!request.query.collection || !Types.ObjectId.isValid(request.query.collection)) {
    noCollection = true;
  }
  if (noAddedBy && noCollection) {
    // Return a generic error that not all parameters have been included
    // with the request
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.VALIDATION_FAILED,
    );
    return false;
  }

  // Valid data
  return true;
};

/**
 * Ensure all needed params are present before deleting a place.
 * If any params are not present, respond with an error message.
 * @param request
 * @param response
 * @returns {boolean}
 */
export const validateDeletePlace = (request, response) => {
  if (!request.params.id) {
    // Return a generic error that not all parameters have been included
    // with the request
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.VALIDATION_FAILED,
    );
    return false;
  }
  // Valid data
  return true;
};

/**
 * Ensure all needed params are present before adding a comment to a place.
 * If any params are not present, respond with an error message.
 * @param request
 * @param response
 * @returns {boolean}
 */
export const validateAddComment = (request, response) => {
  if (!request.params.id
    || !request.body.commentText
    || !request.body.commentName
    || !request.body.userId
  ) {
    // Return a generic error that not all parameters have been included
    // with the request
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.VALIDATION_FAILED,
    );
    return false;
  }
  // Valid data
  return true;
};
