// const path = require('path');
// const favicon = require('serve-favicon');
// const cookieParser = require('cookie-parser');

import express from 'express';
import compression from 'compression';
import { urlencoded } from 'body-parser';
import { connect } from 'mongoose';
import session from 'express-session';
import { createClient } from 'redis';
import router from './router';

const RedisStore = require('connect-redis')(session);

// Start express
const app = express();

// Add variables from .env file for connection string
require('dotenv').config();

// Define network port for API calls
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// Define URL to connect to MongoDB, or add a default
const dbURL = process.env.MONGODB_URI || 'mongodb://localhost/TheKnowAPI';

// Define options for the connection to MongoDB server
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
};

// Define options for connection to the Redis server
const redisCredentials = {
  hostname: '',
  port: '',
  pass: '',
};

if (process.env.REDISCLOUD_URL && process.env.REDISCLOUD_PORT && process.env.REDISCLOUD_PASS) {
  redisCredentials.hostname = process.env.REDISCLOUD_URL;
  redisCredentials.port = process.env.REDISCLOUD_PORT;
  redisCredentials.pass = process.env.REDISCLOUD_PASS;
}

// Connect to the MongoDB Database
connect(dbURL, mongooseOptions, (err) => {
  if (err) throw err;
});

// Connect to the Redis Database
const redisClient = createClient({
  host: redisCredentials.hostname,
  port: redisCredentials.port,
  password: redisCredentials.pass,
});

// app.use(favicon())

// Use the compression library with express
app.use(compression());
app.use(urlencoded({
  extended: true,
}));

// Use the connected Redis instance as storage for sessions
app.use(session({
  key: 'sessionid',
  store: new RedisStore({
    client: redisClient,
  }),
  secret: '5d4db169307b415fb4e9',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
  },
}));

// app.use(cookieParser());

// Use dependency injection to start the router & pass in the express instance.
router(app);

// Set express to start listening for network requests.
app.listen(port, (err) => {
  console.log('Server is running');
  if (err) throw err;
});
