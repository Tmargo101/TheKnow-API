import { Collection } from '../models';

export const addCollection = async (request, response) => {
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

export const getCollection = async (request, response, id) => {
  response.json({ id });
};

export const getAllCollections = async (request, response, id) => {
  response.json({ id });
};

export const updateCollection = async (request, response, id) => {
  response.json({ id });
};

export const removeCollection = async (request, response, id) => {
  response.json({ id });
};
