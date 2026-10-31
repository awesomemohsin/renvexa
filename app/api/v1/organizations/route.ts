import { NextRequest } from 'next/server'
import { apiError, apiSuccess, resolveAuthContext } from '@/lib/auth/context'
import { store } from '@/lib/repository/store'
import { createOrganizationValidationSchema } from '@/lib/validations/schemas'

export async function GET(request: NextRequest) {
  const { authContext, errorResponse } = resolveAuthContext(request)
  if (errorResponse) return errorResponse

  const userOrgs = store.getUserOrganizations(authContext!.userId)
  return apiSuccess(
    userOrgs.map((uo) => ({
      organization: uo.organization,
      membership: uo.membership,
    })),
    authContext!.organizationId,
  )
}

export async function POST(request: NextRequest) {
  const { authContext, errorResponse } = resolveAuthContext(request)
  if (errorResponse) return errorResponse

  try {
    const body = await request.json()
    const parsed = createOrganizationValidationSchema.safeParse(body)

    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
      return apiError('VALIDATION_ERROR', errorMsg, 400)
    }

    const newOrg = store.createOrganization(authContext!.userId, parsed.data.name, parsed.data.plan)
    return apiSuccess(newOrg, newOrg.id, 201)
  } catch {
    return apiError('BAD_REQUEST', 'Failed to parse JSON body', 400)
  }
}

