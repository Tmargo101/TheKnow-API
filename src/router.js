import * as Home from './controllers/Home';
import * as Account from './controllers/Account';
import * as Collection from './controllers/Collection';
import * as Place from './controllers/Place';

const router = (app) => {
  // API Base
  app.get('/', Home.home);

  // Authentication functions
  app.get('/logout', Account.logout);
  app.post('/login', Account.login);
  app.post('/signup', Account.signup);

  // Collection routes
  app.get('/collections', Collection.getAllCollections);
  app.get('/collections/:id', Collection.getCollection);
  app.post('/collections', Collection.addCollection);
  app.put('/collections/:id', Collection.updateCollection);
  app.delete('/collections/:id', Collection.removeCollection);

  // Place routes
  app.get('/places', Place.getAllPlaces);
  app.get('/places/:id', Place.getPlace);
  app.post('/places', Place.addPlace);
  app.put('/places/:id', Place.updatePlace);
  app.delete('/places/:id', Place.removePlace);

  // Fallback routes
  app.get('*', Home.notFound);
  app.post('*', Home.notFound);
  app.put('*', Home.notFound);
  app.delete('*', Home.notFound);
};

export default router;
