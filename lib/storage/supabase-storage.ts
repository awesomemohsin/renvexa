import { createClient, SupabaseClient } from '@supabase/supabase-js'
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  StorageMetadata,
  StorageProvider,
  StorageResult,
  UploadParams,
} from './types'

export class SupabaseStorageProvider implements StorageProvider {
  name = 'supabase'
  private client: SupabaseClient | null = null

  constructor(supabaseUrl?: string, serviceRoleKey?: string) {
    const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (url && key) {
      this.client = createClient(url, key, {
        auth: { persistSession: false },
      })
    }
  }

  private getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error(
        'Supabase Storage is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.',
      )
    }
    return this.client
  }

  async upload(params: UploadParams): Promise<StorageResult> {
    const client = this.getClient()

    // Enforce file size limit
    if (params.file.byteLength > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size exceeds the allowed limit of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`)
    }

    // Enforce MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(params.mimeType as any)) {
      throw new Error(`MIME type '${params.mimeType}' is not permitted. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`)
    }

    const { error } = await client.storage.from(params.bucket).upload(params.key, params.file, {
      contentType: params.mimeType,
      upsert: true,
    })

    if (error) {
      throw new Error(`Supabase Storage upload failed: ${error.message}`)
    }

    return {
      key: params.key,
      bucket: params.bucket,
      sizeBytes: params.file.byteLength,
      mimeType: params.mimeType,
    }
  }

  async download(bucket: string, key: string): Promise<Buffer> {
    const client = this.getClient()
    const { data, error } = await client.storage.from(bucket).download(key)
    if (error || !data) {
      throw new Error(`Failed to download object '${key}' from bucket '${bucket}': ${error?.message}`)
    }
    const arrayBuffer = await data.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  async delete(bucket: string, key: string): Promise<void> {
    const client = this.getClient()
    const { error } = await client.storage.from(bucket).remove([key])
    if (error) {
      throw new Error(`Failed to delete object '${key}' from bucket '${bucket}': ${error.message}`)
    }
  }

  async getSignedUrl(bucket: string, key: string, expiresInSeconds = 900): Promise<string> {
    const client = this.getClient()
    const { data, error } = await client.storage
      .from(bucket)
      .createSignedUrl(key, expiresInSeconds)

    if (error || !data?.signedUrl) {
      throw new Error(`Failed to generate signed URL for '${key}': ${error?.message}`)
    }

    return data.signedUrl
  }

  async getMetadata(bucket: string, key: string): Promise<StorageMetadata | null> {
    const client = this.getClient()
    const parts = key.split('/')
    const fileName = parts.pop() || key
    const folder = parts.join('/')

    const { data, error } = await client.storage.from(bucket).list(folder, {
      search: fileName,
    })

    if (error || !data || data.length === 0) {
      return null
    }

    const fileMeta = data.find((f) => f.name === fileName) || data[0]
    return {
      key,
      bucket,
      fileName,
      mimeType: fileMeta.metadata?.mimetype || 'application/octet-stream',
      sizeBytes: fileMeta.metadata?.size || 0,
      updatedAt: fileMeta.updated_at || new Date().toISOString(),
    }
  }

  async copy(
    sourceBucket: string,
    sourceKey: string,
    destBucket: string,
    destKey: string,
  ): Promise<void> {
    const client = this.getClient()
    const { error } = await client.storage
      .from(sourceBucket)
      .copy(sourceKey, destKey, { destinationBucket: destBucket })

    if (error) {
      throw new Error(`Failed to copy object: ${error.message}`)
    }
  }
}

