"use client";

/**
 * src/components/admin/images/FolderBreadcrumb.tsx
 *
 * Breadcrumb de navegación + drop targets en cada segmento.
 *
 * Dado currentPath = "coragem/products" renderiza:
 *   Home / coragem / products
 *
 * Cada segmento anterior al actual es clicable y es un drop target:
 * arrastrar assets sobre él los mueve a ese path.
 */

import { DropFolderTarget } from "./DropFolderTarget";
import styles from './FolderBreadcrumb.module.css';

interface FolderBreadcrumbProps {
  currentPath: string;
  onNavigate:  (path: string) => void;
  /** Si se pasa, cada segmento actúa como drop target */
  onDrop?:     (publicIds: string[], targetPath: string) => void;
  /** publicId que está siendo procesado en un move activo */
  droppingTo?: string | null;
}

interface Segment {
  label: string;
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

export function FolderBreadcrumb({
  currentPath,
  onNavigate,
  onDrop,
  droppingTo,
}: FolderBreadcrumbProps) {
  const segments = buildSegments(currentPath);

  return (
    <nav className={styles.breadcrumb} aria-label="Ubicación actual">
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;

        const segmentContent = (
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

        /* Los segmentos anteriores al actual son drop targets */
        if (!isLast && onDrop) {
          return (
            <DropFolderTarget
              key={seg.path || 'root'}
              targetPath={seg.path}
              onDrop={onDrop}
              isDropping={droppingTo === seg.path}
            >
              {segmentContent}
            </DropFolderTarget>
          );
        }

        return segmentContent;
      })}
    </nav>
  );
}