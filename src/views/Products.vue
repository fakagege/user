<template>
  <div class="products-page min-h-screen theme-page pt-20 pb-16">
    <div class="container mx-auto px-4">
      <!-- Page Header -->
      <div class="mb-12 mt-12 text-center">
        <h1 class="text-4xl md:text-5xl font-black mb-4 tracking-tight theme-text-primary">{{ t('nav.products') }}</h1>
        <p class="theme-text-secondary max-w-2xl mx-auto text-lg border-b theme-border pb-8">
          {{ t('products.subtitle') }}
        </p>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Mobile Filter Button -->
        <button @click="showFilterDrawer = true"
          class="lg:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-xl border theme-btn-secondary text-sm font-medium min-h-[44px]">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {{ t('products.filter') }}
          <span v-if="selectedCategory" class="w-2 h-2 rounded-full theme-accent-stick"></span>
        </button>

        <!-- Mobile Filter Drawer Overlay -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0">
          <div v-if="showFilterDrawer" class="lg:hidden fixed inset-0 z-40 bg-black/50" @click="showFilterDrawer = false"
            style="overscroll-behavior: none;"></div>
        </Transition>

        <!-- Mobile Filter Drawer -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="-translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="translate-x-0"
          leave-to-class="-translate-x-full">
          <div v-if="showFilterDrawer"
            class="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 max-w-[80vw] theme-panel-strong backdrop-blur-xl border-r theme-border overflow-y-auto"
            style="overscroll-behavior: none;">
            <div class="p-6">
              <div class="flex items-center justify-between mb-6">
                <span class="text-sm font-bold theme-text-primary flex items-center gap-2">
                  <span class="w-1 h-5 theme-accent-stick rounded-full"></span>
                  {{ t('products.filter') }}
                </span>
                <button @click="showFilterDrawer = false"
                  class="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg theme-btn-neutral">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Search in drawer -->
              <div class="mb-6">
                <label class="text-xs font-semibold uppercase tracking-wider theme-text-muted">
                  {{ t('products.searchLabel') }}
                </label>
                <div class="mt-3 flex items-center gap-2">
                  <input v-model="searchQuery" type="text"
                    class="min-w-0 flex-1 form-input"
                    :placeholder="t('products.searchPlaceholder')" />
                  <button v-if="searchQuery" type="button" @click="clearSearch"
                    class="shrink-0 whitespace-nowrap px-3 py-2.5 rounded-xl border theme-btn-secondary text-xs">
                    {{ t('common.cancel') }}
                  </button>
                </div>
              </div>

              <!-- Categories in drawer -->
              <h2 class="text-lg font-bold mb-4 theme-text-primary">{{ t('products.categories') }}</h2>
              <ul class="space-y-2">
                <li>
                  <button @click="selectCategory(null, true)"
                    class="w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border min-h-[44px]"
                    :class="selectedCategory === null
                      ? 'theme-btn-primary border border-transparent'
                      : 'border-transparent theme-text-secondary hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'">
                    {{ t('products.allCategories') }}
                  </button>
                </li>
                <li v-for="group in categoryGroups" :key="group.id">
                  <div class="space-y-2">
                    <div class="flex items-stretch gap-2">
                      <button @click="selectCategory(group.id, true)"
                        class="flex-1 text-left px-4 py-3 rounded-xl transition-all duration-300 border flex items-center gap-2 min-h-[44px]"
                        :class="selectedCategory === group.id
                          ? 'theme-btn-primary border border-transparent'
                          : 'border-transparent theme-text-secondary hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'">
                        <img v-if="group.icon" :src="getImageUrl(group.icon)"
                          :alt="getLocalizedText(group.name)"
                          class="h-5 w-5 rounded object-cover" />
                        <span class="truncate">{{ getLocalizedText(group.name) }}</span>
                      </button>
                      <button
                        v-if="group.children.length > 0"
                        type="button"
                        class="h-10 w-10 shrink-0 self-center rounded-full border flex items-center justify-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                        :class="getParentToggleButtonClass(group.id)"
                        @click.stop="toggleParentCategory(group.id)"
                      >
                        <svg
                          class="w-4 h-4 transition-transform duration-200"
                          :class="isParentExpanded(group.id) ? 'rotate-90' : ''"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    <ul v-if="group.children.length > 0 && isParentExpanded(group.id)" class="space-y-2 pl-4">
                      <li v-for="child in group.children" :key="child.id">
                        <button @click="selectCategory(child.id, true)"
                          class="w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border flex items-center gap-2 min-h-[44px]"
                          :class="selectedCategory === child.id
                            ? 'theme-btn-primary border border-transparent'
                            : 'border-transparent theme-text-secondary hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'">
                          <img v-if="child.icon" :src="getImageUrl(child.icon)"
                            :alt="getLocalizedText(child.name)"
                            class="h-5 w-5 rounded object-cover" />
                          <span class="truncate">{{ getLocalizedText(child.name) }}</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </Transition>

        <!-- Desktop Sidebar - Categories -->
        <aside class="hidden lg:block lg:w-64 flex-shrink-0">
          <div class="theme-panel backdrop-blur-xl border rounded-2xl p-6 sticky top-24">
            <div class="mb-6">
              <label class="text-xs font-semibold uppercase tracking-wider theme-text-muted">
                {{ t('products.searchLabel') }}
              </label>
              <div class="mt-3 flex items-center gap-2">
                <input v-model="searchQuery" type="text"
                  class="min-w-0 flex-1 form-input"
                  :placeholder="t('products.searchPlaceholder')" />
                <button v-if="searchQuery" type="button" @click="clearSearch"
                  class="shrink-0 whitespace-nowrap px-3 py-2.5 rounded-xl border theme-btn-secondary text-xs">
                  {{ t('common.cancel') }}
                </button>
              </div>
            </div>
            <h2 class="text-lg font-bold mb-6 theme-text-primary flex items-center gap-2">
              <span class="w-1 h-5 theme-accent-stick rounded-full"></span>
              {{ t('products.categories') }}
            </h2>
            <ul class="space-y-2">
              <li>
                <button @click="selectCategory(null)"
                  class="w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border"
                  :class="selectedCategory === null
                    ? 'theme-btn-primary border border-transparent'
                    : 'border-transparent theme-text-secondary hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'">
                  {{ t('products.allCategories') }}
                </button>
              </li>
              <li v-for="group in categoryGroups" :key="group.id">
                <div class="space-y-2">
                  <div class="flex items-stretch gap-2">
                    <button @click="selectCategory(group.id)"
                      class="flex-1 text-left px-4 py-3 rounded-xl transition-all duration-300 border flex items-center gap-2"
                      :class="selectedCategory === group.id
                        ? 'theme-btn-primary border border-transparent'
                        : 'border-transparent theme-text-secondary hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'">
                      <img v-if="group.icon" :src="getImageUrl(group.icon)"
                        :alt="getLocalizedText(group.name)"
                        class="h-5 w-5 rounded object-cover" />
                      <span class="truncate">{{ getLocalizedText(group.name) }}</span>
                    </button>
                    <button
                      v-if="group.children.length > 0"
                      type="button"
                      class="h-10 w-10 shrink-0 self-center rounded-full border flex items-center justify-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                      :class="getParentToggleButtonClass(group.id)"
                      @click.stop="toggleParentCategory(group.id)"
                    >
                      <svg
                        class="w-4 h-4 transition-transform duration-200"
                        :class="isParentExpanded(group.id) ? 'rotate-90' : ''"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <ul v-if="group.children.length > 0 && isParentExpanded(group.id)" class="space-y-2 pl-4">
                    <li v-for="child in group.children" :key="child.id">
                      <button @click="selectCategory(child.id)"
                        class="w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border flex items-center gap-2"
                        :class="selectedCategory === child.id
                          ? 'theme-btn-primary border border-transparent'
                          : 'border-transparent theme-text-secondary hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'">
                        <img v-if="child.icon" :src="getImageUrl(child.icon)"
                          :alt="getLocalizedText(child.name)"
                          class="h-5 w-5 rounded object-cover" />
                        <span class="truncate">{{ getLocalizedText(child.name) }}</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </aside>

        <!-- Main Content - Products Grid -->
        <main class="flex-1">
          <!-- Loading Skeleton -->
          <div v-if="loading" class="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
            <div v-for="i in 6" :key="i"
              class="theme-panel rounded-2xl border overflow-hidden flex flex-col">
              <div class="h-36 md:h-56 theme-skeleton"></div>
              <div class="p-3 md:p-5 space-y-3">
                <div class="h-3 w-16 rounded theme-skeleton"></div>
                <div class="h-5 w-3/4 rounded theme-skeleton"></div>
                <div class="flex gap-2">
                  <div class="h-5 w-14 rounded-full theme-skeleton"></div>
                  <div class="h-5 w-14 rounded-full theme-skeleton"></div>
                </div>
                <div class="h-3 w-full rounded theme-skeleton"></div>
                <div class="h-3 w-2/3 rounded theme-skeleton"></div>
                <div class="border-t theme-border pt-3 flex justify-between items-center">
                  <div class="h-6 w-20 rounded theme-skeleton"></div>
                  <div class="h-4 w-16 rounded theme-skeleton"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Products Grid -->
          <div v-else-if="products.length > 0">
            <div class="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
              <div v-for="(product, idx) in products" :key="product.id"
                class="group relative theme-panel rounded-2xl border transition-all overflow-hidden flex flex-col h-full theme-slide-up"
                :class="isSoldOut(product)
                  ? 'opacity-85 grayscale-[0.25] saturate-50 border-rose-300/60 dark:border-rose-900/40 hover:-translate-y-0 hover:shadow-none hover:border-rose-300/60 dark:hover:border-rose-900/40'
                  : 'theme-card-interactive'"
                :style="{ animationDelay: `${idx * 50}ms` }"
                @click="goToProduct(product.slug)">
                <!-- Image Area -->
                <div class="aspect-[4/3] overflow-hidden theme-surface-muted relative shrink-0">
                  <div class="absolute inset-0 bg-black/15 z-10"></div>
                  <img v-if="product.images && getFirstImageUrl(product.images)" :src="getFirstImageUrl(product.images)"
                    :alt="getLocalizedText(product.title)"
                    class="w-full h-full object-cover transform transition-transform duration-700 ease-out"
                    :class="isSoldOut(product) ? 'grayscale brightness-75' : 'group-hover:scale-110'" />
                  <img v-else-if="product.category?.icon" :src="getImageUrl(product.category.icon)"
                    :alt="getLocalizedText(product.category?.name)"
                    class="w-full h-full object-cover transform transition-transform duration-700 ease-out"
                    :class="isSoldOut(product) ? 'grayscale brightness-75' : 'group-hover:scale-110'" />
                  <div v-else class="w-full h-full flex items-center justify-center theme-text-muted">
                    <svg class="w-8 h-8 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>

                  <div v-if="isSoldOut(product)" class="absolute inset-0 z-20 bg-black/45"></div>
                  <div v-if="isSoldOut(product)"
                    class="absolute left-2 top-2 md:left-4 md:top-4 z-30 theme-badge theme-badge-solid-danger text-xs font-bold tracking-wider shadow-sm">
                    {{ t('products.stockStatus.outOfStock') }}
                  </div>

                  <!-- Tags -->
                  <div v-if="!isSoldOut(product) && product.tags && product.tags.length > 0"
                    class="absolute top-2 right-2 md:top-4 md:right-4 z-20 flex flex-wrap gap-1 md:gap-2 justify-end">
                    <span v-for="(tag, index) in product.tags.slice(0, isMobileGrid ? 1 : 2)" :key="index"
                      class="theme-badge theme-badge-inverse px-2 md:px-3 py-0.5 md:py-1 text-xs font-medium">
                      {{ tag }}
                    </span>
                  </div>
                </div>

                <!-- Content Area -->
                <div class="p-3 md:p-5 relative z-20 flex flex-col flex-1">
                  <div v-if="getProductCategoryLabel(product)" class="text-xs theme-text-muted uppercase tracking-wider mb-1 md:mb-2 truncate">
                    {{ t('products.categoryLabel') }} · {{ getProductCategoryLabel(product) }}
                  </div>
                  <h3 class="text-sm md:text-lg font-bold theme-text-primary mb-1 md:mb-2 transition-colors line-clamp-1">
                    {{ getLocalizedText(product.title) }}
                  </h3>

                  <!-- Badges: mobile shows only 1 most important -->
                  <div class="mb-2 md:mb-3 flex flex-wrap items-center gap-1 md:gap-2">
                    <!-- Mobile: show only fulfillment type badge -->
                    <span class="md:hidden theme-badge text-xs"
                      :class="product.fulfillment_type === 'auto' ? 'theme-badge-info' : 'theme-badge-neutral'">
                      {{ getFulfillmentTypeLabel(product.fulfillment_type) }}
                    </span>

                    <!-- Desktop: show all badges -->
                    <span class="hidden md:inline-flex theme-badge"
                      :class="product.purchase_type === 'guest' ? 'theme-badge-warning' : 'theme-badge-success'">
                      <svg v-if="product.purchase_type === 'guest'" class="mr-1 h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
                        <circle cx="9.5" cy="7" r="3" stroke-width="2" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 8l2 2-2 2" />
                      </svg>
                      <svg v-else class="mr-1 h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="3" y="11" width="18" height="10" rx="2" ry="2" stroke-width="2" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11V8a5 5 0 0110 0v3" />
                      </svg>
                      {{ getPurchaseTypeLabel(product.purchase_type) }}
                    </span>

                    <span class="hidden md:inline-flex theme-badge"
                      :class="product.fulfillment_type === 'auto' ? 'theme-badge-info' : 'theme-badge-neutral'">
                      <svg v-if="product.fulfillment_type === 'auto'" class="mr-1 h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                      </svg>
                      <svg v-else class="mr-1 h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.7 6.3l3 3m-9.4 9.4l-4 1 1-4 9.9-9.9a2.1 2.1 0 013 3L8.3 18.7z" />
                      </svg>
                      {{ getFulfillmentTypeLabel(product.fulfillment_type) }}
                    </span>

                    <span class="hidden md:inline-flex theme-badge"
                      :class="getStockBadgeClass(product.stock_status)">
                      {{ getStockStatusLabel(product) }}
                    </span>
                  </div>

                  <p class="hidden md:block theme-text-secondary text-sm mb-6 line-clamp-2">
                    {{ getLocalizedText(product.description) }}
                  </p>

                  <div class="flex items-center justify-between border-t theme-border pt-2 md:pt-4 mt-auto">
                    <div class="flex flex-col">
                      <span class="hidden md:block text-xs theme-text-muted uppercase tracking-wider">{{ t('products.price') }}</span>
                      <span v-if="hasPromotionPrice(product)" class="theme-price-sm text-rose-600 dark:text-rose-300">
                        {{ formatPrice(getPromotionPriceAmount(product), siteCurrency) }}
                      </span>
                      <span v-else class="theme-price-sm theme-text-primary">
                        {{ formatPrice(product.price_amount, siteCurrency) }}
                      </span>
                      <div v-if="hasPromotionPrice(product)" class="mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span class="hidden md:inline text-xs theme-text-muted opacity-80 line-through">{{ formatPrice(product.price_amount, siteCurrency) }}</span>
                        <span class="theme-badge theme-badge-danger theme-badge-xs">
                          {{ t('products.promotionTag') }}
                        </span>
                      </div>
                      <div v-else-if="hasPromotionRules(product)" class="mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span class="theme-badge theme-badge-warning theme-badge-xs">
                          {{ t('products.promotionBadge') }}
                        </span>
                      </div>
                    </div>

                    <span
                      class="hidden md:flex text-xs uppercase font-bold transition-colors items-center gap-1"
                      :class="isSoldOut(product)
                        ? 'text-rose-500/90 dark:text-rose-300/90'
                        : 'text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white'">
                      {{ t('common.viewDetails') }}
                      <svg class="w-4 h-4 transition-transform" :class="isSoldOut(product) ? '' : 'group-hover:translate-x-1'" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                    <!-- Mobile: arrow only -->
                    <svg class="md:hidden w-4 h-4 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="mt-12 flex justify-center">
              <nav
                class="flex items-center space-x-2 theme-panel-soft backdrop-blur-md p-2 rounded-2xl border">
                <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
                  class="w-12 h-12 flex items-center justify-center rounded-xl border theme-btn-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <span class="px-4 py-2 font-mono theme-text-muted">
                  <span class="theme-text-primary font-bold">{{ currentPage }}</span>
                  <span class="mx-2 opacity-50">/</span>
                  <span>{{ totalPages }}</span>
                </span>

                <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
                  class="w-12 h-12 flex items-center justify-center rounded-xl border theme-btn-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else
            class="text-center py-20 border theme-panel-soft rounded-2xl backdrop-blur-sm theme-slide-up">
            <svg class="w-20 h-20 mx-auto theme-text-muted mb-6" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="theme-text-muted text-lg">
              {{ t('products.empty') }}
            </p>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { productAPI, categoryAPI } from '../api'
