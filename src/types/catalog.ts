/* ─── Product image ──────────────────────────────────────────────────── */
export interface ProductImage {
  id:     string;
  url:    string;
  order:  number;
  width:  number | null;
  height: number | null;
}

/* ─── Product ────────────────────────────────────────────────────────── */
export interface Product {
  id:     string;
  name:   string;
  price:  number;
  images: ProductImage[];
  stock:  number;
  ventas: number;

  category: {
    id: string;
    name: string;
    slug: string;
  };

  color: {
    id: string;
    name: string;
    slug: string;
    hex: string;
  };
}

/* ─── Category ───────────────────────────────────────────────────────── */
export interface Category {
  id: string;
  label: string;
}

/* ─── Color ──────────────────────────────────────────────────────────── */
export interface Color {
  id: string;
  label: string;
  hex: string;
}

/* ─── Sort option ────────────────────────────────────────────────────── */
export type SortKey =
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc'
  | 'most_sold';

export interface SortOption {
  key:   SortKey;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { key: 'price_asc',  label: 'Precio: menor a mayor' },
  { key: 'price_desc', label: 'Precio: mayor a menor' },
  { key: 'name_asc',   label: 'A → Z'                },
  { key: 'name_desc',  label: 'Z → A'                },
  { key: 'most_sold',  label: 'Más vendido'           },
];

/* ─── Active filters ────────────────────────────────────────────────── */
export interface ActiveFilters {
  search:     string;
  categories: string[];
  colors:     string[];
  priceMin:   number;
  priceMax:   number;
  sort:       SortKey;
}