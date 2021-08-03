// const path = require('path');
// const favicon = require('serve-favicon');
// const cookieParser = require('cookie-parser');
// MONGODB_URI=mongodb+srv://tomMargosian:Pmi3sA9QerOP3e4v@cluster0.x98go.mongodb.net/TheKnow?retryWrites=true&w=majority

import express from 'express';
import compression from 'compression';
import { urlencoded } from 'body-parser';
import { connect } from 'mongoose';
import router from './router';

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

// Connect to the MongoDB Database
connect(dbURL, mongooseOptions, (err) => {
  if (err) throw err;
});

// Use the compression library with express
app.use(compression());
app.use(urlencoded({
  extended: true,
}));

// app.use(cookieParser());

// Use dependency injection to start the router & pass in the express instance.
router(app);

// Set express to start listening for network requests.
app.listen(port, (err) => {
  // eslint-disable-next-line no-console
  console.log('Server is running');
  if (err) throw err;
});
