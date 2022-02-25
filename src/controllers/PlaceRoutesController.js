import { Place, Collection } from '../models';
import * as Responses from '../utilities/Responses';
import * as Strings from '../Strings';
import * as Validators from './validators/PlaceValidators';
import * as Utilities from './shared/PlaceUtilityFunctions';

// Update a collection's "Places" array with a new PlaceID
/**
 * Adds a place to a collection
 * @param collectionID
 * @param placeID
 * @returns {Promise<*>}
 */
const addPlaceToCollection = async (collectionID, placeID) => {
  const parentCollection = await Collection.CollectionModel.findByIdAndUpdate(
    collectionID,
    {
      $push: {
        places: placeID,
      },
    },
  ).exec();
  return parentCollection;
};

/**
 * Handles POST requests to /places
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
export const addPlace = async (request, response) => {
  // Validate database
  const validData = Validators.validateNewPlace(request, response);
  if (!validData) { return; }

  // Create new place object
  const newPlace = Utilities.createNewPlaceObject(request);

  // Database actions
  try {
    // Save the new place to the database
    await newPlace.save();

    // Update the parent collection's places array with the new place's ID
    await addPlaceToCollection(request.body.collectionId, newPlace._id);
  } catch (err) {
    // Send error if either database operation throws an error
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.NOT_SAVED,
    );
    return;
  }

  // Compose response
  Responses.sendDataResponse(
    response,
    Strings.RESPONSE_MESSAGE.PLACE_ADD_SUCCESS,
    { newPlace },
  );
};

/**
 * Handles GET requests to /places/:id
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
export const getPlace = async (request, response) => {
  // Validate input
  const validData = Validators.validateGetPlace(request, response);
  if (!validData) { return; }

  // Get place from database
  const place = await Place.PlaceModel.findPlace(
    request.params.id,
  );

  // Compose response
  Responses.sendDataResponse(
    response,
    Strings.RESPONSE_MESSAGE.PLACE_GET_SUCCESS,
    { place },
  );
};

/**
 * Handles GET requests to /places endpoint with query param 'collection'
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
export const getPlaces = async (request, response) => {
  // Validate input
  const validData = Validators.validateGetPlaces(request, response);
  if (!validData) { return; }

  if (request.query.collection) {
    const places = await Place.PlaceModel.findByCollection(
      request.query.collection,
    );
    Responses.sendDataResponse(
      response,
      Strings.RESPONSE_MESSAGE.COLLECTION_PLACES_GET_SUCCESS,
      { places },
    );
    return;
  }

  // Get place from database
  const places = await Place.PlaceModel.findByOwner(
    request.query.addedBy,
  );

  // Compose response
  Responses.sendDataResponse(
    response,
    Strings.RESPONSE_MESSAGE.USER_COLLECTION_GET_SUCCESS,
    { places },
  );
};

// TODO: Work on this function
/**
 * Handle PUT requests to the /places/:id endpoint
 * @param request
 * @param response
 * @param id
 * @returns {Promise<void>}
 */
export const updatePlace = async (request, response, id) => {
  response.json({ id });
};

/**
 * Handle POST requests to /places/:id/comments
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
export const addComment = async (request, response) => {
  // Validate that all necessary params exist
  const validData = Validators.validateAddComment(request, response);
  if (!validData) { return; }

  const place = await Place.PlaceModel.find({ _id: request.params.id }).exec();

  // Add new comment to the place
  place[0].comments.push({
    text: request.body.commentText,
    name: request.body.commentName,
    userId: request.body.userId,
  });

  place[0].save();

  Responses.sendDataResponse(
    response,
    Strings.RESPONSE_MESSAGE.COMMENT_ADD_SUCCESS,
    { place },
  );
};

/**
 * Handle DELETE requests to /places/:id
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
export const removePlace = async (request, response) => {
  // Validate Input
  const validData = Validators.validateDeletePlace(request, response);
  if (!validData) { return; }

  // Get place
  const placeToDelete = await Place.PlaceModel.findPlace(request.params.id);
  console.log(placeToDelete);

  // Remove placeId from collection
  const placesRemoved = await Collection.CollectionModel.removePlaceFromCollection(
    placeToDelete[0]._id,
    placeToDelete[0].collectionId,
  );

  console.log(`Places removed: ${placesRemoved}`);

  // Remove place
  const place = await Place.PlaceModel.deletePlace(request.params.id);

  // Create response object
  const deletedPlace = {
    deletedPlaces: place.deletedCount,
  };

  // Send response
  Responses.sendDataResponse(
    response,
    'Deleted Place',
    { deletedPlace },
  );
};
