const express = require('express');

const DATA_NOT_FOUND_ERROR_CODE = 404;

const { userRoutes } = require('./user');

const { cardsRoutes } = require('./card');

const routes = express.Router();

routes.use('/users', userRoutes);
routes.use('/cards', cardsRoutes);
routes.use('/', (req, res) => {
  res.status(DATA_NOT_FOUND_ERROR_CODE).send({ message: 'Страница по указанному маршруту не найдена' });
});

exports.routes = routes;
