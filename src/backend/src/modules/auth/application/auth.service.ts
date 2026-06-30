import * as argon2 from 'argon2';
import { Role } from '../../../db/index.js';
import type { LoginInput, RegisterInput, UpdateProfileInput } from '../../../types/index.js';
import { verifyRecaptcha } from '../../../shared/security/recaptcha.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getRefreshExpiryDate,
} from '../../../shared/auth/jwt.js';
import { authRepository } from '../infrastructure/auth.repository.js';
import {
  userExists,
  invalidCredentials,
  invalidRefreshToken,
  refreshExpired,
  userNotFound,
} from '../domain/auth.errors.js';

export class AuthService {
  async register(input: RegisterInput) {
    await verifyRecaptcha(input.recaptchaToken);

    const existing = await authRepository.findByEmailOrUsername(input.email, input.username);
    if (existing) {
      throw userExists();
    }

    const passwordHash = await argon2.hash(input.password);
    const user = await authRepository.createUser({
      email: input.email,
      username: input.username,
      passwordHash,
      displayName: input.displayName ?? input.username,
      role: Role.USER,
    });

    return this.createSession(user);
  }

  async login(input: LoginInput) {
    await verifyRecaptcha(input.recaptchaToken);

    const user = await authRepository.findByEmail(input.email);
    if (!user || !user.isActive) {
      throw invalidCredentials();
    }

    const valid = await argon2.verify(user.passwordHash, input.password);
    if (!valid) {
      throw invalidCredentials();
    }

    return this.createSession({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    });
  }

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw invalidRefreshToken();
    }

    const stored = await authRepository.findRefreshToken(refreshToken);
    if (!stored || stored.expiresAt < new Date()) {
      throw refreshExpired();
    }

    const user = await authRepository.findById(payload.sub);
    if (!user || !user.isActive) {
      throw userNotFound();
    }

    await authRepository.deleteRefreshToken(refreshToken);
    return this.createSession({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    });
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await authRepository.deleteRefreshTokens(refreshToken);
    }
  }

  async getMe(userId: string) {
    const user = await authRepository.findByIdWithProfile(userId);
    if (!user) throw userNotFound();
    return user;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    return authRepository.updateProfile(userId, input);
  }

  async updateUserRole(userId: string, role: Role) {
    return authRepository.updateRole(userId, role);
  }

  async listUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      authRepository.listUsers(skip, limit),
      authRepository.countUsers(),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  private async createSession(user: {
    id: string;
    email: string;
    username: string;
    displayName: string | null;
    role: Role;
    avatarUrl: string | null;
  }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await authRepository.createRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshExpiryDate(),
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    };
  }
}

export const authService = new AuthService();
