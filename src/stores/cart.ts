import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CartItem {
    productId: number
    skuId?: number
    selectedSecretIds?: number[]
    selectedSecretDisplays?: string[]
    secretSelectionMarkupAmount?: string
    skuCode?: string
    skuSpecValues?: Record<string, any>
    skuManualStockTotal?: number
    skuManualStockLocked?: number
    skuManualStockSold?: number
    skuAutoStockAvailable?: number
    skuUpstreamStock?: number
    skuStockEnforced?: boolean
    skuStockSnapshotAt?: string
    slug: string
    title: any
    priceAmount: string
    image?: string
    quantity: number
    maxPurchaseQuantity?: number
    purchaseType?: string
    fulfillmentType?: string
    manualFormSchema?: any
}

const normalizeSkuId = (value: unknown) => {
    const numberValue = Number(value)
    if (!Number.isFinite(numberValue)) return 0
    const integerValue = Math.trunc(numberValue)
    return integerValue > 0 ? integerValue : 0
}

const normalizeSelectedSecretIds = (value: unknown): number[] => {
    if (!Array.isArray(value)) return []
    return Array.from(
        new Set(
            value
                .map((item) => Number(item))
                .filter((item) => Number.isFinite(item) && item > 0)
                .map((item) => Math.trunc(item))
        )
    )
}

const normalizeSelectedSecretDisplays = (value: unknown): string[] => {
    if (!Array.isArray(value)) return []
    return value
        .map((item) => String(item || '').trim())
        .filter(Boolean)
}

export const buildCartIdentity = (item: Pick<CartItem, 'productId' | 'skuId' | 'selectedSecretIds'>) => {
    const selectedKey = normalizeSelectedSecretIds(item.selectedSecretIds).join(',')
    return `${item.productId}:${normalizeSkuId(item.skuId)}:${selectedKey}`
}

const cartIdentity = (item: Pick<CartItem, 'productId' | 'skuId' | 'selectedSecretIds'>) => buildCartIdentity(item)

const normalizeOptionalStockNumber = (value: unknown, allowUnlimited = false): number | undefined => {
    if (value === undefined || value === null || value === '') return undefined
    const numberValue = Number(value)
    if (!Number.isFinite(numberValue)) return undefined
    const integerValue = Math.floor(numberValue)
    if (allowUnlimited && integerValue === -1) return -1
    return Math.max(integerValue, 0)
}

const normalizeOptionalBoolean = (value: unknown): boolean | undefined => {
    if (value === undefined || value === null || value === '') return undefined
    return Boolean(value)
}

const normalizeOptionalString = (value: unknown): string | undefined => {
    if (value === undefined || value === null) return undefined
    const text = String(value).trim()
    return text || undefined
}

const normalizeOptionalLimitNumber = (value: unknown): number | undefined => {
    if (value === undefined || value === null || value === '') return undefined
    const numberValue = Number(value)
    if (!Number.isFinite(numberValue)) return undefined
    const integerValue = Math.floor(numberValue)
    if (integerValue <= 0) return undefined
    return integerValue
}

const clampCartQuantity = (quantity: number, maxPurchaseQuantity?: number) => {
    const normalizedQuantity = Math.max(1, Math.floor(Number(quantity) || 1))
    if (!maxPurchaseQuantity || maxPurchaseQuantity <= 0) {
        return normalizedQuantity
    }
    return Math.min(normalizedQuantity, maxPurchaseQuantity)
}

