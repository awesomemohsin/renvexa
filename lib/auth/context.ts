import { NextRequest, NextResponse } from 'next/server'
import { apiError, apiSuccess, type StandardApiResponse } from '../api/response'
import { store } from '../repository/store'
import { AuthContext } from './types'

export type ApiResponse<T = any> = StandardApiResponse<T>
export { apiError, apiSuccess }

/**
 * Resolve authenticated user & active organization context from NextRequest
 */
export function resolveAuthContext(request: NextRequest): {
  authContext: AuthContext | null
  errorResponse?: NextResponse
} {
  // Support custom simulation headers or default to Mohsin (Owner)
  const userId = request.headers.get('x-user-id') || 'user_owner_mohsin'
  const organizationId = request.headers.get('x-organization-id') || 'org_prime_holdings'

  const user = store.getUser(userId)
  if (!user) {
    return {
      authContext: null,
      errorResponse: apiError('USER_NOT_FOUND', `User ${userId} does not exist`, 401),
    }
  }

  const membership = store.getMembership(organizationId, userId)
  if (!membership) {
    return {
      authContext: null,
      errorResponse: apiError(
        'ORGANIZATION_FORBIDDEN',
        `User ${user.fullName} is not a member of organization ${organizationId}`,
        403,
      ),
    }
  }

  const isGlobalOrgAdmin = membership.role === 'owner' || membership.role === 'admin'
  let assignedPropertyIds: string[] = []

  if (!isGlobalOrgAdmin) {
    const propMemberships = store.getUserPropertyMemberships(organizationId, userId)
    assignedPropertyIds = propMemberships.map((pm) => pm.propertyId)
  }

  return {
    authContext: {
      userId,
      organizationId,
      orgRole: membership.role,
      assignedPropertyIds,
      isGlobalOrgAdmin,
    },
  }
}
