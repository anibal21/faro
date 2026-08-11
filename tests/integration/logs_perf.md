# Buffer drop under load (US7/T085)

When follow emits faster than the UI can render, `useLogWindows` keeps at most **500** chunks per window (drop oldest). Structured/Raw views re-render from that ring buffer only — no SQLite log dumps.
