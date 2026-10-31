import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

// ==============================================================================
// ENUMS
// ==============================================================================

export const organizationRoleEnum = pgEnum('organization_role', [
  'owner',
  'admin',
  'property_manager',
  'accountant',
  'viewer',
])

export const propertyRoleEnum = pgEnum('property_role', [
  'manager',
  'accountant',
  'supervisor',
  'viewer',
])

export const membershipStatusEnum = pgEnum('membership_status', [
  'active',
  'invited',
  'suspended',
])

export const subscriptionPlanEnum = pgEnum('subscription_plan', [
  'free_tier',
  'starter',
  'growth',
  'enterprise',
])

export const unitStatusEnum = pgEnum('unit_status', [
  'vacant',
  'occupied',
  'reserved',
  'maintenance',
])

export const unitTypeEnum = pgEnum('unit_type', [
  'residential',
  'commercial',
  'office',
  'storage',
  'parking',
])

export const agreementStatusEnum = pgEnum('agreement_status', [
  'draft',
  'active',
  'expired',
  'terminated',
])

export const billStatusEnum = pgEnum('bill_status', [
  'draft',
  'unpaid',
  'partially_paid',
  'paid',
  'overdue',
  'void',
])

export const paymentMethodEnum = pgEnum('payment_method', [
  'bkash',
  'nagad',
  'bank_transfer',
  'cheque',
  'cash',
])

export const transactionEntryTypeEnum = pgEnum('transaction_entry_type', ['debit', 'credit'])

export const accountTypeEnum = pgEnum('account_type', [
  'rental_revenue',
  'utility_revenue',
  'deposit_liability',
  'operating_expense',
  'accounts_receivable',
  'cash_and_bank',
])

export const jobStatusEnum = pgEnum('job_status', [
  'pending',
  'processing',
  'completed',
  'failed',
  'retrying',
])

// ==============================================================================
// 1. USERS (Global Auth Identity)
// ==============================================================================
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ==============================================================================
// 2. ORGANIZATIONS (SaaS Tenant Root)
// ==============================================================================
export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    currency: varchar('currency', { length: 10 }).default('BDT').notNull(),
    timezone: varchar('timezone', { length: 50 }).default('Asia/Dhaka').notNull(),
    taxIdentifier: varchar('tax_identifier', { length: 100 }),
    createdByUserId: uuid('created_by_user_id')
      .references(() => users.id, { onDelete: 'restrict' })
      .notNull(),
    subscriptionPlan: subscriptionPlanEnum('subscription_plan').default('free_tier').notNull(),
    subscriptionStatus: varchar('subscription_status', { length: 50 }).default('active').notNull(),
    maxProperties: integer('max_properties').default(3).notNull(),
    maxUnits: integer('max_units').default(25).notNull(),
    settings: jsonb('settings').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_organizations_slug').on(table.slug),
    index('idx_organizations_plan').on(table.subscriptionPlan, table.subscriptionStatus),
  ],
)

// ==============================================================================
// 3. ORGANIZATION MEMBERS
// ==============================================================================
export const organizationMembers = pgTable(
  'organization_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    role: organizationRoleEnum('role').default('viewer').notNull(),
    status: membershipStatusEnum('status').default('active').notNull(),
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('uq_org_member').on(table.organizationId, table.userId),
    index('idx_org_members_user').on(table.userId),
    index('idx_org_members_org').on(table.organizationId),
  ],
)

// ==============================================================================
// 4. ORGANIZATION INVITATIONS
// ==============================================================================
export const organizationInvitations = pgTable(
  'organization_invitations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    role: organizationRoleEnum('role').default('property_manager').notNull(),
    assignedPropertyIds: uuid('assigned_property_ids').array().default([]),
    invitedByUserId: uuid('invited_by_user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    status: varchar('status', { length: 50 }).default('pending').notNull(),
    token: varchar('token', { length: 255 }).notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_invitations_org').on(table.organizationId),
    index('idx_invitations_token').on(table.token),
  ],
)

// ==============================================================================
// 5. PROPERTIES
// ==============================================================================
export const properties = pgTable(
  'properties',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 50 }).notNull(),
    propertyType: varchar('property_type', { length: 50 }).default('commercial_residential').notNull(),
    address: text('address').notNull(),
    city: varchar('city', { length: 100 }).notNull(),
    timezone: varchar('timezone', { length: 50 }).default('Asia/Dhaka').notNull(),
    totalBuildings: integer('total_buildings').default(1).notNull(),
    settings: jsonb('settings').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('uq_org_property_code').on(table.organizationId, table.code),
    index('idx_properties_org').on(table.organizationId),
  ],
)

