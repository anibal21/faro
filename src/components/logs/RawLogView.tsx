import { useEffect, useRef } from "react";
import {
  isNearBottom,
  preserveScrollOnPrepend,
  scrollToEnd,
} from "../../lib/logScroll";

type RawLogViewProps = {
  lines: string[];
  search: string;
  stickToBottom: boolean;
  onStickToBottomChange: (value: boolean) => void;
  prependGeneration: number;
  chunkCount: number;
};

export function RawLogView({
  lines,
  search,
  stickToBottom,
  onStickToBottomChange,
  prependGeneration,
  chunkCount,
}: RawLogViewProps) {
  const ref = useRef<HTMLPreElement>(null);
  const prevPrepend = useRef(prependGeneration);
  const prevHeight = useRef(0);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? lines.filter((l) => l.toLowerCase().includes(q))
    : lines;

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
  }, [chunkCount, filtered.length, stickToBottom, prependGeneration]);

  useEffect(() => {
    prevHeight.current = ref.current?.scrollHeight ?? 0;
  });

  return (
    <pre
      ref={ref}
      className="raw-log"
      aria-label="Raw logs"
      onScroll={() => {
        const el = ref.current;
        if (!el) return;
        if (stickToBottom && !isNearBottom(el)) {
          onStickToBottomChange(false);
        }
      }}
    >
      {filtered.length === 0 ? "— sin líneas —" : filtered.join("")}
    </pre>
  );
}
