const express = require('express');
const {
  getUsers,
  getUserMe,
  getUserbyId,
  patchUserMe,
  patchUserAvatar,
} = require('../controllers/user');
const {
  patchUserMeValidation,
  patchUserAvatarValidation,
  userIdValidation,
} = require('../middlewares/validations');

const userRoutes = express.Router();

userRoutes.get('/', getUsers);

userRoutes.get('/me', getUserMe);

userRoutes.patch('/me', express.json(), patchUserMeValidation, patchUserMe);

userRoutes.get('/:userId', userIdValidation, getUserbyId);

userRoutes.patch('/me/avatar', express.json(), patchUserAvatarValidation, patchUserAvatar);

exports.userRoutes = userRoutes;
