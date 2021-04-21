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

PlaceSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };
  return PlaceModel.find(search).select('_id name addedBy notes').lean().exec(callback);
};

PlaceModel = model('Place', PlaceSchema);

export {
  PlaceModel,
  PlaceSchema,
};
