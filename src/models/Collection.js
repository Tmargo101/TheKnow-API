import { Types, Schema, model } from 'mongoose';
import mongooseLeanGetters from 'mongoose-lean-getters';
import { escape, unescape } from 'underscore';
// import { PlaceModel } from './Place';

let CollectionModel = {};

// Converts a string of an ID to a mongoose ID
const convertId = (id) => new Types.ObjectId(id);

// Converts
const setString = (inString) => escape(inString);

const getString = (inString) => {
  if (inString === undefined) {
    return undefined;
  }
  return unescape(inString);
};

const CollectionSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setString,
    get: getString,
  },
  description: {
    type: String,
    set: setString,
    get: getString,
  },
  owner: {
    type: Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  members: [{
    type: Schema.ObjectId,
    ref: 'Account',
  }],
  places: [{
    type: Types.ObjectId,
    ref: 'Place',
    required: true,
  }],
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

CollectionSchema.set('toObject', { getters: true });
CollectionSchema.set('toJSON', { getters: true });
CollectionSchema.plugin(mongooseLeanGetters);

CollectionSchema.statics.toAPI = (doc) => ({
  id: doc._id,
  name: doc.name,
  owner: doc.owner,
  places: doc.places,
});

CollectionSchema.statics.findByOwner = async (ownerId) => {
  const search = {
    owner: convertId(ownerId),
  };

  const results = await CollectionModel
    .find(search)
    .lean({ getters: true })
    .exec();
  return results;
};

CollectionSchema.statics.findByMember = async (userId) => {
  const search = {
    members: convertId(userId),
  };

  const results = await CollectionModel
    .find(search)
    .lean({ getters: true })
    .exec();
  return results;
};

CollectionSchema.statics.findCollection = async (collectionId) => {
  const search = {
    _id: convertId(collectionId),
  };

  const results = await CollectionModel
    .find(search)
    // .populate('members', 'name email')
    .lean({ getters: true })
    .exec();

  return results;
};

CollectionSchema.statics.removePlaceFromCollection = async (placeId, collectionId) => {
  const update = {
    $pullAll: {
      places: [placeId],
    },
  };
  console.log(`Remove PlaceID ${placeId} from CollectionID ${collectionId}`);
  let removedCount = 0;
  try {
    const collection = await CollectionModel.findByIdAndUpdate(collectionId, update);
    if (!collection.places.includes(placeId)) {
      removedCount = 1;
    }
  } catch (err) {
    console.log(err);
  }
  return removedCount;
};

CollectionSchema.statics.deleteCollection = async (collectionId) => {
  const search = {
    _id: convertId(collectionId),
  };

  const results = await CollectionModel.deleteOne(search).exec();
  console.log(results);
  return results;
};

CollectionModel = model('Collection', CollectionSchema);

export {
  CollectionModel,
  CollectionSchema,
};
