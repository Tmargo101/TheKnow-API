import { Types } from 'mongoose';

import { Collection, Place, Account } from '../models';
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

const validateAddMemberToCollection = (request, response) => {
  if (!request.params.id || !request.body.email || !Types.ObjectId.isValid(request.params.id)) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.VALIDATION_FAILED,
    );
    return false;
  }
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

const validateUpdateCollection = (request, response) => {
  if (!request.params.id || !Types.ObjectId.isValid(request.params.id)) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.VALIDATION_FAILED,
    );
    return false;
  }

  if (!request.body.name || request.body.name.trim().length === 0) {
    Responses.sendGenericErrorResponse(
      response,
      Strings.RESPONSE_MESSAGE.VALIDATION_FAILED,
    );
    return false;
  }

  return true;
};

export const addCollection = async (request, response) => {
  // Validate fields, else return
  const validData = validateNewCollection(request, response);
  if (!validData) { return; }

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

  try {
    const collection = await Collection.CollectionModel.findCollection(
      request.params.id,
    );
    Responses.sendDataResponse(
      response,
      Strings.RESPONSE_MESSAGE.COLLECTION_GET_SUCCESS,
      { collection },
    );
  } catch (err) {
    Responses.sendGenericErrorResponse(response, Strings.RESPONSE_MESSAGE.NOT_SAVED);
  }
};

export const getCollections = async (request, response) => {
  try {
    const collections = await Collection.CollectionModel.findByMember(request.userId);
    Responses.sendDataResponse(
      response,
      Strings.RESPONSE_MESSAGE.USER_COLLECTION_GET_SUCCESS,
      { collections },
    );
  } catch (err) {
    Responses.sendGenericErrorResponse(response, Strings.RESPONSE_MESSAGE.NOT_SAVED);
  }
};

export const updateCollection = async (request, response) => {
  const validData = validateUpdateCollection(request, response);
  if (!validData) { return; }

  try {
    const collection = await Collection.CollectionModel.findById(request.params.id).exec();
    if (!collection) {
      Responses.sendNotFoundResponse(
        response,
        Strings.RESPONSE_MESSAGE.NOT_FOUND,
      );
      return;
    }

    if (collection.owner.toString() !== request.userId) {
      Responses.sendGenericErrorResponse(
        response,
        Strings.RESPONSE_MESSAGE.VALIDATION_FAILED,
      );
      return;
    }

    collection.name = request.body.name.trim();
    await collection.save();

    Responses.sendDataResponse(
      response,
      Strings.RESPONSE_MESSAGE.COLLECTION_UPDATE_SUCCESS,
      { collection },
    );
  } catch (err) {
    Responses.sendGenericErrorResponse(response, Strings.RESPONSE_MESSAGE.NOT_SAVED);
  }
};

export const removeCollection = async (request, response) => {
  try {
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
  } catch (err) {
    Responses.sendGenericErrorResponse(response, Strings.RESPONSE_MESSAGE.NOT_SAVED);
  }
};

export const addMemberToCollection = async (request, response) => {
  // Validate that all necessary params exist
  const validData = validateAddMemberToCollection(request, response);
  if (!validData) { return; }

  try {
    const collection = await Collection.CollectionModel.find({ _id: request.params.id }).exec();

    const member = await Account.AccountModel.find({ email: request.body.email }).exec();
    if (member !== []) {
      Responses.sendGenericErrorResponse(
        response,
        Strings.RESPONSE_MESSAGE.MEMBER_NOT_FOUND,
      );
      return;
    }
    if (collection[0].members.includes(member[0]._id)) {
      Responses.sendGenericErrorResponse(
        response,
        Strings.RESPONSE_MESSAGE.MEMBER_ALREADY_IN_COLLECTION,
      );
      return;
    }

    // Add new member to the place
    collection[0].members.push(member[0]._id);

    await collection[0].save();

    Responses.sendDataResponse(
      response,
      Strings.RESPONSE_MESSAGE.MEMBER_ADDED_TO_COLLECTION,
      { collection },
    );
  } catch (err) {
    Responses.sendGenericErrorResponse(response, Strings.RESPONSE_MESSAGE.NOT_SAVED);
  }
};

export const getCollectionMembers = async (request, response) => {
  // Validate input
  if (!request.params.id) { return; }

  try {
    const members = await Collection.CollectionModel
      .findOne({ _id: request.params.id })
      .select('members')
      .populate('members', 'name email')
      .exec();

    Responses.sendDataResponse(
      response,
      Strings.RESPONSE_MESSAGE.COLLECTION_MEMBERS_GET_SUCCESS,
      members,
    );
  } catch (err) {
    Responses.sendGenericErrorResponse(response, Strings.RESPONSE_MESSAGE.NOT_SAVED);
  }
};