import { buildCategoryGroups, buildCategoryPath, createCategoryMap, normalizeCategoryParentId, type PublicCategory } from '../utils/category'
import { getImageUrl, getFirstImageUrl } from '../utils/image'
import { debounceAsync } from '../utils/debounce'
import { useLocalized, useProductLabels } from '../composables/useProduct'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const { getLocalizedText, siteCurrency, formatPrice } = useLocalized()
const { getPurchaseTypeLabel, getFulfillmentTypeLabel, getStockBadgeClass, getStockStatusLabel, isSoldOut, hasPromotionPrice, getPromotionPriceAmount, hasPromotionRules } = useProductLabels()

const loading = ref(true)
const products = ref<any[]>([])
const categories = ref<PublicCategory[]>([])
const selectedCategory = ref<number | null>(null)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const totalPages = ref(0)
const showFilterDrawer = ref(false)
const expandedParentIds = ref<number[]>([])

const categoryMap = computed(() => createCategoryMap(categories.value))
const categoryGroups = computed(() => buildCategoryGroups(categories.value))

// Detect mobile 2-col grid (< md breakpoint)
const isMobileGrid = ref(window.innerWidth < 768)
const handleResize = () => {
  isMobileGrid.value = window.innerWidth < 768
}

const isParentExpanded = (categoryId: number) => {
  return expandedParentIds.value.includes(categoryId)
}

