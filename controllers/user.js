const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const WrongDataError = require('../errors/wrong-data-err');
const WrongTokenError = require('../errors/wrong-token-err');
const ExistingEmailError = require('../errors/existing-email-err');

const saltPassword = 10;

const { NODE_ENV, JWT_SECRET } = process.env;

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).send(users);
  } catch (err) {
    next(err);
  }
};

exports.getUserMe = async (req, res, next) => {
  const ownerId = req.user._id;
  try {
    const userSpec = await User.findById(ownerId);
    if (userSpec) {
      res.status(200).send({ data: userSpec });
    } else {
      throw new NotFoundError(`Пользователь по указанному ${ownerId} не найден`);
    }
  } catch (err) {
    if (err.name === 'CastError') {
      next(new WrongDataError(`Невалидный id ${ownerId}`));
    } else {
      next(err);
    }
  }
};

exports.getUserbyId = async (req, res, next) => {
  const ownerId = req.params.userId;
  try {
    const userSpec = await User.findById(req.params.userId);
    if (userSpec) {
      res.status(200).send({ data: userSpec });
    } else {
      throw new NotFoundError(`Пользователь по указанному ${ownerId} не найден`);
    }
  } catch (err) {
    if (err.name === 'CastError') {
      next(new WrongDataError(`Невалидный id ${ownerId}`));
    } else {
      next(err);
    }
  }
};

// создание пользователя
exports.createUser = async (req, res, next) => {
  // получаем данные
  const {
    name, about, avatar, email, password,
  } = req.body;
  // хешируем пароль
  bcrypt.hash(password, saltPassword)
    .then((hash) => {
      User.create({
        name,
        about,
        avatar,
        email,
        password: hash, // записываем хеш в базу
      })
        .then(() => {
          res.status(200).send({
            data: {
              name,
              about,
              avatar,
              email,
            },
          });
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            return next(new WrongDataError('Некорректные данные'));
          }
          if (err.code === 11000) {
            // ошибка: пользователь пытается зарегистрироваться по уже существующему в базе email
            return next(new ExistingEmailError('Данный email уже существует в базе данных'));
          }
          return next(err);
        });
    })
    .catch(next);
};

exports.patchUserMe = async (req, res, next) => {
  try {
    const { name, about } = req.body;
    const opts = { new: true, runValidators: true };
    if (!name || !about) {
      throw new WrongDataError('Поля "name" и "about" должно быть заполнены');
    } else {
      const ownerId = req.user._id;
      const userPatchMe = await User.findByIdAndUpdate(ownerId, { name, about }, opts);
      if (userPatchMe) {
        res.status(200).send({ data: userPatchMe });
      } else {
        throw new NotFoundError('Пользователь не найден');
      }
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new WrongDataError('Некорректные данные'));
    } else {
      next(err);
    }
  }
};

exports.patchUserAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;
    const ownerId = req.user._id;
    const opts = { new: true, runValidators: true };
    const userPatchAvatar = await User.findByIdAndUpdate(ownerId, { avatar }, opts);
    if (userPatchAvatar) {
      res.status(200).send({ data: userPatchAvatar });
    } else {
      throw new NotFoundError('Пользователь не найден');
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new WrongDataError('Некорректные данные'));
    } else {
      next(err);
    }
  }
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
