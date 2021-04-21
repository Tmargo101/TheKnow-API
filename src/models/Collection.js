import { Types, Schema, model } from 'mongoose';
import { escape } from 'underscore';

// mongoose.Promise = global.Promise;

let CollectionModel = {};

// Converts a string of an ID to a mongoose ID
const convertId = Types.ObjectId;

// Converts
const setName = (name) => escape(name).trim();

const CollectionSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },
  owner: {
    type: Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  members: [
    {
      memberId: {
        type: Schema.ObjectId,
        ref: 'Account',
      },
    },
  ],
  places: {
    type: Array,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
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

CollectionModel = model('Collection', CollectionSchema);

export {
  CollectionModel,
  CollectionSchema,
};
