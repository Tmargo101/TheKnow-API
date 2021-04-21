import { Place, Collection } from '../models';

// Ensure all needed params are present before creating a new place.
// If any params are not present, respond with an error message
const validateNewPlace = (request, response) => {
  // Validate that all params needed are included
  if (!request.body.name || !request.body.mapLink || !request.body.addedBy) {
    // Return a generic error that not all parameters have been included
    // with the request
    response.status().json({
      status: 'error',
      message: 'not all params',
    });
  }
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
  validateNewPlace(request, response);

  try {
    const newPlace = createNewPlaceObject(request);
    await newPlace.save();

    // Update the parent collection's places array with the new place's ID
    const parentCollection = await addPlaceToCollection(request.body.collectionID, newPlace._id);

    // Respond
    response.json({
      status: 'success',
      message: 'place add success',
      placeID: newPlace._id,
      collectionID: parentCollection._id,
    });
  } catch (err) {
    console.log(err);
  }
};

export const getPlace = async (request, response, id) => {
  response.json({ id });
};

export const getAllPlaces = async (request, response, id) => {
  response.json({ id });
};

export const updatePlace = async (request, response, id) => {
  response.json({ id });
};

export const removePlace = async (request, response, id) => {
  response.json({ id });
};
