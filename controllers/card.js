const card = require('../models/card');

const INCORRECT_DATA_ERROR_CODE = 400;
const DATA_NOT_FOUND_ERROR_CODE = 404;
const DEFAULT_ERROR_CODE = 500;

exports.getCards = async (req, res) => {
  try {
    const cards = await card.find({});
    res.status(200).send(cards);
  } catch (err) {
    res.status(DEFAULT_ERROR_CODE).send({ message: 'Произошла ошибка!', ...err });
  }
};

exports.deleteCardById = async (req, res) => {
  try {
    const cardSpec = await card.findByIdAndRemove(req.params.cardId);
    if (cardSpec) {
      res.status(200).send(cardSpec);
    } else {
      res.status(DATA_NOT_FOUND_ERROR_CODE).send({ message: 'Карточка не найдена' });
    }
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Невалидный id ' });
    } else {
      res.status(DEFAULT_ERROR_CODE).send({ message: 'Произошла ошибка!', ...err });
    }
  }
};

exports.createCard = async (req, res) => {
  try {
    const { name, link } = req.body;
    const ownerId = req.user._id;
    if (!name || !link) {
      res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Поля "name" и "link" должны быть заполнены' });
    } else {
      const cardNew = await card.create({ name, link, owner: ownerId });
      res.status(201).send({ data: cardNew });
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Некорректные данные' });
    } else {
      res.status(DEFAULT_ERROR_CODE).send({ message: 'Произошла ошибка!', ...err });
    }
  }
};

exports.putCardlike = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const cardLike = await card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: ownerId } },
      { new: true },
    );
    if (cardLike) {
      res.status(200).send({ data: cardLike });
    } else {
      res.status(DATA_NOT_FOUND_ERROR_CODE).send({ message: 'Карточка не найдена' });
    }
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Невалидный id ' });
    } else {
      res.status(DEFAULT_ERROR_CODE).send({ message: 'Произошла ошибка!', ...err });
    }
  }
};

exports.deleteCardLike = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const cardDislike = await card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: ownerId } },
      { new: true },
    );
    if (cardDislike) {
      res.status(200).send({ data: cardDislike });
    } else {
      res.status(DATA_NOT_FOUND_ERROR_CODE).send({ message: 'Карточка не найдена' });
    }
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Невалидный id ' });
    } else {
      res.status(DEFAULT_ERROR_CODE).send({ message: 'Произошла ошибка!', ...err });
    }
  }
};
