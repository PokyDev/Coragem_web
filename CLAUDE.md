# CLAUDE.md — Bisutería Rodio Frontend

## Contexto del proyecto

Frontend de la tienda en línea **Coragem**, una marca de bisutería bañada en rodio. El proyecto está en producción, desplegado en **Vercel** vía GitHub Actions. El backend es un servidor **Node.js + Fastify** que expone una REST API.

---

## Stack tecnológico

| Aspecto | Tecnología |
|---|---|
| Framework | Next.js 16 con App Router |
| Lenguaje | TypeScript 5 (strict mode) |
| Estilos | Tailwind CSS v4 + CSS Modules + CSS Custom Properties |
| Componentes UI | Radix-UI + shadcn (new-york style) + Lucide icons |
| Estado | React Hooks (`useState`, `useCallback`) + caché a nivel de módulo |
| Fetching | Cliente HTTP custom (`src/lib/api.ts`) con credentials |
| Tema | next-themes (light/dark) + tokens CSS en `globals.css` |
| Imágenes | Next.js Image + Cloudinary CDN |
| Visualizaciones | Recharts |
| PDF/QR | jspdf, pdf-lib, qr-code-styling |
| Alerts/Modales | SweetAlert2 |
| Canvas/3D | Three.js, Fabric.js |
| Despliegue | Vercel (frontend), backend separado en AWS EC2 |

---

## Estructura del proyecto

```
app/
  (public)/          # Rutas públicas (landing, catálogo, contacto)
  (admin)/           # Panel de administración protegido por AdminGuard
  layout.tsx         # Fuentes: Cormorant Garamond + Jost
  globals.css        # Tokens de color de marca (--coragem-teal, --coragem-pink, etc.)
  providers.tsx      # ThemeProvider de next-themes

src/
  components/
    admin/           # Componentes del panel admin
    layout/          # Navbar, Footer, FloatingControls, SlideMenu (públicos)
    user/            # Catálogo, landing, contacto
    shared/          # ProductModal, ProductMobileSheet, UI reutilizable
  hooks/
    admin/           # Hooks de autenticación, productos, categorías, Cloudinary, dashboard
    shared/          # useCatalog, useProducts, useProductSearch
    user/            # useDebouncedPrice
  lib/
    api.ts           # Cliente HTTP tipado (get, post, put, patch, delete)
    config.ts        # URLs sociales (Instagram, WhatsApp)
    dashboard.ts     # Utilidades: toProductRow, getStockStatus, computeStats
    folderMeta.tsx   # Metadatos de carpetas Cloudinary (emojis/iconos)
  types/
    admin.ts         # PatternLock, estados auth, formulario de producto, umbrales de stock
    catalog.ts       # Product, Category, Color, opciones de filtro

lib/
  utils.ts           # cn() = clsx + tailwind-merge
```

---

## Rutas

### Públicas
- `/` — Landing con hero y productos destacados
- `/products` — Catálogo completo con filtros y búsqueda
- `/contact` — Información de contacto y redes sociales
- `/admin/auth/callback` — Callback de OAuth

### Admin (protegidas por `AdminGuard`)
- `/admin` — Login (pattern lock + Google OAuth)
- `/admin/dashboard` — Vista general (stats, top productos, QR)
- `/admin/dashboard/products` — Listado de productos
- `/admin/dashboard/products/new` — Crear producto
- `/admin/dashboard/products/[id]` — Editar producto
- `/admin/dashboard/categories` — Gestión de categorías y colores
- `/admin/dashboard/images` — Navegador de Cloudinary
- `/admin/dashboard/inventory` — Control de stock
- `/admin/dashboard/settings` — Configuración

---

## Variables de entorno

```env
NEXT_PUBLIC_API_URL=http://localhost:3001       # URL del backend
NEXT_PUBLIC_INSTAGRAM_URL=...                   # Perfil de Instagram
NEXT_PUBLIC_WHATSAPP_NUMBER=573166054031
NEXT_PUBLIC_WHATSAPP_BASE_URL=https://wa.me
```

---

## Patrones clave

### Cliente HTTP (`src/lib/api.ts`)
- Todas las llamadas al backend pasan por `api.get<T>()`, `api.post<T>()`, etc.
- Siempre incluye cookies (`credentials: 'include'`).
- Retorna `ApiResponse<T>` con manejo consistente de errores en español.
- Soporta estado 429 con campo `retryAfter`.

### Gestión de estado
- **Sin Redux ni Zustand.** Estado local con `useState` + `useCallback`.
- **Caché a nivel de módulo:** `useCatalog` expone `catalogCache` (singleton) para categorías y colores; se invalida explícitamente desde los hooks de mutación.
- **Hooks de dominio:** cada entidad tiene sus propios hooks (`useProductForm`, `useCategoryActions`, `useColorActions`, `useCloudinaryBrowser`, etc.).
- **Filtrado client-side:** productos cargados una sola vez, filtrados/ordenados en el navegador.

### Autenticación admin
- Sesión por cookies HttpOnly.
- `AdminGuard` verifica sesión en mount, redirige a `/admin` si no hay sesión.
- Login: pattern lock de 9 puntos o Google OAuth.

### Estilos
- Variables de diseño en `globals.css` (`--coragem-teal: #4ec4c4`, `--coragem-pink: #c47a9e`, etc.).
- Combinación de Tailwind utilities + CSS Modules para estilos complejos.
- `cn()` para clases condicionales.
- Panel admin tiene su propio `AdminThemeProvider` independiente del tema público.

### Stock
- `getStockStatus()` clasifica: `"ok"` (>3), `"low"` (≤3), `"out"` (0).
- Productos con stock 0 se ocultan automáticamente del catálogo público.

---

## Convenciones

- Path alias `@/*` apunta a `src/*`.
- Componentes Server para layouts, Client (`"use client"`) para interactividad.
- Props siempre tipadas con interfaces TypeScript.
- Validación de formularios integrada en los hooks (sin librería externa).
- Imágenes de productos en Cloudinary; el browser de Cloudinary está integrado en el admin.
- Fuentes del proyecto: **Cormorant Garamond** (display) y **Jost** (cuerpo).

---

## Integración con el backend

El backend (Node.js + Fastify) corre separado. Los endpoints públicos no requieren auth; los de `/api/admin/*` requieren sesión válida. El frontend nunca expone secretos: toda la lógica sensible (Cloudinary upload signing, OAuth secrets, DB) está en el backend.

---

## Despliegue

- **Vercel** conectado al repositorio de GitHub (rama `main`).
- Los pushes a `main` disparan despliegue automático.
- Variables de entorno de producción configuradas en el panel de Vercel.