// ==============================================================================
// 6. PROPERTY MEMBERS (Scoped Staff Access)
// ==============================================================================
export const propertyMembers = pgTable(
  'property_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    propertyId: uuid('property_id')
      .references(() => properties.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    role: propertyRoleEnum('role').default('viewer').notNull(),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('uq_prop_user').on(table.propertyId, table.userId),
    index('idx_prop_members_user').on(table.userId),
    index('idx_prop_members_prop').on(table.propertyId),
    index('idx_prop_members_org').on(table.organizationId),
  ],
)

// ==============================================================================
// 7. BUILDINGS
// ==============================================================================
export const buildings = pgTable(
  'buildings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    propertyId: uuid('property_id')
      .references(() => properties.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 50 }).notNull(),
    totalFloors: integer('total_floors').default(1).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('uq_property_building_code').on(table.propertyId, table.code),
    index('idx_buildings_org_prop').on(table.organizationId, table.propertyId),
  ],
)

// ==============================================================================
// 8. FLOORS
// ==============================================================================
export const floors = pgTable(
  'floors',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    propertyId: uuid('property_id')
      .references(() => properties.id, { onDelete: 'cascade' })
      .notNull(),
    buildingId: uuid('building_id')
      .references(() => buildings.id, { onDelete: 'cascade' })
      .notNull(),
    floorNumber: integer('floor_number').notNull(),
    label: varchar('label', { length: 100 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('uq_building_floor').on(table.buildingId, table.floorNumber),
    index('idx_floors_org_prop_building').on(
      table.organizationId,
      table.propertyId,
      table.buildingId,
    ),
  ],
)

// ==============================================================================
// 9. ROOMS / UNITS
// ==============================================================================
export const rooms = pgTable(
  'rooms',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    propertyId: uuid('property_id')
      .references(() => properties.id, { onDelete: 'cascade' })
      .notNull(),
    buildingId: uuid('building_id')
      .references(() => buildings.id, { onDelete: 'cascade' })
      .notNull(),
    floorId: uuid('floor_id')
      .references(() => floors.id, { onDelete: 'cascade' })
      .notNull(),
    roomNumber: varchar('room_number', { length: 50 }).notNull(),
    unitType: unitTypeEnum('unit_type').default('residential').notNull(),
    baseRent: decimal('base_rent', { precision: 14, scale: 2 }).default('0.00').notNull(),
    sizeSqft: decimal('size_sqft', { precision: 8, scale: 2 }),
    status: unitStatusEnum('status').default('vacant').notNull(),
    utilityMeters: jsonb('utility_meters').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('uq_floor_room_number').on(table.floorId, table.roomNumber),
    index('idx_rooms_org_prop').on(table.organizationId, table.propertyId),
    index('idx_rooms_status').on(table.organizationId, table.propertyId, table.status),
  ],
)

// ==============================================================================
// 10. TENANTS
// ==============================================================================
export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    legalName: varchar('legal_name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 50 }).notNull(),
    nidOrPassport: varchar('nid_or_passport', { length: 100 }),
    isCorporate: boolean('is_corporate').default(false).notNull(),
    companyRegistration: varchar('company_registration', { length: 100 }),
    profileImageStorageKey: varchar('profile_image_storage_key', { length: 255 }),
    nidDocumentStorageKey: varchar('nid_document_storage_key', { length: 255 }),
    spouseNidStorageKey: varchar('spouse_nid_storage_key', { length: 255 }),
    emergencyContact: jsonb('emergency_contact'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_tenants_org').on(table.organizationId)],
)

// ==============================================================================
// 11. RENTAL AGREEMENTS (Formal Leases)
// ==============================================================================
export const rentalAgreements = pgTable(
  'rental_agreements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    propertyId: uuid('property_id')
      .references(() => properties.id, { onDelete: 'cascade' })
      .notNull(),
    roomId: uuid('room_id')
      .references(() => rooms.id, { onDelete: 'restrict' })
      .notNull(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'restrict' })
      .notNull(),
    startDate: timestamp('start_date', { withTimezone: true }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true }),
    baseRent: decimal('base_rent', { precision: 14, scale: 2 }).notNull(),
    securityDeposit: decimal('security_deposit', { precision: 14, scale: 2 })
      .default('0.00')
      .notNull(),
    utilityAdvance: decimal('utility_advance', { precision: 14, scale: 2 })
      .default('0.00')
      .notNull(),
    billingCycleDay: integer('billing_cycle_day').default(1).notNull(),
    status: agreementStatusEnum('status').default('active').notNull(),
    agreementDocumentStorageKey: varchar('agreement_document_storage_key', { length: 255 }),
    terms: jsonb('terms').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_agreements_org_prop').on(table.organizationId, table.propertyId),
    index('idx_agreements_room').on(table.roomId),
    index('idx_agreements_tenant').on(table.tenantId),
  ],
)

