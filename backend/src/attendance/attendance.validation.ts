import { z } from 'zod';

export const checkInSchema = z.object({}).strict({
  message: 'Invalid request body: Client-supplied parameters (e.g. employeeId, date, checkIn, status) are strictly forbidden',
});

export const checkOutSchema = z.object({}).strict({
  message: 'Invalid request body: Client-supplied parameters (e.g. employeeId, date, checkOut, status) are strictly forbidden',
});

export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
