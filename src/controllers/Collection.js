const models = require('../models');

const { Collection } = models;

const addCollection = async (request, response) => {
  if (!request.body.name || !request.body.owner) {
    response.send('Not all params');
    return;
  }
  const newCollection = new Collection.CollectionModel({
    name: request.body.name,
    owner: request.body.owner,
  });
  await newCollection.save();
  response.json({
    status: 'saved',
    object: newCollection,
  });
};

const getCollection = async (request, response, id) => {
  response.json({ id });
};

const getAllCollections = async (request, response, id) => {
  response.json({ id });
};

const updateCollection = async (request, response, id) => {
  response.json({ id });
};

const removeCollection = async (request, response, id) => {
  response.json({ id });
};

module.exports = {
  addCollection,
  getCollection,
  getAllCollections,
  updateCollection,
  removeCollection,
};
