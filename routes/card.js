const express = require('express');

const {
  getCards,
  deleteCardById,
  createCard,
  putCardlike,
  deleteCardLike,
} = require('../controllers/card');
const {
  validateCardId,
  createCardValidation,
} = require('../middlewares/validations');

const cardsRoutes = express.Router();

cardsRoutes.get('/', getCards);

cardsRoutes.delete('/:cardId', validateCardId, deleteCardById);

cardsRoutes.put('/:cardId/likes', validateCardId, putCardlike);

cardsRoutes.delete('/:cardId/likes', validateCardId, deleteCardLike);

cardsRoutes.post('/', express.json(), createCardValidation, createCard);

exports.cardsRoutes = cardsRoutes;
