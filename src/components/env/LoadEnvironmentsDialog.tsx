import { useEffect, useState } from "react";
import type { ConnectionInstance } from "../../lib/ipc";
import "./LoadEnvironmentsDialog.css";

type LoadEnvironmentsDialogProps = {
  open: boolean;
  multi: boolean;
  environments: ConnectionInstance[];
  alreadyLoadedIds: string[];
  onClose: () => void;
  onConfirm: (ids: string[]) => Promise<void>;
};

export function LoadEnvironmentsDialog({
  open,
  multi,
  environments,
  alreadyLoadedIds,
  onClose,
  onConfirm,
}: LoadEnvironmentsDialogProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelected([]);
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  function toggle(id: string) {
    if (!multi) {
      setSelected([id]);
      return;
    }
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function submit() {
    if (selected.length === 0) {
      setError("Selecciona al menos un ambiente");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onConfirm(selected);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="load-dialog-backdrop" onClick={onClose} role="presentation">
      <div
        className="load-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="load-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="load-dialog-title">
          {multi ? "Cargar varios ambientes" : "Cargar ambiente"}
        </h2>
        <p className="load-dialog__hint">
          Los ambientes cargados aparecen en el selector. Solo uno puede estar
          activo.
        </p>
        <ul className="load-dialog__list">
          {environments.map((env) => {
            const loaded = alreadyLoadedIds.includes(env.id);
            return (
              <li key={env.id}>
                <label>
                  <input
                    type={multi ? "checkbox" : "radio"}
                    name="load-env"
                    checked={selected.includes(env.id)}
                    onChange={() => toggle(env.id)}
                  />
                  <span>
                    {env.name}
                    {loaded ? " (ya cargado)" : ""}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        {environments.length === 0 && (
          <p className="load-dialog__empty">No hay ambientes guardados.</p>
        )}
        {error && <p className="load-dialog__error">{error}</p>}
        <footer>
          <button type="button" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="button" onClick={() => void submit()} disabled={saving}>
            {saving ? "Cargando…" : "Cargar"}
          </button>
        </footer>
      </div>
    </div>
  );
}
