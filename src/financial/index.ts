/**
 * @module financial
 * Financial and mathematical utility functions.
 * Covers rounding, interest, amortization, tax, margins, and more.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AmortizationPayment {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface LoanSummary {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: AmortizationPayment[];
}

export interface ROIResult {
  roi: number;         // as a decimal (0.25 = 25%)
  roiPercent: number;  // as a percentage string-ready number
  netProfit: number;
}

// ─── Rounding ─────────────────────────────────────────────────────────────────

/** Round to N decimal places using "round half away from zero". */
export function round(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/** Round up to N decimal places. */
export function roundUp(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.ceil(value * factor) / factor;
}

/** Round down to N decimal places. */
export function roundDown(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.floor(value * factor) / factor;
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ─── Percentage ───────────────────────────────────────────────────────────────

/** Calculate what percentage `part` is of `total`. */
export function percentOf(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

/** Calculate the value of a percentage of a total. */
export function percentValue(percent: number, total: number): number {
  return (percent / 100) * total;
}

/** Calculate percentage change from `from` to `to`. */
export function percentChange(from: number, to: number): number {
  if (from === 0) return to === 0 ? 0 : Infinity;
  return ((to - from) / Math.abs(from)) * 100;
}

// ─── Margins & Markups ────────────────────────────────────────────────────────

/** Calculate gross margin as a percentage: (revenue - cost) / revenue. */
export function grossMargin(revenue: number, cost: number): number {
  if (revenue === 0) return 0;
  return ((revenue - cost) / revenue) * 100;
}

/** Calculate markup percentage: (price - cost) / cost. */
export function markupPercent(cost: number, price: number): number {
  if (cost === 0) return 0;
  return ((price - cost) / cost) * 100;
}

/** Calculate selling price from cost and desired markup percent. */
export function priceFromMarkup(cost: number, markupPct: number): number {
  return cost * (1 + markupPct / 100);
}

/** Calculate selling price from cost and desired margin percent. */
export function priceFromMargin(cost: number, marginPct: number): number {
  if (marginPct >= 100) throw new Error('Margin cannot be 100% or more.');
  return cost / (1 - marginPct / 100);
}

// ─── Tax ──────────────────────────────────────────────────────────────────────

/** Calculate tax amount for a given value and rate. */
export function calcTax(amount: number, taxRate: number): number {
  return round(amount * (taxRate / 100));
}

/** Add tax to an amount. */
export function addTax(amount: number, taxRate: number): number {
  return round(amount + calcTax(amount, taxRate));
}

/** Strip tax from a tax-inclusive amount. */
export function removeTax(grossAmount: number, taxRate: number): number {
  return round(grossAmount / (1 + taxRate / 100));
}

// ─── Interest ─────────────────────────────────────────────────────────────────

/** Simple interest: I = P * r * t */
export function simpleInterest(principal: number, annualRate: number, years: number): number {
  return round(principal * (annualRate / 100) * years);
}

/** Compound interest: A = P(1 + r/n)^(nt) */
export function compoundInterest(
  principal: number,
  annualRate: number,
  years: number,
  compoundsPerYear = 12
): number {
  const r = annualRate / 100;
  const n = compoundsPerYear;
  const t = years;
  return round(principal * Math.pow(1 + r / n, n * t) - principal);
}

/** Future value of a lump sum with compound interest. */
export function futureValue(
  principal: number,
  annualRate: number,
  years: number,
  compoundsPerYear = 12
): number {
  return round(principal + compoundInterest(principal, annualRate, years, compoundsPerYear));
}

// ─── Amortization ─────────────────────────────────────────────────────────────

/** Calculate monthly payment for a loan. */
export function monthlyPayment(principal: number, annualRate: number, months: number): number {
  if (annualRate === 0) return round(principal / months);
  const r = annualRate / 100 / 12;
  return round(principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
}

/** Generate a full loan amortization schedule. */
export function amortizationSchedule(
  principal: number,
  annualRate: number,
  months: number
): LoanSummary {
  const payment = monthlyPayment(principal, annualRate, months);
  const r = annualRate / 100 / 12;
  const schedule: AmortizationPayment[] = [];
  let balance = principal;

  for (let i = 1; i <= months; i++) {
    const interest = round(balance * r);
    const principalPaid = round(payment - interest);
    balance = round(balance - principalPaid);
    schedule.push({
      period: i,
      payment,
      principal: principalPaid,
      interest,
      balance: Math.max(0, balance),
    });
  }

  const totalPayment = round(payment * months);
  return {
    monthlyPayment: payment,
    totalPayment,
    totalInterest: round(totalPayment - principal),
    schedule,
  };
}

// ─── ROI & Valuation ──────────────────────────────────────────────────────────

/** Calculate Return on Investment. */
export function calcROI(initialInvestment: number, finalValue: number): ROIResult {
  const netProfit = finalValue - initialInvestment;
  const roi = initialInvestment === 0 ? 0 : netProfit / initialInvestment;
  return {
    roi,
    roiPercent: round(roi * 100),
    netProfit: round(netProfit),
  };
}

/** Calculate Break-Even point: fixed costs / (price per unit - variable cost per unit). */
export function breakEven(fixedCosts: number, pricePerUnit: number, variableCostPerUnit: number): number {
  const contribution = pricePerUnit - variableCostPerUnit;
  if (contribution <= 0) throw new Error('Price per unit must exceed variable cost per unit.');
  return Math.ceil(fixedCosts / contribution);
}

/** Calculate Net Present Value given cash flows and a discount rate. */
export function npv(discountRate: number, cashFlows: number[]): number {
  const r = discountRate / 100;
  const total = cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + r, t), 0);
  return round(total);
}

// ─── Statistics ───────────────────────────────────────────────────────────────

/** Returns the arithmetic mean of an array. */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return round(values.reduce((s, v) => s + v, 0) / values.length);
}

/** Returns the median of an array. */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : round((sorted[mid - 1] + sorted[mid]) / 2);
}

/** Returns the mode(s) of an array. */
export function mode(values: number[]): number[] {
  const freq: Record<number, number> = {};
  for (const v of values) freq[v] = (freq[v] ?? 0) + 1;
  const max = Math.max(...Object.values(freq));
  return Object.entries(freq)
    .filter(([, count]) => count === max)
    .map(([val]) => Number(val));
}

/** Returns the standard deviation of an array. */
export function stdDev(values: number[], population = false): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const squareDiffs = values.map((v) => Math.pow(v - avg, 2));
  const variance = squareDiffs.reduce((s, v) => s + v, 0) / (population ? values.length : values.length - 1);
  return round(Math.sqrt(variance));
}

/** Normalize values to 0–1 range. */
export function normalize(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0);
  return values.map((v) => round((v - min) / (max - min), 4));
}
