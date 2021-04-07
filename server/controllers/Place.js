const models = require('../models');

const { Place, Collection } = models;

const addPlace = (request, response) => {
  if (!request.body.name || !request.body.mapLink || !request.body.addedBy) {
    response.send('Not all params');
    return;
  }
  
  const newPlace = new Place.PlaceModel({
    name: request.body.name,
    addedBy: request.body.addedBy,
    link: {
      maps: request.body.mapLink,
    },
  });
  
  // Added async so we can await results of FindByIdAndUpdate  
  newPlace.save().then( async () => {
    Place.PlaceModel.toAPI(newPlace);
    
    // Now that we have the newPlace ID, add it to the Collection
    const parentCollection = await Collection.CollectionModel.findByIdAndUpdate(
      request.body.collectionID,
      {
        $push: {
          places: newPlace._id
        }
      }
    ).exec();
    
    return response.json({
      success: 'saved',
      placeID: newPlace._id,
      collectionID: parentCollection._id
    });
  });
};

const getPlace = (request, response, id) => {
  response.json({ id });
};

module.exports = {
  addPlace,
  getPlace,
};
