import { Types } from 'mongoose';

import { Collection, Place } from '../models';
import * as Responses from '../utilities/Responses';
import * as Strings from '../Strings';

const validateNewCollection = (request, response) => {
  if (!request.body.name || !request.body.owner || !Types.ObjectId.isValid(request.body.owner)) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.VALIDATION_FAILED,
    );
    return false;
  }
  return true;
};

const validateGetCollections = (request, response) => {
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

const validateGetCollection = (request, response) => {
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

export const addCollection = async (request, response) => {
  // Validate fields, else return
  const validData = validateNewCollection(request, response);
  if (!validData) { return; }
  console.log(request.body);
  // Create new collection object
  const newCollection = new Collection.CollectionModel({
    name: request.body.name,
    owner: request.body.owner,
    members: [
      request.body.owner,
    ],
  });

  try {
    await newCollection.save();
  } catch (err) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.NOT_SAVED,
    );
    return;
  }

  Responses.sendDataResponse(
    response,
    Strings.RESPONSE_MESSAGE.COLLECTION_ADD_SUCCESS,
    { newCollection },
  );
};

export const getCollection = async (request, response) => {
  // Validate input
  const validData = validateGetCollection(request, response);
  if (!validData) { return; }

  const collection = await Collection.CollectionModel.findCollection(
    request.params.id,
  );
  Responses.sendDataResponse(
    response,
    Strings.RESPONSE_MESSAGE.COLLECTION_GET_SUCCESS,
    { collection },
  );
};

export const getCollections = async (request, response) => {
  // Validate input
  const validData = validateGetCollections(request, response);
  if (!validData) { return; }

  const collections = await Collection.CollectionModel.findByMember(
    request.query.user,
  );
  Responses.sendDataResponse(
    response,
    Strings.RESPONSE_MESSAGE.USER_COLLECTION_GET_SUCCESS,
    { collections },
  );
};

export const updateCollection = async (request, response, id) => {
  response.json({ id });
};

export const removeCollection = async (request, response) => {
  // Validate Input
  // const validData = validateDeleteCollection(request, response);
  // if (!validData) { return; }

  // Get the collection object
  const collection = await Collection.CollectionModel.findCollection(request.params.id);

  let count = 0;
  // Remove all places in the collection
  collection[0].places.forEach(async (place) => {
    await Place.PlaceModel.deletePlace(place._id);
    count += 1;
  });

  // Remove the collection
  const deleteCollection = await Collection.CollectionModel.deleteCollection(request.params.id);

  // Create response object
  const deletedCollection = {
    deletedPlaces: count,
    deleted: deleteCollection.deletedCount,
  };

  // Send response
  Responses.sendDataResponse(
    response,
    Strings.RESPONSE_MESSAGE.COLLECTION_REMOVE_SUCCESS,
    { deletedCollection },
  );
};
