import { NextRequest } from 'next/server'
import { apiSuccess, resolveAuthContext } from '@/lib/auth/context'
import { store } from '@/lib/repository/store'

export async function GET(request: NextRequest) {
  const { authContext, errorResponse } = resolveAuthContext(request)
  if (errorResponse) return errorResponse

  const user = store.getUser(authContext!.userId)!
  const userOrganizations = store.getUserOrganizations(authContext!.userId)
  const accessibleProperties = store.getProperties(
    authContext!.organizationId,
    authContext!.isGlobalOrgAdmin ? undefined : authContext!.assignedPropertyIds,
  )

  const activeOrgInfo = userOrganizations.find((o) => o.organization.id === authContext!.organizationId)

  return apiSuccess(
    {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
      currentOrganization: activeOrgInfo?.organization,
      membership: activeOrgInfo?.membership,
      isGlobalOrgAdmin: authContext!.isGlobalOrgAdmin,
      assignedPropertyIds: authContext!.assignedPropertyIds,
      accessibleProperties,
      userOrganizations: userOrganizations.map((o) => ({
        id: o.organization.id,
        name: o.organization.name,
        slug: o.organization.slug,
        role: o.membership.role,
      })),
    },
    authContext!.organizationId,
  )
}

