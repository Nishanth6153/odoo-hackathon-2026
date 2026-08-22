import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { prisma } from '../config/prisma';
import { CreateEmployeeInput, UpdateEmployeeInput } from './employee.validation';
import { CustomError } from '../middleware/errorHandler';
import { AuthUser } from '../types/express';

export class EmployeeService {
  /**
   * Generates a sequential employee ID (e.g. EMP001, EMP002).
   * Queries existing employee IDs and relies on Prisma/DB @unique constraint as final safety.
   */
  async generateEmployeeId(): Promise<string> {
    const employees = await prisma.employee.findMany({
      select: { employeeId: true },
    });

    let maxNum = 0;
    const empIdRegex = /^EMP(\d+)$/i;

    for (const emp of employees) {
      const match = emp.employeeId.match(empIdRegex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    }

    const nextNum = maxNum + 1;
    const padded = nextNum.toString().padStart(3, '0');
    return `EMP${padded}`;
  }

  async createEmployee(data: CreateEmployeeInput) {
    const emailNormalized = data.email.toLowerCase();

    // 1. Check for duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (existingUser) {
      const error: CustomError = new Error('User with this email address already exists');
      error.statusCode = 409;
      throw error;
    }

    // 2. Generate unique sequential Employee ID
    const employeeId = await this.generateEmployeeId();

    // 3. Prepare password (provided or generated secure temporary password)
    const rawPassword = data.password || crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 4. Atomic transaction: create User + Employee
    try {
      const employee = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: emailNormalized,
            password: hashedPassword,
            role: Role.EMPLOYEE,
            isEmailVerified: true,
          },
        });

        return tx.employee.create({
          data: {
            userId: user.id,
            employeeId,
            name: data.name,
            jobTitle: data.jobTitle,
            phone: data.phone || null,
            address: data.address || null,
            profilePicture: data.profilePicture || null,
            documents: data.documents || null,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                isEmailVerified: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        });
      });

      return employee;
    } catch (err: any) {
      if (err.code === 'P2002') {
        const error: CustomError = new Error('Employee creation failed due to a unique constraint violation (duplicate email or employeeId)');
        error.statusCode = 409;
        throw error;
      }
      throw err;
    }
  }

  async getEmployees() {
    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isEmailVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { employees };
  }

  async getEmployeeById(id: string) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isEmailVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!employee) {
      const error: CustomError = new Error('Employee not found');
      error.statusCode = 404;
      throw error;
    }

    return { employee };
  }

  async getEmployeeByUserId(userId: string) {
    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isEmailVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!employee) {
      const error: CustomError = new Error('Employee profile not found for the current user');
      error.statusCode = 404;
      throw error;
    }

    return { employee };
  }

  async updateEmployee(id: string, currentAuthUser: AuthUser, data: UpdateEmployeeInput) {
    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      const error: CustomError = new Error('Employee not found');
      error.statusCode = 404;
      throw error;
    }

    // Ownership check: Admin can update any profile; Employee can only update own profile
    if (currentAuthUser.role !== Role.ADMIN && existingEmployee.userId !== currentAuthUser.userId) {
      const error: CustomError = new Error('Forbidden: You can only update your own employee profile');
      error.statusCode = 403;
      throw error;
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isEmailVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return { employee: updatedEmployee };
  }
}

export const employeeService = new EmployeeService();
