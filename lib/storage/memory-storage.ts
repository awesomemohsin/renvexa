import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  StorageMetadata,
  StorageProvider,
  StorageResult,
  UploadParams,
} from './types'

export class MemoryStorageProvider implements StorageProvider {
  name = 'memory'
  private store = new Map<string, { buffer: Buffer; metadata: StorageMetadata }>()

  private makeCompoundKey(bucket: string, key: string): string {
    return `${bucket}:::${key}`
  }

  async upload(params: UploadParams): Promise<StorageResult> {
    if (params.file.byteLength > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size exceeds limit of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`)
    }

    if (!ALLOWED_MIME_TYPES.includes(params.mimeType as any)) {
      throw new Error(`MIME type '${params.mimeType}' is not permitted. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`)
    }

    const cKey = this.makeCompoundKey(params.bucket, params.key)
    const buf = Buffer.isBuffer(params.file) ? params.file : Buffer.from(params.file)

    const meta: StorageMetadata = {
      key: params.key,
      bucket: params.bucket,
      fileName: params.fileName,
      mimeType: params.mimeType,
      sizeBytes: buf.byteLength,
      updatedAt: new Date().toISOString(),
    }

    this.store.set(cKey, { buffer: buf, metadata: meta })

    return {
      key: params.key,
      bucket: params.bucket,
      sizeBytes: buf.byteLength,
      mimeType: params.mimeType,
    }
  }

  async download(bucket: string, key: string): Promise<Buffer> {
    const cKey = this.makeCompoundKey(bucket, key)
    const item = this.store.get(cKey)
    if (!item) {
      throw new Error(`Object '${key}' not found in bucket '${bucket}'.`)
    }
    return item.buffer
  }

  async delete(bucket: string, key: string): Promise<void> {
    const cKey = this.makeCompoundKey(bucket, key)
    this.store.delete(cKey)
  }

  async getSignedUrl(bucket: string, key: string, expiresInSeconds = 900): Promise<string> {
    const cKey = this.makeCompoundKey(bucket, key)
    const item = this.store.get(cKey)
    if (!item) {
      throw new Error(`Object '${key}' not found in bucket '${bucket}'.`)
    }
    const expiresAt = Date.now() + expiresInSeconds * 1000
    return `https://storage.renvexa.io/signed/${bucket}/${encodeURIComponent(key)}?expires=${expiresAt}&token=sig_${Date.now()}`
  }

  async getMetadata(bucket: string, key: string): Promise<StorageMetadata | null> {
    const cKey = this.makeCompoundKey(bucket, key)
    const item = this.store.get(cKey)
    return item ? item.metadata : null
  }

  async copy(
    sourceBucket: string,
    sourceKey: string,
    destBucket: string,
    destKey: string,
  ): Promise<void> {
    const sCKey = this.makeCompoundKey(sourceBucket, sourceKey)
    const item = this.store.get(sCKey)
    if (!item) {
      throw new Error(`Source object '${sourceKey}' not found.`)
    }
    const dCKey = this.makeCompoundKey(destBucket, destKey)
    this.store.set(dCKey, {
      buffer: item.buffer,
      metadata: {
        ...item.metadata,
        key: destKey,
        bucket: destBucket,
        updatedAt: new Date().toISOString(),
      },
    })
  }
}

