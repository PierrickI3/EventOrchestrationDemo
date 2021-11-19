const responseLib = require('./response-lib');

module.exports.getPathParameter = function (event, parameter, defaultValue) {
  if (event && Object.keys(event).includes('pathParameters') && event.pathParameters[parameter]) {
    return event.pathParameters[parameter];
  } else {
    return defaultValue;
  }
};

module.exports.getQueryStringParameter = function (event, parameter, defaultValue) {
  if (event && Object.keys(event).includes('queryStringParameters') && event.queryStringParameters && Object.keys(event.queryStringParameters).includes(parameter)) {
    return event.queryStringParameters[parameter];
  } else {
    console.log(`${parameter} not found in queryStringParameters. Returning default value: ${defaultValue}`);
    return defaultValue;
  }
};

module.exports.getBody = function (event) {
  if (event?.body) {
    if (typeof event.body === 'string') {
      return JSON.parse(event.body);
    } else {
      return event.body;
    }
  } else {
    return undefined;
  }
};

module.exports.handleError = function (error) {
  return new Promise((resolve, reject) => {
    if (error.hasOwnProperty('response') && error.response && error.response.hasOwnProperty('status')) {
      console.error('Error.response.data: ' + error.response.data);
      console.error(error.response.data && Object.keys(error.response.data).length > 0 ? error.response.data.message : error.response.statusText);
      resolve(responseLib.generic(error.response.status, { message: error.response.data && Object.keys(error.response.data).length > 0 ? error.response.data.message : error.response.statusText }));
    } else {
      resolve(responseLib.failure(error));
    }
  });
};