const expandParentCategory = (categoryId: number) => {
  if (!categoryId || isParentExpanded(categoryId)) return
  expandedParentIds.value = [...expandedParentIds.value, categoryId]
}

const toggleParentCategory = (categoryId: number) => {
  if (isParentExpanded(categoryId)) {
    expandedParentIds.value = expandedParentIds.value.filter((id) => id !== categoryId)
    return
  }

  expandParentCategory(categoryId)
}

const getParentToggleButtonClass = (categoryId: number) => {
  return isParentExpanded(categoryId)
    ? 'theme-btn-primary border-transparent'
    : 'theme-panel-soft theme-text-muted hover:text-gray-900 dark:hover:text-white'
}

const syncExpandedCategoryState = () => {
  if (!selectedCategory.value) return

  const matched = categoryMap.value.get(selectedCategory.value)
  if (!matched) return

  const parentId = normalizeCategoryParentId(matched.parent_id)
  if (parentId > 0) {
    expandParentCategory(parentId)
    return
  }

  const selectedGroup = categoryGroups.value.find((group) => group.id === matched.id)
  if (selectedGroup?.children.length) {
    expandParentCategory(selectedGroup.id)
  }
}

const selectCategory = (categoryId: number | null, closeDrawer = false) => {
  selectedCategory.value = categoryId
  if (closeDrawer) {
    showFilterDrawer.value = false
  }
}

