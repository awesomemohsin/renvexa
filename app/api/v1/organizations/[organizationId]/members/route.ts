import { NextRequest } from 'next/server'
import { apiError, apiSuccess, resolveAuthContext } from '@/lib/auth/context'
import { canPerformAction } from '@/lib/auth/permissions'
import { store } from '@/lib/repository/store'
import { inviteMemberValidationSchema } from '@/lib/validations/schemas'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  const { organizationId } = await params
  const { authContext, errorResponse } = resolveAuthContext(request)
  if (errorResponse) return errorResponse

  // Multi-tenant check: User must be a member of this organization
  if (authContext!.organizationId !== organizationId) {
    return apiError('FORBIDDEN_ORG_ACCESS', 'You cannot view members of another organization', 403)
  }

  const members = store.getOrganizationMembers(organizationId)
  return apiSuccess(members, organizationId)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  const { organizationId } = await params
  const { authContext, errorResponse } = resolveAuthContext(request)
  if (errorResponse) return errorResponse

  if (authContext!.organizationId !== organizationId) {
    return apiError('FORBIDDEN_ORG_ACCESS', 'You cannot invite members to another organization', 403)
  }

  // Authorization check: User must have members:manage permission (Owner or Admin)
  if (!canPerformAction(authContext!, 'members:manage')) {
    return apiError(
      'FORBIDDEN_ACTION',
      'Only Organization Owners and Admins can invite team members',
      403,
    )
  }

  try {
    const body = await request.json()
    const parsed = inviteMemberValidationSchema.safeParse(body)

    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
      return apiError('VALIDATION_ERROR', errorMsg, 400)
    }

    const invitation = store.inviteMember(
      organizationId,
      authContext!.userId,
      parsed.data.email,
      parsed.data.role,
      parsed.data.assignedPropertyIds,
    )

    return apiSuccess(invitation, organizationId, 201)
  } catch {
    return apiError('BAD_REQUEST', 'Invalid JSON body', 400)
  }
}

