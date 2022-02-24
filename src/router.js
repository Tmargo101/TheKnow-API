// eslint-disable-next-line import/no-unresolved
import * as Home from './controllers/home';
import * as Account from './controllers/Account/AccountController';
import * as Collection from './controllers/Collection';
import * as Place from './controllers/Place';
import * as middleware from './middleware';

const router = (app) => {
  // API Base
  app.get('/', Home.home);

  // Authentication functions
  app.post('/logout', middleware.validateToken, Account.logout);
  app.post('/login', Account.login);
  app.post('/signup', Account.signup);
  app.post('/forgotPassword', Account.forgotPassword);
  app.post('/validate', Account.validateToken);
  app.get('/user', middleware.validateToken, Account.getUser);
  app.post('/changePassword', middleware.validateToken, Account.changePassword);

  // Collection routes
  app.get('/collections', middleware.validateToken, Collection.getCollections);
  app.get('/collections/:id', middleware.validateToken, Collection.getCollection);
  app.post('/collections', middleware.validateToken, Collection.addCollection);
  app.get('/collections/:id/members', middleware.validateToken, Collection.getCollectionMembers);
  app.post('/collections/:id/members', middleware.validateToken, Collection.addMemberToCollection);
  // Get members from collection
  app.put('/collections/:id', middleware.validateToken, Collection.updateCollection);
  app.delete('/collections/:id', middleware.validateToken, Collection.removeCollection);

  // Place routes
  app.get('/places', middleware.validateToken, Place.getPlaces);
  app.get('/places/:id', middleware.validateToken, Place.getPlace);
  app.post('/places', middleware.validateToken, Place.addPlace);
  app.post('/places/:id/comments', middleware.validateToken, Place.addComment);
  app.put('/places/:id', middleware.validateToken, Place.updatePlace);
  app.delete('/places/:id', middleware.validateToken, Place.removePlace);

  // Fallback routes
  app.get('*', Home.notFound);
  app.post('*', Home.notFound);
  app.put('*', Home.notFound);
  app.delete('*', Home.notFound);
};

export default router;
