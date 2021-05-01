import { Place, Collection } from '../models';
import * as Responses from '../utilities/Responses';
import * as Strings from '../Strings';

// TODO: Refactor these helper functions / validators to new file?

// Ensure all needed params are present before creating a new place.
// If any params are not present, respond with an error message
const validateNewPlace = (request, response) => {
  // Validate that all params needed are included
  if (
    !request.body.name
    || !request.body.mapLink
    || !request.body.addedBy
    || !request.body.collectionId
  ) {
    // Return a generic error that not all parameters have been included
    // with the request
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.MISSING_REQUIRED_FIELDS,
    );
    return false;
  }
  return true;
};

const validateGetPlace = (request, response) => {
  if (!request.params.id) {
    // Return a generic error that not all parameters have been included
    // with the request
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.MISSING_REQUIRED_FIELDS,
    );
    return false;
  }
  // Valid data
  return true;
};

const validateGetAllPlaces = (request, response) => {
  if (!request.query.addedBy && !request.query.collectionID) {
    // Return a generic error that not all parameters have been included
    // with the request
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.MISSING_REQUIRED_FIELDS,
    );
    return false;
  }
  // Valid data
  return true;
};

const validateDeletePlace = (request, response) => {
  if (!request.params.id) {
    // Return a generic error that not all parameters have been included
    // with the request
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.MISSING_REQUIRED_FIELDS,
    );
    return false;
  }
  // Valid data
  return true;
};

// Update a collection's "Places" array with a new PlaceID
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

const createNewPlaceObject = (request) => {
  const newPlace = new Place.PlaceModel({
    name: request.body.name,
    addedBy: request.body.addedBy,
    link: {
      maps: request.body.mapLink,
    },
  });
  return newPlace;
};

export const addPlace = async (request, response) => {
  // Validate database
  const validData = validateNewPlace(request, response);
  if (!validData) { return; }

  // Create new place object
  const newPlace = createNewPlaceObject(request);

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
    newPlace,
  );
};

export const getPlace = async (request, response) => {
  // Validate input
  const validData = validateGetPlace(request, response);
  if (!validData) { return; }

  // Get place from database
  const place = await Place.PlaceModel.findPlace(
    request.params.id,
  );

  // Compose response
  Responses.sendDataResponse(
    response,
    Strings.RESPONSE_MESSAGE.PLACE_GET_SUCCESS,
    place,
  );
};

export const getAllPlaces = async (request, response) => {
  // Validate input
  const validData = validateGetAllPlaces(request, response);
  if (!validData) { return; }

  // Get place from database
  const places = await Place.PlaceModel.findByOwner(
    request.query.addedBy,
  );

  // Compose response
  Responses.sendDataResponse(
    response,
    Strings.RESPONSE_MESSAGE.PLACE_GET_SUCCESS,
    places,
  );
};

export const updatePlace = async (request, response, id) => {
  response.json({ id });
};

export const removePlace = async (request, response) => {
  // Validate Input
  const validData = validateDeletePlace(request, response);
  if (!validData) { return; }

  // Remove place
  const place = await Place.PlaceModel.deletePlace(request.params.id);

  // Create response object
  const responseObject = {
    deleted: place.deletedCount,
  };

  // Send response
  Responses.sendDataResponse(
    response,
    'Deleted Place',
    responseObject,
  );
};
