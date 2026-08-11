/** Scroll helpers for Deployment log Raw/Structured panes. */

export function isNearBottom(el: HTMLElement, thresholdPx = 48): boolean {
  return el.scrollHeight - el.scrollTop - el.clientHeight <= thresholdPx;
}

export function scrollToEnd(el: HTMLElement): void {
  el.scrollTop = el.scrollHeight;
}

/** After prepending content, keep the same lines in view. */
export function preserveScrollOnPrepend(
  el: HTMLElement,
  previousScrollHeight: number,
): void {
  const delta = el.scrollHeight - previousScrollHeight;
  if (delta > 0) {
    el.scrollTop += delta;
  }
}

export function captureScrollHeight(el: HTMLElement | null): number {
  return el?.scrollHeight ?? 0;
}
