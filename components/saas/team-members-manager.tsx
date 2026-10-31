'use client'

import { useState } from 'react'
import {
  Building2,
  CheckCircle2,
  Lock,
  Mail,
  Plus,
  Shield,
  ShieldAlert,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { OrganizationMemberDetail, OrganizationRole, Property } from '@/lib/domain/hierarchy'

interface TeamMembersManagerProps {
  members: OrganizationMemberDetail[]
  properties: Property[]
  organizationName: string
  currentRole: OrganizationRole
  onInviteMember: (email: string, role: OrganizationRole, propertyIds: string[]) => void
}

export function TeamMembersManager({
  members,
  properties,
  organizationName,
  currentRole,
  onInviteMember,
}: TeamMembersManagerProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<OrganizationRole>('property_manager')
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([])

  const canManageTeam = currentRole === 'owner' || currentRole === 'admin'

  const handleToggleProperty = (propId: string) => {
    setSelectedPropertyIds((prev) =>
      prev.includes(propId) ? prev.filter((id) => id !== propId) : [...prev, propId],
    )
  }

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    onInviteMember(inviteEmail.trim(), inviteRole, selectedPropertyIds)
    setInviteEmail('')
    setSelectedPropertyIds([])
    setIsInviteModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#123332]">
            Team & Staff ({members.length})
          </h2>
          <p className="mt-1 text-xs text-[#5f7d7a]">
            Manage multi-user access and property-level scopes for <strong>{organizationName}</strong>
          </p>
        </div>

        {canManageTeam && (
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#123332] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1d4f4b]"
          >
            <UserPlus className="size-4 text-[#a9e7d6]" />
            Invite Team Member
          </button>
        )}
      </div>

      {/* Team Members Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map(({ membership, user, propertyMemberships }) => {
          const isGlobal = membership.role === 'owner' || membership.role === 'admin'
          return (
            <div
              key={user.id}
              className="flex flex-col justify-between rounded-2xl border border-[#dfe8e5] bg-white p-5 shadow-2xs transition-all hover:border-[#295654]"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-[#e6f4f1] font-bold text-[#14574d]">
                      {user.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#123332]">{user.fullName}</h3>
                      <p className="text-[11px] text-[#71928f]">{user.email}</p>
                    </div>
                  </div>

                  <span className="rounded-full bg-[#eef7f5] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1e6157]">
                    {membership.role.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-4 border-t border-[#edf3f1] pt-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#739692]">
                    Property Access Scope:
                  </span>
                  {isGlobal ? (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#1c6057]">
                      <Shield className="size-3.5" />
                      <span className="font-medium">Portfolio-wide (All Properties)</span>
                    </div>
                  ) : propertyMemberships.length > 0 ? (
                    <div className="mt-1.5 space-y-1">
                      {propertyMemberships.map((pm) => {
                        const prop = properties.find((p) => p.id === pm.propertyId)
                        return (
                          <div
                            key={pm.propertyId}
                            className="flex items-center gap-1.5 rounded-md bg-[#f4f8f7] px-2 py-1 text-xs text-[#204a47]"
                          >
                            <Building2 className="size-3 text-[#295654]" />
                            <span className="truncate">{prop?.name || pm.propertyId}</span>
                            <span className="ml-auto text-[9px] uppercase font-bold text-[#65918c]">
                              {pm.role}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="mt-1.5 text-xs text-[#a06830]">No properties assigned</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#edf3f1] pt-3 text-[11px] text-[#86a6a2]">
                <span>Status: <strong className="capitalize text-[#1f5951]">{membership.status}</strong></span>
                <span>Active</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ebf2f0] pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="size-5 text-[#295654]" />
                <h3 className="text-base font-bold text-[#123332]">Invite Team Member</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="rounded-lg p-1 text-[#83a29f] hover:bg-[#f2f6f5] hover:text-[#123332]"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#30534f]">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="manager@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-[#dce7e3] px-3 text-xs outline-none focus:border-[#295654]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#30534f]">Organization Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as OrganizationRole)}
                  className="mt-1 h-10 w-full rounded-xl border border-[#dce7e3] bg-white px-3 text-xs outline-none focus:border-[#295654]"
                >
                  <option value="property_manager">Property Manager</option>
                  <option value="accountant">Accountant</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer (Read-only)</option>
                </select>
              </div>

              {inviteRole === 'property_manager' && (
                <div>
                  <label className="block text-xs font-semibold text-[#30534f]">
                    Assign Specific Properties (SaaS Scope Isolation)
                  </label>
                  <p className="mt-0.5 text-[11px] text-[#71918e]">
                    Select which properties this manager is allowed to see and manage:
                  </p>
                  <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto">
                    {properties.map((prop) => {
                      const isChecked = selectedPropertyIds.includes(prop.id)
                      return (
                        <label
                          key={prop.id}
                          className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 text-xs transition-colors ${
                            isChecked
                              ? 'border-[#295654] bg-[#edf6f4] text-[#123332]'
                              : 'border-[#e2ece9] hover:bg-[#f9fbfa]'
                          }`}
                        >
                          <span className="font-medium">{prop.name} ({prop.code})</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleProperty(prop.id)}
                            className="size-4 accent-[#295654]"
                          />
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#123332] py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1f4a47]"
                >
                  Send Invitation
                </button>
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="rounded-xl border border-[#dce7e3] px-4 py-2.5 text-xs font-semibold text-[#527773] hover:bg-[#f4f8f7]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

