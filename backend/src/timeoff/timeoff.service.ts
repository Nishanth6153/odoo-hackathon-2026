import { LeaveStatus, AttendanceStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { CustomError } from '../middleware/errorHandler';
import { CreateLeaveRequestInput, ApproveRejectLeaveInput } from './timeoff.validation';

export class TimeOffService {
  /**
   * Helper method for consistent start-of-day UTC normalization.
   */
  normalizeToUtcMidnight(dateInput: string | Date): Date {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const iso = d.toISOString().split('T')[0];
    return new Date(`${iso}T00:00:00.000Z`);
  }

  /**
   * Calculates requested leave days dynamically.
   */
  calculateLeaveDays(startDate: Date, endDate: Date): number {
    const diffMs = endDate.getTime() - startDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  }

  async createLeaveRequest(userId: string, data: CreateLeaveRequestInput) {
    // 1. Find linked Employee profile
    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      const error: CustomError = new Error('Employee profile not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Normalize start and end dates
    const startDate = this.normalizeToUtcMidnight(data.startDate);
    const endDate = this.normalizeToUtcMidnight(data.endDate);

    // 3. Overlap check against PENDING or APPROVED leave requests
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        employeeId: employee.id,
        status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    if (overlapping) {
      const error: CustomError = new Error('Overlapping leave request exists for the selected date range');
      error.statusCode = 409;
      throw error;
    }

    // 4. Create LeaveRequest (status forced to PENDING)
    const request = await prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        leaveType: data.leaveType,
        startDate,
        endDate,
        remarks: data.remarks || null,
        status: LeaveStatus.PENDING,
      },
    });

    const days = this.calculateLeaveDays(request.startDate, request.endDate);

    return {
      request: {
        ...request,
        days,
      },
    };
  }

  async getEmployeeLeaveHistory(userId: string) {
    const employee = await prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      const error: CustomError = new Error('Employee profile not found');
      error.statusCode = 404;
      throw error;
    }

    const requests = await prisma.leaveRequest.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = requests.map((req) => ({
      ...req,
      days: this.calculateLeaveDays(req.startDate, req.endDate),
    }));

    return { requests: mapped };
  }

  async getAllLeaveRequests() {
    const requests = await prisma.leaveRequest.findMany({
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
      orderBy: { createdAt: 'desc' },
    });

    const mapped = requests.map((req) => ({
      ...req,
      days: this.calculateLeaveDays(req.startDate, req.endDate),
    }));

    return { requests: mapped };
  }

  async getLeaveRequestById(id: string) {
    const request = await prisma.leaveRequest.findUnique({
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

    if (!request) {
      const error: CustomError = new Error('Leave request not found');
      error.statusCode = 404;
      throw error;
    }

    const days = this.calculateLeaveDays(request.startDate, request.endDate);

    return {
      request: {
        ...request,
        days,
      },
    };
  }

  async approveLeaveRequest(id: string, data: ApproveRejectLeaveInput) {
    const request = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!request) {
      const error: CustomError = new Error('Leave request not found');
      error.statusCode = 404;
      throw error;
    }

    // State machine: Only PENDING requests can be approved
    if (request.status !== LeaveStatus.PENDING) {
      const error: CustomError = new Error('Leave request is already processed and cannot be changed');
      error.statusCode = 409;
      throw error;
    }

    // 1. Update LeaveRequest status to APPROVED
    const updatedRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: LeaveStatus.APPROVED,
        adminComment: data.adminComment || null,
      },
    });

    // 2. Attendance Integration for each approved leave date
    const currentDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);

    while (currentDate <= endDate) {
      const targetDate = this.normalizeToUtcMidnight(currentDate);

      const existingAttendance = await prisma.attendance.findUnique({
        where: {
          employeeId_date: {
            employeeId: request.employeeId,
            date: targetDate,
          },
        },
      });

      if (!existingAttendance) {
        // No attendance record -> create LEAVE record
        await prisma.attendance.create({
          data: {
            employeeId: request.employeeId,
            date: targetDate,
            status: AttendanceStatus.LEAVE,
          },
        });
      } else {
        // Attendance exists: preserve existing checkIn/checkOut data safely
        if (!existingAttendance.checkIn && !existingAttendance.checkOut) {
          await prisma.attendance.update({
            where: { id: existingAttendance.id },
            data: {
              status: AttendanceStatus.LEAVE,
            },
          });
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const days = this.calculateLeaveDays(updatedRequest.startDate, updatedRequest.endDate);

    return {
      request: {
        ...updatedRequest,
        days,
      },
    };
  }

  async rejectLeaveRequest(id: string, data: ApproveRejectLeaveInput) {
    const request = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!request) {
      const error: CustomError = new Error('Leave request not found');
      error.statusCode = 404;
      throw error;
    }

    // State machine: Only PENDING requests can be rejected
    if (request.status !== LeaveStatus.PENDING) {
      const error: CustomError = new Error('Leave request is already processed and cannot be changed');
      error.statusCode = 409;
      throw error;
    }

    // Update LeaveRequest status to REJECTED
    const updatedRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: LeaveStatus.REJECTED,
        adminComment: data.adminComment || null,
      },
    });

    const days = this.calculateLeaveDays(updatedRequest.startDate, updatedRequest.endDate);

    return {
      request: {
        ...updatedRequest,
        days,
      },
    };
  }
}

export const timeoffService = new TimeOffService();
