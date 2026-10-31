import { OrganizationRole, PropertyRole } from '../domain/hierarchy'

export type Permission =
  | 'organization:manage'
  | 'members:manage'
  | 'properties:create'
  | 'properties:read'
  | 'properties:update'
  | 'properties:delete'
  | 'buildings:manage'
  | 'floors:manage'
  | 'rooms:manage'
  | 'rooms:read'
  | 'tenants:manage'
  | 'tenants:read'
  | 'leases:manage'
  | 'leases:read'
  | 'finance:manage'
  | 'finance:read'
  | 'reports:read'

export interface AuthContext {
  userId: string
  organizationId: string
  orgRole: OrganizationRole
  assignedPropertyIds: string[] // Empty if user has global org-level access (owner / admin)
  isGlobalOrgAdmin: boolean
}

