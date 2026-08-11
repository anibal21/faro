import { useEffect, useRef } from "react";
import {
  isNearBottom,
  preserveScrollOnPrepend,
  scrollToEnd,
} from "../../lib/logScroll";

export type WriteGroup = {
  id: string;
  text: string;
  podName: string;
  timestamp: string;
  marked: boolean;
};

type StructuredLogViewProps = {
  groups: WriteGroup[];
  onAnalyze: (group: WriteGroup) => void;
  stickToBottom?: boolean;
  onStickToBottomChange?: (value: boolean) => void;
  prependGeneration?: number;
  chunkCount?: number;
};

export function StructuredLogView({
  groups,
  onAnalyze,
  stickToBottom = true,
  onStickToBottomChange,
  prependGeneration = 0,
  chunkCount = 0,
}: StructuredLogViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prevPrepend = useRef(prependGeneration);
  const prevHeight = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prependGeneration !== prevPrepend.current) {
      preserveScrollOnPrepend(el, prevHeight.current);
      prevPrepend.current = prependGeneration;
      return;
    }
    if (stickToBottom) {
      scrollToEnd(el);
    }
  }, [chunkCount, groups.length, stickToBottom, prependGeneration]);

  useEffect(() => {
    prevHeight.current = ref.current?.scrollHeight ?? 0;
  });

  return (
    <div
      ref={ref}
      className="structured-log"
      onScroll={() => {
        const el = ref.current;
        if (!el || !onStickToBottomChange) return;
        if (stickToBottom && !isNearBottom(el)) {
          onStickToBottomChange(false);
        }
      }}
    >
      {groups.length === 0 && (
        <p className="structured-log__empty">Esperando logs…</p>
      )}
      {groups.map((g) => (
        <button
          key={g.id}
          type="button"
          className={
            g.marked
              ? "structured-log__group structured-log__group--marked"
              : "structured-log__group"
          }
          onClick={() => onAnalyze(g)}
          title={g.marked ? "Clic para analizar" : "Clic para analizar"}
        >
          <header>
            <span>{g.podName}</span>
            <time>{g.timestamp}</time>
            {g.marked && <em>ERROR</em>}
          </header>
          <pre>{g.text}</pre>
        </button>
      ))}
    </div>
  );
}

type Chunk = { podName: string; text: string; timestamp: string };

const MAX_GROUPS = 800;

/** Build write-groups from streamed chunks (Spring Boot / stacktrace aware). */
export function chunksToWriteGroups(chunks: Chunk[], search: string): WriteGroup[] {
  const q = search.trim().toLowerCase();
  const lines = flattenLines(chunks);
  const groups = groupSpringBootLines(lines);
  return groups
    .filter((g) => (q ? g.text.toLowerCase().includes(q) : true))
    .slice(-MAX_GROUPS)
    .map((g, i) => ({
      id: `${g.timestamp}-${g.podName}-${i}`,
      text: g.text,
      podName: g.podName,
      timestamp: g.timestamp,
      marked: lightweightMark(g.text),
    }));
}

type LineRef = { podName: string; timestamp: string; line: string };

function flattenLines(chunks: Chunk[]): LineRef[] {
  const out: LineRef[] = [];
  for (const c of chunks) {
    const parts = c.text.split(/\r?\n/);
    // Keep trailing empty only if text ends with newline and we want blank separators —
    // drop a single trailing empty from split.
    const lines =
      parts.length > 0 && parts[parts.length - 1] === ""
        ? parts.slice(0, -1)
        : parts;
    for (const line of lines) {
      out.push({ podName: c.podName, timestamp: c.timestamp, line });
    }
  }
  return out;
}

function groupSpringBootLines(lines: LineRef[]): WriteGroup[] {
  const groups: WriteGroup[] = [];
  let cur: { podName: string; timestamp: string; lines: string[] } | null =
    null;

  const flush = () => {
    if (!cur || cur.lines.length === 0) {
      cur = null;
      return;
    }
    const text = cur.lines.join("\n") + (cur.lines.length ? "\n" : "");
    groups.push({
      id: "",
      text,
      podName: cur.podName,
      timestamp: cur.timestamp,
      marked: false,
    });
    cur = null;
  };

  for (const row of lines) {
    if (isStackContinuation(row.line)) {
      if (!cur) {
        cur = {
          podName: row.podName,
          timestamp: row.timestamp,
          lines: [row.line],
        };
      } else {
        cur.lines.push(row.line);
      }
      continue;
    }

    if (isNewLogEntry(row.line) || !cur || cur.podName !== row.podName) {
      flush();
      cur = {
        podName: row.podName,
        timestamp: row.timestamp,
        lines: [row.line],
      };
      continue;
    }

    cur.lines.push(row.line);
  }
  flush();
  return groups;
}

/** Stack / exception continuation lines (keep in same write-group). */
export function isStackContinuation(line: string): boolean {
  const t = line.trimStart();
  if (t.startsWith("at ") || t.startsWith("\tat ")) return true;
  // JVM often uses a literal tab before "at"
  if (line.includes("\tat ")) return true;
  if (/^Caused by:/i.test(t)) return true;
  if (/^Suppressed:/i.test(t)) return true;
  if (/^\.\.\. \d+ more/.test(t)) return true;
  if (/^[a-zA-Z0-9_$.]+(Exception|Error)(:|$)/.test(t)) return true;
  return false;
}

/** Likely start of a new Spring Boot / logback / JSON log entry. */
export function isNewLogEntry(line: string): boolean {
  const t = line.trimStart();
  if (!t) return false;
  if (isStackContinuation(t)) return false;
  // ISO-ish timestamps
  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/.test(t)) return true;
  // Common level-first patterns
  if (/^(ERROR|WARN|INFO|DEBUG|TRACE|FATAL)\b/.test(t)) return true;
  // logback with level after spaces: "2024-..  ERROR ..."
  if (/\b(ERROR|WARN|INFO|DEBUG|TRACE|FATAL)\b/.test(t) && t.length < 500) {
    // Prefer treating as new entry when level appears early
    const idx = t.search(/\b(ERROR|WARN|INFO|DEBUG|TRACE|FATAL)\b/);
    if (idx >= 0 && idx < 80) return true;
  }
  // JSON logs
  if (t.startsWith("{") && /"level"|"severity"|"message"/i.test(t)) return true;
  return false;
}

export function lightweightMark(text: string): boolean {
  const u = text.toUpperCase();
  return (
    u.includes("ERROR") ||
    u.includes("EXCEPTION") ||
    u.includes("NULLPOINTER") ||
    text.includes("\tat ") ||
    /^\s*at /m.test(text)
  );
}
