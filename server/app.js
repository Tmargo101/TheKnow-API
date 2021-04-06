const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
// const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');

require('dotenv').config();

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const dbURL = process.env.MONGODB_URI || 'mongodb://localhost/DomoMaker';

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};

mongoose.connect(dbURL, mongooseOptions, (err) => {
  if (err) throw err;
});

const router = require('./router.js');

const app = express();

// app.use(favicon())
app.use(compression());
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use(session({
  key: 'sessionid',
  secret: '5d4db169307b415fb4e9',
  resave: true,
  saveUninitalized: true,
}));

// app.use(cookieParser());

router(app);

app.listen(port, (err) => {
  if (err) throw err;
});