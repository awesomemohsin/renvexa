export interface InfrastructureHealthReport {
  timestamp: string
  environment: {
    nodeEnv: string
    hostingPlatform: string
    databaseProvider: string
    storageProvider: string
    isDatabaseConnected: boolean
    isSupabaseConfigured: boolean
  }
  quotas: {
    tierName: string
    databaseSizeBytes: number
    databaseMaxBytes: number
    databaseUsagePercent: number
    isDatabaseWarning: boolean
    storageSizeBytes: number
    storageMaxBytes: number
    storageUsagePercent: number
    isStorageWarning: boolean
    propertiesCount: number
    propertiesMax: number
    unitsCount: number
    unitsMax: number
  }
  outbox: {
    total: number
    pending: number
    processing: number
    completed: number
    failed: number
    retrying: number
  }
  backup: {
    lastBackupTimestamp: string
    isConfigured: boolean
    provider: string
  }
}

