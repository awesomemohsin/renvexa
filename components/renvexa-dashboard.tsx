'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Bell,
  Building,
  Building2,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  FileText,
  KeyRound,
  LayoutDashboard,
  Lock,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Server,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react'
import { InfrastructureMonitor } from '@/components/admin/infrastructure-monitor'
import { PropertyHierarchyExplorer } from '@/components/hierarchy/property-hierarchy-explorer'
import { OrganizationSwitcher } from '@/components/saas/organization-switcher'
import { TeamMembersManager } from '@/components/saas/team-members-manager'
import { StatCard } from '@/components/shared/stat-card'
import { TenantDirectoryTable } from '@/components/tenants/tenant-directory-table'
import { OrganizationRole } from '@/lib/domain/hierarchy'
import { store } from '@/lib/repository/store'
import { formatCurrency } from '@/lib/utils/formatters'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Properties & Units', icon: Building2 },
  { label: 'Tenants & Leases', icon: Users },
  { label: 'Team & Staff', icon: Users },
  { label: 'Infrastructure & Quotas', icon: Server },
  { label: 'Billing & payments', icon: WalletCards },
  { label: 'Reports', icon: ClipboardList },
]

interface ActivityFeedItem {
  readonly name: string
  readonly detail: string
  readonly amount: string
  readonly time: string
  readonly tone: 'teal' | 'amber' | 'blue' | 'rose'
}

const DEFAULT_ACTIVITY: readonly ActivityFeedItem[] = [
  { name: 'Nusrat Jahan', detail: 'Rent payment · Green Tower / Unit 4B', amount: '+ ৳28,500', time: '12 min ago', tone: 'teal' },
  { name: 'Electricity sub-meter logged', detail: 'Green Tower · Unit 101 (TechCorp)', amount: '৳34,180', time: '1 hr ago', tone: 'amber' },
  { name: 'Md. Arif Hossain', detail: 'Rent payment · Lake View / Unit 1A', amount: '+ ৳26,000', time: '3 hrs ago', tone: 'blue' },
  { name: 'Maintenance ticket', detail: 'AC checkup · Unit 301', amount: 'Scheduled', time: 'Yesterday', tone: 'rose' },
] as const

