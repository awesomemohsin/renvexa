'use client'

import React from 'react'
import { LucideIcon, MoreHorizontal } from 'lucide-react'

export interface StatCardProps {
  label: string
  value: string | number
  change?: string
  hint?: string
  icon: LucideIcon
  accent?: 'teal' | 'blue' | 'amber' | 'violet' | 'rose'
  onMore?: () => void
}

const ACCENT_STYLES = {
  teal: 'bg-[#e4f5f0] text-[#318e7e]',
  blue: 'bg-[#e8f0f8] text-[#5a89ad]',
  amber: 'bg-[#fff2dc] text-[#bb8143]',
  violet: 'bg-[#efebf7] text-[#8465a9]',
  rose: 'bg-[#feeef0] text-[#a11a2f]',
}

export function StatCard({
  label,
  value,
  change,
  hint,
  icon: Icon,
  accent = 'teal',
  onMore,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[#e2ebe8] bg-white p-5 shadow-[0_2px_12px_rgba(28,67,63,0.03)] transition-all hover:border-[#295654]/40">
      <div className="mb-4 flex items-start justify-between">
        <div className={`grid size-9 place-items-center rounded-xl ${ACCENT_STYLES[accent]}`}>
          <Icon className="size-[17px]" />
        </div>
        {onMore && (
          <button
            type="button"
            aria-label={`More options for ${label}`}
            onClick={onMore}
            className="text-[#a4b6b2] hover:text-[#42605b]"
          >
            <MoreHorizontal className="size-[18px]" />
          </button>
        )}
      </div>

      <p className="text-xs font-medium text-[#78918d]">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-[22px] font-semibold tracking-[-0.04em] text-[#193734]">{value}</p>
      </div>

      {(change || hint) && (
        <p className="mt-2 text-[11px] text-[#8ba29e]">
          {change && (
            <span
              className={`mr-1 font-semibold ${
                accent === 'amber' || accent === 'rose' ? 'text-[#bc8244]' : 'text-[#3d9a87]'
              }`}
            >
              {change}
            </span>
          )}
          {hint}
        </p>
      )}
    </div>
  )
}

