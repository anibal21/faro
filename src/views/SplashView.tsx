import splashLoad from "../assets/splash-load.png";
import "./SplashView.css";

type SplashViewProps = {
  status?: string | null;
  error?: string | null;
};

export function SplashView({ status = null, error = null }: SplashViewProps) {
  const message = error ?? status;
  const showMessage = Boolean(message && String(message).trim());

  return (
    <div className="splash" role="status" aria-live="polite">
      <div
        className="splash__bg"
        aria-hidden="true"
        style={{ backgroundImage: `url(${splashLoad})` }}
      />
      {showMessage ? (
        <p
          className={
            error ? "splash__status splash__status--error" : "splash__status"
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
