/**
 * src/lib/dashboard.ts
 *
 * Utilidades de datos para el dashboard administrativo.
 * Transforman los productos de la API en las entidades tipadas
 * que consumen los componentes del dashboard.
 */

import type { Product }      from "@/types/catalog";
import type { DashboardStats, ProductRow, StockStatus } from "@/types/admin";
import { STOCK_THRESHOLDS }  from "@/types/admin";

/**
 * Clasifica el estado de stock de un producto.
 */
export function getStockStatus(stock: number): StockStatus {
  if (stock === 0)                   return "out";
  if (stock <= STOCK_THRESHOLDS.LOW) return "low";
  return "ok";
}

/**
 * Convierte un Product del catálogo en un ProductRow del dashboard,
 * añadiendo el campo stockStatus calculado.
 */
export function toProductRow(product: Product): ProductRow {
  return {
    id:          product.id,
    name:        product.name,
    category:    product.category,
    color:       product.color,
    price:       product.price,
    stock:       product.stock,
    stockStatus: getStockStatus(product.stock),
    ventas:      product.ventas,
    images:      product.images,
    isVisible:   product.stock > 0,
  };
}

/**
 * Calcula las estadísticas globales de inventario.
 */
export function computeStats(products: Product[]): DashboardStats {
  let inStock  = 0;
  let lowStock = 0;
  let outStock = 0;

  for (const p of products) {
    const status = getStockStatus(p.stock);
    if (status === "ok")  inStock++;
    if (status === "low") lowStock++;
    if (status === "out") outStock++;
  }

  return { total: products.length, inStock, lowStock, outStock };
}

/**
 * Filtra y convierte los productos según la query de búsqueda.
 * Compara contra nombre y nombre de categoría.
 */
export function filterProductRows(products: Product[], query: string): ProductRow[] {
  const q = query.trim().toLowerCase();
  return products
    .filter((p) => {
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.name.toLowerCase().includes(q)
      );
    })
    .map(toProductRow);
}