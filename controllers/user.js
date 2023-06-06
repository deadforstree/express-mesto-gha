require('dotenv').config();
const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const WrongTokenError = require('../errors/wrong-token-err');
const ExistingEmailError = require('../errors/existing-email-err');

const { NODE_ENV, JWT_SECRET } = process.env;

const {
  handleError,
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
} = require('../constants/constants');

exports.getUsers = async (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

exports.getUserMe = async (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь по указанному id не найден'));
      }
      res.status(HTTP_STATUS_OK)
        .send(user);
    })
    .catch((err) => handleError(err, next));
};

exports.getUserbyId = async (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь по указанному id не найден'));
      } return res.send(user);
    })
    .catch((err) => handleError(err, next));
};

// создание пользователя
exports.createUser = async (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name, about, avatar, email, password: hash,
      })
        .then((user) => {
          const noPassword = user.toObject({ useProjection: true });
          res.status(HTTP_STATUS_CREATED).send(noPassword);
        })
        .catch((err) => {
          if (err.code === 11000) {
            return next(new ExistingEmailError('Пользователь с указанным e-mail уже существует'));
          }
          return handleError(err, next);
        });
    })
    .catch(next);
};

exports.patchUserMe = async (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь не найден'));
      }
      res.status(HTTP_STATUS_OK).send({ data: user });
    })
    .catch((err) => handleError(err, next));
};

exports.patchUserAvatar = async (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь не найден'));
      }
      res.status(HTTP_STATUS_OK).send({ avatar });
    })
    .catch((err) => handleError(err, next));
};

// контроллер аутентификации (проверка почты и пароля)
exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return next(new WrongTokenError('Неправильные почта или пароль.'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return next(new WrongTokenError('Неправильные почта или пароль.'));
          }

          const token = jwt.sign(
            { _id: user._id },
            NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
            { expiresIn: '7d' },
          );

          return res.send({ token });
        });
    })

    .catch(next);
};
