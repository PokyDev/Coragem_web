"use client";

/**
 * src/hooks/admin/products/useProductForm.ts
 *
 * Encapsula la lógica del formulario de producto.
 * Categorías y colores se reciben como prop (ya fetchados por useCatalog)
 * en lugar de leerlos desde JSON estáticos.
 *
 * Campos del form:
 *   categoryId / colorId → IDs de cuid que coinciden con las entidades
 *   de la API, enviados directamente al backend.
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
  category:  { id: string; name: string; slug: string };
  color:     { id: string; name: string; slug: string; hex: string };
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
  name:          "",
  price:         "",
  stock:         "",
  ventas:        "",
  categoryId:    "",
  colorId:       "",
  imageUrl:      "",
  imagePublicId: "",
};

function productRowToFormData(product: ProductRow): ProductFormData {
  return {
    name:          product.name,
    price:         String(product.price),
    stock:         String(product.stock),
    ventas:        String(product.ventas),
    categoryId:    product.category.id,
    colorId:       product.color.id,
    imageUrl:      product.images[0]?.url ?? "",
    imagePublicId: "",
  };
}

/* ─── Validación ────────────────────────────────────────────────── */

function validate(data: ProductFormData): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (!data.name.trim())           errors.name       = "El nombre es obligatorio";
  if (!data.price)                 errors.price      = "El precio es obligatorio";
  else if (Number(data.price) < 0) errors.price      = "El precio no puede ser negativo";
  if (!data.stock)                 errors.stock      = "El stock es obligatorio";
  else if (Number(data.stock) < 0) errors.stock      = "El stock no puede ser negativo";
  if (!data.categoryId)            errors.categoryId = "Selecciona una categoría";
  if (!data.colorId)               errors.colorId    = "Selecciona un color";

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

  /* ── Imagen desde ImagePickerModal ── */
  const handleImageSelect = useCallback((url: string, publicId: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url, imagePublicId: publicId }));
    setApiError(null);
  }, []);

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
      const hasNewImage = Boolean(formData.imageUrl && formData.imagePublicId);

      const basePayload = {
        name:       formData.name.trim(),
        price:      Number(formData.price),
        stock:      Number(formData.stock),
        ventas:     Number(formData.ventas || "0"),
        categoryId: formData.categoryId,
        colorId:    formData.colorId,
      };

      const payload = hasNewImage
        ? { ...basePayload, imageUrl: formData.imageUrl, imagePublicId: formData.imagePublicId }
        : basePayload;

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
    handleImageSelect,
    handleSubmit,
    handleCancel,
  };
}