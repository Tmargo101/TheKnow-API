import { Types, Schema, model } from 'mongoose';
import mongooseLeanGetters from 'mongoose-lean-getters';
import { escape, unescape } from 'underscore';

// mongoose.Promise = global.Promise;

let PlaceModel = {};

// Converts a string of an ID to a mongoose ID
const convertId = Types.ObjectId;

// Converts
const setString = (inString) => escape(inString).trim();

const getString = (inString) => {
  if (inString === undefined) {
    return undefined;
  }
  return unescape(inString);
};

const PlaceSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setString,
    get: getString,
  },
  addedBy: {
    type: Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  collectionId: {
    type: Schema.ObjectId,
    ref: 'Collection',
  },
  been: {
    type: Boolean,
  },
  placeData: {
    address: {
      type: String,
      set: setString,
      get: getString,
    },
    link: {
      type: String,
      set: setString,
      get: getString,
    },
    phoneNumber: {
      type: String,
      set: setString,
      get: getString,
    },
    mapsLink: {
      type: String,
      set: setString,
      get: getString,
    },
    coordinates: {
      latitude: {
        type: String,
        set: setString,
        get: getString,
      },
      longitude: {
        type: String,
        set: setString,
        get: getString,
      },
    },
  },
  comments: [{
    comment: {
      name: {
        type: String,
        set: setString,
        get: getString,
      },
      text: {
        type: String,
        set: setString,
        get: getString,
      },
      userId: {
        type: Schema.ObjectId,
        ref: 'Acccount',
      },
    },
  }],
  note: {
    type: String,
    set: setString,
    get: getString,
  },
  recommendedBy: {
    name: {
      type: String,
      set: setString,
      get: getString,
    },
    _id: {
      type: Schema.ObjectId,
      ref: 'Account',
    },
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

PlaceSchema.set('toObject', { getters: true });
PlaceSchema.set('toJSON', { getters: true });
PlaceSchema.plugin(mongooseLeanGetters);

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
    .lean({ getters: true })
    .exec();
  return results;
};

PlaceSchema.statics.findPlace = async (placeId) => {
  const search = {
    _id: convertId(placeId),
  };

  const results = await PlaceModel
    .find(search)
    .lean({ getters: true })
    .exec();
  return results;
};

PlaceSchema.statics.findByCollection = async (collectionId) => {
  const search = {
    collectionId: convertId(collectionId),
  };

  const results = await PlaceModel
    .find(search)
    .lean({ getters: true })
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
