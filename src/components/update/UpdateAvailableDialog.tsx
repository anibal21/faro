import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import "./UpdateAvailableDialog.css";

export type UpdateAvailableDialogProps = {
  open: boolean;
  currentVersion: string;
  availableVersion: string;
  notes?: string | null;
  canInstall: boolean;
  installing?: boolean;
  progressPercent?: number | null;
  installMessage?: string | null;
  error?: string | null;
  onAccept: () => void;
  onReject: () => void;
  onOpenChange: (open: boolean) => void;
};

export function UpdateAvailableDialog({
  open,
  currentVersion,
  availableVersion,
  notes,
  canInstall,
  installing = false,
  progressPercent = null,
  installMessage = null,
  error = null,
  onAccept,
  onReject,
  onOpenChange,
}: UpdateAvailableDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (installing) return;
        onOpenChange(next);
        if (!next) onReject();
      }}
    >
      <DialogContent
        className="update-dialog"
        aria-describedby="update-dialog-body"
      >
        <DialogHeader>
          <DialogTitle>Actualización disponible</DialogTitle>
        </DialogHeader>
        <div id="update-dialog-body" className="update-dialog__body">
          <p>
            Versión instalada: <strong>{currentVersion}</strong>
          </p>
          <p>
            Nueva versión: <strong>{availableVersion}</strong>
          </p>
          {notes ? <p className="update-dialog__notes">{notes}</p> : null}
          {!canInstall ? (
            <p className="update-dialog__info">
              En este sistema Faro solo informa de la novedad. La instalación
              automática está disponible en Windows.
            </p>
          ) : null}
          {installing ? (
            <p className="update-dialog__progress" role="status">
              Descargando e instalando
              {progressPercent != null
                ? `… ${Math.round(progressPercent)}%`
                : "…"}
            </p>
          ) : null}
          {installMessage ? (
            <p className="update-dialog__info" role="status">
              {installMessage}
            </p>
          ) : null}
          {error ? (
            <p className="update-dialog__error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <div className="update-dialog__footer">
          <Button
            type="button"
            variant="outline"
            disabled={installing}
            onClick={onReject}
          >
            Ahora no
          </Button>
          <Button
            type="button"
            variant="default"
            disabled={!canInstall || installing}
            onClick={onAccept}
          >
            Actualizar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