const loadCartItems = (): CartItem[] => {
    const raw = localStorage.getItem('cart_items')
    if (!raw) return []
    try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed
            .map((item) => {
                if (!item || typeof item !== 'object') return null
                const row = item as any
                const productId = Number(row.productId)
                if (!Number.isFinite(productId) || productId <= 0) return null
                return {
                    ...(item as CartItem),
                    productId: Math.trunc(productId),
                    skuId: normalizeSkuId(row.skuId),
                    selectedSecretIds: normalizeSelectedSecretIds(row.selectedSecretIds ?? row.selected_secret_ids),
                    selectedSecretDisplays: normalizeSelectedSecretDisplays(row.selectedSecretDisplays ?? row.selected_secret_displays),
                    secretSelectionMarkupAmount: normalizeOptionalString(row.secretSelectionMarkupAmount ?? row.secret_selection_markup_amount),
                    skuManualStockTotal: normalizeOptionalStockNumber(row.skuManualStockTotal ?? row.sku_manual_stock_total, true),
                    skuManualStockLocked: normalizeOptionalStockNumber(row.skuManualStockLocked ?? row.sku_manual_stock_locked),
                    skuManualStockSold: normalizeOptionalStockNumber(row.skuManualStockSold ?? row.sku_manual_stock_sold),
                    skuAutoStockAvailable: normalizeOptionalStockNumber(row.skuAutoStockAvailable ?? row.sku_auto_stock_available),
                    skuUpstreamStock: normalizeOptionalStockNumber(row.skuUpstreamStock ?? row.sku_upstream_stock, true),
                    skuStockEnforced: normalizeOptionalBoolean(row.skuStockEnforced ?? row.sku_stock_enforced),
                    skuStockSnapshotAt: normalizeOptionalString(row.skuStockSnapshotAt ?? row.sku_stock_snapshot_at),
                    maxPurchaseQuantity: normalizeOptionalLimitNumber(row.maxPurchaseQuantity ?? row.max_purchase_quantity),
                } as CartItem
            })
            .filter(Boolean) as CartItem[]
    } catch (error) {
        console.error('Failed to parse cart items', error)
        return []
    }
}

