import * as Responses from '../utilities/Responses';
import * as Strings from '../Strings';

export const home = async (request, response) => {
  Responses.sendGenericSuccessResponse(
    response,
    Strings.RESPONSE_MESSAGE.API_LIVE,
  );
};

export const notFound = async (request, response) => {
  Responses.sendNotFoundResponse(
    response,
    Strings.RESPONSE_MESSAGE.NOT_FOUND,
  );
};
