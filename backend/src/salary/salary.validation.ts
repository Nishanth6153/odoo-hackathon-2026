import { z } from 'zod';

export const createSalarySchema = z
  .object({
    baseSalary: z
      .number({ required_error: 'baseSalary is required' })
      .min(0, 'baseSalary must be a non-negative number'),
  })
  .strict({
    message: 'Invalid request body: Client-supplied calculated fields (allowances, deductions, netSalary) or employeeId are strictly forbidden',
  });

export const updateSalarySchema = z
  .object({
    baseSalary: z
      .number()
      .min(0, 'baseSalary must be a non-negative number')
      .optional(),
  })
  .strict({
    message: 'Invalid request body: Client-supplied calculated fields (allowances, deductions, netSalary) or employeeId are strictly forbidden',
  });

export const createComponentSchema = z
  .object({
    name: z.string({ required_error: 'Component name is required' }).min(1, 'Component name is required'),
    category: z.enum(['EARNING', 'DEDUCTION'], {
      required_error: 'Category must be EARNING or DEDUCTION',
    }),
    calculationType: z.enum(['FIXED', 'PERCENTAGE'], {
      required_error: 'Calculation type must be FIXED or PERCENTAGE',
    }),
    value: z.number({ required_error: 'Value is required' }).min(0, 'Value must be a non-negative number'),
  })
  .strict({
    message: 'Invalid request body: Unknown or forbidden component fields provided',
  })
  .superRefine((data, ctx) => {
    if (data.calculationType === 'PERCENTAGE' && data.value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Percentage value cannot exceed 100%',
        path: ['value'],
      });
    }
  });

export const updateComponentSchema = z
  .object({
    name: z.string().min(1, 'Component name cannot be empty').optional(),
    category: z.enum(['EARNING', 'DEDUCTION']).optional(),
    calculationType: z.enum(['FIXED', 'PERCENTAGE']).optional(),
    value: z.number().min(0, 'Value must be a non-negative number').optional(),
  })
  .strict({
    message: 'Invalid request body: Unknown or forbidden component fields provided',
  })
  .superRefine((data, ctx) => {
    if (data.calculationType === 'PERCENTAGE' && data.value !== undefined && data.value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Percentage value cannot exceed 100%',
        path: ['value'],
      });
    }
  });

export type CreateSalaryInput = z.infer<typeof createSalarySchema>;
export type UpdateSalaryInput = z.infer<typeof updateSalarySchema>;
export type CreateComponentInput = z.infer<typeof createComponentSchema>;
export type UpdateComponentInput = z.infer<typeof updateComponentSchema>;
