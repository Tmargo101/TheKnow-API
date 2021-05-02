import { Types, Schema, model } from 'mongoose';
import { escape } from 'underscore';

// mongoose.Promise = global.Promise;

let PlaceModel = {};

// Converts a string of an ID to a mongoose ID
const convertId = Types.ObjectId;

// Converts
const setName = (name) => escape(name).trim();

const PlaceSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },
  addedBy: {
    type: Schema.ObjectId,
    // required: true,
    ref: 'Account',
  },
  collectionId: {
    type: Schema.ObjectId,
    // required: true,
    ref: 'Collection',
  },
  link: {
    maps: String,
    yelp: String,
  },
  reccomendedBy: {
    name: String,
    _id: {
      type: Schema.ObjectId,
      ref: 'Account',
    },
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  notes: String,
});

PlaceSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  link: {
    maps: doc.link.maps,
  },
});

PlaceSchema.statics.findByOwner = async (ownerId) => {
  const search = {
    addedBy: convertId(ownerId),
  };

  const results = await PlaceModel
    .find(search)
    .lean()
    .exec();
  return results;
};

PlaceSchema.statics.findPlace = async (placeId) => {
  const search = {
    _id: convertId(placeId),
  };

  const results = await PlaceModel
    .find(search)
    .lean()
    .exec();
  return results;
};

PlaceSchema.statics.findByCollection = async (collectionId) => {
  const search = {
    collectionId: convertId(collectionId),
  };

  const results = await PlaceModel
    .find(search)
    .lean()
    .exec();
  return results;
};

PlaceSchema.statics.deletePlace = async (placeId) => {
  const search = {
    _id: convertId(placeId),
  };

  const results = await PlaceModel.deleteOne(search).exec();
  console.log(results);
  return results;
};

PlaceModel = model('Place', PlaceSchema);

export {
  PlaceModel,
  PlaceSchema,
};
