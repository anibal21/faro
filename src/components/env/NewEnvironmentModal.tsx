import { FormEvent, useEffect, useState } from "react";
import {
  demoFixturePaths,
  type ConnectionInstance,
  type EnvUpsertInput,
} from "../../lib/ipc";
import { openPathPicker } from "../../lib/fileBrowse";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type NewEnvironmentModalProps = {
  open: boolean;
  initial?: ConnectionInstance | null;
  onClose: () => void;
  onSave: (payload: EnvUpsertInput) => Promise<void>;
};

const emptyForm = {
  name: "",
  bastionHost: "",
  sshPort: "22",
  sshUser: "",
  namespaceDefault: "",
  pemPath: "",
  regionName: "",
  clusterName: "",
  notes: "",
};

const BROWSE_BLOCKED_MSG =
  "No se puede guardar: el selector de archivos no está disponible. Reintenta Examinar.";

export function NewEnvironmentModal({
  open,
  initial = null,
  onClose,
  onSave,
}: NewEnvironmentModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [browseBroken, setBrowseBroken] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        name: initial.name,
        bastionHost: initial.bastionHost,
        sshPort: String(initial.sshPort),
        sshUser: initial.sshUser,
        namespaceDefault: initial.namespaceDefault ?? "",
        pemPath: initial.pemPath,
        regionName: initial.regionName,
        clusterName: initial.clusterName,
        notes: initial.notes ?? "",
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
    setBrowseBroken(false);
  }, [open, initial]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (browseBroken) {
      setError(BROWSE_BLOCKED_MSG);
      return;
    }
    if (!form.namespaceDefault.trim()) {
      setError("Namespace es obligatorio para ambientes live.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: EnvUpsertInput = {
        id: initial?.id,
        name: form.name,
        bastionHost: form.bastionHost,
        sshPort: Number(form.sshPort) || 22,
        sshUser: form.sshUser,
        pemPath: form.pemPath,
        iamCredentialsPath: "",
        regionName: form.regionName,
        clusterName: form.clusterName,
        namespaceDefault: form.namespaceDefault || undefined,
        notes: form.notes || undefined,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  function setField(key: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function browsePem() {
    setError(null);
    try {
      const path = await openPathPicker();
      setBrowseBroken(false);
      if (path === null) {
        return;
      }
      setField("pemPath", path);
    } catch {
      setBrowseBroken(true);
      setError(BROWSE_BLOCKED_MSG);
    }
  }

  async function fillDemo() {
    setError(null);
    try {
      const paths = await demoFixturePaths();
      setForm((prev) => ({
        ...prev,
        bastionHost: prev.bastionHost || "bastion.demo.local",
        sshUser: prev.sshUser || "ec2-user",
        pemPath: paths.pemPath,
        regionName: prev.regionName || "us-east-1",
        clusterName: prev.clusterName || "demo-eks",
        namespaceDefault: prev.namespaceDefault || "default",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const textFields = [
    ["name", "Nombre de la conexion", "text"],
    ["bastionHost", "Host (bastion)", "text"],
    ["sshPort", "Puerto SSH", "number"],
    ["sshUser", "Username SSH", "text"],
    ["namespaceDefault", "Namespace", "text"],
    ["regionName", "region_name", "text"],
    ["clusterName", "cluster_name", "text"],
  ] as const;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto text-xs">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Editar ambiente" : "Configuracion nuevo ambiente"}
          </DialogTitle>
        </DialogHeader>
        <p className="mb-2 text-[11px] text-muted-foreground">
          PEM + SSH + region_name + cluster_name. Solo rutas e identificadores
          (sin archivo IAM).{" "}
          <button
            type="button"
            className="text-primary underline"
            onClick={() => void fillDemo()}
          >
            Usar fixtures demo
          </button>
        </p>
        <form className="grid gap-1.5" onSubmit={handleSubmit}>
          {textFields.map(([key, label, type]) => (
            <label key={key} className="grid gap-0.5">
              <span className="text-muted-foreground">{label}</span>
              <input
                required
                type={type}
                className="h-7 rounded-md border border-input bg-background px-2"
                value={form[key]}
                onChange={(e) => setField(key, e.target.value)}
              />
            </label>
          ))}
          <label className="grid gap-0.5">
            <span className="text-muted-foreground">PEM (ruta)</span>
            <div className="flex gap-1">
              <input
                required
                type="text"
                aria-label="PEM (ruta)"
                className="h-7 min-w-0 flex-1 rounded-md border border-input bg-background px-2"
                value={form.pemPath}
                onChange={(e) => setField("pemPath", e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                className="h-7 shrink-0 px-2"
                onClick={() => void browsePem()}
              >
                Examinar
              </Button>
            </div>
          </label>
          <label className="grid gap-0.5">
            <span className="text-muted-foreground">Notas (sin secretos)</span>
            <textarea
              rows={2}
              className="rounded-md border border-input bg-background px-2 py-1"
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
            />
          </label>
          {error && <p className="text-destructive">{error}</p>}
          <footer className="mt-1 flex justify-end gap-1.5">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || browseBroken}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}
