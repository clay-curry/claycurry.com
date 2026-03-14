import { describe, expect, test } from "vitest";
import {
  clampBounds,
  DEBUG_PANEL_MIN_HEIGHT,
  DEBUG_PANEL_MIN_WIDTH,
  DEBUG_PANEL_WINDOW_GUTTER,
  type DebugPanelSizeConstraints,
  moveBounds,
  resizeBoundsFromHandle,
} from "./windowing";

const DEFAULT_CONSTRAINTS: DebugPanelSizeConstraints = {
  gutter: DEBUG_PANEL_WINDOW_GUTTER,
  minHeight: DEBUG_PANEL_MIN_HEIGHT,
  minWidth: DEBUG_PANEL_MIN_WIDTH,
  viewport: {
    height: 900,
    width: 1200,
  },
};

describe("debug panel windowing", () => {
  test("clamps dragged bounds to the viewport gutter", () => {
    expect(
      moveBounds(
        {
          height: 300,
          width: 400,
          x: 100,
          y: 100,
        },
        {
          x: -250,
          y: 700,
        },
        DEFAULT_CONSTRAINTS,
      ),
    ).toEqual({
      height: 300,
      width: 400,
      x: 8,
      y: 592,
    });
  });

  test("resizes from the left while keeping the right edge anchored", () => {
    expect(
      resizeBoundsFromHandle(
        {
          height: 320,
          width: 400,
          x: 120,
          y: 140,
        },
        {
          x: -200,
          y: 0,
        },
        "left",
        DEFAULT_CONSTRAINTS,
      ),
    ).toEqual({
      height: 320,
      width: 512,
      x: 8,
      y: 140,
    });
  });

  test("enforces the minimum width on right-edge resize", () => {
    expect(
      resizeBoundsFromHandle(
        {
          height: 320,
          width: 500,
          x: 100,
          y: 140,
        },
        {
          x: -300,
          y: 0,
        },
        "right",
        DEFAULT_CONSTRAINTS,
      ),
    ).toEqual({
      height: 320,
      width: DEBUG_PANEL_MIN_WIDTH,
      x: 100,
      y: 140,
    });
  });

  test("resizes both axes from the top-left corner", () => {
    expect(
      resizeBoundsFromHandle(
        {
          height: 360,
          width: 500,
          x: 180,
          y: 180,
        },
        {
          x: 80,
          y: 90,
        },
        "top-left",
        DEFAULT_CONSTRAINTS,
      ),
    ).toEqual({
      height: 270,
      width: 420,
      x: 260,
      y: 270,
    });
  });

  test("shrinks oversized manual bounds to fit a smaller viewport", () => {
    expect(
      clampBounds(
        {
          height: 800,
          width: 1000,
          x: 20,
          y: 40,
        },
        {
          height: 500,
          width: 700,
        },
        DEBUG_PANEL_WINDOW_GUTTER,
        {
          minHeight: DEBUG_PANEL_MIN_HEIGHT,
          minWidth: DEBUG_PANEL_MIN_WIDTH,
        },
      ),
    ).toEqual({
      height: 484,
      width: 684,
      x: 8,
      y: 8,
    });
  });
});
