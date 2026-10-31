'use client'

import React, { useMemo } from 'react'
import { Phone, Users } from 'lucide-react'
import { ColumnDef, DataTable } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Lease, Tenant } from '@/lib/domain/hierarchy'
import { formatCurrency, formatPhoneNumber } from '@/lib/utils/formatters'

export interface TenantWithLeaseRow extends Tenant {
  currentLeases: Lease[]
  primaryPropertyCode?: string
  roomNumber?: string
  monthlyRent?: number
  leaseStatus?: string
}

interface TenantDirectoryTableProps {
  tenants: (Tenant & { currentLeases: Lease[] })[]
  onTenantClick?: (tenant: TenantWithLeaseRow) => void
}

export function TenantDirectoryTable({ tenants, onTenantClick }: TenantDirectoryTableProps) {
  const tableData: TenantWithLeaseRow[] = useMemo(() => {
    return tenants.map((t) => {
      const activeLease = t.currentLeases.find((l) => l.status === 'active') || t.currentLeases[0]
      return {
        ...t,
        primaryPropertyCode: activeLease?.propertyId.replace('prop_', '').toUpperCase() || 'N/A',
        roomNumber: activeLease?.roomId.replace('room_', '').toUpperCase() || 'Unassigned',
        monthlyRent: activeLease?.rentAmount || 0,
        leaseStatus: activeLease?.status || 'draft',
      }
    })
  }, [tenants])

  const columns: ColumnDef<TenantWithLeaseRow>[] = useMemo(
    () => [
      {
        id: 'legalName',
        header: 'Tenant Name',
        accessorKey: 'legalName',
        sortable: true,
        cell: (row) => (
          <div>
            <span className="font-bold text-[#123332]">{row.legalName}</span>
            <div className="flex items-center gap-1.5 text-[11px] text-[#71928f]">
              <Phone className="size-3" />
              <span>{formatPhoneNumber(row.phone)}</span>
            </div>
          </div>
        ),
      },
      {
        id: 'property',
        header: 'Property / Unit',
        cell: (row) => (
          <span className="font-mono text-xs font-semibold text-[#183938]">
            {row.primaryPropertyCode} · {row.roomNumber}
          </span>
        ),
      },
      {
        id: 'monthlyRent',
        header: 'Rent Commitment',
        accessorKey: 'monthlyRent',
        sortable: true,
        align: 'right',
        cell: (row) => (
          <span className="font-semibold text-[#18554b]">
            {formatCurrency(row.monthlyRent || 0)} / mo
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Contract Status',
        accessorKey: 'leaseStatus',
        cell: (row) => <StatusBadge status={row.leaseStatus || 'draft'} />,
      },
      {
        id: 'emergencyContact',
        header: 'Emergency Contact',
        cell: (row) => (
          row.emergencyContact ? (
            <div className="text-[11px] text-[#557874]">
              <p className="font-medium text-[#183938]">{row.emergencyContact.name}</p>
              <p className="text-[10px] text-[#86a6a2]">{row.emergencyContact.relation}</p>
            </div>
          ) : (
            <span className="text-[11px] text-[#a4b6b2]">Not provided</span>
          )
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#123332]">Tenant Directory</h2>
          <p className="mt-1 text-xs text-[#5f7d7a]">
            Unified multi-property tenant registry built with reusable DataTable
          </p>
        </div>
      </div>

      <DataTable
        data={tableData}
        columns={columns}
        searchPlaceholder="Search by tenant name, phone, or unit..."
        searchKey="legalName"
        pageSize={5}
        onRowClick={onTenantClick}
        emptyTitle="No tenants registered"
        emptyDescription="There are no tenants matching your search or filters."
      />
    </div>
  )
}

