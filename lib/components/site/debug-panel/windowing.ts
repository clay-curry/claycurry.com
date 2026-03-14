export const DEBUG_PANEL_WINDOW_GUTTER = 8;
export const DEBUG_PANEL_MIN_WIDTH = 360;
export const DEBUG_PANEL_MIN_HEIGHT = 240;

export type DebugPanelBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DebugPanelResizeHandle =
  | "left"
  | "right"
  | "bottom"
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-right";

export type DebugPanelViewport = {
  width: number;
  height: number;
};

export type DebugPanelSizeConstraints = {
  viewport: DebugPanelViewport;
  gutter: number;
  minWidth: number;
  minHeight: number;
};

type DebugPanelMinSize = {
  minWidth: number;
  minHeight: number;
};

type DragDelta = {
  x: number;
  y: number;
};

function clampValue(value: number, min: number, max: number) {
  if (min > max) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function getDimensionLimits(total: number, gutter: number, min: number) {
  const max = Math.max(total - gutter * 2, 0);
  return {
    max,
    min: Math.min(min, max),
  };
}

export function clampBounds(
  bounds: DebugPanelBounds,
  viewport: DebugPanelViewport,
  gutter: number,
  minSize: DebugPanelMinSize,
): DebugPanelBounds {
  const widthLimits = getDimensionLimits(
    viewport.width,
    gutter,
    minSize.minWidth,
  );
  const heightLimits = getDimensionLimits(
    viewport.height,
    gutter,
    minSize.minHeight,
  );

  const width = clampValue(bounds.width, widthLimits.min, widthLimits.max);
  const height = clampValue(bounds.height, heightLimits.min, heightLimits.max);
  const maxX = Math.max(gutter, viewport.width - gutter - width);
  const maxY = Math.max(gutter, viewport.height - gutter - height);

  return {
    height,
    width,
    x: clampValue(bounds.x, gutter, maxX),
    y: clampValue(bounds.y, gutter, maxY),
  };
}

export function moveBounds(
  bounds: DebugPanelBounds,
  delta: DragDelta,
  constraints: DebugPanelSizeConstraints,
): DebugPanelBounds {
  const current = clampBounds(
    bounds,
    constraints.viewport,
    constraints.gutter,
    {
      minHeight: constraints.minHeight,
      minWidth: constraints.minWidth,
    },
  );
  const maxX = Math.max(
    constraints.gutter,
    constraints.viewport.width - constraints.gutter - current.width,
  );
  const maxY = Math.max(
    constraints.gutter,
    constraints.viewport.height - constraints.gutter - current.height,
  );

  return {
    ...current,
    x: clampValue(current.x + delta.x, constraints.gutter, maxX),
    y: clampValue(current.y + delta.y, constraints.gutter, maxY),
  };
}

function resizeHorizontal(
  bounds: DebugPanelBounds,
  deltaX: number,
  handle: DebugPanelResizeHandle,
  constraints: DebugPanelSizeConstraints,
) {
  const limits = getDimensionLimits(
    constraints.viewport.width,
    constraints.gutter,
    constraints.minWidth,
  );
  const right = bounds.x + bounds.width;

  if (handle === "left" || handle === "bottom-left" || handle === "top-left") {
    const minX = Math.max(constraints.gutter, right - limits.max);
    const maxX = right - limits.min;
    const x = clampValue(bounds.x + deltaX, minX, maxX);

    return {
      width: right - x,
      x,
    };
  }

  if (
    handle === "right" ||
    handle === "bottom-right" ||
    handle === "top-right"
  ) {
    const minRight = bounds.x + limits.min;
    const maxRight = Math.min(
      constraints.viewport.width - constraints.gutter,
      bounds.x + limits.max,
    );
    const nextRight = clampValue(right + deltaX, minRight, maxRight);

    return {
      width: nextRight - bounds.x,
      x: bounds.x,
    };
  }

  return {
    width: bounds.width,
    x: bounds.x,
  };
}

function resizeVertical(
  bounds: DebugPanelBounds,
  deltaY: number,
  handle: DebugPanelResizeHandle,
  constraints: DebugPanelSizeConstraints,
) {
  const limits = getDimensionLimits(
    constraints.viewport.height,
    constraints.gutter,
    constraints.minHeight,
  );
  const bottom = bounds.y + bounds.height;

  if (handle === "top-left" || handle === "top-right") {
    const minY = Math.max(constraints.gutter, bottom - limits.max);
    const maxY = bottom - limits.min;
    const y = clampValue(bounds.y + deltaY, minY, maxY);

    return {
      height: bottom - y,
      y,
    };
  }

  if (
    handle === "bottom" ||
    handle === "bottom-left" ||
    handle === "bottom-right"
  ) {
    const minBottom = bounds.y + limits.min;
    const maxBottom = Math.min(
      constraints.viewport.height - constraints.gutter,
      bounds.y + limits.max,
    );
    const nextBottom = clampValue(bottom + deltaY, minBottom, maxBottom);

    return {
      height: nextBottom - bounds.y,
      y: bounds.y,
    };
  }

  return {
    height: bounds.height,
    y: bounds.y,
  };
}

export function resizeBoundsFromHandle(
  bounds: DebugPanelBounds,
  delta: DragDelta,
  handle: DebugPanelResizeHandle,
  constraints: DebugPanelSizeConstraints,
): DebugPanelBounds {
  const current = clampBounds(
    bounds,
    constraints.viewport,
    constraints.gutter,
    {
      minHeight: constraints.minHeight,
      minWidth: constraints.minWidth,
    },
  );
  const horizontal = resizeHorizontal(current, delta.x, handle, constraints);
  const vertical = resizeVertical(current, delta.y, handle, constraints);

  return {
    height: vertical.height,
    width: horizontal.width,
    x: horizontal.x,
    y: vertical.y,
  };
}
