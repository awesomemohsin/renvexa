export type OrganizationRole = 'owner' | 'admin' | 'property_manager' | 'accountant' | 'viewer'

export type PropertyRole = 'manager' | 'accountant' | 'supervisor' | 'viewer'

export type MembershipStatus = 'active' | 'invited' | 'suspended'

export type SubscriptionPlan = 'starter' | 'growth' | 'enterprise'

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'canceled'

export type UnitStatus = 'vacant' | 'occupied' | 'reserved' | 'maintenance'

export type UnitType = 'residential' | 'commercial' | 'office' | 'storage' | 'parking'

export type LeaseStatus = 'active' | 'expired' | 'terminated' | 'draft'

export interface User {
  id: string
  email: string
  fullName: string
  phone?: string
  avatarUrl?: string
}

export interface OrganizationSubscription {
  plan: SubscriptionPlan
  status: SubscriptionStatus
  maxProperties: number
  maxUnits: number
  renewalDate: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  currency: string
  taxIdentifier?: string
  createdByUserId: string
  subscription: OrganizationSubscription
  createdAt: string
}

export interface OrganizationMembership {
  id: string
  organizationId: string
  userId: string
  role: OrganizationRole
  status: MembershipStatus
  joinedAt: string
}

export interface OrganizationInvitation {
  id: string
  organizationId: string
  email: string
  role: OrganizationRole
  assignedPropertyIds: string[]
  invitedByUserId: string
  status: 'pending' | 'accepted' | 'expired'
  createdAt: string
  expiresAt: string
}

export interface Property {
  id: string
  organizationId: string
  name: string
  code: string
  propertyType: 'commercial_residential' | 'residential' | 'commercial' | 'industrial'
  address: string
  city: string
  timezone: string
  totalBuildings: number
  imageUrl?: string
  createdAt: string
}

export interface PropertyMembership {
  id: string
  organizationId: string
  propertyId: string
  userId: string
  role: PropertyRole
  assignedAt: string
}

export interface Building {
  id: string
  organizationId: string
  propertyId: string
  name: string
  code: string
  totalFloors: number
  createdAt: string
}

export interface Floor {
  id: string
  organizationId: string
  propertyId: string
  buildingId: string
  floorNumber: number
  label: string
}

export interface UtilityMeters {
  electricityMeterNo?: string
  gasMeterNo?: string
  waterMeterNo?: string
}

export interface Room {
  id: string
  organizationId: string
  propertyId: string
  buildingId: string
  floorId: string
  roomNumber: string
  unitType: UnitType
  baseRent: number
  sizeSqft: number
  status: UnitStatus
  utilityMeters?: UtilityMeters
  createdAt: string
}

export interface TenantEmergencyContact {
  name: string
  relation: string
  phone: string
}

export interface Tenant {
  id: string
  organizationId: string
  legalName: string
  email?: string
  phone: string
  nidOrPassport?: string
  isCorporate: boolean
  companyRegistration?: string
  emergencyContact?: TenantEmergencyContact
  createdAt: string
}

export interface Lease {
  id: string
  organizationId: string
  propertyId: string
  roomId: string
  tenantId: string
  startDate: string
  endDate?: string
  rentAmount: number
  securityDeposit: number
  billingCycleDay: number
  status: LeaseStatus
  createdAt: string
}

// Composite views for nested API responses
export interface RoomWithTenant extends Room {
  activeLease?: Lease
  tenant?: Tenant
}

export interface FloorWithRooms extends Floor {
  rooms: RoomWithTenant[]
}

export interface BuildingWithFloors extends Building {
  floors: FloorWithRooms[]
}

export interface PropertyHierarchy extends Property {
  buildings: BuildingWithFloors[]
  stats: {
    totalUnits: number
    occupiedUnits: number
    vacantUnits: number
    maintenanceUnits: number
    occupancyRate: number
    totalMonthlyRevenue: number
  }
}

export interface OrganizationMemberDetail {
  membership: OrganizationMembership
  user: User
  propertyMemberships: PropertyMembership[]
}
