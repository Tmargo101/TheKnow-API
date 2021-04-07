const models = require('../models');

const { Place } = models;

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

  newPlace.save().then(() => {
    Place.PlaceModel.toAPI(newPlace);
    return response.json({
      success: 'saved',
      object: newPlace,
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
