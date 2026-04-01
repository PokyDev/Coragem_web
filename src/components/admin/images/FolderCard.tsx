"use client";

/**
 * src/components/admin/images/FolderCard.tsx
 *
 * Tarjeta de carpeta navegable dentro del browser de Cloudinary.
 * Al hacer click llama a onNavigate con el path completo de la carpeta.
 *
 * Si el nombre de la carpeta coincide con una entrada conocida en
 * folderMeta (meses, categorías de joyería), se muestra un ícono y
 * color de acento específicos. Las carpetas no reconocidas reciben el
 * estilo neutro genérico de carpeta.
 */

import type { CloudinaryFolder } from "@/hooks/admin/useCloudinaryBrowser";
import { getFolderMeta }         from "@/lib/folderMeta";
import styles from "./FolderCard.module.css";

interface FolderCardProps {
  folder:     CloudinaryFolder;
  index:      number;
  onNavigate: (path: string) => void;
}

export function FolderCard({ folder, index, onNavigate }: FolderCardProps) {
  const meta    = getFolderMeta(folder.name);
  const hasTheme = Boolean(meta.accentColor);

  return (
    <button
      className={`${styles.card} ${hasTheme ? styles.cardThemed : ""}`}
      style={{
        animationDelay: `${index * 0.04}s`,
        ...(hasTheme ? {
          "--folder-accent" : meta.accentColor,
          "--folder-bg"     : meta.bgColor,
        } as React.CSSProperties : {}),
      }}
      onClick={() => onNavigate(folder.path)}
      type="button"
      aria-label={`Abrir carpeta ${folder.name}`}
    >
      {/* Área del ícono */}
      <div className={styles.iconArea}>
        {meta.icon ? (
          /* Ícono temático — tamaño fijo, hereda color de la variable CSS */
          <span className={styles.themedIcon} aria-hidden="true">
            {meta.icon}
          </span>
        ) : (
          /* Ícono genérico de carpeta */
          <svg
            className={styles.folderIcon}
            width="52"
            height="52"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        )}

        {/* Flecha de navegación */}
        <svg
          className={styles.arrowIcon}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>

      {/* Info */}
      <div className={styles.info}>
        <p className={styles.name} title={folder.name}>
          {folder.name}
        </p>
        <p className={styles.path} title={folder.path}>
          {folder.path}
        </p>
      </div>
    </button>
  );
}