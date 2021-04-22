import * as Home from './controllers/Home';
import * as Account from './controllers/Account';
import * as Collection from './controllers/Collection';
import * as Place from './controllers/Place';
import * as middleware from './middleware';

const router = (app) => {
  // API Base
  app.get('/', Home.home);

  // Authentication functions
  app.get('/logout', middleware.validateToken, Account.logout);
  app.post('/login', Account.login);
  app.post('/signup', Account.signup);

  // Collection routes
  app.get('/collections', middleware.validateToken, Collection.getAllCollections);
  app.get('/collections/:id', middleware.validateToken, Collection.getCollection);
  app.post('/collections', middleware.validateToken, Collection.addCollection);
  app.put('/collections/:id', middleware.validateToken, Collection.updateCollection);
  app.delete('/collections/:id', middleware.validateToken, Collection.removeCollection);

  // Place routes
  app.get('/places', middleware.validateToken, Place.getAllPlaces);
  app.get('/places/:id', middleware.validateToken, Place.getPlace);
  app.post('/places', middleware.validateToken, Place.addPlace);
  app.put('/places/:id', middleware.validateToken, Place.updatePlace);
  app.delete('/places/:id', middleware.validateToken, Place.removePlace);

  // Fallback routes
  app.get('*', Home.notFound);
  app.post('*', Home.notFound);
  app.put('*', Home.notFound);
  app.delete('*', Home.notFound);
};

export default router;
