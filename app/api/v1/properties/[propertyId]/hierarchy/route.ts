import { NextRequest } from 'next/server'
import { apiError, apiSuccess, resolveAuthContext } from '@/lib/auth/context'
import { canAccessProperty } from '@/lib/auth/permissions'
import { store } from '@/lib/repository/store'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> },
) {
  const { propertyId } = await params
  const { authContext, errorResponse } = resolveAuthContext(request)
  if (errorResponse) return errorResponse

  // Multi-tenant check 1: Does user have access to this property within their org?
  if (!canAccessProperty(authContext!, propertyId)) {
    return apiError(
      'FORBIDDEN_PROPERTY_ACCESS',
      `You do not have permission to access property '${propertyId}' in this organization.`,
      403,
    )
  }

  // Multi-tenant check 2: Retrieve hierarchy strictly scoped to this organization
  const hierarchy = store.getPropertyHierarchy(authContext!.organizationId, propertyId)
  if (!hierarchy) {
    return apiError(
      'PROPERTY_NOT_FOUND',
      `Property '${propertyId}' not found in organization '${authContext!.organizationId}'.`,
      404,
    )
  }

  return apiSuccess(hierarchy, authContext!.organizationId)
}

