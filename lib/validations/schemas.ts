import { z } from 'zod'

/**
 * SHARED VALIDATION SCHEMAS
 * Enforces Rule 9 (Reusable Forms & Validation), Rule 12 (Strict TypeScript)
 */

// Phone Validation: Supports Bangladesh (+8801XXXXXXXXX) and standard E.164 international numbers
export const phoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(16, 'Phone number must not exceed 16 characters')
  .regex(/^\+?[0-9\s-]{10,16}$/, 'Invalid phone number format')

// Positive monetary amount schema
export const moneyAmountSchema = z
  .number({ invalid_type_error: 'Amount must be a number' })
  .min(0, 'Amount cannot be negative')
  .max(100_000_000, 'Amount exceeds permitted ceiling')

// 1. TENANT SCHEMA
export const tenantValidationSchema = z.object({
  legalName: z.string().min(2, 'Name must be at least 2 characters').max(255),
  phone: phoneSchema,
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  nidOrPassport: z.string().min(5, 'NID or passport must be at least 5 characters').max(100).optional(),
  isCorporate: z.boolean().default(false),
  companyRegistration: z.string().max(100).optional(),
  emergencyContact: z
    .object({
      name: z.string().min(2, 'Contact name required'),
      relation: z.string().min(2, 'Relation required'),
      phone: phoneSchema,
    })
    .optional(),
})
export type TenantInput = z.infer<typeof tenantValidationSchema>

// 2. PROPERTY SCHEMA
export const propertyValidationSchema = z.object({
  name: z.string().min(2, 'Property name is required').max(255),
  code: z.string().min(2, 'Property code is required').max(50),
  propertyType: z.enum(['commercial_residential', 'residential', 'commercial', 'industrial']),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required').max(100),
  timezone: z.string().default('Asia/Dhaka'),
  totalBuildings: z.number().int().min(1).default(1),
})
export type PropertyInput = z.infer<typeof propertyValidationSchema>

// 3. METER READING SCHEMA
export const meterReadingValidationSchema = z
  .object({
    meterNumber: z.string().min(2, 'Meter serial number is required'),
    previousReading: z.number().min(0, 'Previous reading cannot be negative'),
    currentReading: z.number().min(0, 'Current reading cannot be negative'),
    ratePerUnit: z.number().min(0, 'Rate per unit must be positive'),
    readingDate: z.string().min(1, 'Reading date is required'),
  })
  .refine((data) => data.currentReading >= data.previousReading, {
    message: 'Current reading cannot be lower than previous reading',
    path: ['currentReading'],
  })
export type MeterReadingInput = z.infer<typeof meterReadingValidationSchema>

// 4. RENTAL AGREEMENT SCHEMA
export const agreementValidationSchema = z
  .object({
    roomId: z.string().min(1, 'Room is required'),
    tenantId: z.string().min(1, 'Tenant is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    baseRent: moneyAmountSchema,
    securityDeposit: moneyAmountSchema.default(0),
    utilityAdvance: moneyAmountSchema.default(0),
    billingCycleDay: z.number().int().min(1).max(31).default(1),
  })
  .refine(
    (data) => {
      if (!data.endDate) return true
      return new Date(data.endDate) > new Date(data.startDate)
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    },
  )
export type AgreementInput = z.infer<typeof agreementValidationSchema>

// 5. PAYMENT SCHEMA
export const paymentValidationSchema = z.object({
  billId: z.string().min(1, 'Bill reference is required'),
  amountPaid: moneyAmountSchema.refine((amt) => amt > 0, 'Payment amount must be greater than zero'),
  paymentMethod: z.enum(['bkash', 'nagad', 'bank_transfer', 'cheque', 'cash']),
  transactionReference: z.string().max(100).optional(),
  paidAt: z.string().optional(),
})
export type PaymentInput = z.infer<typeof paymentValidationSchema>

// 6. ORGANIZATION CREATION SCHEMA
export const createOrganizationValidationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').max(100),
  plan: z.enum(['starter', 'growth', 'enterprise']).default('starter'),
})
export type CreateOrganizationInput = z.infer<typeof createOrganizationValidationSchema>

// 7. MEMBER INVITATION SCHEMA
export const inviteMemberValidationSchema = z.object({
  email: z.string().email('A valid email address is required'),
  role: z.enum(['owner', 'admin', 'property_manager', 'accountant', 'viewer']).default('property_manager'),
  assignedPropertyIds: z.array(z.string()).default([]),
})
export type InviteMemberInput = z.infer<typeof inviteMemberValidationSchema>

