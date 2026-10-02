import { AppwinError } from './errors.ts'
import type { Session } from './session.ts'
import type { AppwinStorage } from './storage.ts'

export type SdkProduct = 'support' | 'community' | 'notifications' | 'analytics' | 'attribution'

export interface ProductStatus {
  enabled: boolean
  reason?: 'plan' | 'disabled'
}

interface AvailabilityResponse {
  products: Partial<Record<SdkProduct, ProductStatus>>
}

/**
 * Whether the plan and the dashboard toggle allow `product` on this app.
 * The last answer is cached so an offline page falls back to it. `null` means
 * the server was unreachable and nothing is cached.
 *
 * @throws {AppwinError} when the server refused this page (undeclared domain,
 * unknown app): the cache would only hide a setup error that retrying cannot fix.
 */
export async function fetchProductStatus(
  session: Session,
  storage: AppwinStorage,
  product: SdkProduct,
): Promise<ProductStatus | null> {
  const cacheKey = `availability:${product}`
  try {
    const response = await session.fetch<AvailabilityResponse>({
      method: 'GET',
      path: '/api/sdk/v1/availability',
    })
    // An absent product is an unavailable one: the server may know products this build does not.
    const status = response.products[product] ?? { enabled: false, reason: 'disabled' }
    storage.set(cacheKey, JSON.stringify(status))
    return status
  } catch (err) {
    if (err instanceof AppwinError && !err.retryable) throw err
    return readCached(storage, cacheKey)
  }
}

function readCached(storage: AppwinStorage, key: string): ProductStatus | null {
  try {
    const parsed: unknown = JSON.parse(storage.get(key) ?? 'null')
    if (parsed && typeof parsed === 'object' && 'enabled' in parsed) return parsed as ProductStatus
  } catch {
    /* corrupted cache counts as no cache */
  }
  return null
}
