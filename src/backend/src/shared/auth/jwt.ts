import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { JwtPayload } from '../../types/index.js';

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpires as jwt.SignOptions['expiresIn'] });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpires as jwt.SignOptions['expiresIn'] });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtAccessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as JwtPayload;
}

export function getRefreshExpiryDate(): Date {
  const days = env.jwtRefreshExpires.includes('d')
    ? parseInt(env.jwtRefreshExpires, 10)
    : 7;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
