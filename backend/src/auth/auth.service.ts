import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { LoginInput } from './auth.validation';
import { CustomError } from '../middleware/errorHandler';

export class AuthService {
  async login(input: LoginInput) {
    const { email, password } = input;

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      const error: CustomError = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // 2. Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const error: CustomError = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // 3. Sign JWT
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      }
    );

    // 4. Return safe user data + token
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            jobTitle: true,
            profilePicture: true,
          },
        },
      },
    });

    if (!user) {
      const error: CustomError = new Error('User not found');
      error.statusCode = 401;
      throw error;
    }

    return { user };
  }
}

export const authService = new AuthService();
