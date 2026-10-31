import { NextRequest } from 'next/server'
import { apiError, apiSuccess, resolveAuthContext } from '@/lib/auth/context'
import { canAccessProperty, canPerformAction } from '@/lib/auth/permissions'
import { store } from '@/lib/repository/store'
import { tenantValidationSchema } from '@/lib/validations/schemas'

export async function GET(request: NextRequest) {
  const { authContext, errorResponse } = resolveAuthContext(request)
  if (errorResponse) return errorResponse

  const { searchParams } = new URL(request.url)
  const propertyId = searchParams.get('propertyId') || undefined

  if (propertyId && !canAccessProperty(authContext!, propertyId)) {
    return apiError(
      'FORBIDDEN_PROPERTY_ACCESS',
      `You do not have permission to access tenants for property '${propertyId}'.`,
      403,
    )
  }

  const tenants = store.getTenants(authContext!.organizationId, propertyId)

  // If user is restricted to certain properties and no specific propertyId was queried, filter out tenants
  let filteredTenants = tenants
  if (!authContext!.isGlobalOrgAdmin && !propertyId) {
    filteredTenants = tenants.filter((t) =>
      t.currentLeases.some((l) => authContext!.assignedPropertyIds.includes(l.propertyId)),
    )
  }

  return apiSuccess(filteredTenants, authContext!.organizationId)
}

export async function POST(request: NextRequest) {
  const { authContext, errorResponse } = resolveAuthContext(request)
  if (errorResponse) return errorResponse

  if (!canPerformAction(authContext!, 'tenants:manage')) {
    return apiError('FORBIDDEN_ACTION', 'You do not have permission to create or manage tenants', 403)
  }

  try {
    const body = await request.json()
    const parsed = tenantValidationSchema.safeParse(body)

    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
      return apiError('VALIDATION_ERROR', errorMsg, 400)
    }

    const newTenant = store.createTenant(authContext!.organizationId, parsed.data)
    return apiSuccess(newTenant, authContext!.organizationId, 201)
  } catch {
    return apiError('BAD_REQUEST', 'Invalid JSON body', 400)
  }
}

