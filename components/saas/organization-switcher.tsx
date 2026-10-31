'use client'

import { useState } from 'react'
import { Building, Check, ChevronDown, Plus, ShieldCheck, Sparkles } from 'lucide-react'
import { Organization, OrganizationMembership } from '@/lib/domain/hierarchy'

interface OrganizationSwitcherProps {
  organizations: { organization: Organization; membership: OrganizationMembership }[]
  activeOrgId: string
  onSelectOrg: (orgId: string) => void
  onCreateOrg?: (name: string, plan: 'starter' | 'growth' | 'enterprise') => void
}

export function OrganizationSwitcher({
  organizations,
  activeOrgId,
  onSelectOrg,
  onCreateOrg,
}: OrganizationSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgPlan, setNewOrgPlan] = useState<'starter' | 'growth' | 'enterprise'>('growth')

  const activeEntry = organizations.find((o) => o.organization.id === activeOrgId) || organizations[0]

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrgName.trim()) return
    onCreateOrg?.(newOrgName.trim(), newOrgPlan)
    setNewOrgName('')
    setIsCreating(false)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-[#2b5956] bg-[#163f3c] p-2.5 text-left transition-colors hover:bg-[#1b4b48]"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#a9e7d6] text-[#123332]">
            <Building className="size-4 font-bold" />
          </div>
          <div className="min-w-0 truncate">
            <span className="block truncate text-xs font-semibold text-white">
              {activeEntry?.organization.name}
            </span>
            <span className="block text-[10px] uppercase tracking-wider text-[#a9e7d6]">
              {activeEntry?.organization.subscription.plan.toUpperCase()} TIER · {activeEntry?.membership.role}
            </span>
          </div>
        </div>
        <ChevronDown className="size-4 shrink-0 text-[#9ebbb7]" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-72 rounded-2xl border border-[#2c5b58] bg-[#123332] p-2 shadow-2xl">
          <div className="mb-2 px-2.5 pt-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#739692]">
              SaaS Organizations ({organizations.length})
            </span>
          </div>

          <div className="space-y-1">
            {organizations.map(({ organization, membership }) => {
              const isSelected = organization.id === activeOrgId
              return (
                <button
                  key={organization.id}
                  type="button"
                  onClick={() => {
                    onSelectOrg(organization.id)
                    setIsOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-[#295654] text-white shadow-xs'
                      : 'text-[#9ebbb7] hover:bg-[#1b4340] hover:text-white'
                  }`}
                >
                  <div className="truncate">
                    <p className="font-semibold text-white truncate">{organization.name}</p>
                    <p className="text-[10px] text-[#86a8a4]">
                      Role: <strong className="text-[#a9e7d6]">{membership.role}</strong> · Plan: {organization.subscription.plan}
                    </p>
                  </div>
                  {isSelected && <Check className="size-4 text-[#a9e7d6] shrink-0" />}
                </button>
              )
            })}
          </div>

          <div className="mt-2 border-t border-[#234e4b] pt-2">
            {!isCreating ? (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#1b4340] py-2 text-xs font-semibold text-[#a9e7d6] hover:bg-[#235652]"
              >
                <Plus className="size-3.5" />
                Add New Organization
              </button>
            ) : (
              <form onSubmit={handleCreate} className="space-y-2 p-1">
                <input
                  type="text"
                  placeholder="New Organization Name"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full rounded-lg border border-[#2b5956] bg-[#0c2423] px-2.5 py-1.5 text-xs text-white placeholder:text-[#6a8b87] outline-none focus:border-[#a9e7d6]"
                  autoFocus
                />
                <div className="flex gap-1">
                  {(['starter', 'growth', 'enterprise'] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setNewOrgPlan(tier)}
                      className={`flex-1 rounded-md py-1 text-[10px] capitalize transition-colors ${
                        newOrgPlan === tier
                          ? 'bg-[#a9e7d6] text-[#123332] font-bold'
                          : 'bg-[#1b4340] text-[#9ebbb7]'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5 pt-1">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-[#a9e7d6] py-1.5 text-xs font-bold text-[#123332]"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="rounded-lg bg-[#1b4340] px-3 py-1.5 text-xs text-[#9ebbb7]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

