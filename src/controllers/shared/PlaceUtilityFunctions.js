import { Place } from '../../models';

/**
 *
 * @param request
 * @returns {*}
 */
export const createNewPlaceObject = (request) => {
  const newPlace = new Place.PlaceModel({
    name: request.body.name,
    addedBy: request.body.addedBy,
    collectionId: request.body.collectionId,
    been: request.body.been,
    recommendedBy: {
      name: request.body.recommendedBy,
    },
  });

  // Add comment if added in Place
  if (request.body.commentText && request.body.commentName) {
    newPlace.comments.push({
      text: request.body.commentText,
      name: request.body.commentName,
      userId: request.body.addedBy,
    });
  }

  // Add address if sent in request
  if (request.body.address) {
    newPlace.placeData.address = request.body.address;
  }

  // Add Phone Number if sent in request
  if (request.body.phoneNumber) {
    newPlace.placeData.phoneNumber = request.body.phoneNumber;
  }

  // Add Website Link if sent in request
  if (request.body.link) {
    newPlace.placeData.link = request.body.link;
  }

  // Add coordinates if sent in request
  if (request.body.latitude && request.body.longitude) {
    newPlace.placeData.coordinates.latitude = request.body.latitude;
    newPlace.placeData.coordinates.longitude = request.body.longitude;
  }

  return newPlace;
};
