const home = (request, response) => {
  response.status(200).json({ success: 'API is live' });
};

module.exports.home = home;
