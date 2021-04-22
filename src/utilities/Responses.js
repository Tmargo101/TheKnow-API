import * as Strings from '../Strings';

export const sendDataResponse = (response, _message, responseObject) => {
  response
    .status(200)
    .json({
      status: Strings.RESPONSE_STATUS.SUCCESS,
      message: _message,
      contents: responseObject,
    });
};

export const sendGenericSuccessResponse = (response, _message) => {
  response
    .status(200)
    .json({
      status: Strings.RESPONSE_STATUS.SUCCESS,
      message: _message,
    });
};

export const sendGenericErrorResponse = (response, _message) => {
  response
    .status(400)
    .json({
      status: Strings.RESPONSE_STATUS.ERROR,
      message: _message,
    });
  return null;
};

export const sendNotFoundResponse = (response, _message) => {
  response
    .status(404)
    .json({
      status: Strings.RESPONSE_STATUS.ERROR,
      message: _message,
    });
  return null;
};
