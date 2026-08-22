import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { CustomError } from '../middleware/errorHandler';
import {
  CreateSalaryInput,
  UpdateSalaryInput,
  CreateComponentInput,
  UpdateComponentInput,
} from './salary.validation';

export interface SalaryComponent {
  id: string;
  name: string;
  category: 'EARNING' | 'DEDUCTION';
  calculationType: 'FIXED' | 'PERCENTAGE';
  value: number;
  amount?: number;
}

export class SalaryService {
  /**
   * Currency rounding helper (2 decimal places).
   */
  round2(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  /**
   * Calculates dynamic allowances, deductions, netSalary, and component amounts.
   */
  calculateFinancials(baseSalary: number, components: SalaryComponent[]) {
    let totalEarnings = 0;
    let totalDeductions = 0;

    const computedComponents = components.map((comp) => {
      let amount = 0;
      if (comp.calculationType === 'FIXED') {
        amount = this.round2(comp.value);
      } else if (comp.calculationType === 'PERCENTAGE') {
        amount = this.round2(baseSalary * (comp.value / 100));
      }

      if (comp.category === 'EARNING') {
        totalEarnings += amount;
      } else if (comp.category === 'DEDUCTION') {
        totalDeductions += amount;
      }

      return {
        ...comp,
        amount,
      };
    });

    const allowances = this.round2(totalEarnings);
    const deductions = this.round2(totalDeductions);
    const netSalary = this.round2(baseSalary + allowances - deductions);

    return {
      allowances,
      deductions,
      netSalary,
      computedComponents,
    };
  }

  /**
   * Resolves Employee by business employeeId (e.g. EMP001) or primary key ID.
   */
  async findEmployeeByIdentifier(identifier: string) {
    const employee = await prisma.employee.findFirst({
      where: {
        OR: [{ id: identifier }, { employeeId: identifier }],
      },
    });

    if (!employee) {
      const error: CustomError = new Error(`Employee with ID or employeeId '${identifier}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return employee;
  }

  async getSalary(employeeIdentifier: string) {
    const employee = await this.findEmployeeByIdentifier(employeeIdentifier);

    const salary = await prisma.salary.findUnique({
      where: { employeeId: employee.id },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            jobTitle: true,
          },
        },
      },
    });

    if (!salary) {
      const error: CustomError = new Error(`Salary information not found for employee '${employeeIdentifier}'`);
      error.statusCode = 404;
      throw error;
    }

    const detailsObj = JSON.parse(salary.details || '{"components":[]}');
    const rawComponents: SalaryComponent[] = detailsObj.components || [];

    const { allowances, deductions, netSalary, computedComponents } = this.calculateFinancials(
      salary.baseSalary,
      rawComponents
    );

    return {
      employee: salary.employee,
      salary: {
        id: salary.id,
        baseSalary: salary.baseSalary,
        allowances,
        deductions,
        netSalary,
        components: computedComponents,
        createdAt: salary.createdAt,
        updatedAt: salary.updatedAt,
      },
    };
  }

  async createSalary(employeeIdentifier: string, data: CreateSalaryInput) {
    const employee = await this.findEmployeeByIdentifier(employeeIdentifier);

    const existingSalary = await prisma.salary.findUnique({
      where: { employeeId: employee.id },
    });

    if (existingSalary) {
      const error: CustomError = new Error(`Salary record already exists for employee '${employeeIdentifier}'`);
      error.statusCode = 409;
      throw error;
    }

    const baseSalary = this.round2(data.baseSalary);
    const allowances = 0;
    const deductions = 0;
    const netSalary = baseSalary;

    const salary = await prisma.salary.create({
      data: {
        employeeId: employee.id,
        baseSalary,
        allowances,
        deductions,
        netSalary,
        details: JSON.stringify({ components: [] }),
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            jobTitle: true,
          },
        },
      },
    });

    return {
      employee: salary.employee,
      salary: {
        id: salary.id,
        baseSalary: salary.baseSalary,
        allowances,
        deductions,
        netSalary,
        components: [],
        createdAt: salary.createdAt,
        updatedAt: salary.updatedAt,
      },
    };
  }

  async updateSalary(employeeIdentifier: string, data: UpdateSalaryInput) {
    const employee = await this.findEmployeeByIdentifier(employeeIdentifier);

    const salary = await prisma.salary.findUnique({
      where: { employeeId: employee.id },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            jobTitle: true,
          },
        },
      },
    });

    if (!salary) {
      const error: CustomError = new Error(`Salary record not found for employee '${employeeIdentifier}'`);
      error.statusCode = 404;
      throw error;
    }

    const baseSalary = data.baseSalary !== undefined ? this.round2(data.baseSalary) : salary.baseSalary;
    const detailsObj = JSON.parse(salary.details || '{"components":[]}');
    const rawComponents: SalaryComponent[] = detailsObj.components || [];

    const { allowances, deductions, netSalary, computedComponents } = this.calculateFinancials(
      baseSalary,
      rawComponents
    );

    const updatedSalary = await prisma.salary.update({
      where: { id: salary.id },
      data: {
        baseSalary,
        allowances,
        deductions,
        netSalary,
      },
    });

    return {
      employee: salary.employee,
      salary: {
        id: updatedSalary.id,
        baseSalary: updatedSalary.baseSalary,
        allowances,
        deductions,
        netSalary,
        components: computedComponents,
        createdAt: updatedSalary.createdAt,
        updatedAt: updatedSalary.updatedAt,
      },
    };
  }

  async addComponent(employeeIdentifier: string, data: CreateComponentInput) {
    const employee = await this.findEmployeeByIdentifier(employeeIdentifier);

    const salary = await prisma.salary.findUnique({
      where: { employeeId: employee.id },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            jobTitle: true,
          },
        },
      },
    });

    if (!salary) {
      const error: CustomError = new Error(`Salary record not found for employee '${employeeIdentifier}'`);
      error.statusCode = 404;
      throw error;
    }

    const detailsObj = JSON.parse(salary.details || '{"components":[]}');
    const components: SalaryComponent[] = detailsObj.components || [];

    const newComponent: SalaryComponent = {
      id: `comp_${crypto.randomUUID()}`,
      name: data.name,
      category: data.category,
      calculationType: data.calculationType,
      value: this.round2(data.value),
    };

    components.push(newComponent);

    const { allowances, deductions, netSalary, computedComponents } = this.calculateFinancials(
      salary.baseSalary,
      components
    );

    const updatedSalary = await prisma.salary.update({
      where: { id: salary.id },
      data: {
        allowances,
        deductions,
        netSalary,
        details: JSON.stringify({ components }),
      },
    });

    return {
      employee: salary.employee,
      salary: {
        id: updatedSalary.id,
        baseSalary: updatedSalary.baseSalary,
        allowances,
        deductions,
        netSalary,
        components: computedComponents,
        createdAt: updatedSalary.createdAt,
        updatedAt: updatedSalary.updatedAt,
      },
    };
  }

  async updateComponent(componentId: string, data: UpdateComponentInput, targetEmployeeIdentifier?: string) {
    // 1. Find Salary containing component
    const salaries = await prisma.salary.findMany({
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            jobTitle: true,
          },
        },
      },
    });

    let targetSalary: any = null;
    let targetComponentIndex = -1;
    let componentsList: SalaryComponent[] = [];

    for (const sal of salaries) {
      const detailsObj = JSON.parse(sal.details || '{"components":[]}');
      const comps: SalaryComponent[] = detailsObj.components || [];
      const idx = comps.findIndex((c) => c.id === componentId);
      if (idx !== -1) {
        targetSalary = sal;
        targetComponentIndex = idx;
        componentsList = comps;
        break;
      }
    }

    if (!targetSalary || targetComponentIndex === -1) {
      const error: CustomError = new Error(`Salary component with ID '${componentId}' not found`);
      error.statusCode = 404;
      throw error;
    }

    // Ownership Verification: If target employee specified, verify component belongs to that employee's salary
    if (targetEmployeeIdentifier) {
      const targetEmp = await this.findEmployeeByIdentifier(targetEmployeeIdentifier);
      if (targetSalary.employeeId !== targetEmp.id) {
        const error: CustomError = new Error(`Component '${componentId}' does not belong to employee '${targetEmployeeIdentifier}'`);
        error.statusCode = 403;
        throw error;
      }
    }

    // 2. Update component properties
    const existingComp = componentsList[targetComponentIndex];
    componentsList[targetComponentIndex] = {
      ...existingComp,
      name: data.name !== undefined ? data.name : existingComp.name,
      category: data.category !== undefined ? data.category : existingComp.category,
      calculationType: data.calculationType !== undefined ? data.calculationType : existingComp.calculationType,
      value: data.value !== undefined ? this.round2(data.value) : existingComp.value,
    };

    // 3. Recalculate financials
    const { allowances, deductions, netSalary, computedComponents } = this.calculateFinancials(
      targetSalary.baseSalary,
      componentsList
    );

    const updatedSalary = await prisma.salary.update({
      where: { id: targetSalary.id },
      data: {
        allowances,
        deductions,
        netSalary,
        details: JSON.stringify({ components: componentsList }),
      },
    });

    return {
      employee: targetSalary.employee,
      salary: {
        id: updatedSalary.id,
        baseSalary: updatedSalary.baseSalary,
        allowances,
        deductions,
        netSalary,
        components: computedComponents,
        createdAt: updatedSalary.createdAt,
        updatedAt: updatedSalary.updatedAt,
      },
    };
  }

  async deleteComponent(componentId: string, targetEmployeeIdentifier?: string) {
    // 1. Find Salary containing component
    const salaries = await prisma.salary.findMany({
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            jobTitle: true,
          },
        },
      },
    });

    let targetSalary: any = null;
    let componentsList: SalaryComponent[] = [];

    for (const sal of salaries) {
      const detailsObj = JSON.parse(sal.details || '{"components":[]}');
      const comps: SalaryComponent[] = detailsObj.components || [];
      if (comps.some((c) => c.id === componentId)) {
        targetSalary = sal;
        componentsList = comps;
        break;
      }
    }

    if (!targetSalary) {
      const error: CustomError = new Error(`Salary component with ID '${componentId}' not found`);
      error.statusCode = 404;
      throw error;
    }

    // Ownership Verification: If target employee specified, verify component belongs to that employee's salary
    if (targetEmployeeIdentifier) {
      const targetEmp = await this.findEmployeeByIdentifier(targetEmployeeIdentifier);
      if (targetSalary.employeeId !== targetEmp.id) {
        const error: CustomError = new Error(`Component '${componentId}' does not belong to employee '${targetEmployeeIdentifier}'`);
        error.statusCode = 403;
        throw error;
      }
    }

    // 2. Remove component from list
    const updatedComponents = componentsList.filter((c) => c.id !== componentId);

    // 3. Recalculate financials
    const { allowances, deductions, netSalary, computedComponents } = this.calculateFinancials(
      targetSalary.baseSalary,
      updatedComponents
    );

    const updatedSalary = await prisma.salary.update({
      where: { id: targetSalary.id },
      data: {
        allowances,
        deductions,
        netSalary,
        details: JSON.stringify({ components: updatedComponents }),
      },
    });

    return {
      employee: targetSalary.employee,
      salary: {
        id: updatedSalary.id,
        baseSalary: updatedSalary.baseSalary,
        allowances,
        deductions,
        netSalary,
        components: computedComponents,
        createdAt: updatedSalary.createdAt,
        updatedAt: updatedSalary.updatedAt,
      },
    };
  }
}

export const salaryService = new SalaryService();
