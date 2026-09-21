import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import User from '../models/user';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

const generateTokens = (userId: any) => {
  const idString = String(userId);

  const accessToken = jwt.sign({ _id: idString }, SECRET_KEY, {
    expiresIn: '10m',
  });
  const refreshToken = jwt.sign({ _id: idString }, SECRET_KEY, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || password.length < 6) {
      throw new BadRequestError('Некорректные данные');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      tokens: [],
    });

    await newUser.save();

    const { accessToken, refreshToken } = generateTokens(newUser._id);

    newUser.tokens.push({ token: refreshToken });
    await newUser.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: ms('7d'),
      path: '/',
    });

    return res.status(201).json({
      user: { email: newUser.email, name: newUser.name },
      success: true,
      accessToken,
    });
  } catch (err) {
    return next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Email и пароль обязательны');
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password',
    );

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedError('Неверные учетные данные');
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.tokens.push({ token: refreshToken });
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: ms('7d'),
      path: '/',
    });

    return res.json({
      user: { email: user.email, name: user.name },
      success: true,
      accessToken,
    });
  } catch (err) {
    return next(err);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new BadRequestError('Требуется авторизация');
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, SECRET_KEY) as { _id: string };

    const user = await User.findById(payload._id);
    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    return res.json({
      user: { email: user.email, name: user.name },
      success: true,
    });
  } catch (err) {
    return next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      throw new BadRequestError('Refresh token отсутствует');
    }

    const payload = jwt.verify(refreshToken, SECRET_KEY) as { _id: string };

    const user = await User.findById(payload._id).select('+tokens');
    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    user.tokens = user.tokens.filter((t) => t.token !== refreshToken);
    await user.save();

    res.clearCookie('refreshToken');
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      throw new BadRequestError('Refresh token отсутствует');
    }

    const payload = jwt.verify(refreshToken, SECRET_KEY) as { _id: string };

    const user = await User.findOne({
      _id: payload._id,
      'tokens.token': refreshToken,
    }).select('+tokens');

    if (!user) {
      throw new BadRequestError('Недействительный или отозванный токен');
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    user.tokens = user.tokens.filter((t) => t.token !== refreshToken);
    user.tokens.push({ token: newRefreshToken });
    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: ms('7d'),
      path: '/',
    });

    return res.json({
      user: { email: user.email, name: user.name },
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    return next(err);
  }
};
