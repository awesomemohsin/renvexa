import { createHash } from 'crypto'
import { store } from '../repository/store'

export interface BackupManifest {
  backupId: string
  organizationId: string
  organizationName: string
  backupType: 'daily_structured' | 'weekly_snapshot' | 'monthly_archive'
  generatedAt: string
  propertiesCount: number
  unitsCount: number
  tenantsCount: number
  sha256Checksum: string
  sizeBytes: number
  dataPayload: Record<string, any>
}

export class GoogleDriveBackupService {
  /**
   * Generates a portable, structured backup archive of an organization's state
   */
  async createBackupArchive(
    organizationId: string,
    backupType: 'daily_structured' | 'weekly_snapshot' | 'monthly_archive' = 'daily_structured',
  ): Promise<BackupManifest> {
    const org = store.getOrganization(organizationId)
    if (!org) {
      throw new Error(`Organization '${organizationId}' not found for backup generation.`)
    }

    const properties = store.getProperties(organizationId)
    const tenants = store.getTenants(organizationId)

    // Build the complete hierarchical snapshot
    const propertySnapshots = properties.map((p) => {
      return store.getPropertyHierarchy(organizationId, p.id)
    })

    const payload = {
      manifestVersion: '1.0',
      organization: org,
      properties: propertySnapshots,
      tenants,
      exportedAt: new Date().toISOString(),
    }

    const serialized = JSON.stringify(payload)
    const sha256Checksum = createHash('sha256').update(serialized).digest('hex')
    const sizeBytes = Buffer.byteLength(serialized, 'utf-8')
    const backupId = `bkp_${Date.now()}_${sha256Checksum.substring(0, 8)}`

    return {
      backupId,
      organizationId,
      organizationName: org.name,
      backupType,
      generatedAt: new Date().toISOString(),
      propertiesCount: properties.length,
      unitsCount: propertySnapshots.reduce((acc, p) => acc + (p?.stats.totalUnits || 0), 0),
      tenantsCount: tenants.length,
      sha256Checksum,
      sizeBytes,
      dataPayload: payload,
    }
  }

  /**
   * Verify backup checksum integrity
   */
  verifyChecksum(rawContent: string, expectedChecksum: string): boolean {
    const actualChecksum = createHash('sha256').update(rawContent).digest('hex')
    return actualChecksum === expectedChecksum
  }
}

export const googleDriveBackupService = new GoogleDriveBackupService()

