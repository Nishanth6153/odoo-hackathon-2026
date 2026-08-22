import { PrismaClient, Role, AttendanceStatus, LeaveType, LeaveStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Dayflow database seeding...');

  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const employeePasswordHash = await bcrypt.hash('Employee@123', 10);

  // 1. Seed Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@dayflow.local' },
    update: {
      password: adminPasswordHash,
      role: Role.ADMIN,
      isEmailVerified: true,
    },
    create: {
      email: 'admin@dayflow.local',
      password: adminPasswordHash,
      role: Role.ADMIN,
      isEmailVerified: true,
    },
  });
  console.log(`👤 Admin User created/updated: ${adminUser.email}`);

  // 2. Seed Employee User
  const employeeUser = await prisma.user.upsert({
    where: { email: 'employee@dayflow.local' },
    update: {
      password: employeePasswordHash,
      role: Role.EMPLOYEE,
      isEmailVerified: true,
    },
    create: {
      email: 'employee@dayflow.local',
      password: employeePasswordHash,
      role: Role.EMPLOYEE,
      isEmailVerified: true,
    },
  });
  console.log(`👤 Employee User created/updated: ${employeeUser.email}`);

  // 3. Seed Employee Profile linked to Employee User
  const employeeProfile = await prisma.employee.upsert({
    where: { userId: employeeUser.id },
    update: {
      employeeId: 'EMP001',
      name: 'Alex Morgan',
      jobTitle: 'Software Engineer',
      phone: '+1-555-0199',
      address: '100 Innovation Way, Tech City',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
    create: {
      userId: employeeUser.id,
      employeeId: 'EMP001',
      name: 'Alex Morgan',
      jobTitle: 'Software Engineer',
      phone: '+1-555-0199',
      address: '100 Innovation Way, Tech City',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
  });
  console.log(`📋 Employee Profile created/updated: ${employeeProfile.name} (${employeeProfile.employeeId})`);

  // 4. Seed Attendance Log for Today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkInTime = new Date(today);
  checkInTime.setHours(9, 0, 0, 0);

  const checkOutTime = new Date(today);
  checkOutTime.setHours(17, 30, 0, 0);

  const attendance = await prisma.attendance.upsert({
    where: {
      employeeId_date: {
        employeeId: employeeProfile.id,
        date: today,
      },
    },
    update: {
      status: AttendanceStatus.PRESENT,
      checkIn: checkInTime,
      checkOut: checkOutTime,
    },
    create: {
      employeeId: employeeProfile.id,
      date: today,
      status: AttendanceStatus.PRESENT,
      checkIn: checkInTime,
      checkOut: checkOutTime,
    },
  });
  console.log(`⏱️ Attendance record created/updated for date: ${attendance.date.toISOString().split('T')[0]}`);

  // 5. Seed Sample PENDING Leave Request (for testing Admin review)
  const leaveStartDate = new Date(today);
  leaveStartDate.setDate(leaveStartDate.getDate() + 3);

  const leaveEndDate = new Date(leaveStartDate);
  leaveEndDate.setDate(leaveEndDate.getDate() + 2);

  const existingPendingLeave = await prisma.leaveRequest.findFirst({
    where: {
      employeeId: employeeProfile.id,
      status: LeaveStatus.PENDING,
    },
  });

  if (!existingPendingLeave) {
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: employeeProfile.id,
        leaveType: LeaveType.PAID,
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        remarks: 'Attending annual tech conference and family commitments.',
        status: LeaveStatus.PENDING,
      },
    });
    console.log(`🌴 Sample PENDING Leave Request created: ${leaveRequest.id}`);
  } else {
    console.log(`🌴 Sample PENDING Leave Request already exists: ${existingPendingLeave.id}`);
  }

  // 6. Seed Salary Record
  const salary = await prisma.salary.upsert({
    where: { employeeId: employeeProfile.id },
    update: {
      baseSalary: 75000,
      allowances: 5000,
      deductions: 2000,
      netSalary: 78000,
      details: 'Full-time Monthly Compensation Package (Base: $75,000/yr equivalent)',
    },
    create: {
      employeeId: employeeProfile.id,
      baseSalary: 75000,
      allowances: 5000,
      deductions: 2000,
      netSalary: 78000,
      details: 'Full-time Monthly Compensation Package (Base: $75,000/yr equivalent)',
    },
  });
  console.log(`💰 Salary structure created/updated: Net $${salary.netSalary}`);

  console.log('✅ Dayflow database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Database seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
