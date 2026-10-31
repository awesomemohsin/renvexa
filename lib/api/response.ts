import { NextRequest, NextResponse } from 'next/server'

export interface StandardApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    timestamp: string
    organizationId?: string
    version: string
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-organization-id, x-user-id',
}

export function apiSuccess<T>(
  data: T,
  meta?: {
    organizationId?: string
    pagination?: { page: number; limit: number; total: number; totalPages: number }
  },
  status = 200,
): NextResponse<StandardApiResponse<T>> {
  const payload: StandardApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      organizationId: meta?.organizationId,
      pagination: meta?.pagination,
      version: 'v1',
    },
  }

  return NextResponse.json(payload, {
    status,
    headers: CORS_HEADERS,
  })
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  details?: any,
): NextResponse<StandardApiResponse> {
  const payload: StandardApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    },
  }

  return NextResponse.json(payload, {
    status,
    headers: CORS_HEADERS,
  })
}

export function parsePaginationParams(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
  const search = searchParams.get('search') || undefined
  const sortBy = searchParams.get('sortBy') || undefined
  const sortDirection = (searchParams.get('sortDirection') || 'asc') as 'asc' | 'desc'

  return { page, limit, search, sortBy, sortDirection }
}

