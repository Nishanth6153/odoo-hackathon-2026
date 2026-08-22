import { z } from 'zod';
import { LeaveType } from '@prisma/client';

export const createLeaveRequestSchema = z
  .object({
    leaveType: z.nativeEnum(LeaveType, {
      required_error: 'Leave type is required',
      invalid_type_error: 'Invalid leave type. Expected PAID, SICK, or UNPAID',
    }),
    startDate: z.string({ required_error: 'Start date is required' }).min(1, 'Start date is required'),
    endDate: z.string({ required_error: 'End date is required' }).min(1, 'End date is required'),
    remarks: z.string().optional().nullable(),
  })
  .strict({
    message: 'Invalid request body: Client-supplied parameters (e.g. employeeId, status, adminComment) are strictly forbidden',
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (isNaN(start.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid startDate format',
        path: ['startDate'],
      });
    }

    if (isNaN(end.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid endDate format',
        path: ['endDate'],
      });
    }

    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start > end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'startDate must not be after endDate',
        path: ['startDate'],
      });
    }
  });

export const approveRejectLeaveSchema = z
  .object({
    adminComment: z.string().optional().nullable(),
  })
  .strict({
    message: 'Invalid request body: Client-supplied parameters (e.g. status, employeeId, leaveType) are strictly forbidden',
  });

export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;
export type ApproveRejectLeaveInput = z.infer<typeof approveRejectLeaveSchema>;
