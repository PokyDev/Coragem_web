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
 *       new  → POST  /api/admin/products       (multipart/form-data)
 *
 * ── Manejo de imágenes ────────────────────────────────────────────────
 *
 * HEIF/HEIC — preview:
 *   Chrome y Firefox no tienen codec nativo para HEIF, por lo que
 *   URL.createObjectURL() no genera un preview visible. En lugar de
 *   convertir con heic2any (bloqueante en el hilo principal, tarda 3-8 s
 *   en móvil), se muestra un placeholder de "HEIF — se enviará al servidor"
 *   de forma instantánea. El archivo original se sube al backend sin modificar
 *   ya que el servidor acepta y convierte HEIC/HEIF via Cloudinary.
 *
 * HEIF/HEIC — subida:
 *   El archivo original se envía tal cual en FormData. El backend maneja
 *   la conversión en Cloudinary con fetch_format: 'auto'.
 *
 * Android Content URI (Google Fotos, Google Drive, etc.):
 *   En Android, los File objects provenientes de proveedores externos son
 *   Content URIs resueltos de forma lazy. Si el stream se cierra antes del
 *   submit (el usuario tarda, navega dentro de la SPA, o heic2any tarda demasiado
 *   y el proveedor revoca el permiso), el fetch lanza TypeError sin que el backend
 *   lo vea siquiera.
 *
 *   La solución es materializeFile(): lee el contenido completo como ArrayBuffer
 *   en el momento de la selección, con un timeout de 15 s para detectar Content
 *   URIs colgados. El File resultante vive en la memoria del proceso y puede
 *   enviarse en cualquier momento posterior.
 *
 *   El timeout de 15 s es generoso para archivos grandes (hasta ~10 MB en móvil
 *   con conexión lenta a Drive), pero lo suficientemente corto para no dejar
 *   al usuario esperando indefinidamente si el proveedor no responde.
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

/* ─── Helper: detectar HEIF ─────────────────────────────────────── */

function isHeifFile(file: File): boolean {
  return (
    file.type === "image/heif" ||
    file.type === "image/heic" ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name)
  );
}

/* ─── Helper: materializar archivo en memoria con timeout ───────────
 *
 * Lee el contenido completo del archivo como ArrayBuffer de forma inmediata,
 * produciendo un File estable en la memoria del proceso que no depende del
 * Content URI original de Android.
 *
 * El timeout de MATERIALIZE_TIMEOUT_MS detecta Content URIs de proveedores
 * externos (Drive, Fotos) que no responden — en ese caso se rechaza la promesa
 * con un error descriptivo que se muestra al usuario.
 *
 * Sin este timeout, arrayBuffer() puede quedar pendiente indefinidamente en
 * ciertos dispositivos Android, lo que provoca que el submit posterior falle
 * con TypeError ("Failed to fetch") sin que el backend lo vea.
 * ─────────────────────────────────────────────────────────────── */

const MATERIALIZE_TIMEOUT_MS = 15_000;

async function materializeFile(file: File): Promise<File> {
  const bufferPromise = file.arrayBuffer();

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error("TIMEOUT")),
      MATERIALIZE_TIMEOUT_MS,
    )
  );

  const buffer = await Promise.race([bufferPromise, timeoutPromise]);
  const type   = file.type || "application/octet-stream";
  const blob   = new Blob([buffer], { type });
  return new File([blob], file.name, { type });
}

/* ─── Helper: genera URL de preview o señal de placeholder ─────────
 *
 * Para HEIF/HEIC devuelve null de forma instantánea — el componente
 * mostrará un placeholder estático que indica que el archivo fue
 * seleccionado y se enviará al servidor.
 *
 * Razón para no usar heic2any en el preview:
 *   La conversión ocurre en el hilo principal del navegador y puede
 *   tomar 3–8 segundos en un móvil mid-range, bloqueando la UI por
 *   completo. El backend ya convierte HEIC via Cloudinary, así que
 *   pagar ese coste en el cliente solo por el preview no tiene sentido.
 *
 * Para cualquier otro formato usa URL.createObjectURL() directamente.
 * ─────────────────────────────────────────────────────────────── */

function buildPreviewUrl(file: File): string | null {
  if (isHeifFile(file)) {
    // Retornar null → el componente renderiza el placeholder de HEIF
    return null;
  }
  return URL.createObjectURL(file);
}

/* ─── Constante de preview HEIF ─────────────────────────────────── */

/**
 * Valor especial que indica "hay un archivo HEIF seleccionado pero
 * no hay preview visual disponible". El componente ImageZone lo usa
 * para mostrar el estado correcto (archivo listo, no error).
 */
export const HEIF_PREVIEW_PLACEHOLDER = "__heif_placeholder__";

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
        setApiError(null);
      },
    []
  );

  /* ── Procesar archivo de imagen ── */
  const processImageFile = useCallback(async (file: File) => {
    // Rechazar si no es imagen (ni siquiera HEIF sin MIME type correcto)
    if (
      !file.type.startsWith("image/") &&
      !isHeifFile(file)
    ) return;

    try {
      // 1. Materializar el archivo en memoria de forma inmediata.
      //    Incluye timeout para detectar Content URIs de Android que no responden.
      //    Sin esto, arrayBuffer() puede quedar pendiente indefinidamente y el
      //    submit posterior lanzaría TypeError sin que el backend lo vea.
      const stableFile = await materializeFile(file);

      // 2. Guardar el File estable en el formulario. A partir de aquí,
      //    el Content URI original ya no se referencia.
      setFormData((prev) => ({ ...prev, image: stableFile }));

      // 3. Generar la URL de preview.
      //    Para HEIF devuelve null → se muestra el placeholder de forma instantánea.
      //    Para otros formatos genera un ObjectURL en el hilo principal (< 1 ms).
      const previewUrl = buildPreviewUrl(stableFile);
      setImagePreview(previewUrl ?? HEIF_PREVIEW_PLACEHOLDER);

      setErrors((prev) => {
        const next = { ...prev };
        delete next.image;
        return next;
      });
      setApiError(null);

    } catch (err: unknown) {
      const isTimeout =
        err instanceof Error && err.message === "TIMEOUT";

      setErrors((prev) => ({
        ...prev,
        image: isTimeout
          ? "El archivo tardó demasiado en cargarse. Intenta descargarlo primero y luego súbelo."
          : "No se pudo procesar la imagen. Intenta con JPG o PNG.",
      }));
    }
  }, []);

  const handleImageClick = useCallback(() => { fileInputRef.current?.click(); }, []);

  const handleFileInputChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processImageFile(file);
    // Resetear el input para permitir seleccionar el mismo archivo nuevamente
    e.target.value = "";
  }, [processImageFile]);

  const handleDragEnter = useCallback((e: DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true);  }, []);
  const handleDragLeave = useCallback((e: DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
  const handleDragOver  = useCallback((e: DragEvent) => { e.preventDefault(); e.stopPropagation(); }, []);

  const handleDrop = useCallback(async (e: DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processImageFile(file);
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
        const body = new FormData();
        body.append("name",     formData.name.trim());
        body.append("price",    formData.price);
        body.append("stock",    formData.stock);
        body.append("ventas",   formData.ventas || "0");
        body.append("category", formData.category);
        body.append("color",    formData.color);

        // Solo adjuntar imagen si el usuario seleccionó una nueva.
        // formData.image es un File estable en memoria — no un Content URI lazy.
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
      // formData.image es un File estable en memoria — seguro de enviar
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