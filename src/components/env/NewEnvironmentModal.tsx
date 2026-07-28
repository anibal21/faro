import { FormEvent, useEffect, useState } from "react";
import {
  demoFixturePaths,
  type ConnectionInstance,
  type EnvUpsertInput,
} from "../../lib/ipc";
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
  iamCredentialsPath: "",
  regionName: "",
  clusterName: "",
  notes: "",
};

export function NewEnvironmentModal({
  open,
  initial = null,
  onClose,
  onSave,
}: NewEnvironmentModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        iamCredentialsPath: initial.iamCredentialsPath,
        regionName: initial.regionName,
        clusterName: initial.clusterName,
        notes: initial.notes ?? "",
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [open, initial]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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
        iamCredentialsPath: form.iamCredentialsPath,
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

  async function fillDemo() {
    setError(null);
    try {
      const paths = await demoFixturePaths();
      setForm((prev) => ({
        ...prev,
        name: prev.name || "demo-local",
        bastionHost: prev.bastionHost || "bastion.demo.local",
        sshUser: prev.sshUser || "ec2-user",
        pemPath: paths.pemPath,
        iamCredentialsPath: paths.iamCredentialsPath,
        regionName: prev.regionName || "us-east-1",
        clusterName: prev.clusterName || "demo-eks",
        namespaceDefault: prev.namespaceDefault || "default",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto text-xs">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Editar ambiente" : "Configuracion nuevo ambiente"}
          </DialogTitle>
        </DialogHeader>
        <p className="mb-2 text-[11px] text-muted-foreground">
          PEM + SSH + ruta IAM + region_name + cluster_name. Solo rutas e
          identificadores.{" "}
          <button
            type="button"
            className="text-primary underline"
            onClick={() => void fillDemo()}
          >
            Usar fixtures demo
          </button>
        </p>
        <form className="grid gap-1.5" onSubmit={handleSubmit}>
          {(
            [
              ["name", "Nombre de la conexion", "text"],
              ["bastionHost", "Host (bastion)", "text"],
              ["sshPort", "Puerto SSH", "number"],
              ["sshUser", "Username SSH", "text"],
              ["namespaceDefault", "Namespace (opcional)", "text"],
              ["pemPath", "PEM (ruta)", "text"],
              ["iamCredentialsPath", "Credenciales IAM (ruta)", "text"],
              ["regionName", "region_name", "text"],
              ["clusterName", "cluster_name", "text"],
            ] as const
          ).map(([key, label, type]) => (
            <label key={key} className="grid gap-0.5">
              <span className="text-muted-foreground">{label}</span>
              <input
                required={key !== "namespaceDefault"}
                type={type}
                className="h-7 rounded-md border border-input bg-background px-2"
                value={form[key]}
                onChange={(e) => setField(key, e.target.value)}
              />
            </label>
          ))}
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
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}
