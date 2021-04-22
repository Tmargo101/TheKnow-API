import * as Account from '../models/Account';

export const logout = (request, response) => {
  request.session.destroy();
  response.redirect('/');
};

export const login = async (request, response) => {
  const username = `${request.body.username}`;
  const password = `${request.body.pass}`;

  if (!request.body.username || !request.body.password) {
    return response.status(400).json({ error: 'All fields are requred' });
  }

  const account = await Account.AccountModel.authenticate(username, password);

  if (account === null) {
    return response.status(401).json({ error: 'Wrong username or password' });
  }
  request.session.account = Account.AccountModel.toAPI(account);
  return response.json({ redirect: '/maker' });
};

export const signup = async (request, response) => {
  const username = `${request.body.username}`;
  const pass = `${request.body.pass}`;
  const pass2 = `${request.body.pass2}`;

  if (!request.body.username || !request.body.pass || !request.body.pass2) {
    return response.status(400).json({ error: 'All fields are required' });
  }

  if (pass !== pass2) {
    return response.status(400).json({ error: 'Passwords do not match' });
  }

  const encryptedPassword = await Account.AccountModel.generateHash(pass);

  const accountData = {
    username,
    salt: encryptedPassword.salt,
    password: encryptedPassword.hash,
  };

  const newAccount = new Account.AccountModel(accountData);

  try {
    await newAccount.save();
    request.session.account = Account.AccountModel.toAPI(newAccount);
    return response.json({ redirect: '/maker' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return response.status(400).json({ error: 'Username already in use' });
    }
    return response.status(400).json({ error: 'An error occurred' });
  }
};
