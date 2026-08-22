import { z } from 'zod';

export const createEmployeeSchema = z
  .object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address format'),
    name: z.string({ required_error: 'Name is required' }).min(1, 'Name is required'),
    jobTitle: z.string({ required_error: 'Job title is required' }).min(1, 'Job title is required'),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    profilePicture: z.string().optional().nullable(),
    documents: z.string().optional().nullable(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  })
  .strict();

export const updateEmployeeSchema = z
  .object({
    name: z.string().min(1, 'Name cannot be empty').optional(),
    jobTitle: z.string().min(1, 'Job title cannot be empty').optional(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    profilePicture: z.string().optional().nullable(),
    documents: z.string().optional().nullable(),
  })
  .strict();

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
