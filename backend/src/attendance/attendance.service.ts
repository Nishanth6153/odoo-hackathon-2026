import { AttendanceStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { CustomError } from '../middleware/errorHandler';

export class AttendanceService {
  /**
   * Helper method for consistent start-of-day UTC normalization.
   * Prevents timezone discrepancy issues around midnight.
   */
  getStartOfToday(now: Date = new Date()): Date {
    const isoDateString = now.toISOString().split('T')[0];
    return new Date(`${isoDateString}T00:00:00.000Z`);
  }

  /**
   * Calculates integer work duration in minutes derived from checkIn and checkOut timestamps.
   */
  calculateWorkMinutes(checkIn: Date | null, checkOut: Date | null): number | null {
    if (!checkIn || !checkOut) {
      return null;
    }
    const diffMs = checkOut.getTime() - checkIn.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60)));
  }

  async checkIn(userId: string) {
    // 1. Find linked Employee profile
    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      const error: CustomError = new Error('Employee profile not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Determine start of today
    const today = this.getStartOfToday();

    // 3. Check for existing check-in today
    const existingRecord = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
    });

    if (existingRecord) {
      const error: CustomError = new Error('Employee has already checked in today');
      error.statusCode = 409;
      throw error;
    }

    // 4. Server generates check-in timestamp and creates Attendance
    const now = new Date();
    try {
      const attendance = await prisma.attendance.create({
        data: {
          employeeId: employee.id,
          date: today,
          checkIn: now,
          status: AttendanceStatus.PRESENT,
        },
      });

      return {
        attendance: {
          ...attendance,
          workMinutes: null,
        },
      };
    } catch (err: any) {
      if (err.code === 'P2002') {
        const error: CustomError = new Error('Employee has already checked in today');
        error.statusCode = 409;
        throw error;
      }
      throw err;
    }
  }

  async checkOut(userId: string) {
    // 1. Find linked Employee profile
    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      const error: CustomError = new Error('Employee profile not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Determine start of today
    const today = this.getStartOfToday();

    // 3. Query today's attendance
    const existingRecord = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
    });

    if (!existingRecord || !existingRecord.checkIn) {
      const error: CustomError = new Error('No active attendance found for today');
      error.statusCode = 400;
      throw error;
    }

    if (existingRecord.checkOut) {
      const error: CustomError = new Error('Employee has already checked out today');
      error.statusCode = 409;
      throw error;
    }

    // 4. Server generates check-out timestamp
    const now = new Date();
    const updatedAttendance = await prisma.attendance.update({
      where: { id: existingRecord.id },
      data: {
        checkOut: now,
      },
    });

    const workMinutes = this.calculateWorkMinutes(updatedAttendance.checkIn, updatedAttendance.checkOut);

    return {
      attendance: {
        ...updatedAttendance,
        workMinutes,
      },
    };
  }

  async getTodayAttendance(userId: string) {
    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      const error: CustomError = new Error('Employee profile not found');
      error.statusCode = 404;
      throw error;
    }

    const today = this.getStartOfToday();
    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
    });

    if (!attendance) {
      return { attendance: null };
    }

    const workMinutes = this.calculateWorkMinutes(attendance.checkIn, attendance.checkOut);

    return {
      attendance: {
        ...attendance,
        workMinutes,
      },
    };
  }

  async getEmployeeAttendanceHistory(userId: string) {
    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      const error: CustomError = new Error('Employee profile not found');
      error.statusCode = 404;
      throw error;
    }

    const attendances = await prisma.attendance.findMany({
      where: { employeeId: employee.id },
      orderBy: { date: 'desc' },
    });

    const mapped = attendances.map((att) => ({
      ...att,
      workMinutes: this.calculateWorkMinutes(att.checkIn, att.checkOut),
    }));

    return { attendances: mapped };
  }

  async getAllAttendance() {
    const attendances = await prisma.attendance.findMany({
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            jobTitle: true,
            profilePicture: true,
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    const mapped = attendances.map((att) => ({
      ...att,
      workMinutes: this.calculateWorkMinutes(att.checkIn, att.checkOut),
    }));

    return { attendances: mapped };
  }

  async getAttendanceById(id: string) {
    const attendance = await prisma.attendance.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            jobTitle: true,
            profilePicture: true,
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!attendance) {
      const error: CustomError = new Error('Attendance record not found');
      error.statusCode = 404;
      throw error;
    }

    const workMinutes = this.calculateWorkMinutes(attendance.checkIn, attendance.checkOut);

    return {
      attendance: {
        ...attendance,
        workMinutes,
      },
    };
  }
}

export const attendanceService = new AttendanceService();
