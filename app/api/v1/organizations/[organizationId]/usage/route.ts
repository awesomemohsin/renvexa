import { NextRequest } from 'next/server'
import { apiError, apiSuccess, resolveAuthContext } from '@/lib/auth/context'
import { store } from '@/lib/repository/store'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  const { organizationId } = await params
  const { authContext, errorResponse } = resolveAuthContext(request)
  if (errorResponse) return errorResponse

  if (authContext!.organizationId !== organizationId) {
    return apiError('FORBIDDEN_ORG_ACCESS', 'You cannot view usage of another organization', 403)
  }

  const usage = store.getOrganizationUsage(organizationId)
  return apiSuccess(usage, organizationId)
}

