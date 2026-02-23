export const RESPONSE_STATUS = {
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  BAD_TOKEN: 'bad_token',
};

export const RESPONSE_MESSAGE = {
  // Generic response messages
  VALIDATION_FAILED: 'Request validation failed.  Ensure all required data is present in request',
  API_LIVE: 'TheKnow-API',

  // Generic error messages
  NOT_FOUND: 'Not found',
  NOT_SAVED: 'Database returned an error',
  NO_TOKEN_ERROR: 'Please include token with your request',

  // Search response messages
  PLACE_SEARCH_SUCCESS: 'Returned place search results',
  PLACE_DETAILS_SUCCESS: 'Returned place details',
  PLACE_SEARCH_FAILED: 'Failed to fetch results from Google Places',

  // Place response messages
  PLACE_GET_SUCCESS: 'Returned place',
  COLLECTION_PLACES_GET_SUCCESS: 'Returned all places in the collection',
  USER_PLACES_GET_SUCCESS: 'Returned all places added by the current user',

  PLACE_ADD_SUCCESS: 'Place was added successfully',
  PLACE_UPDATE_SUCCESS: 'Place was updated successfully',
  PLACE_REMOVE_SUCCESS: 'Place was removed successfully',

  COMMENT_ADD_SUCCESS: 'Comment was added successfully',

  // Collection response messages
  COLLECTION_GET_SUCCESS: 'Returned collection',
  USER_COLLECTION_GET_SUCCESS: 'Returned all collections the current user is a member of',
  COLLECTION_MEMBERS_GET_SUCCESS: 'Returned all members of the collection',

  COLLECTION_ADD_SUCCESS: 'Collection was added successfully',
  COLLECTION_UPDATE_SUCCESS: 'Collection was updated successfully',
  COLLECTION_REMOVE_SUCCESS: 'Collection was removed successfully',
  MEMBER_NOT_FOUND: 'Member not found',
  MEMBER_ALREADY_IN_COLLECTION: 'Member already in collection',
  MEMBER_ADDED_TO_COLLECTION: 'Member added to collection',

  // Authentication response messages
  LOGIN_SUCCESS: 'Successfully authenticated',
  SIGNUP_SUCCESS: 'Account has been created successfully',
  CHANGE_PASSWORD_SUCCESS: 'Password has been changed successfully',
  LOGOUT_SUCCESS: 'Successfully logged out',
  TOKEN_AUTH_SUCCESS: 'Token authenticated successfully',
  FORGOT_PASSWORD_RESPONSE: 'Check your email for further instructions',

  // Authentication error messages
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  PASSWORD_INCORRECT: 'Current password is incorrect',
  PASSWORD_NOT_STRONG_ENOUGH: 'Password is not strong enough',
  WRONG_USERNAME_PASSWORD: 'Incorrect username or password',
  USERNAME_ALREADY_EXISTS: 'User already exists in database',
  TOKEN_INVALID_ERROR: 'Token was invalid.  Please try re-logging in',
};

export const HEADERS = {
  TOKEN: 'x-access-token',
};