// ==============================================================================
// 12. BILLS (Monthly Invoices)
// ==============================================================================
export const bills = pgTable(
  'bills',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    propertyId: uuid('property_id')
      .references(() => properties.id, { onDelete: 'cascade' })
      .notNull(),
    agreementId: uuid('agreement_id')
      .references(() => rentalAgreements.id, { onDelete: 'restrict' })
      .notNull(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'restrict' })
      .notNull(),
    billNumber: varchar('bill_number', { length: 50 }).notNull(),
    billingPeriod: varchar('billing_period', { length: 20 }).notNull(), // e.g. '2026-10'
    totalAmount: decimal('total_amount', { precision: 14, scale: 2 }).notNull(),
    paidAmount: decimal('paid_amount', { precision: 14, scale: 2 }).default('0.00').notNull(),
    balanceDue: decimal('balance_due', { precision: 14, scale: 2 }).notNull(),
    dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
    status: billStatusEnum('status').default('unpaid').notNull(),
    pdfInvoiceStorageKey: varchar('pdf_invoice_storage_key', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('uq_bill_number').on(table.organizationId, table.billNumber),
    index('idx_bills_org_prop').on(table.organizationId, table.propertyId),
    index('idx_bills_tenant').on(table.tenantId),
    index('idx_bills_status').on(table.organizationId, table.status),
  ],
)

// ==============================================================================
// 13. BILL LINE ITEMS (Rent, Electricity Sub-meter, Gas, Water, etc.)
// ==============================================================================
export const billLineItems = pgTable(
  'bill_line_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    billId: uuid('bill_id')
      .references(() => bills.id, { onDelete: 'cascade' })
      .notNull(),
    itemType: varchar('item_type', { length: 50 }).notNull(), // 'base_rent', 'electricity', 'gas', 'water', 'service'
    description: varchar('description', { length: 255 }).notNull(),
    amount: decimal('amount', { precision: 14, scale: 2 }).notNull(),
    meterReadingMeta: jsonb('meter_reading_meta'), // { previousUnit, currentUnit, ratePerUnit }
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_line_items_bill').on(table.billId)],
)

// ==============================================================================
// 14. PAYMENTS
// ==============================================================================
export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    propertyId: uuid('property_id')
      .references(() => properties.id, { onDelete: 'cascade' })
      .notNull(),
    billId: uuid('bill_id')
      .references(() => bills.id, { onDelete: 'restrict' })
      .notNull(),
    amountPaid: decimal('amount_paid', { precision: 14, scale: 2 }).notNull(),
    paymentMethod: paymentMethodEnum('payment_method').notNull(),
    transactionReference: varchar('transaction_reference', { length: 100 }),
    receiptStorageKey: varchar('receipt_storage_key', { length: 255 }),
    paidAt: timestamp('paid_at', { withTimezone: true }).defaultNow().notNull(),
    recordedByUserId: uuid('recorded_by_user_id')
      .references(() => users.id, { onDelete: 'restrict' })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_payments_org_prop').on(table.organizationId, table.propertyId),
    index('idx_payments_bill').on(table.billId),
  ],
)