export default function RenvexaDashboard() {
  const [activeOrgId, setActiveOrgId] = useState('org_prime_holdings')
  const [currentRole, setCurrentRole] = useState<'owner' | 'property_manager'>('owner')
  const [selectedProperty, setSelectedProperty] = useState('all')
  const [isPropertyMenuOpen, setIsPropertyMenuOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('Overview')
  const [showAllActivity, setShowAllActivity] = useState(false)

  // Current active user profile
  const currentUserId = currentRole === 'owner' ? 'user_owner_mohsin' : 'user_pm_tanvir'
  const userOrganizations = useMemo(() => {
    return store.getUserOrganizations(currentUserId)
  }, [currentUserId])

  // Active Organization Details
  const activeOrg = useMemo(() => {
    return store.getOrganization(activeOrgId) || store.getOrganization('org_prime_holdings')!
  }, [activeOrgId])

  // Active Membership Role
  const activeMembership = useMemo(() => {
    return store.getMembership(activeOrgId, currentUserId)
  }, [activeOrgId, currentUserId])

  // Multi-tenant permission scope
  const allowedPropertyIds = useMemo(() => {
    return currentRole === 'property_manager' ? ['prop_green_tower'] : undefined
  }, [currentRole])

  // Accessible properties under active organization and role
  const accessibleProperties = useMemo(() => {
    return store.getProperties(activeOrgId, allowedPropertyIds)
  }, [activeOrgId, allowedPropertyIds])

  // Organization Team Members Revision (for triggering re-fetch without holding duplicate state)
  const [membersRevision, setMembersRevision] = useState(0)

  // Current members for active organization
  const currentMembers = useMemo(() => {
    return store.getOrganizationMembers(activeOrgId)
  }, [activeOrgId, membersRevision])

  // SaaS Resource Usage & Quota
  const orgUsage = useMemo(() => {
    return store.getOrganizationUsage(activeOrgId)
  }, [activeOrgId, accessibleProperties])

  // Property selection fallback if current selection is not in active org
  const effectivePropertyId = useMemo(() => {
    if (selectedProperty === 'all') {
      return currentRole === 'owner' ? 'all' : accessibleProperties[0]?.id || ''
    }
    const exists = accessibleProperties.some((p) => p.id === selectedProperty)
    return exists ? selectedProperty : (accessibleProperties[0]?.id ?? 'all')
  }, [selectedProperty, currentRole, accessibleProperties])

  // Dynamic portfolio metrics for active organization
  const portfolioMetrics = useMemo(() => {
    return store.getPortfolioMetrics(activeOrgId, allowedPropertyIds)
  }, [activeOrgId, allowedPropertyIds])

  const singlePropertyHierarchy = useMemo(() => {
    if (effectivePropertyId === 'all' || !effectivePropertyId) return null
    return store.getPropertyHierarchy(activeOrgId, effectivePropertyId)
  }, [activeOrgId, effectivePropertyId])

  const stats = useMemo(() => {
    if (effectivePropertyId === 'all') {
      return [
        {
          label: 'Total monthly revenue',
          value: `৳ ${formatCurrency(portfolioMetrics.totalMonthlyRevenue)}`,
          change: '+14.2%',
          hint: 'across portfolio',
          icon: CircleDollarSign,
          accent: 'teal',
        },
        {
          label: 'Collected this month',
          value: `৳ ${formatCurrency(portfolioMetrics.collectedThisMonth)}`,
          change: '82.0%',
          hint: 'collection rate',
          icon: WalletCards,
          accent: 'blue',
        },
        {
          label: 'Outstanding dues',
          value: `৳ ${formatCurrency(portfolioMetrics.outstandingDues)}`,
          change: `${portfolioMetrics.vacantUnits} vacant`,
          hint: 'units available',
          icon: FileText,
          accent: 'amber',
        },
        {
          label: 'Occupancy rate',
          value: `${portfolioMetrics.occupancyRate}%`,
          change: `${portfolioMetrics.occupiedUnits}/${portfolioMetrics.totalUnits} units`,
          hint: 'occupied',
          icon: Users,
          accent: 'violet',
        },
      ]
    }

    const propStats = singlePropertyHierarchy?.stats
    const rev = propStats?.totalMonthlyRevenue ?? 0
    return [
      {
        label: 'Monthly revenue',
        value: `৳ ${formatCurrency(rev)}`,
        change: '+9.4%',
        hint: 'this property',
        icon: CircleDollarSign,
        accent: 'teal',
      },
      {
        label: 'Collected this month',
        value: `৳ ${formatCurrency(Math.round(rev * 0.85))}`,
        change: '85.0%',
        hint: 'collection rate',
        icon: WalletCards,
        accent: 'blue',
      },
      {
        label: 'Outstanding dues',
        value: `৳ ${formatCurrency(Math.round(rev * 0.15))}`,
        change: `${propStats?.vacantUnits ?? 0} vacant`,
        hint: 'units ready',
        icon: FileText,
        accent: 'amber',
      },
      {
        label: 'Occupancy rate',
        value: `${propStats?.occupancyRate ?? 0}%`,
        change: `${propStats?.occupiedUnits ?? 0}/${propStats?.totalUnits ?? 0} units`,
        hint: 'occupied',
        icon: Users,
        accent: 'violet',
      },
    ]
  }, [effectivePropertyId, portfolioMetrics, singlePropertyHierarchy])

  const displayActivity = showAllActivity ? DEFAULT_ACTIVITY : DEFAULT_ACTIVITY.slice(0, 3)

  const handleCreateOrganization = useCallback((name: string, plan: 'starter' | 'growth' | 'enterprise') => {
    const newOrg = store.createOrganization(currentUserId, name, plan)
    setActiveOrgId(newOrg.id)
    setSelectedProperty('all')
  }, [currentUserId])

  const handleInviteMember = useCallback((email: string, role: OrganizationRole, propertyIds: string[]) => {
    store.inviteMember(activeOrgId, currentUserId, email, role, propertyIds)
    setMembersRevision((v) => v + 1)
  }, [activeOrgId, currentUserId])

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-[#152b2a]">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col bg-[#123332] px-5 py-6 text-white transition-transform duration-200 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-xl bg-[#a9e7d6] text-[#123332]">
                <Building2 className="size-5" strokeWidth={2.5} />
              </div>
              <span className="text-[20px] font-semibold tracking-[-0.04em]">RENVEXA</span>
            </div>
            <p className="mt-2 pl-11 text-[10px] uppercase tracking-[0.2em] text-[#9ebbb7]">
              Multi-Property SaaS
            </p>
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-lg p-1 text-[#9ebbb7] lg:hidden"
          >
            <X />
          </button>
        </div>

        {/* Organization Switcher Dropdown */}
        <div className="mb-6">
          <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#739692]">
            Active Organization
          </p>
          <OrganizationSwitcher
            organizations={userOrganizations}
            activeOrgId={activeOrgId}
            onSelectOrg={(orgId) => {
              setActiveOrgId(orgId)
              setSelectedProperty('all')
            }}
            onCreateOrg={handleCreateOrganization}
          />
        </div>

        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#739692]">
          Workspace
        </p>
        <nav className="flex flex-col gap-1.5" aria-label="Main navigation">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setActiveNav(label)
                setIsSidebarOpen(false)
              }}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-medium transition-colors ${
                activeNav === label
                  ? 'bg-[#295654] text-white shadow-[inset_3px_0_0_#a9e7d6]'
                  : 'text-[#a7c1bd] hover:bg-[#1c4745] hover:text-white'
              }`}
            >
              <Icon className="size-[17px]" />
              {label}
            </button>
          ))}
        </nav>

        {/* SaaS Subscription Quota Card */}
        <div className="mt-auto rounded-2xl border border-[#35605d] bg-[#1b4543] p-3 text-xs">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#d8ece8]">
            <span className="capitalize">{orgUsage.plan} Subscription</span>
            <span className="rounded bg-[#a9e7d6]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#a9e7d6]">
              {orgUsage.status.toUpperCase()}
            </span>
          </div>

          <div className="mt-2.5 space-y-1.5 text-[10px] text-[#9ebbb7]">
            <div className="flex justify-between">
              <span>Properties Quota:</span>
              <strong className="text-white">
                {orgUsage.propertiesCount} / {orgUsage.maxProperties}
              </strong>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#315e5b]">
              <div
                className="h-full rounded-full bg-[#a9e7d6]"
                style={{
                  width: `${Math.min(100, (orgUsage.propertiesCount / orgUsage.maxProperties) * 100)}%`,
                }}
              />
            </div>

            <div className="flex justify-between pt-1">
              <span>Units Quota:</span>
              <strong className="text-white">
                {orgUsage.unitsCount} / {orgUsage.maxUnits}
              </strong>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#315e5b]">
              <div
                className="h-full rounded-full bg-[#a9e7d6]"
                style={{
                  width: `${Math.min(100, (orgUsage.unitsCount / orgUsage.maxUnits) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-[#0b2423]/40 lg:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="lg:pl-[260px]">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#e3eae7] bg-[#f8faf9]/90 px-5 backdrop-blur-md sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-xl border border-[#dce7e3] bg-white p-2.5 lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div className="relative hidden w-[240px] sm:block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8da5a1]" />
              <input
                aria-label="Search"
                placeholder="Search properties, rooms, tenants..."
                className="h-10 w-full rounded-xl border border-[#e3eae7] bg-white pl-9 pr-3 text-xs outline-none placeholder:text-[#9aafab] focus:border-[#7acbb9]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-xl p-2.5 text-[#607a76] hover:bg-white"
            >
              <Bell className="size-[19px]" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#ea876c]" />
            </button>
            <div className="h-7 w-px bg-[#dce7e3]" />

            {/* User Account / Role Indicator */}
            <div className="flex items-center gap-2.5 rounded-xl border border-[#dce7e3] bg-white p-1.5 pr-3">
              <div className="grid size-8 place-items-center rounded-full bg-[#dcefe9] text-xs font-semibold text-[#23615a]">
                {currentRole === 'owner' ? 'MA' : 'TR'}
              </div>
              <div className="text-left">
                <span className="block text-xs font-semibold">
                  {currentRole === 'owner' ? 'Mohsin Alam' : 'Tanvir Rahman'}
                </span>
                <span className="block text-[10px] text-[#8ba09d]">
                  {activeMembership?.role ? `${activeMembership.role.toUpperCase()} · ${activeOrg.name}` : activeOrg.name}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          {/* Header Title & Property Selector */}
          <div className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="rounded-full bg-[#e6f4f1] px-2.5 py-0.5 text-xs font-bold text-[#145a50]">
                  {activeOrg.name}
                </span>
                <span className="text-xs text-[#71918e]">· {activeOrg.subscription.plan.toUpperCase()} SaaS Tier</span>
              </div>
              <h1 className="text-[28px] font-semibold tracking-[-0.04em] sm:text-[32px]">
                {activeNav === 'Infrastructure & Quotas'
                  ? 'Infrastructure & Resource Quotas'
                  : effectivePropertyId === 'all'
                  ? 'Portfolio Overview'
                  : singlePropertyHierarchy?.name ?? 'Property Overview'}
                <span className="text-[#6ebfac]">.</span>
              </h1>
              <p className="mt-1 text-sm text-[#75908b]">
                Multi-Tenant Hierarchy: User &rarr; Organization ({activeOrg.name}) &rarr; Properties ({accessibleProperties.length}) &rarr; Buildings &rarr; Floors &rarr; Rooms &rarr; Tenants.
              </p>
            </div>

            {activeNav !== 'Infrastructure & Quotas' && (
              <div className="relative flex flex-wrap items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsPropertyMenuOpen(!isPropertyMenuOpen)}
                    className="flex min-w-[220px] items-center justify-between gap-3 rounded-xl border border-[#dfe9e5] bg-white px-3.5 py-2.5 text-left shadow-xs hover:border-[#295654]"
                  >
                    <div>
                      <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-[#92a6a2]">
                        Current Scope
                      </span>
                      <span className="block text-xs font-semibold text-[#294542]">
                        {effectivePropertyId === 'all'
                          ? `Portfolio (${accessibleProperties.length} Properties)`
                          : accessibleProperties.find((p) => p.id === effectivePropertyId)?.name ?? 'Selected Property'}
                      </span>
                    </div>
                    <ChevronDown className="size-4 text-[#78938e]" />
                  </button>

                  {isPropertyMenuOpen && (
                    <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[270px] rounded-2xl border border-[#dfe9e5] bg-white p-2 shadow-xl">
                      {currentRole === 'owner' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProperty('all')
                            setIsPropertyMenuOpen(false)
                          }}
                          className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left ${
                            effectivePropertyId === 'all' ? 'bg-[#eef8f5]' : 'hover:bg-[#f4f8f6]'
                          }`}
                        >
                          <div>
                            <span className="block text-xs font-semibold">
                              Portfolio ({accessibleProperties.length} Properties)
                            </span>
                            <span className="block text-[10px] text-[#8ba09d]">Consolidated overview</span>
                          </div>
                          {effectivePropertyId === 'all' && <span className="size-2 rounded-full bg-[#55b29f]" />}
                        </button>
                      )}

                      {accessibleProperties.map((property) => (
                        <button
                          key={property.id}
                          type="button"
                          onClick={() => {
                            setSelectedProperty(property.id)
                            setIsPropertyMenuOpen(false)
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left ${
                            effectivePropertyId === property.id ? 'bg-[#eef8f5]' : 'hover:bg-[#f4f8f6]'
                          }`}
                        >
                          <div>
                            <span className="block text-xs font-semibold">{property.name}</span>
                            <span className="block text-[10px] text-[#8ba09d]">{property.address}</span>
                          </div>
                          {effectivePropertyId === property.id && <span className="size-2 rounded-full bg-[#55b29f]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Key Metrics Cards (when in standard views) */}
          {activeNav !== 'Infrastructure & Quotas' && (
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key metrics">
              {stats.map(({ label, value, change, hint, icon, accent }) => (
                <StatCard
                  key={label}
                  label={label}
                  value={value}
                  change={change}
                  hint={hint}
                  icon={icon}
                  accent={accent as any}
                />
              ))}
            </section>
          )}

          {/* Dynamic Navigation Content */}
          {activeNav === 'Infrastructure & Quotas' ? (
            <InfrastructureMonitor organizationId={activeOrgId} />
          ) : activeNav === 'Team & Staff' ? (
            <div className="mt-8">
              <TeamMembersManager
                members={currentMembers}
                properties={accessibleProperties}
                organizationName={activeOrg.name}
                currentRole={activeMembership?.role || 'owner'}
                onInviteMember={handleInviteMember}
              />
            </div>
          ) : activeNav === 'Tenants & Leases' ? (
            <div className="mt-8">
              <TenantDirectoryTable
                tenants={store.getTenants(
                  activeOrgId,
                  effectivePropertyId === 'all' ? undefined : effectivePropertyId,
                )}
              />
            </div>
          ) : activeNav === 'Properties & Units' ? (
            <div className="mt-8">
              <PropertyHierarchyExplorer
                store={store}
                selectedPropertyId={effectivePropertyId}
                onSelectProperty={(id) => setSelectedProperty(id)}
                currentRole={currentRole}
                onToggleRole={(role) => setCurrentRole(role)}
              />
            </div>
          ) : (
            /* Overview Tab: Hierarchy Explorer + Activity Stream */
            <div className="mt-8 space-y-8">
              <PropertyHierarchyExplorer
                store={store}
                selectedPropertyId={effectivePropertyId}
                onSelectProperty={(id) => setSelectedProperty(id)}
                currentRole={currentRole}
                onToggleRole={(role) => setCurrentRole(role)}
              />

              {/* Recent Activity */}
              <section className="rounded-2xl border border-[#e2ebe8] bg-white p-5 shadow-[0_2px_12px_rgba(28,67,63,0.03)] sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold tracking-[-0.02em]">Recent Activity</h2>
                    <p className="mt-1 text-xs text-[#8ba09d]">
                      Events recorded across authorized properties in {activeOrg.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAllActivity(!showAllActivity)}
                    className="text-xs font-semibold text-[#318e7e] hover:underline"
                  >
                    {showAllActivity ? 'Show less' : 'View all activity'}{' '}
                    <ArrowUpRight className="ml-1 inline size-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-[#eef2f0]">
                  {displayActivity.map((item) => (
                    <div key={item.name + item.time} className="flex items-center gap-3 py-3.5 first:pt-1">
                      <div
                        className={`grid size-9 shrink-0 place-items-center rounded-full ${
                          item.tone === 'teal'
                            ? 'bg-[#e4f5f0] text-[#318e7e]'
                            : item.tone === 'amber'
                            ? 'bg-[#fff2dc] text-[#bb8143]'
                            : item.tone === 'blue'
                            ? 'bg-[#e8f0f8] text-[#5a89ad]'
                            : 'bg-[#fae9e5] text-[#bd7868]'
                        }`}
                      >
                        {item.tone === 'teal' ? (
                          <WalletCards className="size-4" />
                        ) : item.tone === 'amber' ? (
                          <Zap className="size-4" />
                        ) : item.tone === 'blue' ? (
                          <CircleDollarSign className="size-4" />
                        ) : (
                          <Building2 className="size-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-[#34534f]">{item.name}</p>
                        <p className="mt-1 truncate text-[11px] text-[#91a6a2]">{item.detail}</p>
                      </div>
                      <p
                        className={`hidden text-xs font-semibold sm:block ${
                          item.tone === 'rose' || item.tone === 'amber'
                            ? 'text-[#b4774d]'
                            : 'text-[#378f7e]'
                        }`}
                      >
                        {item.amount}
                      </p>
                      <p className="w-[70px] text-right text-[10px] text-[#a0b1ae]">{item.time}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
