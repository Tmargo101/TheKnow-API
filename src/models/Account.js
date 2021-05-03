import { randomBytes, pbkdf2Sync } from 'crypto';
import { Schema, model } from 'mongoose';
// import {} from 'mongoose-type-email';

// Promise = global.Promise;

let AccountModel = {};
const iterations = 10000;
const saltLength = 64;
const keyLength = 64;

const AccountSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: /^[A-Za-z0-9_\-.]{1,16}$/,
  },
  email: {
    type: Schema.Email,
    required: true,
  },
  name: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
  },
  salt: {
    type: Buffer,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  tokens: [{
    type: String,
    required: true,
  }],
});

AccountSchema.statics.toAPI = (doc) => ({
  // _id is built into your mongo document and is guaranteed to be unique
  username: doc.username,
  _id: doc._id,
});

const validatePassword = async (doc, password) => {
  const pass = doc.password;

  const hash = pbkdf2Sync(password, doc.salt, iterations, keyLength, 'RSA-SHA512');

  if (hash.toString('hex') !== pass) {
    return false;
  }
  return true;
};

AccountSchema.statics.findByUsername = async (name) => {
  const search = {
    username: name,
  };

  const results = await AccountModel.findOne(search).exec();
  return results;
};

AccountSchema.statics.generateHash = async (password) => {
  const salt = randomBytes(saltLength);
  const hash = pbkdf2Sync(password, salt, iterations, keyLength, 'RSA-SHA512');
  return {
    salt,
    hash: hash.toString('hex'),
  };
};

AccountSchema.statics.authenticate = async (username, password) => {
  const accountDoc = await AccountModel.findByUsername(username);
  if (accountDoc === null) {
    return null;
  }

  const validPassword = await validatePassword(accountDoc, password);

  if (validPassword) {
    return accountDoc;
  }
  return null;
};

AccountSchema.statics.verifyToken = async (token) => {
  const search = {
    tokens: token,
  };

  const results = await AccountModel.find(search, 'id tokens').exec();
  if (results[0] && results[0].tokens.includes(token)) {
    return results[0].id;
  }
  return 0;
};

AccountSchema.statics.removeToken = async (id, token) => {
  const search = {
    tokens: token,
  };

  const update = {
    $pullAll: {
      tokens: [token],
    },
  };
  let tokensRemoved = 0;
  try {
    const accountDoc = await AccountModel.updateOne(search, update);
    tokensRemoved = accountDoc.n;
  } catch (err) {
    console.log(err);
  }
  return tokensRemoved;
};

AccountModel = model('Account', AccountSchema);

export {
  AccountModel,
  AccountSchema,
};
