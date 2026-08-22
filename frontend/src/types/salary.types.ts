export type SalaryComponentCategory = "EARNING" | "DEDUCTION";

export type CalculationType = "FIXED" | "PERCENTAGE";

export interface SalaryComponent {
  id: string;
  name: string;
  category: SalaryComponentCategory;
  calculationType: CalculationType;
  value: number;
  calculatedAmount?: number;
}

export interface SalaryStructure {
  employeeId: string;
  monthlyWage: number;
  yearlyWage?: number;
  workingDays?: number;
  components: SalaryComponent[];
  totalEarnings?: number;
  totalDeductions?: number;
  netMonthlyAmount?: number;
}

export interface SalaryInput {
  monthlyWage: number;
  workingDays?: number;
}

export interface SalaryComponentInput {
  name: string;
  category: SalaryComponentCategory;
  calculationType: CalculationType;
  value: number;
}
