import { NextRequest } from 'next/server'
import { apiSuccess } from '@/lib/auth/context'
import { jobOutbox } from '@/lib/jobs/outbox'

export async function POST(request: NextRequest) {
  // Can be called by Vercel Cron or admin authenticated webhook
  const { searchParams } = new URL(request.url)
  const batchSize = Number(searchParams.get('batchSize') || 5)

  const results = await jobOutbox.processDueJobs(batchSize)

  return apiSuccess({
    processedCount: results.length,
    results,
    queueState: jobOutbox.getQueueMetrics(),
  })
}

export async function GET() {
  return apiSuccess({
    queueState: jobOutbox.getQueueMetrics(),
  })
}

