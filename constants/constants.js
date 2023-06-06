const http2 = require('node:http2');
const NotFoundError = require('../errors/not-found-err');
const WrongDataError = require('../errors/wrong-data-err');

const {
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_NOT_FOUND,
} = http2.constants;

const handleError = (err, next) => {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return next(new WrongDataError('Передан некорректный id'));
  }
  if (err.name === 'DocumentNotFoundError') {
    return next(new NotFoundError('Данные с указанным id не найдены.'));
  }
  return next(err);
};

module.exports = {
  handleError,
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_NOT_FOUND,
};
