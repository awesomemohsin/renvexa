export type JobType =
  | 'monthly_bills_generation'
  | 'google_sheets_sync'
  | 'google_drive_backup'
  | 'utility_meter_reconciliation'
  | 'tenant_welcome_notification'

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retrying'

export interface BackgroundJob {
  id: string
  organizationId: string
  jobType: JobType
  payload: Record<string, any>
  idempotencyKey: string
  status: JobStatus
  attemptsCount: number
  maxRetries: number
  lastError?: string
  lockedAt?: string
  scheduledFor: string
  completedAt?: string
  createdAt: string
}

export interface JobExecutionResult {
  jobId: string
  jobType: JobType
  success: boolean
  durationMs: number
  message?: string
  error?: string
}

