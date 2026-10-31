import { jobOutbox } from '../jobs/outbox'
import { store } from '../repository/store'

export interface SheetRowRecord {
  propertyCode: string
  propertyName: string
  buildingName: string
  unitNumber: string
  unitType: string
  status: string
  tenantName: string
  tenantPhone: string
  monthlyRent: number
  lastUpdated: string
}

export class GoogleSheetsSyncService {
  /**
   * Transforms property and room hierarchy into flat spreadsheet rows
   */
  generateSpreadsheetRows(organizationId: string, propertyId?: string): SheetRowRecord[] {
    const properties = store.getProperties(organizationId, propertyId ? [propertyId] : undefined)
    const rows: SheetRowRecord[] = []

    for (const prop of properties) {
      const hierarchy = store.getPropertyHierarchy(organizationId, prop.id)
      if (!hierarchy) continue

      for (const bld of hierarchy.buildings) {
        for (const flr of bld.floors) {
          for (const room of flr.rooms) {
            rows.push({
              propertyCode: prop.code,
              propertyName: prop.name,
              buildingName: bld.name,
              unitNumber: room.roomNumber,
              unitType: room.unitType,
              status: room.status,
              tenantName: room.tenant?.legalName || 'N/A',
              tenantPhone: room.tenant?.phone || 'N/A',
              monthlyRent: room.activeLease?.rentAmount || room.baseRent,
              lastUpdated: new Date().toISOString().split('T')[0],
            })
          }
        }
      }
    }

    return rows
  }

  /**
   * Queue an asynchronous spreadsheet sync job into the outbox
   */
  async queueSync(
    organizationId: string,
    spreadsheetId: string,
    propertyId?: string,
  ) {
    const idempotencyKey = `sheets_sync_${organizationId}_${spreadsheetId}_${new Date().toISOString().split('T')[0]}`

    return jobOutbox.enqueue(
      organizationId,
      'google_sheets_sync',
      {
        spreadsheetId,
        propertyId,
        triggeredAt: new Date().toISOString(),
      },
      idempotencyKey,
    )
  }
}

export const googleSheetsSyncService = new GoogleSheetsSyncService()

