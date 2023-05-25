const user = require('../models/user');

const INCORRECT_DATA_ERROR_CODE = 400;
const DATA_NOT_FOUND_ERROR_CODE = 404;
const DEFAULT_ERROR_CODE = 500;

exports.getUsers = async (req, res) => {
  try {
    const users = await user.find({});
    res.status(200).send(users);
  } catch (err) {
    res.status(DEFAULT_ERROR_CODE).send({ message: 'Произошла ошибка!', ...err });
  }
};

exports.getUserbyId = async (req, res) => {
  const ownerId = req.params.userId;
  try {
    const userSpec = await user.findById(req.params.userId);
    if (userSpec) {
      res.status(200).send({ data: userSpec });
    } else {
      res.status(DATA_NOT_FOUND_ERROR_CODE).send({ message: `Пользователь по указанному ${ownerId} не найден` });
    }
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(INCORRECT_DATA_ERROR_CODE).send({ message: `Невалидный id ${ownerId}` });
    }
    res.status(DEFAULT_ERROR_CODE).send({ message: 'Произошла ошибка!', ...err });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, about, avatar } = req.body;
    if (!name || !about || !avatar) {
      res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Поля "name", "about" и "avatar" должно быть заполнены' });
    } else {
      const userNew = await user.create({ name, about, avatar });
      res.status(200).send({ data: userNew });
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Некорректные данные' });
    } else {
      res.status(DEFAULT_ERROR_CODE).send({ message: 'Произошла ошибка!', ...err });
    }
  }
};

exports.patchUserMe = async (req, res) => {
  try {
    const { name, about } = req.body;
    const opts = { new: true, runValidators: true };
    if (!name || !about) {
      res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Поля "name" и "about" должно быть заполнены' });
    } else {
      const ownerId = req.user._id;
      const userPatchMe = await user.findByIdAndUpdate(ownerId, { name, about }, opts);
      if (userPatchMe) {
        res.status(200).send({ data: userPatchMe });
      } else {
        res.status(DATA_NOT_FOUND_ERROR_CODE).send({ message: 'Пользователь не найден' });
      }
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Некорректные данные' });
    } else {
      res.status(DEFAULT_ERROR_CODE).send({ message: 'Произошла ошибка!', ...err });
    }
  }
};

exports.patchUserAvatar = async (req, res) => {
  try {
    if (!req.body.avatar) {
      res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Поле "avatar" должно быть заполнено' });
    } else {
      const { avatar } = req.body;
      const ownerId = req.user._id;
      const opts = { new: true, runValidators: true };
      const userPatchAvatar = await user.findByIdAndUpdate(ownerId, { avatar }, opts);
      if (userPatchAvatar) {
        res.status(200).send({ data: userPatchAvatar });
      } else {
        res.status(DATA_NOT_FOUND_ERROR_CODE).send({ message: 'Пользователь не найден' });
      }
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(INCORRECT_DATA_ERROR_CODE).send({ message: 'Некорректные данные' });
    } else {
      res.status(DEFAULT_ERROR_CODE).send({ message: 'Произошла ошибка!', ...err });
    }
  }
};
