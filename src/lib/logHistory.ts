/** Diff a larger pod-log tail against known buffer text to extract older prefix. */

export const LOG_PAGE_LINES = 500;

export function splitLogLines(text: string): string[] {
  if (!text) return [];
  const parts = text.split(/\r?\n/);
  if (parts.length > 0 && parts[parts.length - 1] === "") {
    parts.pop();
  }
  return parts;
}

/** Index in `fetched` where `known` content begins; -1 if not found. */
export function findKnownStart(fetched: string[], known: string[]): number {
  if (known.length === 0) return 0;
  const needleLen = Math.min(5, known.length);
  const needle = known.slice(0, needleLen);
  outer: for (let i = 0; i <= fetched.length - needleLen; i++) {
    for (let j = 0; j < needleLen; j++) {
      if (fetched[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return fetched.indexOf(known[0]);
}

export function olderPrefixFromTail(
  fetchedText: string,
  knownText: string,
): { older: string; exhausted: boolean } {
  const fetched = splitLogLines(fetchedText);
  const known = splitLogLines(knownText);
  if (fetched.length === 0) {
    return { older: "", exhausted: true };
  }
  if (known.length === 0) {
    return { older: `${fetched.join("\n")}\n`, exhausted: false };
  }
  const idx = findKnownStart(fetched, known);
  if (idx < 0) {
    return { older: "", exhausted: true };
  }
  if (idx === 0) {
    return { older: "", exhausted: true };
  }
  const olderLines = fetched.slice(0, idx);
  return { older: `${olderLines.join("\n")}\n`, exhausted: false };
}

export function knownTextForPod(
  chunks: { podName: string; text: string }[],
  podName: string,
): string {
  return chunks
    .filter((c) => c.podName === podName)
    .map((c) => c.text)
    .join("");
}
