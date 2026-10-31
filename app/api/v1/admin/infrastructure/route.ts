import { NextRequest } from 'next/server'
import { apiError, apiSuccess, resolveAuthContext } from '@/lib/auth/context'
import { monitoringService } from '@/lib/monitoring/service'

export async function GET(request: NextRequest) {
  const { authContext, errorResponse } = resolveAuthContext(request)
  if (errorResponse) return errorResponse

  // Only Owner and Admin can inspect infrastructure quotas
  if (!authContext!.isGlobalOrgAdmin) {
    return apiError(
      'FORBIDDEN_INFRA_ACCESS',
      'Infrastructure quota and monitoring is restricted to Organization Owners and Admins',
      403,
    )
  }

  const report = monitoringService.getReport(authContext!.organizationId)
  return apiSuccess(report, authContext!.organizationId)
}

