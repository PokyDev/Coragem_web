"use client";

/**
 * src/components/admin/ui/DevelopmentState.tsx
 *
 * Componente de estado placeholder para páginas del dashboard
 * que aún no tienen funcionalidades implementadas.
 *
 * Uso:
 *   <DevelopmentState
 *     icon="◈"
 *     title="Productos"
 *     description="Aquí podrás crear, editar y eliminar productos del catálogo."
 *   />
 *
 * Props:
 *   icon        — símbolo decorativo que identifica la sección (opcional)
 *   title       — nombre de la sección
 *   description — descripción breve de lo que hará esta sección
 */

import styles from "./DevelopmentState.module.css";

interface DevelopmentStateProps {
  icon?:        string;
  title:        string;
  description?: string;
}

export function DevelopmentState({
  icon        = "▦",
  title,
  description,
}: DevelopmentStateProps) {
  return (
    <div className={styles.root}>
      <div className={styles.card}>

        {/* Ícono decorativo */}
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>

        {/* Texto */}
        <h2 className={styles.title}>{title}</h2>

        {description && (
          <p className={styles.description}>{description}</p>
        )}

        {/* Badge */}
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Funcionalidad en desarrollo
        </div>

      </div>
    </div>
  );
}