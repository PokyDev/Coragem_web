"use client";

/**
 * src/components/admin/images/FolderBreadcrumb.tsx
 *
 * Breadcrumb de navegación para el browser de carpetas de Cloudinary.
 *
 * Dado currentPath = "coragem/products" renderiza:
 *   Home / coragem / products
 *
 * Los segmentos anteriores al actual son clicables y navegan a ese path.
 * El segmento actual no es clicable.
 */

import styles from './FolderBreadcrumb.module.css';

interface FolderBreadcrumbProps {
  currentPath: string;
  onNavigate:  (path: string) => void;
}

interface Segment {
  label: string;
  /** Path completo hasta este segmento. Vacío = raíz. */
  path:  string;
}

function buildSegments(currentPath: string): Segment[] {
  const root: Segment = { label: 'Home', path: '' };
  if (!currentPath) return [root];

  const parts = currentPath.split('/');
  const segments: Segment[] = [root];

  parts.forEach((part, i) => {
    segments.push({
      label: part,
      path:  parts.slice(0, i + 1).join('/'),
    });
  });

  return segments;
}

export function FolderBreadcrumb({ currentPath, onNavigate }: FolderBreadcrumbProps) {
  const segments = buildSegments(currentPath);

  return (
    <nav className={styles.breadcrumb} aria-label="Ubicación actual">
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;

        return (
          <span key={seg.path || 'root'} className={styles.segment}>
            {i > 0 && <span className={styles.separator}>/</span>}

            {isLast ? (
              <span className={styles.segmentCurrent} aria-current="page">
                {seg.label}
              </span>
            ) : (
              <button
                className={styles.segmentBtn}
                onClick={() => onNavigate(seg.path)}
                type="button"
              >
                {seg.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}