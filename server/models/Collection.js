const mongoose = require('mongoose');
const _ = require('underscore');

// mongoose.Promise = global.Promise;

let CollectionModel = {};

// Converts a string of an ID to a mongoose ID
const convertId = mongoose.Types.ObjectId;

// Converts
const setName = (name) => _.escape(name).trim();

const CollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  members: [
    {
      memberId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Account'
      }
    }
  ],
  places: {
    type: Array,
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

CollectionSchema.statics.toAPI = (doc) => ({
  _id: doc._id,
  name: doc.name,
  owner: doc.owner,
  places: doc.places,
});


CollectionSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };
  return CollectionSchema.find(search).select('_id name owner places').lean().exec(callback);
};

CollectionModel = mongoose.model('Collection', CollectionSchema);

module.exports = {
  CollectionModel,
  CollectionSchema,
};
