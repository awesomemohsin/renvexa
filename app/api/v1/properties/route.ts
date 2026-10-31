import { NextRequest } from 'next/server'
import { apiError, apiSuccess, resolveAuthContext } from '@/lib/auth/context'
import { canPerformAction } from '@/lib/auth/permissions'
import { store } from '@/lib/repository/store'
import { propertyValidationSchema } from '@/lib/validations/schemas'

export async function GET(request: NextRequest) {
  const { authContext, errorResponse } = resolveAuthContext(request)
  if (errorResponse) return errorResponse

  const allowedPropertyIds = authContext!.isGlobalOrgAdmin ? undefined : authContext!.assignedPropertyIds
  const properties = store.getProperties(authContext!.organizationId, allowedPropertyIds)
  const portfolioMetrics = store.getPortfolioMetrics(authContext!.organizationId, allowedPropertyIds)

  return apiSuccess(
    {
      properties,
      portfolioMetrics,
    },
    authContext!.organizationId,
  )
}

export async function POST(request: NextRequest) {
  const { authContext, errorResponse } = resolveAuthContext(request)
  if (errorResponse) return errorResponse

  if (!canPerformAction(authContext!, 'properties:create')) {
    return apiError('FORBIDDEN_ACTION', 'You do not have permission to create properties', 403)
  }

  try {
    const body = await request.json()
    const parsed = propertyValidationSchema.safeParse(body)

    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
      return apiError('VALIDATION_ERROR', errorMsg, 400)
    }

    const newProperty = store.createProperty(authContext!.organizationId, parsed.data)
    return apiSuccess(newProperty, authContext!.organizationId, 201)
  } catch {
    return apiError('BAD_REQUEST', 'Invalid JSON body', 400)
  }
}

