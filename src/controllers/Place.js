import { Types } from 'mongoose';

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

const validateGetPlace = (request, response) => {
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

const validateGetPlaces = (request, response) => {
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

const validateDeletePlace = (request, response) => {
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
    collectionId: request.body.collectionId,
    been: request.body.been,
    recommendedBy: {
      name: request.body.recommendedBy,
    },
  });

  // Add comment if added in Place
  if (request.body.commentText && request.body.commentName) {
    newPlace.comments.push({
      text: request.body.commentText,
      name: request.body.commentName,
      userId: request.body.addedBy,
    });
  }

  // Add address if sent in request
  if (request.body.address) {
    newPlace.placeData.address = request.body.address;
  }

  // Add Phone Number if sent in request
  if (request.body.phoneNumber) {
    newPlace.placeData.phoneNumber = request.body.phoneNumber;
  }

  // Add Website Link if sent in request
  if (request.body.link) {
    newPlace.placeData.link = request.body.link;
  }

  // Add coordinates if sent in request
  if (request.body.latitude && request.body.longitude) {
    newPlace.placeData.coordinates.latitude = request.body.latitude;
    newPlace.placeData.coordinates.longitude = request.body.longitude;
  }

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
    { newPlace },
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
    { place },
  );
};

export const getPlaces = async (request, response) => {
  // Validate input
  const validData = validateGetPlaces(request, response);
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

export const updatePlace = async (request, response, id) => {
  response.json({ id });
};

export const removePlace = async (request, response) => {
  // Validate Input
  const validData = validateDeletePlace(request, response);
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