// ==============================================================================
// 15. FINANCIAL TRANSACTIONS (Double-Entry Audit Ledger)
// ==============================================================================
export const financialTransactions = pgTable(
  'financial_transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    propertyId: uuid('property_id')
      .references(() => properties.id, { onDelete: 'cascade' })
      .notNull(),
    paymentId: uuid('payment_id').references(() => payments.id, { onDelete: 'set null' }),
    entryType: transactionEntryTypeEnum('entry_type').notNull(), // 'debit' or 'credit'
    accountType: accountTypeEnum('account_type').notNull(),
    amount: decimal('amount', { precision: 14, scale: 2 }).notNull(),
    description: text('description').notNull(),
    postedAt: timestamp('posted_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_fin_tx_org_prop').on(table.organizationId, table.propertyId),
    index('idx_fin_tx_account').on(table.organizationId, table.accountType),
  ],
)

// ==============================================================================
// 16. STORAGE OBJECTS (Metadata for Private Buckets)
// ==============================================================================
export const storageObjects = pgTable(
  'storage_objects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    bucket: varchar('bucket', { length: 100 }).notNull(),
    objectKey: varchar('object_key', { length: 255 }).notNull().unique(),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    uploadedByUserId: uuid('uploaded_by_user_id')
      .references(() => users.id, { onDelete: 'restrict' })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_storage_objects_org').on(table.organizationId),
    index('idx_storage_objects_bucket').on(table.organizationId, table.bucket),
  ],
)

// ==============================================================================
// 17. DOCUMENT ACCESS LOGS
// ==============================================================================
export const documentAccessLogs = pgTable(
  'document_access_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    storageObjectId: uuid('storage_object_id')
      .references(() => storageObjects.id, { onDelete: 'cascade' })
      .notNull(),
    accessedByUserId: uuid('accessed_by_user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    action: varchar('action', { length: 50 }).notNull(), // 'signed_url_generated', 'downloaded'
    ipAddress: varchar('ip_address', { length: 50 }),
    accessedAt: timestamp('accessed_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_doc_logs_org').on(table.organizationId),
    index('idx_doc_logs_user').on(table.accessedByUserId),
  ],
)

// ==============================================================================
// 18. BACKGROUND JOBS (Durable Serverless Outbox)
// ==============================================================================
export const backgroundJobs = pgTable(
  'background_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    jobType: varchar('job_type', { length: 100 }).notNull(),
    payload: jsonb('payload').default({}).notNull(),
    idempotencyKey: varchar('idempotency_key', { length: 255 }).notNull().unique(),
    status: jobStatusEnum('status').default('pending').notNull(),
    attemptsCount: integer('attempts_count').default(0).notNull(),
    maxRetries: integer('max_retries').default(5).notNull(),
    lastError: text('last_error'),
    lockedAt: timestamp('locked_at', { withTimezone: true }),
    scheduledFor: timestamp('scheduled_for', { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_jobs_org_status').on(table.organizationId, table.status),
    index('idx_jobs_queue').on(table.status, table.scheduledFor),
  ],
)

// ==============================================================================
// 19. JOB LOGS
// ==============================================================================
export const jobLogs = pgTable(
  'job_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    jobId: uuid('job_id')
      .references(() => backgroundJobs.id, { onDelete: 'cascade' })
      .notNull(),
    durationMs: integer('duration_ms').notNull(),
    status: varchar('status', { length: 50 }).notNull(),
    message: text('message'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_job_logs_job').on(table.jobId)],
)

// ==============================================================================
// 20. GOOGLE DRIVE BACKUPS (Independent Historical Archives)
// ==============================================================================
export const googleDriveBackups = pgTable(
  'google_drive_backups',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    backupType: varchar('backup_type', { length: 50 }).notNull(), // 'daily_structured', 'weekly_snapshot', 'monthly_archive'
    fileId: varchar('file_id', { length: 255 }).notNull(),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    sha256Checksum: varchar('sha256_checksum', { length: 64 }).notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    isVerified: boolean('is_verified').default(false).notNull(),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_drive_backups_org').on(table.organizationId)],
)

// ==============================================================================
// 21. GOOGLE SHEETS SYNC CONFIGS (Optional Reporting Integration)
// ==============================================================================
export const googleSheetsSyncConfigs = pgTable(
  'google_sheets_sync_configs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'cascade' }),
    spreadsheetId: varchar('spreadsheet_id', { length: 255 }).notNull(),
    sheetTitle: varchar('sheet_title', { length: 100 }).notNull(),
    syncMode: varchar('sync_mode', { length: 50 }).default('append_only').notNull(),
    isEnabled: boolean('is_enabled').default(true).notNull(),
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_sheets_sync_org').on(table.organizationId)],
)

