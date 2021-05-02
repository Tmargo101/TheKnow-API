export const RESPONSE_STATUS = {
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

export const RESPONSE_MESSAGE = {
  // Generic response messages
  VALIDATION_FAILED: 'Request validation failed.  Ensure all required data is present in request',
  API_LIVE: 'TheKnow-API',

  // Generic error messages
  NOT_FOUND: 'Not found',
  NOT_SAVED: 'Database returned an error',
  NO_TOKEN_ERROR: 'Please include token with your request',

  // Place response messages
  PLACE_GET_SUCCESS: 'Returned place',
  COLLECTION_PLACES_GET_SUCCESS: 'Returned all places in the collection',
  USER_PLACES_GET_SUCCESS: 'Returned all places added by the current user',

  PLACE_ADD_SUCCESS: 'Place was added successfully',
  PLACE_UPDATE_SUCCESS: 'Place was updated successfully',
  PLACE_REMOVE_SUCCESS: 'Place was removed successfully',

  // Collection response messages
  COLLECTION_GET_SUCCESS: 'Returned collection',
  USER_COLLECTION_GET_SUCCESS: 'Returned all collections the current user is a member of',

  COLLECTION_ADD_SUCCESS: 'Collection was added successfully',
  COLLECTION_UPDATE_SUCCESS: 'Collection was updated successfully',
  COLLECTION_REMOVE_SUCCESS: 'Collection was removed successfully',

  // Authentication response messages
  LOGIN_SUCCESS: 'Successfully authenticated',
  SIGNUP_SUCCESS: 'Account has been created successfully',
  LOGOUT_SUCCESS: 'Successfully logged out',
  TOKEN_AUTH_SUCCESS: 'Token authenticated successfully.',

  // Authentication error messages
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  WRONG_USERNAME_PASSWORD: 'Incorrect username or password',
  USERNAME_ALREADY_EXISTS: 'User already exists in database',
  TOKEN_INVALID_ERROR: 'Token was invalid.  Please try re-logging in',
};

export const HEADERS = {
  TOKEN: 'x-access-token',
};
