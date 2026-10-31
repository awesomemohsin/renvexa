/**
 * RENVEXA CENTRALIZED FINANCIAL CALCULATION SERVICE
 * Enforces Rule 2 (Strict DRY), Rule 5 (Logic Separation), Rule 10 (Centralized Financial Services)
 * Decimal-safe arithmetic using scaled integer representations (cents/poisha).
 */

export interface ElectricityTier {
  minUnits: number
  maxUnits: number | null // null for upper unbounded tier
  ratePerUnit: number
}

export interface ElectricityCalculationResult {
  unitsConsumed: number
  energyCharge: number
  demandCharge: number
  vatAmount: number
  totalAmount: number
  tierBreakdown: {
    tier: string
    units: number
    rate: number
    subtotal: number
  }[]
}

export interface BillLineItemInput {
  itemType: string
  description: string
  amount: number
}

export interface BillSummaryResult {
  subtotal: number
  discountAmount: number
  advanceApplied: number
  vatAmount: number
  totalPayable: number
  balanceDue: number
}

export interface UnpaidBillItem {
  billId: string
  billingPeriod: string
  balanceDue: number
}

export interface PaymentAllocationResult {
  paymentAmount: number
  allocatedTotal: number
  unallocatedSurplus: number
  allocations: {
    billId: string
    billingPeriod: string
    amountApplied: number
    remainingBillBalance: number
  }[]
}

// Decimal helper: Scales numbers to integer poisha/cents to prevent floating point drift
const SCALE = 100

function toCents(amount: number): number {
  return Math.round(amount * SCALE)
}

function fromCents(cents: number): number {
  return cents / SCALE
}

export class FinancialCalculatorService {
  /**
   * Calculate prorated rent for partial month move-ins or move-outs
   */
  calculateProratedRent(
    monthlyRent: number,
    daysOccupied: number,
    totalDaysInMonth: number,
  ): number {
    if (daysOccupied <= 0 || totalDaysInMonth <= 0) return 0
    if (daysOccupied >= totalDaysInMonth) return monthlyRent

    const rentCents = toCents(monthlyRent)
    const proratedCents = Math.round((rentCents * daysOccupied) / totalDaysInMonth)
    return fromCents(proratedCents)
  }

  /**
   * Calculate sub-metered electricity bill with optional tiered rates & demand charge
   */
  calculateElectricityBill(
    previousUnitReading: number,
    currentUnitReading: number,
    rates: ElectricityTier[] = [{ minUnits: 0, maxUnits: null, ratePerUnit: 12.5 }],
    demandCharge = 0,
    vatPercent = 0,
  ): ElectricityCalculationResult {
    const unitsConsumed = Math.max(0, currentUnitReading - previousUnitReading)
    let remainingUnits = unitsConsumed
    let totalEnergyCents = 0
    const tierBreakdown: ElectricityCalculationResult['tierBreakdown'] = []

    for (const tier of rates) {
      if (remainingUnits <= 0) break

      const tierCapacity = tier.maxUnits !== null ? tier.maxUnits - tier.minUnits : Infinity
      const unitsInTier = Math.min(remainingUnits, tierCapacity)
      const subtotalCents = toCents(unitsInTier * tier.ratePerUnit)

      totalEnergyCents += subtotalCents
      remainingUnits -= unitsInTier

      tierBreakdown.push({
        tier: `${tier.minUnits} - ${tier.maxUnits ?? 'Above'} units`,
        units: unitsInTier,
        rate: tier.ratePerUnit,
        subtotal: fromCents(subtotalCents),
      })
    }

    const demandChargeCents = toCents(demandCharge)
    const subtotalCents = totalEnergyCents + demandChargeCents
    const vatCents = Math.round((subtotalCents * vatPercent) / 100)
    const totalCents = subtotalCents + vatCents

    return {
      unitsConsumed,
      energyCharge: fromCents(totalEnergyCents),
      demandCharge,
      vatAmount: fromCents(vatCents),
      totalAmount: fromCents(totalCents),
      tierBreakdown,
    }
  }

  /**
   * Calculate consolidated bill summary with line items, advance usage, and discounts
   */
  calculateBillSummary(
    lineItems: BillLineItemInput[],
    discountAmount = 0,
    advanceAvailable = 0,
    vatPercent = 0,
  ): BillSummaryResult {
    let subtotalCents = 0
    for (const item of lineItems) {
      subtotalCents += toCents(item.amount)
    }

    const discountCents = Math.min(toCents(discountAmount), subtotalCents)
    const afterDiscountCents = subtotalCents - discountCents

    const vatCents = Math.round((afterDiscountCents * vatPercent) / 100)
    const totalPayableCents = afterDiscountCents + vatCents

    // Apply available tenant advance/security adjustment
    const advanceAppliedCents = Math.min(toCents(advanceAvailable), totalPayableCents)
    const balanceDueCents = Math.max(0, totalPayableCents - advanceAppliedCents)

    return {
      subtotal: fromCents(subtotalCents),
      discountAmount: fromCents(discountCents),
      advanceApplied: fromCents(advanceAppliedCents),
      vatAmount: fromCents(vatCents),
      totalPayable: fromCents(totalPayableCents),
      balanceDue: fromCents(balanceDueCents),
    }
  }

  /**
   * FIFO Payment Allocation: Distributes incoming payment across oldest outstanding bills
   */
  allocatePayment(
    paymentAmount: number,
    unpaidBills: UnpaidBillItem[],
  ): PaymentAllocationResult {
    let remainingPaymentCents = toCents(paymentAmount)
    let allocatedTotalCents = 0
    const allocations: PaymentAllocationResult['allocations'] = []

    for (const bill of unpaidBills) {
      if (remainingPaymentCents <= 0) {
        allocations.push({
          billId: bill.billId,
          billingPeriod: bill.billingPeriod,
          amountApplied: 0,
          remainingBillBalance: bill.balanceDue,
        })
        continue
      }

      const billBalanceCents = toCents(bill.balanceDue)
      const appliedCents = Math.min(remainingPaymentCents, billBalanceCents)
      const remainingBalanceCents = billBalanceCents - appliedCents

      remainingPaymentCents -= appliedCents
      allocatedTotalCents += appliedCents

      allocations.push({
        billId: bill.billId,
        billingPeriod: bill.billingPeriod,
        amountApplied: fromCents(appliedCents),
        remainingBillBalance: fromCents(remainingBalanceCents),
      })
    }

    return {
      paymentAmount,
      allocatedTotal: fromCents(allocatedTotalCents),
      unallocatedSurplus: fromCents(remainingPaymentCents),
      allocations,
    }
  }

  /**
   * Late payment fee calculation
   */
  calculateLateFee(balanceDue: number, daysOverdue: number, ratePerDayPercent: number): number {
    if (daysOverdue <= 0 || balanceDue <= 0) return 0
    const feeCents = Math.round((toCents(balanceDue) * (daysOverdue * ratePerDayPercent)) / 100)
    return fromCents(feeCents)
  }
}

export const financialCalculator = new FinancialCalculatorService()

