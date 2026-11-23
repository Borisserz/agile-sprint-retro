const bcrypt = require('bcrypt');
const { User, Sequelize } = require('../models');
const { signAccessToken } = require('../config/jwt');

const BCRYPT_ROUNDS = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function validateCredentials(email, password) {
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return 'valid email is required';
  }
  if (!password || typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return `password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return null;
}

function signToken(user) {
  return signAccessToken({ id: user.id, email: user.email, role: user.role });
}

async function register(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const error = validateCredentials(email, password);
    if (error) {
      return next({ status: 400, message: error });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({
      email: email.trim().toLowerCase(),
      passwordHash,
      role: 'member',
    });

    res.status(201).json(user.toSafeJSON());
  } catch (err) {
    if (err instanceof Sequelize.UniqueConstraintError) {
      return next({ status: 400, message: 'email already registered' });
    }
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return next({ status: 400, message: 'email and password are required' });
    }

    const user = await User.findOne({
      where: { email: String(email).trim().toLowerCase() },
    });
    if (!user) {
      return next({ status: 401, message: 'invalid email or password' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return next({ status: 401, message: 'invalid email or password' });
    }

    const token = signToken(user);
    res.status(200).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body || {};
    if (!oldPassword || typeof oldPassword !== 'string') {
      return next({ status: 400, message: 'oldPassword is required' });
    }
    if (
      !newPassword
      || typeof newPassword !== 'string'
      || newPassword.length < MIN_PASSWORD_LENGTH
    ) {
      return next({
        status: 400,
        message: `newPassword must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return next({ status: 404, message: 'User not found' });
    }

    const ok = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!ok) {
      return next({ status: 401, message: 'old password is incorrect' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await user.save();

    res.status(200).json({ message: 'password updated' });
  } catch (err) {
    next(err);
  }
}

async function profile(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return next({ status: 404, message: 'User not found' });
    }
    res.status(200).json(user.toSafeJSON());
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, changePassword, profile };
