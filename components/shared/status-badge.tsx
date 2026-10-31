'use client'

import React from 'react'

export type StatusTone = 'emerald' | 'amber' | 'rose' | 'violet' | 'blue' | 'slate'

export interface StatusBadgeProps {
  status: string
  label?: string
  tone?: StatusTone
  className?: string
}

const STATUS_TONE_MAP: Record<string, StatusTone> = {
  // Unit statuses
  occupied: 'emerald',
  vacant: 'amber',
  maintenance: 'rose',
  reserved: 'violet',

  // Agreement & lease statuses
  active: 'emerald',
  draft: 'slate',
  expired: 'amber',
  terminated: 'rose',

  // Billing statuses
  paid: 'emerald',
  partially_paid: 'amber',
  unpaid: 'rose',
  overdue: 'rose',

  // Staff roles
  owner: 'emerald',
  admin: 'blue',
  property_manager: 'teal' as any,
  accountant: 'violet',
  viewer: 'slate',
}

const TONE_CLASSES: Record<StatusTone, string> = {
  emerald: 'bg-[#eaf8f5] text-[#13574c] border-[#c0e8de]',
  amber: 'bg-[#fff8ea] text-[#915e12] border-[#fae2b4]',
  rose: 'bg-[#feeef0] text-[#a11a2f] border-[#fbc9d1]',
  violet: 'bg-[#f5eefb] text-[#632997] border-[#e2d0f5]',
  blue: 'bg-[#eef5fc] text-[#1e588f] border-[#cde2f6]',
  slate: 'bg-[#f2f5f4] text-[#55706c] border-[#d8e2df]',
}

export function StatusBadge({ status, label, tone, className = '' }: StatusBadgeProps) {
  const normalizedKey = status.toLowerCase().replace(/\s+/g, '_')
  const resolvedTone: StatusTone = tone || STATUS_TONE_MAP[normalizedKey] || 'slate'
  const displayLabel = label || status.replace(/_/g, ' ')

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${TONE_CLASSES[resolvedTone]} ${className}`}
    >
      {displayLabel}
    </span>
  )
}

