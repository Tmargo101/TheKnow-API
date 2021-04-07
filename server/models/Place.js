const mongoose = require('mongoose');
const _ = require('underscore');

// mongoose.Promise = global.Promise;

let PlaceModel = {};

// Converts a string of an ID to a mongoose ID
const convertId = mongoose.Types.ObjectId;

// Converts
const setName = (name) => _.escape(name).trim();

const PlaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },
  addedBy: {
    type: mongoose.Schema.ObjectId,
    // required: true,
    ref: 'Account',
  },
  link: {
    maps: String,
    yelp: String,
  },
  reccomendedBy: {
    name: String,
    _id: {
      type: mongoose.Schema.ObjectId,
      ref: 'Account',
    },
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  notes: String
});

PlaceSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  link: {
    maps: doc.link.maps
  }
});

PlaceSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };
  return PlaceModel.find(search).select('_id name addedBy notes').lean().exec(callback);
};

PlaceModel = mongoose.model('Place', PlaceSchema);

module.exports = {
  PlaceModel,
  PlaceSchema,
};
