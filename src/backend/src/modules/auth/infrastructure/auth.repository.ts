import { prisma, Role } from '../../../db/index.js';

const userSelect = {
  id: true,
  email: true,
  username: true,
  displayName: true,
  bio: true,
  role: true,
  avatarUrl: true,
  createdAt: true,
} as const;

const sessionUserSelect = {
  id: true,
  email: true,
  username: true,
  displayName: true,
  role: true,
  avatarUrl: true,
} as const;

export class AuthRepository {
  findByEmailOrUsername(email: string, username: string) {
    return prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
  }

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  findByIdWithProfile(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  }

  createUser(data: {
    email: string;
    username: string;
    passwordHash: string;
    displayName: string;
    role: Role;
  }) {
    return prisma.user.create({
      data,
      select: sessionUserSelect,
    });
  }

  updateProfile(userId: string, data: Record<string, unknown>) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        bio: true,
        role: true,
        avatarUrl: true,
      },
    });
  }

  updateRole(userId: string, role: Role) {
    return prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, username: true, role: true },
    });
  }

  listUsers(skip: number, take: number) {
    return prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  countUsers() {
    return prisma.user.count();
  }

  findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token } });
  }

  createRefreshToken(data: { token: string; userId: string; expiresAt: Date }) {
    return prisma.refreshToken.create({ data });
  }

  deleteRefreshToken(token: string) {
    return prisma.refreshToken.delete({ where: { token } });
  }

  deleteRefreshTokens(token: string) {
    return prisma.refreshToken.deleteMany({ where: { token } });
  }
}

export const authRepository = new AuthRepository();
