const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-err');
const DeleteCardError = require('../errors/delete-card-err');
const {
  handleError,
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
} = require('../constants/constants');

exports.getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({});
    res.status(200).send(cards);
  } catch (err) {
    next(err);
  }
};

exports.deleteCardById = (req, res, next) => {
  const userId = req.user._id;

  Card.findById(req.params.cardId)
    .orFail()
    .then((card) => {
      const ownerId = card.owner.toString();
      if (ownerId !== userId) {
        return next(new DeleteCardError('К сожалению вы не автор данной карточки'));
      }
      return card;
    })
    .then((card) => Card.deleteOne(card))
    .then((card) => res.status(HTTP_STATUS_OK).send(card))
    .catch((err) => handleError(err, next));
};

exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(HTTP_STATUS_CREATED).send(card))
    .catch(next);
};

exports.putCardlike = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return next(new NotFoundError('Неправильный id'));
      } return res.status(HTTP_STATUS_OK).send(card);
    })
    .catch((err) => handleError(err, next));
};

exports.deleteCardLike = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((card) => {
      if (!card) {
        return next(new NotFoundError('Неправильный id'));
      } return res.status(HTTP_STATUS_OK).send(card);
    })
    .catch((err) => handleError(err, next));
};
