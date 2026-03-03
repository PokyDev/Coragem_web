# Coragem ✦ Bisutería en Rodio

Coragem es una marca de bisutería elaborada en rodio, dirigida por una joven emprendedora colombiana que busca expandir su negocio más allá de los canales informales y llevar sus productos a un público masivo a través de internet.

Este repositorio contiene la plataforma web oficial de Coragem: un catálogo digital donde la propietaria puede gestionar sus productos de forma autónoma y los clientes pueden explorar el inventario disponible, conocer los precios y contactar directamente con la marca.

---

## ¿Qué hace esta plataforma?

- Muestra el catálogo de productos con stock disponible en tiempo real
- Permite buscar y filtrar por categorías (collares, anillos, aretes, manillas)
- Incluye páginas de contacto y política de garantía
- Cuenta con un panel administrativo privado para que la propietaria gestione productos, imágenes e inventario sin necesidad de conocimientos técnicos

---

<div align="center">

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js + TypeScript + React |
| Estilos | CSS Modules |
| Backend | Node.js + Fastify |
| Base de datos | PostgreSQL (Neon) + Prisma |
| Imágenes | Cloudinary |
| Deploy | Vercel (frontend) + AWS EC2 (backend) |

</div>

---

## Estado del proyecto

🚧 **En desarrollo activo — Fase 2: Panel Administrativo**

---

## Fases de desarrollo

### ✅ Fase 1 — Interfaz pública (completada)

Se diseñó e implementó la experiencia completa del usuario visitante, con énfasis en diseño responsivo, consistencia visual y rendimiento.

**Páginas implementadas:**

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page con productos destacados y CTA al catálogo |
| `/catalog` | Catálogo con filtros por categoría, búsqueda y ordenamiento |
| `/contact` | Perfil de contacto con redes sociales (Instagram, WhatsApp) |

**Componentes destacados:**
- `LandingHeader` — encabezado con pills de navegación responsivos
- `ProductsGrid` / `CatalogGrid` — grillas de productos compartiendo lógica reutilizable
- `CatalogAside` — sidebar de filtros con sliders de precio debounced
- `MobileFilterDrawer` — drawer de filtros para móvil con memoización y debounce
- `ProductModal` — modal de detalle con panel de zoom (animación slide en desktop)
- `ProductMobileSheet` — bottom sheet para móvil (≤400px) con swipe-to-dismiss y layout 50/50
- `FloatingControls`, `ScrollToTop`, `BrandIcon`, `ThemeToggle` — controles globales modulares
- Ribbon "Sin Stock" — componente reutilizable compartido entre grillas y modal

**Decisiones técnicas clave:**
- CSS-only hover/active states para evitar estados stuck tras re-renders de React
- `blur()` en handlers de click para prevenir estados `:focus-visible` persistentes en móvil
- `useRef` para preservar la URL de imagen durante transiciones fade-out y evitar cortes de animación
- Hook `useDebouncedPrice` + `React.memo` + `useCallback` estables para optimizar el drawer móvil
- Patrón de variantes con objeto `CONFIG` para componentes reutilizables (ej. `LoadMoreButton`)
- Breakpoint de menú móvil en ≤1250px; footer responsivo en ≤750px; bottom sheet en ≤400px
- Soporte completo de tema claro/oscuro en todos los componentes

---

### 🔄 Fase 2 — Panel administrativo (en curso)

Diseño e implementación de las vistas privadas para la gestión autónoma del catálogo por parte de la propietaria.

**Páginas a implementar:**

| Ruta | Tipo | Descripción |
|------|------|-------------|
| `/admin` | Protected | Login de la propietaria |
| `/admin/dashboard` | Protected | Listado de todos los productos con acciones rápidas |
| `/admin/products/new` | Protected | Formulario de creación de producto |
| `/admin/products/[id]/edit` | Protected | Formulario de edición con gestión de imágenes |

**Funcionalidades previstas:**
- `RF-09` Autenticación con usuario y contraseña (JWT en cookies HttpOnly)
- `RF-10` Cierre de sesión con invalidación de token
- `RF-11` Creación de productos con nombre, descripción, precio, categoría, stock e imágenes
- `RF-12` Edición completa de cualquier campo de un producto existente
- `RF-13` Eliminación de productos con confirmación previa
- `RF-14` Gestión de stock individual con ocultamiento automático al llegar a cero
- `RF-15` Subida, reordenamiento y eliminación de imágenes por producto
- `RF-16` Listado administrativo con todos los productos (incluidos sin stock)

---

### ⏳ Fases pendientes

**Fase 3 — Backend y base de datos**
Configurar Fastify + Prisma + Neon, definir el esquema de base de datos, implementar endpoints CRUD y autenticación JWT.

**Fase 4 — Editor de imágenes**
Integrar Fabric.js en el panel admin para recorte, redimensionado y ajuste de encuadre antes de subir a Cloudinary.

**Fase 5 — Visual Enhancement**
Pulir SEO, optimizar rendimiento con SSG/ISR y explorar animaciones adicionales en la landing page.

**Fase 6 — Deploy y pruebas**
Configurar EC2 + Nginx + PM2 para el backend, conectar Vercel al repositorio, configurar DNS en Cloudflare y ejecutar pruebas de integración end-to-end.

---

## Estructura del proyecto

```
coragem-web/
├── app/
│   ├── (public)/
│   │   ├── page.tsx               # Landing page
│   │   ├── catalog/
│   │   │   └── page.tsx           # Catálogo
│   │   └── contact/
│   │       └── page.tsx           # Contacto
│   └── admin/                     # Panel administrativo (Fase 2)
│       ├── page.tsx               # Login
│       ├── dashboard/
│       └── products/
├── components/
│   ├── landing/
│   ├── catalog/
│   ├── product/
│   ├── ui/                        # Componentes globales reutilizables
│   └── admin/                     # Componentes del panel (Fase 2)
├── hooks/
├── lib/
└── public/
    └── images/
```

---

## Requerimientos no funcionales

| ID | Requisito |
|----|-----------|
| RNF-01 | Páginas públicas con carga < 3 segundos en conexiones estándar |
| RNF-02 | Páginas de catálogo y producto indexables por motores de búsqueda (SSR/SSG) |
| RNF-03 | Panel admin protegido con JWT en cookies HttpOnly; contraseñas con bcrypt (≥12 rondas) |
| RNF-04 | Disponibilidad objetivo ≥99% mensual con reinicio automático via PM2 |
| RNF-05 | Arquitectura desacoplada (frontend/backend) escalable de forma independiente |
| RNF-06 | Interfaz pública completamente responsiva (móvil, tablet y escritorio) |
| RNF-07 | Código con nomenclatura consistente, separación de responsabilidades y documentación en funciones críticas |
| RNF-08 | Backend desplegable en cualquier instancia Linux con Node.js 20+ via variables de entorno |
| RNF-09 | Sin recopilación de datos personales ni cookies de seguimiento en la versión inicial |