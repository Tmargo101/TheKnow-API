const controllers = require('./controllers');

const router = (app) => {
  // API Base
  app.get('/', controllers.Home.home);

  // Authentication functions
  app.get('/logout', controllers.Account.logout);
  app.post('/login', controllers.Account.login);
  app.post('/signup', controllers.Account.signup);

  // Collection routes
  app.get('/collections', controllers.Collection.getAllCollections);
  app.get('/collections/:id', controllers.Collection.getCollection);
  app.post('/collections', controllers.Collection.addCollection);
  app.put('/collections/:id', controllers.Collection.updateCollection);
  app.delete('/collections/:id', controllers.Collection.removeCollection);

  // Place routes
  app.get('/places', controllers.Place.getAllPlaces);
  app.get('/places/:id', controllers.Place.getPlace);
  app.post('/places', controllers.Place.addPlace);
  app.put('/places/:id', controllers.Place.updatePlace);
  app.delete('/places/:id', controllers.Place.removePlace);

  // Fallback routes
  app.get('*', controllers.Home.notFound);
  app.post('*', controllers.Home.notFound);
  app.put('*', controllers.Home.notFound);
  app.delete('*', controllers.Home.notFound);
};

module.exports = router;
