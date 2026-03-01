import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Dos capas de estado para el rango de precio:
 *
 *  · localMin / localMax  → se actualizan en cada evento del slider (instantáneo).
 *  · onCommit             → se llama solo tras `delay` ms sin actividad,
 *                           para propagar el valor al filtro real sin saturar
 *                           el árbol de React con re-renders continuos.
 *
 * Usar useRef para el timer evita que scheduleCommit se recree en cada render.
 */
export function useDebouncedPrice(
  externalMin: number,
  externalMax: number,
  onCommit: (min: number, max: number) => void,
  delay = 120
) {
  const [localMin, setLocalMin] = useState(externalMin);
  const [localMax, setLocalMax] = useState(externalMax);

  /* Sincronizar cuando el padre resetea los filtros (ej: "Limpiar") */
  useEffect(() => { setLocalMin(externalMin); }, [externalMin]);
  useEffect(() => { setLocalMax(externalMax); }, [externalMax]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* useCallback para que la referencia sea estable entre renders */
  const scheduleCommit = useCallback(
    (min: number, max: number) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onCommit(min, max), delay);
    },
    [onCommit, delay]
  );

  const handleChangeMin = useCallback(
    (v: number) => {
      setLocalMin(v);
      /* Usar ref de localMax para evitar capturar un valor stale */
      setLocalMax((prevMax) => {
        scheduleCommit(v, prevMax);
        return prevMax;
      });
    },
    [scheduleCommit]
  );

  const handleChangeMax = useCallback(
    (v: number) => {
      setLocalMax(v);
      setLocalMin((prevMin) => {
        scheduleCommit(prevMin, v);
        return prevMin;
      });
    },
    [scheduleCommit]
  );

  /* Limpiar timer al desmontar */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { localMin, localMax, handleChangeMin, handleChangeMax };
}