export const home = async (request, response) => {
  response.status(200).json({ success: 'API is live' });
};

export const notFound = async (request, response) => {
  response.status(404).json({ error: 'Not found' });
};