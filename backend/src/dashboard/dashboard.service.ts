import { prisma } from '../config/prisma';
import { CustomError } from '../middleware/errorHandler';

export class DashboardService {
  /**
   * UTC ISO start-of-day date normalization helper.
   */
  normalizeToUtcMidnight(dateInput: string | Date = new Date()): Date {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const iso = d.toISOString().split('T')[0];
    return new Date(`${iso}T00:00:00.000Z`);
  }

  /**
   * Currency / rate rounding helper (2 decimal places).
   */
  round2(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  async getAdminDashboard() {
    const todayDate = this.normalizeToUtcMidnight();

    // 1. Total Employees (Employee count, excluding pure user accounts)
    const totalEmployees = await prisma.employee.count();

    // 2. Today's Attendance Metrics
    const presentToday = await prisma.attendance.count({
      where: { date: todayDate, status: 'PRESENT' },
    });

    const onLeaveToday = await prisma.attendance.count({
      where: { date: todayDate, status: 'LEAVE' },
    });

    const todayAttendanceRecords = await prisma.attendance.findMany({
      where: { date: todayDate },
      select: { employeeId: true },
    });

    const uniqueEmployeesWithAttendanceToday = new Set(
      todayAttendanceRecords.map((r) => r.employeeId)
    ).size;

    const notCheckedInToday = Math.max(0, totalEmployees - uniqueEmployeesWithAttendanceToday);

    // Attendance Rate = (presentToday / totalEmployees) * 100
    const attendanceRate = totalEmployees > 0 ? this.round2((presentToday / totalEmployees) * 100) : 0;

    // 3. Leave Analytics
    const pendingLeave = await prisma.leaveRequest.count({
      where: { status: 'PENDING' },
    });

    const approvedToday = await prisma.leaveRequest.count({
      where: {
        status: 'APPROVED',
        updatedAt: { gte: todayDate },
      },
    });

    const rejectedToday = await prisma.leaveRequest.count({
      where: {
        status: 'REJECTED',
        updatedAt: { gte: todayDate },
      },
    });

    // 4. Salary Analytics (Admin Only)
    const employeesWithSalary = await prisma.salary.count();

    const salaryAgg = await prisma.salary.aggregate({
      _sum: {
        baseSalary: true,
        netSalary: true,
      },
    });

    const totalBaseSalary = this.round2(salaryAgg._sum.baseSalary || 0);
    const totalNetSalary = this.round2(salaryAgg._sum.netSalary || 0);

    return {
      employees: {
        total: totalEmployees,
      },
      attendance: {
        presentToday,
        notCheckedInToday,
        onLeaveToday,
        attendanceRate,
      },
      leave: {
        pending: pendingLeave,
        approvedToday,
        rejectedToday,
      },
      salary: {
        employeesWithSalary,
        totalBaseSalary,
        totalNetSalary,
      },
    };
  }

  async getEmployeeDashboard(userId: string) {
    const todayDate = this.normalizeToUtcMidnight();

    // 1. Employee Profile (Strictly omitting password and salary fields)
    const employee = await prisma.employee.findUnique({
      where: { userId },
      select: {
        id: true,
        employeeId: true,
        name: true,
        phone: true,
        address: true,
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
    });

    if (!employee) {
      const error: CustomError = new Error('Employee profile not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Today's Attendance
    const todayAtt = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: todayDate,
        },
      },
    });

    let todayAttendanceSummary = null;
    if (todayAtt) {
      const workMinutes =
        todayAtt.checkIn && todayAtt.checkOut
          ? Math.max(0, Math.floor((todayAtt.checkOut.getTime() - todayAtt.checkIn.getTime()) / 60000))
          : null;

      todayAttendanceSummary = {
        id: todayAtt.id,
        date: todayAtt.date,
        checkIn: todayAtt.checkIn,
        checkOut: todayAtt.checkOut,
        status: todayAtt.status,
        workMinutes,
      };
    }

    // 3. Recent Attendance History (5 latest records)
    const recentAtt = await prisma.attendance.findMany({
      where: { employeeId: employee.id },
      orderBy: { date: 'desc' },
      take: 5,
    });

    const recentAttendanceSummary = recentAtt.map((att) => {
      const workMinutes =
        att.checkIn && att.checkOut
          ? Math.max(0, Math.floor((att.checkOut.getTime() - att.checkIn.getTime()) / 60000))
          : null;

      return {
        id: att.id,
        date: att.date,
        checkIn: att.checkIn,
        checkOut: att.checkOut,
        status: att.status,
        workMinutes,
      };
    });

    // 4. Time Off Summary
    const pendingCount = await prisma.leaveRequest.count({
      where: { employeeId: employee.id, status: 'PENDING' },
    });

    const approvedCount = await prisma.leaveRequest.count({
      where: { employeeId: employee.id, status: 'APPROVED' },
    });

    const rejectedCount = await prisma.leaveRequest.count({
      where: { employeeId: employee.id, status: 'REJECTED' },
    });

    const recentLeaves = await prisma.leaveRequest.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentLeaveSummary = recentLeaves.map((req) => {
      const days = Math.floor((req.endDate.getTime() - req.startDate.getTime()) / 86400000) + 1;
      return {
        id: req.id,
        leaveType: req.leaveType,
        startDate: req.startDate,
        endDate: req.endDate,
        remarks: req.remarks,
        status: req.status,
        adminComment: req.adminComment,
        days,
        createdAt: req.createdAt,
      };
    });

    return {
      profile: employee,
      attendance: {
        today: todayAttendanceSummary,
        recent: recentAttendanceSummary,
      },
      timeOff: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        recent: recentLeaveSummary,
      },
    };
  }
}

export const dashboardService = new DashboardService();
