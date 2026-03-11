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
import type { ProductRow, ProductFormData, ProductFormErrors } from "@/types/admin";

/* ─── Initial state ─────────────────────────────────────────────── */

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

/* ─── Validation ────────────────────────────────────────────────── */

function validate(data: ProductFormData, isEdit: boolean): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (!data.name.trim())           errors.name     = "El nombre es obligatorio";
  if (!data.price)                 errors.price    = "El precio es obligatorio";
  else if (Number(data.price) < 0) errors.price    = "El precio no puede ser negativo";
  if (!data.stock)                 errors.stock    = "El stock es obligatorio";
  else if (Number(data.stock) < 0) errors.stock    = "El stock no puede ser negativo";
  if (!data.category)              errors.category = "Selecciona una categoría";
  if (!data.color)                 errors.color    = "Selecciona un color";
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
  }, []);

  const handleImageClick        = useCallback(() => { fileInputRef.current?.click(); }, []);
  const handleFileInputChange   = useCallback((e: ChangeEvent<HTMLInputElement>) => {
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

  /* ── Submit simulado ── */
  const handleSubmit = useCallback(async (): Promise<boolean> => {
    const validationErrors = validate(formData, isEdit);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }
    setIsSubmitting(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    return true;
  }, [formData, isEdit]);

  const handleCancel = useCallback(() => { onClose(); }, [onClose]);

  return {
    formData, errors, imagePreview, isDragging, isSubmitting, isEdit,
    fileInputRef,
    handleFieldChange, handleImageClick, handleFileInputChange,
    handleDragEnter, handleDragLeave, handleDragOver, handleDrop,
    handleRemoveImage, handleSubmit, handleCancel,
  };
}