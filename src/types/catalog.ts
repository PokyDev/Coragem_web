/* ─── Catalog entities (from API) ───────────────────────────────────── */

export interface CatalogCategory {
  id:   string;
  name: string;
  slug: string;
}

export interface CatalogColor {
  id:   string;
  name: string;
  slug: string;
  hex:  string;
}

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
  id:       string;
  name:     string;
  price:    number;
  images:   ProductImage[];
  stock:    number;
  ventas:   number;
  category: CatalogCategory;
  color:    CatalogColor;
}

/* ─── Sort option ────────────────────────────────────────────────────── */

export type SortKey =
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "name_desc"
  | "most_sold";

export interface SortOption {
  key:   SortKey;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { key: "price_asc",  label: "Precio: menor a mayor" },
  { key: "price_desc", label: "Precio: mayor a menor" },
  { key: "name_asc",   label: "A → Z"                },
  { key: "name_desc",  label: "Z → A"                },
  { key: "most_sold",  label: "Más vendido"           },
];

/* ─── Active filters ────────────────────────────────────────────────── */

export interface ActiveFilters {
  search:     string;
  categories: string[];   // slugs de CatalogCategory
  colors:     string[];   // slugs de CatalogColor
  priceMin:   number;
  priceMax:   number;
  sort:       SortKey;
}