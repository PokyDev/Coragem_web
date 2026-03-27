"use client";

/**
 * src/components/shared/ui/SearchInput.tsx
 *
 * Input de búsqueda reutilizable.
 * Variantes:
 *   - "catalog" → estilos del sitio público (tokens públicos)
 *   - "admin"   → estilos del panel admin (tokens Slate Command)
 *
 * Uso en catálogo:
 *   <SearchInput variant="catalog" {...inputProps} onClear={clearQuery} />
 *
 * Uso en dashboard admin:
 *   <SearchInput variant="admin" {...inputProps} onClear={clearQuery} />
 */

import styles from "./SearchInput.module.css";

interface SearchInputProps {
  variant:     "catalog" | "admin";
  value:       string;
  onChange:    (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear:     () => void;
  placeholder?: string;
  autoFocus?:  boolean;
}

export function SearchInput({
  variant,
  value,
  onChange,
  onClear,
  placeholder = "Buscar producto...",
  autoFocus   = false,
}: SearchInputProps) {
  return (
    <div className={`${styles.wrapper} ${styles[variant]}`}>
      {/* Icon */}
      <svg
        className={styles.icon}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        className={styles.input}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
        autoFocus={autoFocus}
        aria-label={placeholder}
      />

      {/* Clear button */}
      {value && (
        <button
          className={styles.clear}
          onClick={onClear}
          type="button"
          aria-label="Limpiar búsqueda"
          tabIndex={-1}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}