export const useCartStore = defineStore('cart', () => {
    const items = ref<CartItem[]>(loadCartItems())

    const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

    const persist = () => {
        localStorage.setItem('cart_items', JSON.stringify(items.value))
    }

    const addItem = (item: CartItem, quantity = 1) => {
        const normalizedItem: CartItem = {
            ...item,
            productId: Math.trunc(Number(item.productId)),
            skuId: normalizeSkuId(item.skuId),
            selectedSecretIds: normalizeSelectedSecretIds(item.selectedSecretIds),
            selectedSecretDisplays: normalizeSelectedSecretDisplays(item.selectedSecretDisplays),
            secretSelectionMarkupAmount: normalizeOptionalString(item.secretSelectionMarkupAmount),
            skuManualStockTotal: normalizeOptionalStockNumber(item.skuManualStockTotal, true),
            skuManualStockLocked: normalizeOptionalStockNumber(item.skuManualStockLocked),
            skuManualStockSold: normalizeOptionalStockNumber(item.skuManualStockSold),
            skuAutoStockAvailable: normalizeOptionalStockNumber(item.skuAutoStockAvailable),
            skuUpstreamStock: normalizeOptionalStockNumber(item.skuUpstreamStock, true),
            skuStockEnforced: normalizeOptionalBoolean(item.skuStockEnforced),
            skuStockSnapshotAt: normalizeOptionalString(item.skuStockSnapshotAt) || new Date().toISOString(),
            maxPurchaseQuantity: normalizeOptionalLimitNumber(item.maxPurchaseQuantity),
        }
        const selectedCount = normalizedItem.selectedSecretIds?.length || 0
        const qty = selectedCount > 0
            ? selectedCount
            : clampCartQuantity(quantity, normalizedItem.maxPurchaseQuantity)
        const identity = cartIdentity(normalizedItem)
        const existing = items.value.find((entry) => cartIdentity(entry) === identity)
        if (existing) {
            existing.quantity = clampCartQuantity(existing.quantity + qty, normalizedItem.maxPurchaseQuantity)
            existing.slug = normalizedItem.slug
            existing.title = normalizedItem.title
            existing.priceAmount = normalizedItem.priceAmount
            existing.image = normalizedItem.image
            existing.selectedSecretIds = normalizedItem.selectedSecretIds
            existing.selectedSecretDisplays = normalizedItem.selectedSecretDisplays
            existing.secretSelectionMarkupAmount = normalizedItem.secretSelectionMarkupAmount
            existing.maxPurchaseQuantity = normalizedItem.maxPurchaseQuantity
            existing.purchaseType = normalizedItem.purchaseType
            existing.fulfillmentType = normalizedItem.fulfillmentType
            existing.manualFormSchema = normalizedItem.manualFormSchema
            existing.skuId = normalizedItem.skuId
            existing.skuCode = normalizedItem.skuCode
            existing.skuSpecValues = normalizedItem.skuSpecValues
            existing.skuManualStockTotal = normalizedItem.skuManualStockTotal
            existing.skuManualStockLocked = normalizedItem.skuManualStockLocked
            existing.skuManualStockSold = normalizedItem.skuManualStockSold
            existing.skuAutoStockAvailable = normalizedItem.skuAutoStockAvailable
            existing.skuUpstreamStock = normalizedItem.skuUpstreamStock
            existing.skuStockEnforced = normalizedItem.skuStockEnforced
            existing.skuStockSnapshotAt = normalizedItem.skuStockSnapshotAt
        } else {
            items.value.push({
                ...normalizedItem,
                quantity: qty,
            })
        }
        persist()
    }

    const updateQuantity = (productId: number, quantity: number, skuId?: number, selectedSecretIds?: number[]) => {
        const identity = buildCartIdentity({ productId: Math.trunc(Number(productId)), skuId, selectedSecretIds })
        const target = items.value.find((entry) => cartIdentity(entry) === identity)
        if (!target) return
        if ((target.selectedSecretIds?.length || 0) > 0) {
            target.quantity = target.selectedSecretIds!.length
            persist()
            return
        }
        const qty = clampCartQuantity(quantity, target.maxPurchaseQuantity)
        target.quantity = qty
        persist()
    }

    const patchItem = (productId: number, skuId: number | undefined, patch: Partial<CartItem>, selectedSecretIds?: number[]) => {
        const identity = buildCartIdentity({ productId: Math.trunc(Number(productId)), skuId, selectedSecretIds })
        const target = items.value.find((entry) => cartIdentity(entry) === identity)
        if (!target) return
        Object.assign(target, patch)
        target.productId = Math.trunc(Number(target.productId))
        target.skuId = normalizeSkuId(target.skuId)
        target.selectedSecretIds = normalizeSelectedSecretIds(target.selectedSecretIds)
        target.selectedSecretDisplays = normalizeSelectedSecretDisplays(target.selectedSecretDisplays)
        target.secretSelectionMarkupAmount = normalizeOptionalString(target.secretSelectionMarkupAmount)
        target.skuManualStockTotal = normalizeOptionalStockNumber(target.skuManualStockTotal, true)
        target.skuManualStockLocked = normalizeOptionalStockNumber(target.skuManualStockLocked)
        target.skuManualStockSold = normalizeOptionalStockNumber(target.skuManualStockSold)
        target.skuAutoStockAvailable = normalizeOptionalStockNumber(target.skuAutoStockAvailable)
        target.skuUpstreamStock = normalizeOptionalStockNumber(target.skuUpstreamStock, true)
        target.skuStockEnforced = normalizeOptionalBoolean(target.skuStockEnforced)
        target.skuStockSnapshotAt = normalizeOptionalString(target.skuStockSnapshotAt)
        target.maxPurchaseQuantity = normalizeOptionalLimitNumber(target.maxPurchaseQuantity)
        persist()
    }

    const removeItem = (productId: number, skuId?: number, selectedSecretIds?: number[]) => {
        const identity = buildCartIdentity({ productId: Math.trunc(Number(productId)), skuId, selectedSecretIds })
        items.value = items.value.filter((entry) => cartIdentity(entry) !== identity)
        persist()
    }

    const clear = () => {
        items.value = []
        persist()
    }

    return {
        items,
        totalItems,
        addItem,
        updateQuantity,
        patchItem,
        removeItem,
        clear,
    }
})
