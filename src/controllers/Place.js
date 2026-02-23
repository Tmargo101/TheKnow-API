import { Types } from 'mongoose';

import { Place, Collection } from '../models';
import * as Responses from '../utilities/Responses';
import * as Strings from '../Strings';
import * as Search from './Search';

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
    || request.body.been === undefined
    || request.body.been === null
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

const validateAddComment = (request, response) => {
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

  // Add enriched Google Places data if provided
  if (request.body.googlePlaceId) {
    newPlace.placeData.googlePlaceId = request.body.googlePlaceId;
    newPlace.placeDataLastRefreshed = new Date();
  }
  if (request.body.rating) {
    newPlace.placeData.rating = parseFloat(request.body.rating);
  }
  if (request.body.reviewCount) {
    newPlace.placeData.reviewCount = parseInt(request.body.reviewCount, 10);
  }
  if (request.body.priceLevel != null && request.body.priceLevel !== '') {
    newPlace.placeData.priceLevel = parseInt(request.body.priceLevel, 10);
  }
  if (request.body.categories) {
    newPlace.placeData.categories = JSON.parse(request.body.categories);
  }
  if (request.body.photoUrl) {
    newPlace.placeData.photoUrl = request.body.photoUrl;
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

  try {
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
  } catch (err) {
    Responses.sendGenericErrorResponse(response, Strings.RESPONSE_MESSAGE.NOT_SAVED);
  }
};

export const getPlaces = async (request, response) => {
  // Validate input
  const validData = validateGetPlaces(request, response);
  if (!validData) { return; }

  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

  const triggerBackgroundRefresh = (places) => {
    const staleIds = places
      .filter((p) => p.placeData?.googlePlaceId
        && (!p.placeDataLastRefreshed
          || Date.now() - new Date(p.placeDataLastRefreshed) > SEVEN_DAYS))
      .map((p) => p._id);

    if (staleIds.length > 0) {
      Place.PlaceModel.find({ _id: { $in: staleIds } })
        .then((docs) => Promise.allSettled(docs.map(async (doc) => {
          await Search.refreshPlaceDataFromGoogle(doc);
          await doc.save();
        })))
        .catch((err) => console.error('Background refresh error:', err));
    }
  };

  try {
    if (request.query.collection) {
      const places = await Place.PlaceModel.findByCollection(
        request.query.collection,
      );
      Responses.sendDataResponse(
        response,
        Strings.RESPONSE_MESSAGE.COLLECTION_PLACES_GET_SUCCESS,
        { places },
      );
      triggerBackgroundRefresh(places);
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
    triggerBackgroundRefresh(places);
  } catch (err) {
    Responses.sendGenericErrorResponse(response, Strings.RESPONSE_MESSAGE.NOT_SAVED);
  }
};

export const updatePlace = async (request, response, id) => {
  response.json({ id });
};

export const addComment = async (request, response) => {
  // Validate that all necessary params exist
  const validData = validateAddComment(request, response);
  if (!validData) { return; }

  try {
    const place = await Place.PlaceModel.find({ _id: request.params.id }).exec();

    // Add new comment to the place
    place[0].comments.push({
      text: request.body.commentText,
      name: request.body.commentName,
      userId: request.body.userId,
    });

    await place[0].save();

    Responses.sendDataResponse(
      response,
      Strings.RESPONSE_MESSAGE.COMMENT_ADD_SUCCESS,
      { place },
    );
  } catch (err) {
    Responses.sendGenericErrorResponse(response, Strings.RESPONSE_MESSAGE.NOT_SAVED);
  }
};

export const removePlace = async (request, response) => {
  // Validate Input
  const validData = validateDeletePlace(request, response);
  if (!validData) { return; }

  try {
    // Get place
    const placeToDelete = await Place.PlaceModel.findPlace(request.params.id);

    // Remove placeId from collection
    await Collection.CollectionModel.removePlaceFromCollection(
      placeToDelete[0]._id,
      placeToDelete[0].collectionId,
    );

    // Remove place
    const place = await Place.PlaceModel.deletePlace(request.params.id);

    // Create response object
    const deletedPlace = {
      deletedPlaces: place.deletedCount,
    };

    // Send response
    Responses.sendDataResponse(
      response,
      Strings.RESPONSE_MESSAGE.PLACE_REMOVE_SUCCESS,
      { deletedPlace },
    );
  } catch (err) {
    Responses.sendGenericErrorResponse(response, Strings.RESPONSE_MESSAGE.NOT_SAVED);
  }
};
