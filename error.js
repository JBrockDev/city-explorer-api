function handleError(errorCode, errorMessage, response) {
  response.status(errorCode).send(errorMessage);
}

module.exports = { handleError };