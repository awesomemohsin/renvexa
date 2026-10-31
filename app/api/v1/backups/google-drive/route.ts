import { NextRequest } from 'next/server'
import { apiError, apiSuccess, resolveAuthContext } from '@/lib/auth/context'
import { googleDriveBackupService } from '@/lib/integrations/google-drive'

export async function POST(request: NextRequest) {
  const { authContext, errorResponse } = resolveAuthContext(request)
  if (errorResponse) return errorResponse

  if (!authContext!.isGlobalOrgAdmin) {
    return apiError('FORBIDDEN_ACTION', 'Only Owners can generate full disaster recovery backups', 403)
  }

  try {
    const backup = await googleDriveBackupService.createBackupArchive(
      authContext!.organizationId,
      'daily_structured',
    )
    return apiSuccess(backup, authContext!.organizationId, 201)
  } catch (err: any) {
    return apiError('BACKUP_FAILED', err?.message || 'Failed to generate backup archive', 500)
  }
}

