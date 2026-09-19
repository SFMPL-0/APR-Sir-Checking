/**
 * Domain types for Freight Profit, Tax & Interest Calculator
 */

export type ExpenseBasis =
  | 'selling_price'
  | 'buying_price'
  | 'gross_profit'
  | 'net_profit_before_tax'
  | 'fixed_amount';

export interface ExpenseItem {
  id: string;
  name: string;
  enabled: boolean;
  basis: ExpenseBasis;
  percentage: number; // e.g. 2.0 for 2%
  fixedAmount: number; // e.g. 5000
  isTds?: boolean; // Marks this expense as TDS (used in TDS claim section)
}

export interface InterestTranche {
  id: string;
  name: string;
  allocationPercentage: number; // e.g. 75 for 75%
  annualRate: number; // e.g. 1.0 for 1%
  days: number; // e.g. 20
  daysInYear: number; // e.g. 365
  isDailyRate: boolean; // false = annual (rate * days / 365), true = daily (rate * days)
  basis: 'selling_price' | 'buying_price';
}

export type TdsRefundMode = 'monthly' | 'annual' | 'flat';

export interface TdsRefundSettings {
  enabled: boolean;
  refundCarryingRate: number; // default 1.5%
  refundCarryingPeriodMonths: number; // default 18
  refundCarryingMode: TdsRefundMode; // 'monthly' = rate * months, 'annual' = rate * (months/12), 'flat' = rate
  itInterestRate: number; // default 0.5% (Section 244A IT Act)
  itInterestPeriodMonths: number; // default 6
  itInterestMode: TdsRefundMode; // default 'monthly' (0.5% per month for 6 months = 3%)
  actualTaxRate: number; // default 27%
  nominalTdsRate: number; // default 2%
  calculationBasis: 'selling_price' | 'gross_profit';
}

export interface GeneralSettings {
  currencySymbol: string; // '₹'
  currencyCode: string; // 'INR'
  decimalPlaces: number; // 2
  defaultDays: number; // 20
  defaultInterestRate: number; // 1.0
  defaultIncomeTaxRate: number; // 27.0
  daysPerYear: number; // 365
  activeMode: 'quick' | 'detailed' | 'scenario';
}

export interface CalculationInput {
  sellingPrice: number;
  buyingPrice: number;
  title?: string;
  tripNumber?: string;
  notes?: string;
  customDays?: number;
  customInterestRate?: number;
}

export interface InterestCalculationDetail {
  id: string;
  name: string;
  allocationPercent: number;
  basisName: string;
  principal: number;
  rate: number;
  isDailyRate: boolean;
  days: number;
  daysInYear: number;
  amount: number;
  formulaString: string;
}

export interface ExpenseCalculationDetail {
  id: string;
  name: string;
  basis: ExpenseBasis;
  basisAmount: number;
  percentage: number;
  fixedAmount: number;
  amount: number;
  formulaString: string;
  isTds: boolean;
  enabled: boolean;
}

export interface TdsRefundResult {
  nominalTdsAmount: number;
  carryingCostAmount: number;
  carryingCostFormula: string;
  itInterestAmount: number;
  itInterestFormula: string;
  actualTaxLiabilities: number;
  actualTaxFormula: string;
  netSavingInTds: number;
  netProfitWithTdsSaving: number; // Net Profit = Profit After Tax + Net Saving in TDS
  netEffectiveProfitWithTds: number; // alias for netProfitWithTdsSaving
  percentageOfProfitAfterTdsSaving: number; // Net Profit / Selling Price * 100
  formulaSummary: string;
}

export interface CalculationResult {
  sellingPrice: number;
  buyingPrice: number;
  grossProfit: number;
  grossProfitMargin: number; // (GP / SP) * 100

  interestDetails: InterestCalculationDetail[];
  totalInterest: number;

  expenseDetails: ExpenseCalculationDetail[];
  totalOperatingExpenses: number; // sum of expenses without interest
  netTotalExpenses: number; // all enabled expenses + interest

  netProfitBeforeTax: number;
  netProfitBeforeTaxMargin: number; // (NPBT / SP) * 100

  incomeTaxRate: number;
  incomeTax: number;

  profitAfterTax: number;
  percentageOfSale: number; // (PAT / SP) * 100

  netProfitWithTdsSaving: number; // Net Profit = Profit After Tax + Net Saving in TDS
  percentageOfProfitAfterTdsSaving: number; // (netProfitWithTdsSaving / sellingPrice) * 100

  tdsRefund: TdsRefundResult;

  warnings: string[];
  isNegativeProfit: boolean;
  isExpenseExceedingGross: boolean;
  allocationSum: number;
}

export interface SavedCalculation {
  id: string;
  name: string;
  createdAt: string; // ISO String
  updatedAt: string;
  tripNumber?: string;
  notes?: string;
  input: CalculationInput;
  expenses: ExpenseItem[];
  interestTranches: InterestTranche[];
  tdsSettings: TdsRefundSettings;
  generalSettings: GeneralSettings;
  result: CalculationResult;
}

// Automatic, unnamed snapshot of every calculation performed — logged in the
// background (debounced) so nothing is ever lost even if the user never
// clicks "Save". Distinct from SavedCalculation, which is an explicit,
// user-named archive entry.
export interface CalculationHistoryEntry {
  id: string;
  createdAt: string; // ISO String
  input: CalculationInput;
  expenses: ExpenseItem[];
  interestTranches: InterestTranche[];
  tdsSettings: TdsRefundSettings;
  generalSettings: GeneralSettings;
  result: CalculationResult;
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  sellingPrice: number;
  buyingPrice: number;
  days: number;
  interestRate: number;
  incomeTaxRate?: number;
  notes?: string;
}
