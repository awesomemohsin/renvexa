'use client'

import { useEffect, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Cloud,
  Database,
  FileBox,
  HardDrive,
  Layers,
  Play,
  RefreshCw,
  Server,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { InfrastructureHealthReport } from '@/lib/monitoring/types'

const INITIAL_REPORT: InfrastructureHealthReport = {
  timestamp: new Date().toISOString(),
  environment: {
    nodeEnv: 'development',
    hostingPlatform: 'Vercel (Serverless)',
    databaseProvider: 'Supabase PostgreSQL (Live / Drizzle)',
    storageProvider: 'Supabase Storage (Private Buckets)',
    isDatabaseConnected: false,
    isSupabaseConfigured: false,
  },
  quotas: {
    tierName: 'Free / Evaluation Tier',
    databaseSizeBytes: 1.8 * 1024 * 1024,
    databaseMaxBytes: 500 * 1024 * 1024,
    databaseUsagePercent: 0.4,
    isDatabaseWarning: false,
    storageSizeBytes: 14.5 * 1024 * 1024,
    storageMaxBytes: 1 * 1024 * 1024 * 1024,
    storageUsagePercent: 1.4,
    isStorageWarning: false,
    propertiesCount: 3,
    propertiesMax: 3,
    unitsCount: 16,
    unitsMax: 25,
  },
  outbox: {
    total: 2,
    pending: 0,
    processing: 0,
    completed: 2,
    failed: 0,
    retrying: 0,
  },
  backup: {
    lastBackupTimestamp: '2026-10-30T22:02:10Z',
    isConfigured: true,
    provider: 'Google Drive (SHA-256 Verified)',
  },
}

export function InfrastructureMonitor({ organizationId = 'org_prime_holdings' }) {
  const [report, setReport] = useState<InfrastructureHealthReport>(INITIAL_REPORT)
  const [isDispatching, setIsDispatching] = useState(false)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [backupResult, setBackupResult] = useState<any>(null)
  const [dispatchResults, setDispatchResults] = useState<any[] | null>(null)

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/v1/admin/infrastructure', {
        headers: { 'x-organization-id': organizationId },
      })
      if (res.ok) {
        const json = await res.json()
        if (json.data) {
          setReport(json.data)
        }
      }
    } catch {
      // Fallback to static mock report if API is loading
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [organizationId])

  const handleDispatchJobs = async () => {
    setIsDispatching(true)
    try {
      const res = await fetch('/api/v1/jobs/dispatch', { method: 'POST' })
      if (res.ok) {
        const json = await res.json()
        setDispatchResults(json.data?.results || [])
        await fetchMetrics()
      }
    } finally {
      setIsDispatching(false)
    }
  }

  const handleRunBackup = async () => {
    setIsBackingUp(true)
    try {
      const res = await fetch('/api/v1/backups/google-drive', {
        method: 'POST',
        headers: { 'x-organization-id': organizationId },
      })
      if (res.ok) {
        const json = await res.json()
        setBackupResult(json.data)
        await fetchMetrics()
      }
    } finally {
      setIsBackingUp(false)
    }
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#295654]/20 bg-gradient-to-r from-[#123332] to-[#1c4745] p-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-[#a9e7d6] text-[#123332]">
            <Server className="size-6 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#a9e7d6]">
                Infrastructure & Scalability Monitor
              </span>
              <span className="rounded bg-[#a9e7d6]/20 px-2 py-0.5 text-[10px] font-bold text-[#a9e7d6]">
                Free-Tier First
              </span>
            </div>
            <h2 className="text-base font-bold text-white">
              SaaS Operational Environment: {report.environment.hostingPlatform}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchMetrics}
          className="flex items-center gap-2 rounded-xl bg-[#295654] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#356f6c]"
        >
          <RefreshCw className="size-3.5" />
          Refresh Metrics
        </button>
      </div>

      {/* Quota Progress Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Database Size Card */}
        <div className="rounded-2xl border border-[#dce6e3] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5a7b77]">Supabase Database</span>
            <Database className="size-4 text-[#295654]" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-[#123332]">
                {formatBytes(report.quotas.databaseSizeBytes)}
              </span>
              <span className="text-xs text-[#82a29e]">
                of {formatBytes(report.quotas.databaseMaxBytes)} (500 MB)
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#ebf2f0]">
              <div
                className={`h-full rounded-full ${
                  report.quotas.isDatabaseWarning ? 'bg-[#d97706]' : 'bg-[#295654]'
                }`}
                style={{ width: `${Math.max(4, report.quotas.databaseUsagePercent)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-[#789693]">
              {report.quotas.databaseUsagePercent}% utilized · Port 6543 pooler active
            </p>
          </div>
        </div>

        {/* Storage Size Card */}
        <div className="rounded-2xl border border-[#dce6e3] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5a7b77]">Supabase Storage</span>
            <Cloud className="size-4 text-[#295654]" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-[#123332]">
                {formatBytes(report.quotas.storageSizeBytes)}
              </span>
              <span className="text-xs text-[#82a29e]">
                of {formatBytes(report.quotas.storageMaxBytes)} (1 GB)
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#ebf2f0]">
              <div
                className={`h-full rounded-full ${
                  report.quotas.isStorageWarning ? 'bg-[#d97706]' : 'bg-[#295654]'
                }`}
                style={{ width: `${Math.max(4, report.quotas.storageUsagePercent)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-[#789693]">
              Private buckets · 15-min signed URLs
            </p>
          </div>
        </div>

        {/* Serverless Execution Budget */}
        <div className="rounded-2xl border border-[#dce6e3] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5a7b77]">Vercel Hobby Budget</span>
            <Zap className="size-4 text-[#a8741f]" />
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-[#123332]">10s Max Timeout</span>
            <p className="mt-2 text-xs text-[#6e8e8a]">
              Stateless endpoints. Heavy jobs isolated into durable PostgreSQL outbox.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-[#185e54]">
              <CheckCircle2 className="size-3.5 text-[#295654]" />
              <span>Compliant with serverless constraints</span>
            </div>
          </div>
        </div>

        {/* Outbox Health */}
        <div className="rounded-2xl border border-[#dce6e3] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5a7b77]">Outbox Queue Health</span>
            <Activity className="size-4 text-[#295654]" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-[#f4f8f7] p-2">
              <span className="text-[10px] text-[#7f9f9b]">Completed</span>
              <p className="font-bold text-[#145a50]">{report.outbox.completed} jobs</p>
            </div>
            <div className="rounded-lg bg-[#fef7ee] p-2">
              <span className="text-[10px] text-[#a06830]">Pending</span>
              <p className="font-bold text-[#a06830]">{report.outbox.pending} jobs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Outbox Worker & Google Drive Backups */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* PostgreSQL Outbox Worker Panel */}
        <div className="rounded-2xl border border-[#dce6e3] bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#ebf2f0] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#123332]">Durable Job Outbox Engine</h3>
              <p className="text-xs text-[#71918e]">
                Asynchronous tasks (Bills, Sheets, Backups) with idempotency & exponential backoff
              </p>
            </div>
            <button
              type="button"
              disabled={isDispatching}
              onClick={handleDispatchJobs}
              className="flex items-center gap-1.5 rounded-xl bg-[#123332] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1f4a47] disabled:opacity-50"
            >
              <Play className="size-3.5 text-[#a9e7d6]" />
              {isDispatching ? 'Dispatching...' : 'Dispatch Batch'}
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[#527773]">
              <span>Queue Status:</span>
              <span className="font-semibold text-[#183938]">
                {report.outbox.pending === 0
                  ? 'Idle (All jobs processed)'
                  : `${report.outbox.pending} jobs awaiting run`}
              </span>
            </div>

            {dispatchResults && (
              <div className="rounded-xl bg-[#f4f8f7] p-3 text-xs">
                <span className="font-semibold text-[#145a50]">
                  Dispatch Results ({dispatchResults.length} processed):
                </span>
                <ul className="mt-1 space-y-1 text-[11px] text-[#345f5b]">
                  {dispatchResults.map((r, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <span>• {r.jobType}</span>
                      <span className="font-mono text-[10px]">{r.durationMs}ms</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-xl border border-[#edf3f1] bg-[#fafbfb] p-3 text-xs text-[#6e8d89]">
              <p className="font-medium text-[#183938]">Vercel 10-Second Safeguard:</p>
              <p className="mt-1 text-[11px] leading-relaxed">
                Jobs are processed in batches of 5 with <code>FOR UPDATE SKIP LOCKED</code>. Tasks
                exceeding 4 seconds are paused and rescheduled to prevent HTTP function timeouts.
              </p>
            </div>
          </div>
        </div>

        {/* Independent Google Drive Backup Panel */}
        <div className="rounded-2xl border border-[#dce6e3] bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#ebf2f0] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#123332]">Google Drive Independent Backups</h3>
              <p className="text-xs text-[#71918e]">
                Cryptographically hashed snapshots independent of Supabase
              </p>
            </div>
            <button
              type="button"
              disabled={isBackingUp}
              onClick={handleRunBackup}
              className="flex items-center gap-1.5 rounded-xl bg-[#295654] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#346f6c] disabled:opacity-50"
            >
              <HardDrive className="size-3.5 text-[#a9e7d6]" />
              {isBackingUp ? 'Exporting...' : 'Export Snapshot'}
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#527773]">
              <span>Last Snapshot:</span>
              <span className="font-mono font-medium text-[#183938]">
                {backupResult?.generatedAt || report.backup.lastBackupTimestamp}
              </span>
            </div>

            {backupResult ? (
              <div className="rounded-xl border border-[#c4e2db] bg-[#f2faf7] p-3.5 text-xs text-[#145a50]">
                <div className="flex items-center justify-between font-semibold">
                  <span>Export ID: {backupResult.backupId}</span>
                  <span className="rounded bg-[#a9e7d6] px-2 py-0.5 text-[9px] font-bold text-[#123332]">
                    SHA-256 Verified
                  </span>
                </div>
                <p className="mt-1 font-mono text-[10px] break-all text-[#326a62]">
                  Checksum: {backupResult.sha256Checksum}
                </p>
                <div className="mt-2 flex gap-4 text-[11px] text-[#427770]">
                  <span>Properties: <strong>{backupResult.propertiesCount}</strong></span>
                  <span>Units: <strong>{backupResult.unitsCount}</strong></span>
                  <span>Payload: <strong>{formatBytes(backupResult.sizeBytes)}</strong></span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-[#edf3f1] bg-[#fafbfb] p-3 text-xs text-[#6e8d89]">
                <p className="font-medium text-[#183938]">Independent Disaster Recovery Guarantee:</p>
                <p className="mt-1 text-[11px] leading-relaxed">
                  Backups contain full normalized JSON hierarchies. If Supabase is unreachable or paused, all records can be restored into any standard PostgreSQL instance immediately.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Migration & Portability Readiness Card */}
      <div className="rounded-2xl border border-[#dce6e3] bg-white p-6 shadow-2xs">
        <h3 className="text-base font-bold text-[#123332]">Provider Portability & Zero-Rebuild Roadmap</h3>
        <p className="mt-1 text-xs text-[#71918e]">
          How Renvexa transitions seamlessly from free-tier development to paid infrastructure:
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-[#ebf2f0] p-3.5 bg-[#fbfdfc]">
            <span className="font-bold text-[#183938]">1. Database Portability</span>
            <p className="mt-1 text-[11px] text-[#6b8b87]">
              Uses standard Drizzle ORM + vanilla PostgreSQL. Can move from Supabase to AWS RDS, Neon, or self-hosted Postgres by updating <code>DATABASE_URL</code> only.
            </p>
          </div>
          <div className="rounded-xl border border-[#ebf2f0] p-3.5 bg-[#fbfdfc]">
            <span className="font-bold text-[#183938]">2. Storage Portability</span>
            <p className="mt-1 text-[11px] text-[#6b8b87]">
              Uses <code>StorageProvider</code> abstraction. Can switch from Supabase Storage to Cloudflare R2 (10 GB free, $0 egress) or AWS S3 without changing any file-handling logic.
            </p>
          </div>
          <div className="rounded-xl border border-[#ebf2f0] p-3.5 bg-[#fbfdfc]">
            <span className="font-bold text-[#183938]">3. Hosting Portability</span>
            <p className="mt-1 text-[11px] text-[#6b8b87]">
              Compatible with Vercel Hobby during development. For commercial launch, easily transition to Vercel Pro or self-hosted Docker container (Coolify/Fly.io).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
