import type { Product } from '../types/insurance';
import { isReferenceOnlyProduct } from './product-availability.ts';
import { promoDisplay } from './premium-display.ts';

export interface CatalogueFilters {
  query?: string;
  insurers?: readonly string[];
  trip?: 'all' | 'single' | 'annual';
  region?: 'all' | 'asia' | 'worldwide' | 'gba';
  onlyPremium?: boolean;
  onlyPromo?: boolean;
  includeHistorical?: boolean;
  now?: Date;
}
/** Identity search is separate from coverage matching: finding a name never proves cover. */
export function filterCatalogue(products: readonly Product[], filters: CatalogueFilters): Product[] {
  const words = (filters.query ?? '').normalize('NFKC').trim().toLocaleLowerCase('en-HK').split(/\s+/u).filter(Boolean);
  return products.filter(product => {
    if (!filters.includeHistorical && isReferenceOnlyProduct(product)) return false;
    if (filters.insurers?.length && !filters.insurers.includes(product.insurer)) return false;
    if (filters.onlyPremium && !product.premium_available) return false;
    if (filters.onlyPromo && !promoDisplay(product, filters.now).present) return false;
    if (filters.trip && filters.trip !== 'all' && product.trip_type !== filters.trip && product.trip_type !== 'both') return false;
    if (filters.region && filters.region !== 'all' && !product.destination_scope?.includes(filters.region)) return false;
    const identity = [product.insurer, product.insurer_zh, product.product_name, product.product_name_zh, ...product.plan_tiers].join(' ').normalize('NFKC').toLocaleLowerCase('en-HK');
    return words.every(word => identity.includes(word));
  });
}
