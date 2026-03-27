"use client";

/**
 * src/hooks/admin/useProductForm.ts
 *
 * Encapsula la lógica del formulario de producto:
 *   - Estado de campos (nombre, precio, stock, ventas, categoría, color)
 *   - Validación de campos obligatorios
 *   - Reset al abrir/cerrar modal
 *   - Modo "nuevo" vs "editar" según si se recibe un ProductRow
 *   - Integración con el backend vía JSON:
 *       new  → POST  /api/admin/products
 *       edit → PATCH /api/admin/products/:id
 *
 * Nota: la subida de imágenes está suspendida temporalmente.
 * Los productos nuevos se crean sin imagen; al editar se conserva la existente.
 */

import {
  useState,
  useCallback,
  useEffect,
  type ChangeEvent,
} from "react";
import { api } from "@/lib/api";
import type { ProductRow, ProductFormData, ProductFormErrors } from "@/types/admin";

/* ─── Tipos de respuesta ────────────────────────────────────────── */

interface ProductPayload {
  id:        string;
  name:      string;
  price:     number;
  category:  string;
  color:     string;
  stock:     number;
  ventas:    number;
  isVisible: boolean;
  images: Array<{
    id:     string;
    url:    string;
    order:  number;
    width:  number | null;
    height: number | null;
  }>;
}

interface SaveProductResponse {
  product: ProductPayload;
}

/* ─── Estado inicial ────────────────────────────────────────────── */

const EMPTY_FORM: ProductFormData = {
  name:     "",
  price:    "",
  stock:    "",
  ventas:   "",
  category: "",
  color:    "",
};

function productRowToFormData(product: ProductRow): ProductFormData {
  return {
    name:     product.name,
    price:    String(product.price),
    stock:    String(product.stock),
    ventas:   String(product.ventas),
    category: product.category,
    color:    product.color,
  };
}

/* ─── Validación ────────────────────────────────────────────────── */

function validate(data: ProductFormData): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (!data.name.trim())           errors.name     = "El nombre es obligatorio";
  if (!data.price)                 errors.price    = "El precio es obligatorio";
  else if (Number(data.price) < 0) errors.price    = "El precio no puede ser negativo";
  if (!data.stock)                 errors.stock    = "El stock es obligatorio";
  else if (Number(data.stock) < 0) errors.stock    = "El stock no puede ser negativo";
  if (!data.category)              errors.category = "Selecciona una categoría";
  if (!data.color)                 errors.color    = "Selecciona un color";

  return errors;
}

/* ─── Hook ──────────────────────────────────────────────────────── */

interface UseProductFormOptions {
  product: ProductRow | null;
  onClose: () => void;
}

export function useProductForm({ product, onClose }: UseProductFormOptions) {
  const isEdit = product !== null;

  const [formData,     setFormData]     = useState<ProductFormData>(EMPTY_FORM);
  const [errors,       setErrors]       = useState<ProductFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError,     setApiError]     = useState<string | null>(null);

  /* ── Inicializar al abrir el modal ── */
  useEffect(() => {
    setFormData(product ? productRowToFormData(product) : EMPTY_FORM);
    setErrors({});
    setApiError(null);
    setIsSubmitting(false);
  }, [product]);

  /* ── Campo genérico ── */
  const handleFieldChange = useCallback(
    (field: keyof ProductFormData) =>
      (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => {
          if (!prev[field as keyof ProductFormErrors]) return prev;
          const next = { ...prev };
          delete next[field as keyof ProductFormErrors];
          return next;
        });
        setApiError(null);
      },
    []
  );

  /* ── Submit ── */
  const handleSubmit = useCallback(async (): Promise<boolean> => {
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const payload = {
        name:     formData.name.trim(),
        price:    Number(formData.price),
        stock:    Number(formData.stock),
        ventas:   Number(formData.ventas || "0"),
        category: formData.category,
        color:    formData.color,
      };

      const res = isEdit && product
        ? await api.patch<SaveProductResponse>(`/api/admin/products/${product.id}`, payload)
        : await api.post<SaveProductResponse>("/api/admin/products", payload);

      if (res.error || !res.data) {
        setApiError(res.error ?? "Error al guardar el producto");
        return false;
      }

      return true;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isEdit, product]);

  const handleCancel = useCallback(() => { onClose(); }, [onClose]);

  return {
    formData,
    errors,
    isSubmitting,
    isEdit,
    apiError,
    handleFieldChange,
    handleSubmit,
    handleCancel,
  };
}