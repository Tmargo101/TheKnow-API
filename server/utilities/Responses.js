const sendGenericSuccessResponse = (response, _message, responseObject) => {
  response
    .status(200)
    .json({
      status: 'FFF',
      message: _message,
      object: responseObject,
    });
};

const sendGenericErrorResponse = (response, _message) => {
  response
    .status(400)
    .json({
      status: 'STRING RESPONSE ERROR',
      message: _message,
    });
};

export default {
  sendGenericErrorResponse,
  sendGenericSuccessResponse,
};
