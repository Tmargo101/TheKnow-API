const models = require('../models');

const { Place, Collection } = models;

const addPlace = async (request, response) => {
  // Validate that all params needed are included
  if (!request.body.name || !request.body.mapLink || !request.body.addedBy) {
    // Return a generic error that not all parameters have been included
    // with the request
    response.status().json({
      status: 'error',
      message: 'not all params',
    });
    return;
  }

  // Create a new Place object to add to the database
  const newPlace = new Place.PlaceModel({
    name: request.body.name,
    addedBy: request.body.addedBy,
    link: {
      maps: request.body.mapLink,
    },
  });

  // Perform database actions
  try {
    // Async call to save to database
    await newPlace.save();

    // Convert the newPlace object to the API
    Place.PlaceModel.toAPI(newPlace);

    // Update the parent collection's places array with the new place's ID
    const parentCollection = await Collection.CollectionModel.findByIdAndUpdate(
      request.body.collectionID,
      {
        $push: {
          places: newPlace._id,
        },
      },
    ).exec();

    // Respond
    response.json({
      status: 'success',
      placeID: newPlace._id,
      collectionID: parentCollection._id,
    });
  } catch (err) {
    console.log(err);
  }
};

const getPlace = (request, response, id) => {
  response.json({ id });
};

module.exports = {
  addPlace,
  getPlace,
};
