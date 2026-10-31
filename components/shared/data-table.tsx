'use client'

import React, { useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
} from 'lucide-react'
import { EmptyState } from './empty-state'

export interface ColumnDef<T> {
  id: string
  header: React.ReactNode
  accessorKey?: keyof T
  cell?: (item: T) => React.ReactNode
  sortable?: boolean
  className?: string
  align?: 'left' | 'center' | 'right'
}

export interface DataTableFilterOption<T> {
  key: keyof T
  label: string
  options: { label: string; value: string }[]
}

export interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  searchPlaceholder?: string
  searchKey?: keyof T
  filterOptions?: DataTableFilterOption<T>
  pageSize?: number
  onRowClick?: (item: T) => void
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  keyExtractor?: (item: T) => string
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  searchKey,
  filterOptions,
  pageSize = 10,
  onRowClick,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching your criteria.',
  keyExtractor = (item) => (item.id as string) || Math.random().toString(),
  className = '',
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [sortColumnId, setSortColumnId] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)

  // 1. Filtered Data
  const filteredData = useMemo(() => {
    let result = [...data]

    // Apply Filter
    if (filterOptions && selectedFilter !== 'all') {
      result = result.filter(
        (item) => String(item[filterOptions.key]) === selectedFilter,
      )
    }

    // Apply Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((item) => {
        if (searchKey) {
          const val = item[searchKey]
          return String(val ?? '').toLowerCase().includes(q)
        }
        // Universal search over all item string/number values
        return Object.values(item).some((val) =>
          String(val ?? '').toLowerCase().includes(q),
        )
      })
    }

    // Apply Sorting
    if (sortColumnId) {
      const column = columns.find((c) => c.id === sortColumnId)
      if (column?.accessorKey) {
        const key = column.accessorKey
        result.sort((a, b) => {
          const valA = a[key]
          const valB = b[key]
          if (valA === valB) return 0
          if (valA === undefined || valA === null) return 1
          if (valB === undefined || valB === null) return -1

          const comp = valA > valB ? 1 : -1
          return sortDirection === 'asc' ? comp : -comp
        })
      }
    }

    return result
  }, [data, searchQuery, searchKey, filterOptions, selectedFilter, sortColumnId, sortDirection, columns])

  // 2. Pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  const handleSort = (columnId: string, sortable?: boolean) => {
    if (!sortable) return
    if (sortColumnId === columnId) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else {
        setSortColumnId(null)
      }
    } else {
      setSortColumnId(columnId)
      setSortDirection('asc')
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls Bar: Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8da5a1]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-xl border border-[#dce7e3] bg-white pl-9 pr-3 text-xs outline-none placeholder:text-[#9aafab] focus:border-[#295654]"
          />
        </div>

        {filterOptions && (
          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-[#739692]" />
            <select
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="h-10 rounded-xl border border-[#dce7e3] bg-white px-3 text-xs font-medium text-[#294542] outline-none focus:border-[#295654]"
            >
              <option value="all">All {filterOptions.label}s</option>
              {filterOptions.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-[#dce6e3] bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#ebf2f0] bg-[#f9fbfa] text-[11px] font-semibold uppercase tracking-wider text-[#739692]">
              <tr>
                {columns.map((col) => {
                  const isSorted = sortColumnId === col.id
                  const alignClass =
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'

                  return (
                    <th
                      key={col.id}
                      onClick={() => handleSort(col.id, col.sortable)}
                      className={`px-4 py-3.5 ${alignClass} ${
                        col.sortable ? 'cursor-pointer select-none hover:text-[#123332]' : ''
                      } ${col.className || ''}`}
                    >
                      <div
                        className={`inline-flex items-center gap-1.5 ${
                          col.align === 'right' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        {col.header}
                        {col.sortable && (
                          <span className="text-[#a4b6b2]">
                            {isSorted ? (
                              sortDirection === 'asc' ? (
                                <ArrowUp className="size-3 text-[#295654]" />
                              ) : (
                                <ArrowDown className="size-3 text-[#295654]" />
                              )
                            ) : (
                              <ArrowUpDown className="size-3 opacity-40" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#edf3f1]">
              {isLoading ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {columns.map((c) => (
                      <td key={c.id} className="px-4 py-3.5">
                        <div className="h-4 rounded bg-[#e8efec]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-8">
                    <EmptyState title={emptyTitle} description={emptyDescription} />
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr
                    key={keyExtractor(item)}
                    onClick={() => onRowClick?.(item)}
                    className={`transition-colors ${
                      onRowClick ? 'cursor-pointer hover:bg-[#f6f9f8]' : 'hover:bg-[#fafbfb]'
                    }`}
                  >
                    {columns.map((col) => {
                      const alignClass =
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'

                      return (
                        <td
                          key={col.id}
                          className={`px-4 py-3.5 text-[#294542] ${alignClass} ${col.className || ''}`}
                        >
                          {col.cell
                            ? col.cell(item)
                            : col.accessorKey
                            ? String(item[col.accessorKey] ?? '')
                            : null}
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!isLoading && filteredData.length > 0 && (
          <div className="flex items-center justify-between border-t border-[#edf3f1] bg-[#fbfdfc] px-4 py-3 text-xs text-[#71918e]">
            <span>
              Showing <strong>{Math.min(filteredData.length, (currentPage - 1) * pageSize + 1)}</strong> to{' '}
              <strong>{Math.min(filteredData.length, currentPage * pageSize)}</strong> of{' '}
              <strong>{filteredData.length}</strong> records
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="grid size-7 place-items-center rounded-lg border border-[#dce7e3] bg-white transition-colors hover:bg-[#edf3f1] disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="px-2 text-xs font-semibold text-[#183938]">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="grid size-7 place-items-center rounded-lg border border-[#dce7e3] bg-white transition-colors hover:bg-[#edf3f1] disabled:opacity-40"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

