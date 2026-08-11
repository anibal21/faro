# Contract: Signal snippet

## Purpose

Show **“Señal en el log”** — literal excerpt from analyzed text (after 64 KiB truncate), never invented.

## Output

`signalSnippet: string | null` on `AnalyzeResult`.

## Algorithm (normative)

1. Scan lines (preserve original casing in output).
2. Pick **primary line** = first match among (case-sensitive where types matter; also try case-insensitive for headers):
   - contains `Caused by:`
   - matches / looks like Java exception type line (`Exception`, `Error:` with capital)
   - starts with or contains `TypeError:`, `Error:`, `UnhandledPromise`
   - contains `Traceback (most recent call last)`
   - contains `Minified React error`
3. From primary line index, collect up to **2** stack frames:
   - line contains `\tat ` (Java)
   - line matches `at Object.` / `at ` (JS)
   - line matches `File "…", line N` (Python)
4. Join primary + frames with `\n`. Cap ~2048 characters.
5. If no primary line → `null` (UI hides block).

## Non-goals

- No rewriting, translating, or summarizing beyond selection.
- Not stored in analysis history table.
