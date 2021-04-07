const controllers = require('./controllers');

const router = (app) => {
  app.get('/', controllers.Home.home);
  app.get('/logout', controllers.Account.logout);
  app.post('/login', controllers.Account.login);
  app.post('/signup', controllers.Account.signup);
  app.post('/place', controllers.Place.addPlace);
  app.get('/place/:id', controllers.Place.getPlace);
  app.post('/collection', controllers.Collection.addCollection);
};

module.exports = router;
