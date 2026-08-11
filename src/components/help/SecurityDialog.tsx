import {
  CHILE_NORMS,
  FARO_ALIGNMENT,
  SECURITY_CLOSE_LABEL,
  SECURITY_DIALOG_TITLE,
  SECURITY_INTRO,
} from "../../content/chileSecurity";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import "./SecurityDialog.css";

type SecurityDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SecurityDialog({ open, onOpenChange }: SecurityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="security-dialog"
        aria-describedby="security-dialog-intro"
      >
        <DialogHeader>
          <DialogTitle>{SECURITY_DIALOG_TITLE}</DialogTitle>
        </DialogHeader>
        <div className="security-dialog__body">
          <p id="security-dialog-intro" className="security-dialog__intro">
            {SECURITY_INTRO}
          </p>

          <h3 className="security-dialog__section">Marco normativo (Chile)</h3>
          <ul className="security-dialog__norms">
            {CHILE_NORMS.map((norm) => (
              <li key={norm.id}>
                <strong>{norm.name}</strong>
                <p>{norm.description}</p>
              </li>
            ))}
          </ul>

          <h3 className="security-dialog__section">Cómo Faro se alinea</h3>
          <ul className="security-dialog__align">
            {FARO_ALIGNMENT.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="security-dialog__footer">
          <DialogClose asChild>
            <Button type="button" variant="default">
              {SECURITY_CLOSE_LABEL}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
