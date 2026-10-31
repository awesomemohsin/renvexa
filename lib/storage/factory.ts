import { MemoryStorageProvider } from './memory-storage'
import { SupabaseStorageProvider } from './supabase-storage'
import { StorageProvider } from './types'

let activeProvider: StorageProvider | null = null

export function getStorageProvider(): StorageProvider {
  if (activeProvider) {
    return activeProvider
  }

  const providerType = process.env.STORAGE_PROVIDER || 'memory'

  if (providerType === 'supabase') {
    const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)
    const hasKey = Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    )

    if (hasSupabaseUrl && hasKey) {
      activeProvider = new SupabaseStorageProvider()
      return activeProvider
    }
  }

  // Fallback to memory provider for local dev and testing
  activeProvider = new MemoryStorageProvider()
  return activeProvider
}

export function resetStorageProvider(): void {
  activeProvider = null
}

