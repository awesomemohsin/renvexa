import { OrganizationRole, PropertyRole } from '../domain/hierarchy'
import { AuthContext, Permission } from './types'

export const ORGANIZATION_ROLE_PERMISSIONS: Record<OrganizationRole, readonly Permission[]> = {
  owner: [
    'organization:manage',
    'members:manage',
    'properties:create',
    'properties:read',
    'properties:update',
    'properties:delete',
    'buildings:manage',
    'floors:manage',
    'rooms:manage',
    'rooms:read',
    'tenants:manage',
    'tenants:read',
    'leases:manage',
    'leases:read',
    'finance:manage',
    'finance:read',
    'reports:read',
  ],
  admin: [
    'members:manage',
    'properties:create',
    'properties:read',
    'properties:update',
    'buildings:manage',
    'floors:manage',
    'rooms:manage',
    'rooms:read',
    'tenants:manage',
    'tenants:read',
    'leases:manage',
    'leases:read',
    'finance:manage',
    'finance:read',
    'reports:read',
  ],
  property_manager: [
    'properties:read',
    'buildings:manage',
    'floors:manage',
    'rooms:manage',
    'rooms:read',
    'tenants:manage',
    'tenants:read',
    'leases:manage',
    'leases:read',
    'finance:read',
    'reports:read',
  ],
  accountant: [
    'properties:read',
    'rooms:read',
    'tenants:read',
    'leases:read',
    'finance:manage',
    'finance:read',
    'reports:read',
  ],
  viewer: [
    'properties:read',
    'rooms:read',
    'tenants:read',
    'leases:read',
    'reports:read',
  ],
}

export const PROPERTY_ROLE_PERMISSIONS: Record<PropertyRole, readonly Permission[]> = {
  manager: [
    'properties:read',
    'buildings:manage',
    'floors:manage',
    'rooms:manage',
    'rooms:read',
    'tenants:manage',
    'tenants:read',
    'leases:manage',
    'leases:read',
    'finance:read',
    'reports:read',
  ],
  accountant: [
    'properties:read',
    'rooms:read',
    'tenants:read',
    'leases:read',
    'finance:manage',
    'finance:read',
    'reports:read',
  ],
  supervisor: [
    'properties:read',
    'rooms:read',
    'tenants:read',
    'reports:read',
  ],
  viewer: [
    'properties:read',
    'rooms:read',
    'reports:read',
  ],
}

/**
 * Check if the user has permission to access a specific property.
 * If user is Owner or Admin at the Organization level, they have access to all properties in that org.
 * Otherwise, the propertyId must be in their assignedPropertyIds list.
 */
export function canAccessProperty(authContext: AuthContext, propertyId: string): boolean {
  if (authContext.isGlobalOrgAdmin) {
    return true
  }
  return authContext.assignedPropertyIds.includes(propertyId)
}

/**
 * Check if the user can perform an action within an organization, optionally checking property scope.
 */
export function canPerformAction(
  authContext: AuthContext,
  permission: Permission,
  propertyId?: string,
): boolean {
  // If propertyId is provided, first verify property access
  if (propertyId && !canAccessProperty(authContext, propertyId)) {
    return false
  }

  // Check organization-level role grant
  const orgPermissions = ORGANIZATION_ROLE_PERMISSIONS[authContext.orgRole] ?? []
  return orgPermissions.includes(permission)
}

/**
 * Filter an array of properties according to the user's authorization scope.
 */
export function filterAccessibleProperties<T extends { id: string }>(
  authContext: AuthContext,
  properties: T[],
): T[] {
  if (authContext.isGlobalOrgAdmin) {
    return properties
  }
  return properties.filter((p) => authContext.assignedPropertyIds.includes(p.id))
}

