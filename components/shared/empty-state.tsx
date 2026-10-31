'use client'

import React from 'react'
import { LucideIcon, PackageOpen } from 'lucide-react'

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#dce6e3] bg-[#fbfdfc] px-6 py-12 text-center ${className}`}
    >
      <div className="grid size-12 place-items-center rounded-2xl bg-[#edf4f2] text-[#295654]">
        <Icon className="size-6" />
      </div>
      <h3 className="mt-4 text-sm font-bold text-[#123332]">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-xs text-[#71918e]">{description}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-xl bg-[#123332] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1f4a47]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

