import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { RawLogView } from "../../src/components/logs/RawLogView";
import { isNearBottom, scrollToEnd } from "../../src/lib/logScroll";

describe("stick-to-bottom", () => {
  it("calls onStickToBottomChange(false) when scrolling away from bottom", () => {
    const onStick = vi.fn();
    const { container } = render(
      <RawLogView
        lines={["a\n", "b\n", "c\n"]}
        search=""
        stickToBottom
        onStickToBottomChange={onStick}
        prependGeneration={0}
        chunkCount={3}
      />,
    );
    const pre = container.querySelector("pre");
    expect(pre).toBeTruthy();
    Object.defineProperty(pre!, "scrollHeight", { value: 1000, configurable: true });
    Object.defineProperty(pre!, "clientHeight", { value: 100, configurable: true });
    Object.defineProperty(pre!, "scrollTop", { value: 0, writable: true, configurable: true });
    fireEvent.scroll(pre!);
    expect(onStick).toHaveBeenCalledWith(false);
  });

  it("scroll helpers: stick off keeps position conceptually", () => {
    const el = {
      scrollHeight: 500,
      scrollTop: 50,
      clientHeight: 100,
    } as HTMLElement;
    expect(isNearBottom(el)).toBe(false);
    scrollToEnd(el);
    expect(el.scrollTop).toBe(500);
  });
});
