/**
 * RENVEXA CENTRALIZED FORMATTING UTILITIES
 * Enforces Rule 2 (Strict DRY), Rule 10 (Centralized Financial Services), Rule 12 (TypeScript Quality)
 */

export function formatCurrency(
  value: number,
  currency = 'BDT',
  locale = 'en-BD',
): string {
  const symbol = currency === 'BDT' ? '৳ ' : currency === 'USD' ? '$' : ''
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)

  return symbol ? `${symbol}${formattedNumber}` : `${currency} ${formattedNumber}`
}

export function formatDate(
  dateInput: string | Date | number,
  formatStyle: 'short' | 'medium' | 'long' = 'medium',
): string {
  if (!dateInput) return ''
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput
  if (isNaN(date.getTime())) return ''

  if (formatStyle === 'short') {
    return date.toISOString().split('T')[0]
  }

  const options: Intl.DateTimeFormatOptions =
    formatStyle === 'long'
      ? { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }
      : { year: 'numeric', month: 'short', day: 'numeric' }

  return new Intl.DateTimeFormat('en-US', options).format(date)
}

export function formatDateTime(dateInput: string | Date | number): string {
  if (!dateInput) return ''
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput
  if (isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return ''
  const cleaned = phone.replace(/[^\d+]/g, '')
  // If Bangladesh local format: +8801XXXXXXXXX -> +880 1XXX-XXXXXX
  if (cleaned.startsWith('+880') && cleaned.length === 14) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)}-${cleaned.slice(8)}`
  }
  return cleaned
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

