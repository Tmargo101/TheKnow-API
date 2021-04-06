const controllers = require('./controllers');

const router = (app) => {
  app.get('/', controllers.Home.home);
  // app.get('/login', controllers.Account.login);
  // app.get('/logout', controllers.Account.logout);
  // app.post('/user', controllers.Account.register);
  
  

};

module.exports = router;