const getCategoryPathById = (categoryId: unknown) => {
  const normalizedId = Number(categoryId)
  if (!Number.isFinite(normalizedId) || normalizedId <= 0) return ''

  const matched = categoryMap.value.get(Math.floor(normalizedId))
  return buildCategoryPath(matched, categoryMap.value, getLocalizedText)
}

const getProductCategoryLabel = (product: any) => {
  const category = product?.category
  if (!category) return ''

  const resolvedPath = getCategoryPathById(category.id)
  if (resolvedPath) return resolvedPath

  return category.name ? getLocalizedText(category.name) : ''
}

const loadProducts = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      page_size: pageSize.value,
    }
    if (selectedCategory.value) {
      params.category_id = selectedCategory.value
    }
    const keyword = searchQuery.value.trim()
    if (keyword) {
      params.search = keyword
    }
    const response = await productAPI.list(params)
    products.value = response.data.data || []
    if (response.data.pagination) {
      total.value = response.data.pagination.total || 0
      totalPages.value = response.data.pagination.total_page || 0
    }
  } catch (error) {
    console.error('Failed to load products:', error)
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await categoryAPI.list()
    categories.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

const debouncedLoadProducts = debounceAsync(loadProducts, 300)
const debouncedLoadCategories = debounceAsync(loadCategories, 250)

const goToProduct = (slug: string) => {
  router.push(`/products/${slug}`)
}

const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  debouncedLoadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const clearSearch = () => {
  if (!searchQuery.value) return
  searchQuery.value = ''
  currentPage.value = 1
  debouncedLoadProducts()
}

const syncSelectedCategoryFromRoute = () => {
  if (route.name !== 'category-products') {
    if (selectedCategory.value !== null) {
      selectedCategory.value = null
    }
    return false
  }

  const slugParam = route.params.slug as string | undefined
  if (!slugParam || categories.value.length === 0) return false

  const matched = categories.value.find((category) => category.slug === slugParam)
  if (!matched) return false

  if (selectedCategory.value !== matched.id) {
    selectedCategory.value = matched.id
  }

  return true
}

watch(selectedCategory, () => {
  currentPage.value = 1
  syncExpandedCategoryState()
  debouncedLoadProducts()
  // 同步 URL：分类切换时更新地址栏
  if (selectedCategory.value) {
    const matched = categories.value.find((category) => category.id === selectedCategory.value)
    if (matched?.slug && route.params.slug !== matched.slug) {
      router.replace({ name: 'category-products', params: { slug: matched.slug } })
    }
  } else if (route.name === 'category-products') {
    router.replace({ name: 'products' })
  }
})

watch(searchQuery, () => {
  currentPage.value = 1
  debouncedLoadProducts()
})

watch(
  () => route.params.slug,
  () => {
    if (categories.value.length === 0) return
    syncSelectedCategoryFromRoute()
  },
)

onMounted(async () => {
  window.addEventListener('resize', handleResize, { passive: true })
  await debouncedLoadCategories()
  if (syncSelectedCategoryFromRoute()) {
    syncExpandedCategoryState()
    return
  }
  await debouncedLoadProducts()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  debouncedLoadProducts.cancel()
  debouncedLoadCategories.cancel()
})
</script>

<style scoped>
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  line-clamp: 1;
}
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
</style>
