import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export function ConnectionLimitModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Límite de conexiones</DialogTitle>
        </DialogHeader>
        <p>
          Solo puedes tener dos ambientes conectados a la vez. Desconecta uno
          para abrir una conexión nueva.
        </p>
        <footer className="flex justify-end">
          <Button type="button" onClick={onClose}>
            Entendido
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

