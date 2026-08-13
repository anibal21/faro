import {
  ABOUT_AUTHOR_NAME,
  ABOUT_CLOSE_LABEL,
  ABOUT_CONTACT_INTRO,
  ABOUT_DIALOG_TITLE,
  ABOUT_EMAIL,
  ABOUT_GITHUB_URL,
  ABOUT_LICENSE,
  ABOUT_LINKEDIN_URL,
  ABOUT_MESSAGE,
} from "../../content/aboutFaro";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import "./AboutFaroDialog.css";

type AboutFaroDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

async function openExternal(url: string): Promise<void> {
  try {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export function AboutFaroDialog({ open, onOpenChange }: AboutFaroDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="about-dialog"
        aria-describedby="about-faro-message"
      >
        <DialogHeader>
          <DialogTitle>{ABOUT_DIALOG_TITLE}</DialogTitle>
        </DialogHeader>
        <div className="about-dialog__body">
          <p id="about-faro-message" className="about-dialog__message">
            {ABOUT_MESSAGE}
          </p>
          <div className="about-dialog__meta">
            <p>
              <strong>Proyecto:</strong> Faro
            </p>
            <p>
              <strong>Licencia:</strong> {ABOUT_LICENSE}
            </p>
            <p>
              <strong>Desarrollado por:</strong> {ABOUT_AUTHOR_NAME}
            </p>
          </div>
          <h3 className="about-dialog__section">{ABOUT_CONTACT_INTRO}</h3>
          <ul className="about-dialog__links">
            <li>
              Correo:{" "}
              <button
                type="button"
                className="linkish"
                onClick={() => {
                  void openExternal(`mailto:${ABOUT_EMAIL}`);
                }}
              >
                {ABOUT_EMAIL}
              </button>
            </li>
            <li>
              GitHub:{" "}
              <button
                type="button"
                className="linkish"
                onClick={() => {
                  void openExternal(ABOUT_GITHUB_URL);
                }}
              >
                {ABOUT_GITHUB_URL}
              </button>
            </li>
            <li>
              LinkedIn:{" "}
              <button
                type="button"
                className="linkish"
                onClick={() => {
                  void openExternal(ABOUT_LINKEDIN_URL);
                }}
              >
                {ABOUT_LINKEDIN_URL}
              </button>
            </li>
          </ul>
        </div>
        <div className="about-dialog__footer">
          <DialogClose asChild>
            <Button type="button" variant="default">
              {ABOUT_CLOSE_LABEL}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
