"use client";

/**
 * src/hooks/admin/useProductForm.ts
 *
 * Encapsula toda la lógica del formulario de producto:
 *   - Estado de campos (nombre, precio, stock, ventas, categoría, color, imagen)
 *   - Validación de campos obligatorios
 *   - Drag & drop de imagen
 *   - Reset al abrir/cerrar modal
 *   - Modo "nuevo" vs "editar" según si se recibe un ProductRow
 *   - Integración con el backend:
 *       edit → PATCH /api/admin/products/:id  (multipart/form-data)
 *       new  → POST  /api/admin/products       (pendiente de implementación)
 *
 * No contiene UI — solo estado y handlers.
 */

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { api }  from "@/lib/api";
import type { ProductRow, ProductFormData, ProductFormErrors } from "@/types/admin";

/* ─── Tipos de respuesta del backend ────────────────────────────── */

interface PatchProductResponse {
  product: {
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
  };
}

/* ─── Estado inicial ────────────────────────────────────────────── */

const EMPTY_FORM: ProductFormData = {
  name:     "",
  price:    "",
  stock:    "",
  ventas:   "",
  category: "",
  color:    "",
  image:    null,
};

function productRowToFormData(product: ProductRow): ProductFormData {
  return {
    name:     product.name,
    price:    String(product.price),
    stock:    String(product.stock),
    ventas:   String(product.ventas),
    category: product.category,
    color:    product.color,
    image:    null,
  };
}

/* ─── Validación ────────────────────────────────────────────────── */

function validate(data: ProductFormData, isEdit: boolean): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (!data.name.trim())           errors.name     = "El nombre es obligatorio";
  if (!data.price)                 errors.price    = "El precio es obligatorio";
  else if (Number(data.price) < 0) errors.price    = "El precio no puede ser negativo";
  if (!data.stock)                 errors.stock    = "El stock es obligatorio";
  else if (Number(data.stock) < 0) errors.stock    = "El stock no puede ser negativo";
  if (!data.category)              errors.category = "Selecciona una categoría";
  if (!data.color)                 errors.color    = "Selecciona un color";

  // En modo "nuevo" la imagen es obligatoria.
  // En modo "editar" es opcional: si no se sube una nueva se conserva la existente.
  if (!isEdit && !data.image)      errors.image    = "Agrega una imagen al producto";

  return errors;
}

/* ─── Hook ──────────────────────────────────────────────────────── */

interface UseProductFormOptions {
  product: ProductRow | null; // null = modo "nuevo"
  onClose: () => void;
}

export function useProductForm({ product, onClose }: UseProductFormOptions) {
  const isEdit = product !== null;

  const [formData,     setFormData]     = useState<ProductFormData>(EMPTY_FORM);
  const [errors,       setErrors]       = useState<ProductFormErrors>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging,   setIsDragging]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError,     setApiError]     = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Inicializar al abrir el modal ── */
  useEffect(() => {
    if (product) {
      setFormData(productRowToFormData(product));
      setImagePreview(product.images[0]?.url ?? null);
    } else {
      setFormData(EMPTY_FORM);
      setImagePreview(null);
    }
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
        // Limpiar error de API al editar cualquier campo
        setApiError(null);
      },
    []
  );

  /* ── Procesar archivo de imagen ── */
  const processImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setFormData((prev) => ({ ...prev, image: file }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.image;
      return next;
    });
    setApiError(null);
  }, []);

  const handleImageClick = useCallback(() => { fileInputRef.current?.click(); }, []);

  const handleFileInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
    e.target.value = "";
  }, [processImageFile]);

  const handleDragEnter = useCallback((e: DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true);  }, []);
  const handleDragLeave = useCallback((e: DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
  const handleDragOver  = useCallback((e: DragEvent) => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleDrop      = useCallback((e: DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  }, [processImageFile]);

  const handleRemoveImage = useCallback(() => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: null }));
  }, []);

  /* ── Submit real ── */
  const handleSubmit = useCallback(async (): Promise<boolean> => {
    // 1. Validación local
    const validationErrors = validate(formData, isEdit);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      if (isEdit && product) {
        // ── Modo editar: PATCH /api/admin/products/:id ────────────
        //
        // El backend espera multipart/form-data. Solo se envían los
        // campos que el usuario puede haber modificado. La imagen es
        // opcional: si no se seleccionó una nueva, se conserva la actual.
        const body = new FormData();
        body.append("name",     formData.name.trim());
        body.append("price",    formData.price);
        body.append("stock",    formData.stock);
        body.append("ventas",   formData.ventas || "0");
        body.append("category", formData.category);
        body.append("color",    formData.color);

        // Solo adjuntar imagen si el usuario seleccionó una nueva
        if (formData.image) {
          body.append("image", formData.image);
        }

        const res = await api.multipart<PatchProductResponse>(
          `/api/admin/products/${product.id}`,
          "PATCH",
          body,
        );

        if (res.error || !res.data) {
          setApiError(res.error ?? "Error al guardar el producto");
          return false;
        }

        return true;
      }

      // ── Modo nuevo: POST /api/admin/products ──────────────────
      const body = new FormData();
      body.append("name",     formData.name.trim());
      body.append("price",    formData.price);
      body.append("stock",    formData.stock);
      body.append("ventas",   formData.ventas || "0");
      body.append("category", formData.category);
      body.append("color",    formData.color);
      body.append("image",    formData.image!);

      const res = await api.multipart<{ product: PatchProductResponse["product"] }>(
        "/api/admin/products",
        "POST",
        body,
      );

      if (res.error || !res.data) {
        setApiError(res.error ?? "Error al crear el producto");
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
    imagePreview,
    isDragging,
    isSubmitting,
    isEdit,
    apiError,
    fileInputRef,
    handleFieldChange,
    handleImageClick,
    handleFileInputChange,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleRemoveImage,
    handleSubmit,
    handleCancel,
  };
}