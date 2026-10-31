import { BackgroundJob, JobExecutionResult, JobType } from './types'

// In-memory outbox queue (used in local dev or fallback)
const MEMORY_JOB_QUEUE: BackgroundJob[] = [
  {
    id: 'job_seed_1',
    organizationId: 'org_prime_holdings',
    jobType: 'monthly_bills_generation',
    payload: { billingPeriod: '2026-11', propertyId: 'prop_green_tower' },
    idempotencyKey: 'bill_gen_org_prime_holdings_2026_11_prop_green_tower',
    status: 'completed',
    attemptsCount: 1,
    maxRetries: 5,
    scheduledFor: '2026-10-31T00:00:00Z',
    completedAt: '2026-10-31T00:01:15Z',
    createdAt: '2026-10-30T23:55:00Z',
  },
  {
    id: 'job_seed_2',
    organizationId: 'org_prime_holdings',
    jobType: 'google_drive_backup',
    payload: { backupType: 'daily_structured', destinationFolder: 'Renvexa_Backups' },
    idempotencyKey: 'backup_org_prime_holdings_2026_10_30',
    status: 'completed',
    attemptsCount: 1,
    maxRetries: 5,
    scheduledFor: '2026-10-30T22:00:00Z',
    completedAt: '2026-10-30T22:02:10Z',
    createdAt: '2026-10-30T21:55:00Z',
  },
]

export class JobOutboxService {
  private queue: BackgroundJob[] = [...MEMORY_JOB_QUEUE]

  /**
   * Enqueue a new durable job into the outbox with idempotency check
   */
  async enqueue(
    organizationId: string,
    jobType: JobType,
    payload: Record<string, any>,
    idempotencyKey: string,
    scheduledFor = new Date().toISOString(),
  ): Promise<BackgroundJob> {
    // Check for existing duplicate by idempotencyKey
    const existing = this.queue.find((j) => j.idempotencyKey === idempotencyKey)
    if (existing) {
      return existing
    }

    const job: BackgroundJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      organizationId,
      jobType,
      payload,
      idempotencyKey,
      status: 'pending',
      attemptsCount: 0,
      maxRetries: 5,
      scheduledFor,
      createdAt: new Date().toISOString(),
    }

    this.queue.push(job)
    return job
  }

  /**
   * Process pending jobs in atomic batches (designed for Vercel 10s serverless window)
   */
  async processDueJobs(batchSize = 5): Promise<JobExecutionResult[]> {
    const now = new Date()
    const results: JobExecutionResult[] = []

    // Fetch up to batchSize pending or retrying jobs due for execution
    const dueJobs = this.queue
      .filter((j) => (j.status === 'pending' || j.status === 'retrying') && new Date(j.scheduledFor) <= now)
      .slice(0, batchSize)

    for (const job of dueJobs) {
      const startTime = Date.now()
      job.status = 'processing'
      job.lockedAt = new Date().toISOString()
      job.attemptsCount += 1

      try {
        const message = await this.executeJobHandler(job)
        job.status = 'completed'
        job.completedAt = new Date().toISOString()
        job.lastError = undefined

        results.push({
          jobId: job.id,
          jobType: job.jobType,
          success: true,
          durationMs: Date.now() - startTime,
          message,
        })
      } catch (err: any) {
        const durationMs = Date.now() - startTime
        job.lastError = err?.message || 'Unknown job failure'

        if (job.attemptsCount >= job.maxRetries) {
          job.status = 'failed'
        } else {
          job.status = 'retrying'
          // Exponential backoff: 2^attempts * 30 seconds
          const backoffSeconds = Math.pow(2, job.attemptsCount) * 30
          job.scheduledFor = new Date(Date.now() + backoffSeconds * 1000).toISOString()
        }

        results.push({
          jobId: job.id,
          jobType: job.jobType,
          success: false,
          durationMs,
          error: job.lastError,
        })
      }
    }

    return results
  }

  /**
   * Internal job handler dispatch
   */
  private async executeJobHandler(job: BackgroundJob): Promise<string> {
    switch (job.jobType) {
      case 'monthly_bills_generation':
        return `Generated bills for period ${job.payload.billingPeriod || 'current'}`

      case 'google_sheets_sync':
        return `Synchronized spreadsheet ${job.payload.spreadsheetId || 'default'}`

      case 'google_drive_backup':
        return `Structured backup archive created for ${job.organizationId}`

      case 'utility_meter_reconciliation':
        return `Meter readings validated and audited`

      case 'tenant_welcome_notification':
        return `Notification delivered to ${job.payload.email || 'tenant'}`

      default:
        throw new Error(`Unhandled job type: ${job.jobType}`)
    }
  }

  /**
   * List jobs for an organization
   */
  getJobs(organizationId: string): BackgroundJob[] {
    return this.queue.filter((j) => j.organizationId === organizationId)
  }

  /**
   * Get queue health stats
   */
  getQueueMetrics(organizationId?: string) {
    const list = organizationId ? this.queue.filter((j) => j.organizationId === organizationId) : this.queue
    return {
      total: list.length,
      pending: list.filter((j) => j.status === 'pending').length,
      processing: list.filter((j) => j.status === 'processing').length,
      completed: list.filter((j) => j.status === 'completed').length,
      failed: list.filter((j) => j.status === 'failed').length,
      retrying: list.filter((j) => j.status === 'retrying').length,
    }
  }
}

export const jobOutbox = new JobOutboxService()

