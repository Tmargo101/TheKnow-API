const home = async (request, response) => {
  response.status(200).json({ success: 'API is live' });
};

const notFound = async (request, response) => {
  response.status(404).json({ error: 'Not found' });
};

module.exports = {
  home,
  notFound,
};