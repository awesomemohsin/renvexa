export interface TierQuota {
  name: string
  maxProperties: number
  maxUnits: number
  maxStorageBytes: number // e.g. 1 GB for free tier
  maxMonthlyEmails: number
  databaseSizeWarningBytes: number // 80% of 500 MB
  storageSizeWarningBytes: number // 80% of 1 GB
  features: {
    googleDriveBackup: boolean
    googleSheetsSync: boolean
    customDomain: boolean
    auditLogs: boolean
  }
}

export const INFRASTRUCTURE_TIERS: Record<string, TierQuota> = {
  free_tier: {
    name: 'Free / Evaluation Tier',
    maxProperties: 3,
    maxUnits: 25,
    maxStorageBytes: 1 * 1024 * 1024 * 1024, // 1 GB (Supabase free limit)
    maxMonthlyEmails: 100,
    databaseSizeWarningBytes: 400 * 1024 * 1024, // 400 MB (80% of 500 MB)
    storageSizeWarningBytes: 800 * 1024 * 1024, // 800 MB (80% of 1 GB)
    features: {
      googleDriveBackup: true,
      googleSheetsSync: true,
      customDomain: false,
      auditLogs: true,
    },
  },
  starter: {
    name: 'Commercial Starter',
    maxProperties: 5,
    maxUnits: 50,
    maxStorageBytes: 5 * 1024 * 1024 * 1024, // 5 GB
    maxMonthlyEmails: 1000,
    databaseSizeWarningBytes: 800 * 1024 * 1024,
    storageSizeWarningBytes: 4 * 1024 * 1024 * 1024,
    features: {
      googleDriveBackup: true,
      googleSheetsSync: true,
      customDomain: true,
      auditLogs: true,
    },
  },
  growth: {
    name: 'Commercial Growth',
    maxProperties: 20,
    maxUnits: 300,
    maxStorageBytes: 25 * 1024 * 1024 * 1024, // 25 GB
    maxMonthlyEmails: 10000,
    databaseSizeWarningBytes: 2 * 1024 * 1024 * 1024,
    storageSizeWarningBytes: 20 * 1024 * 1024 * 1024,
    features: {
      googleDriveBackup: true,
      googleSheetsSync: true,
      customDomain: true,
      auditLogs: true,
    },
  },
  enterprise: {
    name: 'Enterprise Portfolio',
    maxProperties: 9999,
    maxUnits: 99999,
    maxStorageBytes: 100 * 1024 * 1024 * 1024,
    maxMonthlyEmails: 100000,
    databaseSizeWarningBytes: 10 * 1024 * 1024 * 1024,
    storageSizeWarningBytes: 80 * 1024 * 1024 * 1024,
    features: {
      googleDriveBackup: true,
      googleSheetsSync: true,
      customDomain: true,
      auditLogs: true,
    },
  },
}

export const BUCKET_NAMES = {
  TENANT_PROFILES: 'tenant-profiles',
  TENANT_NID: 'tenant-nid-documents',
  SPOUSE_NID: 'spouse-nid-documents',
  RENTAL_AGREEMENTS: 'rental-agreements',
  PROPERTY_DOCUMENTS: 'property-documents',
  PAYMENT_RECEIPTS: 'payment-receipts',
} as const

export function getInfrastructureConfig() {
  return {
    database: {
      url: process.env.DATABASE_URL || '',
      isConfigured: Boolean(process.env.DATABASE_URL),
      provider: 'postgresql' as const,
      poolSize: Number(process.env.DATABASE_POOL_SIZE || 10),
    },
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      isConfigured: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      ),
    },
    storage: {
      provider: (process.env.STORAGE_PROVIDER || 'memory') as 'supabase' | 's3' | 'r2' | 'memory',
      bucketPrefix: process.env.STORAGE_BUCKET_PREFIX || 'renvexa',
      signedUrlExpirationSeconds: 900, // 15 minutes TTL for private documents
    },
    hosting: {
      platform: 'vercel' as const,
      isServerless: true,
      maxFunctionDurationSeconds: 10, // Vercel Hobby constraint
    },
    backgroundJobs: {
      batchSize: 5,
      maxRetries: 5,
      pollIntervalSeconds: 60,
    },
  }
}

