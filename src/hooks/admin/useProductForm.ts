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
 * Fix HEIF/HEIC:
 *   Los navegadores (Chrome, Firefox) no tienen codec nativo para HEIF,
 *   por lo que URL.createObjectURL() sobre un archivo .heif no genera un
 *   preview visible. Se convierte a JPEG solo para el preview usando heic2any
 *   (import dinámico para evitar problemas de SSR). El archivo original se
 *   manda al backend sin modificar, ya que el servidor tiene su propio fix
 *   para aceptar y subir HEIF a Cloudinary.
 *
 * Fix Android Content URI (Google Fotos, Google Drive, etc.):
 *   En Android, los File objects provenientes de proveedores externos
 *   (Google Fotos, Drive, Files) son Content URIs resueltos de forma lazy.
 *   Si el File no se lee completamente en el momento de selección, el fetch
 *   puede fallar con TypeError ("Failed to fetch") porque el proveedor cierra
 *   el stream antes del submit. materializeFile() lee el contenido completo
 *   como ArrayBuffer en el momento de selección y produce un Blob/File estable
 *   en memoria que puede enviarse en cualquier momento posterior.
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

/* ─── Helper: detectar HEIF ─────────────────────────────────────── */

function isHeifFile(file: File): boolean {
  return (
    file.type === "image/heif" ||
    file.type === "image/heic" ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name)
  );
}

/* ─── Helper: materializar archivo en memoria ────────────────────
 *
 * En Android, los File objects de proveedores externos (Google Fotos,
 * Google Drive, Samsung Files, etc.) son Content URIs cuyo contenido
 * se resuelve de forma lazy. Si el stream se cierra antes del submit
 * — lo cual ocurre cuando el usuario tarda en confirmar el formulario
 * o navega dentro de la SPA — el fetch lanza TypeError ("Failed to fetch")
 * porque el browser intenta leer el body en ese momento tardío.
 *
 * La solución es leer el contenido completo como ArrayBuffer en el momento
 * de la selección (aquí, síncronamente con la interacción del usuario) y
 * construir un nuevo File con ese buffer estable en memoria del proceso.
 * El File resultante no depende del proveedor externo y puede enviarse
 * en cualquier momento posterior sin riesgo de stream cerrado.
 *
 * Consideraciones:
 *   - El MIME type se preserva; si viene vacío (común en HEIF desde Windows/Linux)
 *     se usa "application/octet-stream" como fallback — el backend lo acepta.
 *   - El nombre del archivo se preserva para que FormData lo incluya correctamente.
 *   - Esta operación es O(tamaño del archivo) en memoria, lo cual es aceptable
 *     para imágenes de producto (típicamente < 10 MB, límite del multipart plugin).
 * ─────────────────────────────────────────────────────────────── */

async function materializeFile(file: File): Promise<File> {
  const buffer = await file.arrayBuffer();
  const type   = file.type || "application/octet-stream";
  const blob   = new Blob([buffer], { type });
  return new File([blob], file.name, { type });
}

/* ─── Helper: genera URL de preview compatible con el navegador ── */

/**
 * Genera un ObjectURL previsualizable para cualquier formato de imagen.
 * Para HEIF/HEIC convierte a JPEG primero usando heic2any (import dinámico),
 * ya que Chrome y Firefox no tienen decodificador nativo para ese formato.
 * El archivo pasado aquí ya fue materializado — es un File estable en memoria.
 *
 * Casos especiales:
 *   - Si heic2any lanza ERR_USER ("already browser readable"), el archivo tiene
 *     extensión .heif pero su contenido es realmente PNG/JPEG — se usa ObjectURL directo.
 *   - Si el MIME type viene vacío (común en algunos OS), la detección se hace
 *     solo por extensión via isHeifFile().
 */
async function buildPreviewUrl(file: File): Promise<string> {
  if (!isHeifFile(file)) {
    return URL.createObjectURL(file);
  }

  // Import dinámico: heic2any usa APIs de browser, no puede ejecutarse en SSR
  const heic2any = (await import("heic2any")).default;

  try {
    const converted = await heic2any({
      blob:    file,
      toType:  "image/jpeg",
      quality: 0.85,
    });

    // heic2any devuelve Blob | Blob[] si hay múltiples imágenes en el HEIF
    const blob = Array.isArray(converted) ? converted[0] : converted;
    return URL.createObjectURL(blob);

  } catch (err: unknown) {
    // ERR_USER significa que el archivo ya es legible por el navegador
    // (extensión .heif pero contenido real PNG/JPEG) — ObjectURL directo funciona
    const isAlreadyReadable =
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: number }).code === 1;

    if (isAlreadyReadable) {
      return URL.createObjectURL(file);
    }

    // Cualquier otro error de conversión es real — re-lanzar para que
    // processImageFile lo capture y muestre el mensaje de error al usuario
    throw err;
  }
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
      // 1. Materializar el archivo completo en memoria ANTES de cualquier otra
      //    operación. Esto resuelve el Content URI de Android de forma inmediata
      //    y produce un File estable que no depende del proveedor externo.
      //    Si el proveedor falla aquí (archivo no disponible, permisos revocados,
      //    etc.), el error se captura y se muestra al usuario en este momento,
      //    no más tarde durante el submit.
      const stableFile = await materializeFile(file);

      // 2. Guardar el File estable en el estado del formulario.
      //    El archivo original (Content URI) ya no se referencia.
      setFormData((prev) => ({ ...prev, image: stableFile }));

      // 3. Generar la URL de preview con el archivo ya materializado.
      //    Para HEIF convierte a JPEG primero (solo para el preview).
      const previewUrl = await buildPreviewUrl(stableFile);
      setImagePreview(previewUrl);

      setErrors((prev) => {
        const next = { ...prev };
        delete next.image;
        return next;
      });
      setApiError(null);

    } catch {
      setErrors((prev) => ({
        ...prev,
        image: "No se pudo procesar la imagen. Intenta con JPG o PNG.",
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
        // En este punto formData.image es ya un File estable en memoria
        // (materializado en processImageFile), no un Content URI lazy.
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