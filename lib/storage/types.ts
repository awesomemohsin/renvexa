export interface StorageMetadata {
  key: string
  bucket: string
  fileName: string
  mimeType: string
  sizeBytes: number
  updatedAt: string
}

export interface UploadParams {
  bucket: string
  key: string
  file: Buffer | Uint8Array
  fileName: string
  mimeType: string
  organizationId: string
  uploadedByUserId: string
}

export interface StorageResult {
  key: string
  bucket: string
  sizeBytes: number
  mimeType: string
}

export interface StorageProvider {
  name: string
  upload(params: UploadParams): Promise<StorageResult>
  download(bucket: string, key: string): Promise<Buffer>
  delete(bucket: string, key: string): Promise<void>
  getSignedUrl(bucket: string, key: string, expiresInSeconds?: number): Promise<string>
  getMetadata(bucket: string, key: string): Promise<StorageMetadata | null>
  copy(sourceBucket: string, sourceKey: string, destBucket: string, destKey: string): Promise<void>
}

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024 // 15 MB max for free-tier safety

