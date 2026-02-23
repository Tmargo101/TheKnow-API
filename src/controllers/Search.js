import * as Responses from '../utilities/Responses';
import * as Strings from '../Strings';

const PLACES_BASE = 'https://places.googleapis.com/v1';

// Read lazily so dotenv.config() in app.js has time to run before first use
const getApiKey = () => process.env.GOOGLE_PLACES_API_KEY;

const numericPriceLevel = (str) => {
  const map = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  };
  return map[str] ?? null;
};

const buildPhotoUrl = (photoName) => {
  if (!photoName) return null;
  return `${PLACES_BASE}/${photoName}/media?maxWidthPx=800&key=${getApiKey()}`;
};

const fetchPlaceDetails = async (googlePlaceId) => {
  const fieldMask = [
    'id', 'displayName', 'formattedAddress', 'location',
    'nationalPhoneNumber', 'websiteUri', 'rating', 'userRatingCount',
    'priceLevel', 'types', 'photos',
  ].join(',');

  const res = await fetch(`${PLACES_BASE}/places/${googlePlaceId}`, {
    headers: {
      'X-Goog-Api-Key': getApiKey(),
      'X-Goog-FieldMask': fieldMask,
    },
  });

  if (!res.ok) {
    throw new Error(`Google Places Details error: ${res.status}`);
  }

  return res.json();
};

export const searchPlaces = async (request, response) => {
  const { q, location } = request.query;

  if (!q || !q.trim()) {
    Responses.sendGenericErrorResponse(response, Strings.RESPONSE_MESSAGE.VALIDATION_FAILED);
    return;
  }

  try {
    const body = { textQuery: q.trim() };
    if (location) {
      const [lat, lng] = location.split(',').map(Number);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        body.locationBias = {
          circle: { center: { latitude: lat, longitude: lng }, radius: 5000 },
        };
      }
    }

    const res = await fetch(`${PLACES_BASE}/places:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': getApiKey(),
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Google Places Search error: ${res.status}`);
    }

    const data = await res.json();
    const results = (data.places || []).map((place) => ({
      googlePlaceId: place.id,
      displayName: place.displayName?.text ?? '',
      formattedAddress: place.formattedAddress ?? '',
      lat: place.location?.latitude ?? null,
      lng: place.location?.longitude ?? null,
    }));

    Responses.sendDataResponse(response, Strings.RESPONSE_MESSAGE.PLACE_SEARCH_SUCCESS, { results });
  } catch (err) {
    console.error('searchPlaces error:', err);
    Responses.sendGenericErrorResponse(response, Strings.RESPONSE_MESSAGE.PLACE_SEARCH_FAILED);
  }
};

export const getPlaceDetails = async (request, response) => {
  const { googlePlaceId } = request.params;

  if (!googlePlaceId) {
    Responses.sendGenericErrorResponse(response, Strings.RESPONSE_MESSAGE.VALIDATION_FAILED);
    return;
  }

  try {
    const data = await fetchPlaceDetails(googlePlaceId);

    const photoUrl = data.photos?.[0]?.name
      ? buildPhotoUrl(data.photos[0].name)
      : null;

    const details = {
      googlePlaceId: data.id,
      name: data.displayName?.text ?? '',
      address: data.formattedAddress ?? '',
      lat: data.location?.latitude ?? null,
      lng: data.location?.longitude ?? null,
      phoneNumber: data.nationalPhoneNumber ?? null,
      link: data.websiteUri ?? null,
      rating: data.rating ?? null,
      reviewCount: data.userRatingCount ?? null,
      priceLevel: numericPriceLevel(data.priceLevel),
      categories: data.types ?? [],
      photoUrl,
    };

    Responses.sendDataResponse(response, Strings.RESPONSE_MESSAGE.PLACE_DETAILS_SUCCESS, { details });
  } catch (err) {
    console.error('getPlaceDetails error:', err);
    Responses.sendGenericErrorResponse(response, Strings.RESPONSE_MESSAGE.PLACE_SEARCH_FAILED);
  }
};

export const refreshPlaceDataFromGoogle = async (placeDoc) => {
  const { googlePlaceId } = placeDoc.placeData;
  if (!googlePlaceId) return placeDoc;

  try {
    const data = await fetchPlaceDetails(googlePlaceId);

    const photoUrl = data.photos?.[0]?.name
      ? buildPhotoUrl(data.photos[0].name)
      : placeDoc.placeData.photoUrl;

    if (data.rating != null) placeDoc.placeData.rating = data.rating;
    if (data.userRatingCount != null) placeDoc.placeData.reviewCount = data.userRatingCount;
    const price = numericPriceLevel(data.priceLevel);
    if (price != null) placeDoc.placeData.priceLevel = price;
    if (data.types?.length) placeDoc.placeData.categories = data.types;
    if (photoUrl) placeDoc.placeData.photoUrl = photoUrl;
    placeDoc.placeDataLastRefreshed = new Date();
  } catch (err) {
    console.error(`refreshPlaceDataFromGoogle error for ${googlePlaceId}:`, err);
  }

  return placeDoc;
};
