import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';
import { env } from '../config/env';
import { AppError } from '../middleware/error.middleware';
import { RegisterInput, LoginInput, AuthResponse } from '../types/auth.types';

const SALT_ROUNDS = 12;

export const registerUser = async (input: RegisterInput): Promise<AuthResponse> => {
  const existingUser = await User.findOne({ email: input.email });
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: hashedPassword,
  });

  const token = generateToken(user._id.toString());

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  };
};

export const loginUser = async (input: LoginInput): Promise<AuthResponse> => {
  const user = await User.findOne({ email: input.email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user._id.toString());

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  };
};

const generateToken = (userId: string): string => {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] };
  return jwt.sign({ userId }, env.JWT_SECRET, options);
};

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
};
