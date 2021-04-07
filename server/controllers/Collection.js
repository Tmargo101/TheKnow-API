const models = require('../models');

const { Collection } = models;

const addCollection = (request, response) => {
  if (!request.body.name || !request.body.owner) {
    response.send('Not all params');
    return;
  }
  const newCollection = new Collection.CollectionModel({
    name: request.body.name,
    owner: request.body.owner,
  });

  newCollection.save().then(() => {
    // Collection.CollectionModel.toAPI(newCollection);
    response.json({
      success: 'saved',
      object: newCollection,
    });
  });
};

const getCollection = (request, response, id) => {
  response.json({ id });
};

module.exports = {
  addCollection,
  getCollection,
};
