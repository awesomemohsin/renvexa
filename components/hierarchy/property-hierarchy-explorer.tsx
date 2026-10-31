'use client'

import { useMemo, useState } from 'react'
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileCheck2,
  Gauge,
  KeyRound,
  Layers,
  Lock,
  Phone,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users2,
  Wrench,
  X,
  Zap,
} from 'lucide-react'
import { StatusBadge } from '@/components/shared/status-badge'
import {
  BuildingWithFloors,
  FloorWithRooms,
  PropertyHierarchy,
  RoomWithTenant,
} from '@/lib/domain/hierarchy'
import { RenvexaStore } from '@/lib/repository/store'
import { formatCurrency } from '@/lib/utils/formatters'

interface PropertyHierarchyExplorerProps {
  store: RenvexaStore
  selectedPropertyId: string
  onSelectProperty: (propertyId: string) => void
  currentRole: 'owner' | 'property_manager'
  onToggleRole: (role: 'owner' | 'property_manager') => void
}

export function PropertyHierarchyExplorer({
  store,
  selectedPropertyId,
  onSelectProperty,
  currentRole,
  onToggleRole,
}: PropertyHierarchyExplorerProps) {
  const orgId = 'org_prime_holdings'

  // Restricted property IDs for Tanvir (Property Manager)
  const allowedPropertyIds = currentRole === 'property_manager' ? ['prop_green_tower'] : undefined

  const accessibleProperties = useMemo(() => {
    return store.getProperties(orgId, allowedPropertyIds)
  }, [store, allowedPropertyIds])

  // If currently selected property is not accessible under current role, default to first accessible
  const activePropertyId = useMemo(() => {
    if (selectedPropertyId === 'all') return 'all'
    const exists = accessibleProperties.some((p) => p.id === selectedPropertyId)
    return exists ? selectedPropertyId : accessibleProperties[0]?.id || 'prop_green_tower'
  }, [selectedPropertyId, accessibleProperties])

  const hierarchy: PropertyHierarchy | null = useMemo(() => {
    if (activePropertyId === 'all') return null
    return store.getPropertyHierarchy(orgId, activePropertyId)
  }, [store, activePropertyId])

  const [activeBuildingId, setActiveBuildingId] = useState<string | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<RoomWithTenant | null>(null)

  // Current active building
  const currentBuilding = useMemo(() => {
    if (!hierarchy || !hierarchy.buildings.length) return null
    if (!activeBuildingId) return hierarchy.buildings[0]
    return hierarchy.buildings.find((b) => b.id === activeBuildingId) || hierarchy.buildings[0]
  }, [hierarchy, activeBuildingId])

  return (
    <div className="space-y-6">
      {/* Role Simulator Banner (Multi-Tenant Verification Tool) */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#295654]/20 bg-gradient-to-r from-[#123332] to-[#1c4745] p-4 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-[#a9e7d6] text-[#123332]">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#a9e7d6]">Multi-Tenant Context</span>
              <span className="rounded bg-[#a9e7d6]/20 px-2 py-0.5 text-[10px] font-bold text-[#a9e7d6]">API-First Scope</span>
            </div>
            <p className="text-sm font-medium text-white/90">
              Org: <strong className="text-white">Renvexa Prime Holdings</strong> · Simulating:{' '}
              <strong className="text-[#a9e7d6]">
                {currentRole === 'owner' ? 'Mohsin Alam (Owner)' : 'Tanvir Rahman (Property Manager)'}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#9ebbb7]">Active Role:</span>
          <div className="inline-flex rounded-xl bg-[#0d2625] p-1">
            <button
              type="button"
              onClick={() => onToggleRole('owner')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                currentRole === 'owner'
                  ? 'bg-[#a9e7d6] text-[#123332] shadow-sm'
                  : 'text-[#9ebbb7] hover:text-white'
              }`}
            >
              Owner (All Properties)
            </button>
            <button
              type="button"
              onClick={() => onToggleRole('property_manager')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                currentRole === 'property_manager'
                  ? 'bg-[#a9e7d6] text-[#123332] shadow-sm'
                  : 'text-[#9ebbb7] hover:text-white'
              }`}
            >
              Manager (Green Tower Only)
            </button>
          </div>
        </div>
      </div>

      {/* Property Selector Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#e2e8e5] pb-3">
        <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-[#527976]">View Scope:</span>
        {currentRole === 'owner' && (
          <button
            type="button"
            onClick={() => onSelectProperty('all')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors ${
              activePropertyId === 'all'
                ? 'bg-[#123332] text-white shadow-sm'
                : 'bg-white text-[#295654] border border-[#d6e0dd] hover:bg-[#ebf2f0]'
            }`}
          >
            <Building2 className="size-3.5" />
            Portfolio Overview (3 Properties)
          </button>
        )}

        {accessibleProperties.map((p) => {
          const isSelected = activePropertyId === p.id
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectProperty(p.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-[#123332] text-white shadow-sm'
                  : 'bg-white text-[#295654] border border-[#d6e0dd] hover:bg-[#ebf2f0]'
              }`}
            >
              <span className="font-semibold text-[#689490]">{p.code}</span>
              {p.name}
              <span className="text-[10px] text-[#86a8a4]">({p.totalBuildings} bld)</span>
            </button>
          )
        })}

        {currentRole === 'property_manager' && (
          <div className="ml-auto flex items-center gap-1.5 text-xs text-[#a06830] bg-[#fef7ee] border border-[#fbd38d]/50 px-3 py-1.5 rounded-xl">
            <Lock className="size-3.5" />
            <span>2 other properties restricted by Org Policy</span>
          </div>
        )}
      </div>

      {/* Main Hierarchy View */}
      {hierarchy ? (
        <div className="space-y-6">
          {/* Property Summary & Building Tabs */}
          <div className="rounded-2xl border border-[#dbe6e3] bg-white p-5 shadow-xs">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-[#123332]">{hierarchy.name}</h2>
                  <span className="rounded-full bg-[#e6f4f1] px-2.5 py-0.5 text-xs font-medium text-[#1c6057]">
                    {hierarchy.propertyType.replace('_', ' & ')}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#5f7d7a]">{hierarchy.address}, {hierarchy.city}</p>
              </div>

              {/* Quick Property Stats */}
              <div className="grid grid-cols-3 gap-3 border-t border-[#ebf2f0] pt-3 sm:border-t-0 sm:pt-0">
                <div className="rounded-xl bg-[#f5f8f7] px-3 py-2 text-center">
                  <span className="block text-[11px] text-[#6b8b87]">Total Units</span>
                  <span className="text-sm font-bold text-[#123332]">{hierarchy.stats.totalUnits}</span>
                </div>
                <div className="rounded-xl bg-[#eafaf6] px-3 py-2 text-center">
                  <span className="block text-[11px] text-[#257266]">Occupancy</span>
                  <span className="text-sm font-bold text-[#14574d]">{hierarchy.stats.occupancyRate}%</span>
                </div>
                <div className="rounded-xl bg-[#f0f6ff] px-3 py-2 text-center">
                  <span className="block text-[11px] text-[#2e62a8]">Monthly Rent</span>
                  <span className="text-sm font-bold text-[#1e4883]">{formatCurrency(hierarchy.stats.totalMonthlyRevenue)}</span>
                </div>
              </div>
            </div>

            {/* Building Switcher Pills */}
            <div className="mt-5 border-t border-[#edf3f1] pt-4">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#739692]">
                Buildings in this Property ({hierarchy.buildings.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {hierarchy.buildings.map((b) => {
                  const isCurrent = currentBuilding?.id === b.id
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setActiveBuildingId(b.id)}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                        isCurrent
                          ? 'bg-[#295654] text-white shadow-xs'
                          : 'bg-[#f4f7f6] text-[#335654] hover:bg-[#e6edeb]'
                      }`}
                    >
                      <Layers className="size-3.5" />
                      {b.name}
                      <span className="rounded bg-black/15 px-1.5 py-0.5 text-[10px]">
                        {b.floors.length} Floors
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Floors & Units Tree */}
          {currentBuilding && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="size-4 text-[#295654]" />
                  <h3 className="font-semibold text-[#123332]">
                    Floors & Units inside {currentBuilding.name}
                  </h3>
                </div>
                <span className="text-xs text-[#6e8e8b]">
                  Click any unit to inspect tenant, lease, and utility meter details
                </span>
              </div>

              <div className="space-y-3">
                {currentBuilding.floors.map((floor) => (
                  <div
                    key={floor.id}
                    className="overflow-hidden rounded-2xl border border-[#dce6e3] bg-white shadow-2xs"
                  >
                    <div className="flex items-center justify-between border-b border-[#edf3f1] bg-[#f9fbfa] px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="grid size-6 place-items-center rounded-lg bg-[#295654] text-[11px] font-bold text-white">
                          L{floor.floorNumber}
                        </span>
                        <span className="text-xs font-semibold text-[#183938]">{floor.label}</span>
                      </div>
                      <span className="text-[11px] text-[#71928f]">
                        {floor.rooms.length} Units ·{' '}
                        {floor.rooms.filter((r) => r.status === 'occupied').length} Occupied
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {floor.rooms.map((room) => {
                        const isVacant = room.status === 'vacant'

                        return (
                          <div
                            key={room.id}
                            onClick={() => setSelectedRoom(room)}
                            className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-[#e4ece9] bg-white p-3.5 transition-all hover:border-[#295654] hover:shadow-md"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-base font-bold text-[#123332]">Unit {room.roomNumber}</span>
                                <StatusBadge status={room.status} />
                              </div>

                              <p className="mt-1 text-[11px] capitalize text-[#6b8c88]">
                                {room.unitType} · {room.sizeSqft} sqft
                              </p>

                              {/* Tenant preview */}
                              {room.tenant ? (
                                <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-[#f4f8f7] px-2 py-1.5 text-xs text-[#1c4745]">
                                  <Users2 className="size-3 text-[#295654]" />
                                  <span className="truncate font-medium">{room.tenant.legalName}</span>
                                </div>
                              ) : (
                                <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-[#fafbfb] px-2 py-1.5 text-xs text-[#8da5a2]">
                                  <KeyRound className="size-3" />
                                  <span>{isVacant ? 'Ready for lease' : 'Offline'}</span>
                                </div>
                              )}
                            </div>

                            <div className="mt-3 flex items-center justify-between border-t border-[#edf3f1] pt-2 text-xs">
                              <span className="font-semibold text-[#183938]">{formatCurrency(room.baseRent)}/mo</span>
                              <span className="text-[11px] font-medium text-[#295654] opacity-0 transition-opacity group-hover:opacity-100">
                                Details &rarr;
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Portfolio Overview Mode (All 3 Properties) */
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#dbe6e3] bg-white p-5 shadow-xs">
            <h2 className="text-lg font-bold text-[#123332]">Portfolio Properties Overview</h2>
            <p className="text-xs text-[#5f7d7a]">
              Aggregated view across all 3 properties managed under Renvexa Prime Holdings
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              {accessibleProperties.map((prop) => {
                const propHierarchy = store.getPropertyHierarchy(orgId, prop.id)
                return (
                  <div
                    key={prop.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#e2eae7] bg-[#fbfdfc] p-4 transition-all hover:border-[#295654] hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-lg bg-[#295654] px-2 py-0.5 text-xs font-bold text-white">
                          {prop.code}
                        </span>
                        <span className="text-xs font-semibold text-[#295654]">
                          {propHierarchy?.stats.occupancyRate}% Occupied
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-bold text-[#123332]">{prop.name}</h3>
                      <p className="text-xs text-[#6e8d89]">{prop.address}, {prop.city}</p>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-white p-2 border border-[#ebf2f0]">
                          <span className="text-[10px] text-[#8aa6a3]">Buildings</span>
                          <p className="font-bold text-[#153433]">{prop.totalBuildings}</p>
                        </div>
                        <div className="rounded-lg bg-white p-2 border border-[#ebf2f0]">
                          <span className="text-[10px] text-[#8aa6a3]">Total Units</span>
                          <p className="font-bold text-[#153433]">{propHierarchy?.stats.totalUnits}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectProperty(prop.id)}
                      className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#123332] py-2 text-xs font-medium text-white transition-colors hover:bg-[#1f4a47]"
                    >
                      <Eye className="size-3.5" />
                      Explore Buildings & Rooms
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Room Detail Modal / Drawer (Mobile Responsive Bottom Sheet & Desktop Modal) */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-xs sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-[#ebf2f0] pb-3">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-xl bg-[#295654] font-bold text-white">
                  {selectedRoom.roomNumber}
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#123332]">Unit {selectedRoom.roomNumber}</h3>
                  <p className="text-xs text-[#71918e]">
                    {selectedRoom.unitType.toUpperCase()} · {selectedRoom.sizeSqft} sqft
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setSelectedRoom(null)}
                className="rounded-lg p-1 text-[#83a29f] hover:bg-[#f2f6f5] hover:text-[#123332]"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Tenant & Lease Section */}
              {selectedRoom.tenant && selectedRoom.activeLease ? (
                <div className="rounded-2xl border border-[#c4e2db] bg-[#f2faf7] p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#18554b]">
                      <UserCheck className="size-3.5" /> Active Lease & Tenant
                    </span>
                    <span className="rounded bg-[#a9e7d6] px-2 py-0.5 text-[10px] font-bold text-[#123332]">
                      Active Contract
                    </span>
                  </div>

                  <h4 className="mt-2 text-base font-bold text-[#123332]">
                    {selectedRoom.tenant.legalName}
                  </h4>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#3d6b64]">
                    <span>Phone: {selectedRoom.tenant.phone}</span>
                    {selectedRoom.tenant.nidOrPassport && <span>ID: {selectedRoom.tenant.nidOrPassport}</span>}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#d6ede6] pt-2 text-xs">
                    <div>
                      <span className="text-[10px] text-[#55817a]">Monthly Rent</span>
                      <p className="font-bold text-[#144d44]">{formatCurrency(selectedRoom.activeLease.rentAmount)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#55817a]">Security Deposit</span>
                      <p className="font-bold text-[#144d44]">{formatCurrency(selectedRoom.activeLease.securityDeposit)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#55817a]">Lease Period</span>
                      <p className="font-medium text-[#1c554c]">
                        {selectedRoom.activeLease.startDate} &rarr; {selectedRoom.activeLease.endDate || 'Ongoing'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#55817a]">Billing Day</span>
                      <p className="font-medium text-[#1c554c]">Day {selectedRoom.activeLease.billingCycleDay} of month</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#fae2b4] bg-[#fffbf2] p-4 text-center">
                  <KeyRound className="mx-auto size-6 text-[#a8741f]" />
                  <h4 className="mt-2 text-sm font-bold text-[#6d4608]">Unit is currently {selectedRoom.status}</h4>
                  <p className="mt-1 text-xs text-[#8c6523]">
                    Base asking rent: <strong>{formatCurrency(selectedRoom.baseRent)} / month</strong>
                  </p>
                </div>
              )}

              {/* Utility Meters */}
              <div className="rounded-2xl border border-[#e2eae7] bg-[#fbfdfc] p-4">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#5a7c78]">
                  <Gauge className="size-3.5" /> Sub-Meter Allocations
                </span>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-white p-2.5 border border-[#edf3f1]">
                    <span className="text-[10px] text-[#80a09c]">Electricity Meter</span>
                    <p className="font-mono font-bold text-[#153433]">
                      {selectedRoom.utilityMeters?.electricityMeterNo || 'N/A'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-2.5 border border-[#edf3f1]">
                    <span className="text-[10px] text-[#80a09c]">Water / Gas Meter</span>
                    <p className="font-mono font-bold text-[#153433]">
                      {selectedRoom.utilityMeters?.gasMeterNo || selectedRoom.utilityMeters?.waterMeterNo || 'Direct connection'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className="w-full rounded-xl bg-[#123332] py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1c4745]"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

