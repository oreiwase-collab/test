import {useLayoutEffect} from "react";
import {cancelRender, useCurrentFrame} from "remotion";

type VisibleBox = {
  id: string;
  rect: DOMRect;
};

const accumulatedOpacity = (element: Element): number => {
  let opacity = 1;
  let current: Element | null = element;
  while (current) {
    const value = Number.parseFloat(window.getComputedStyle(current).opacity);
    if (Number.isFinite(value)) opacity *= value;
    current = current.parentElement;
  }
  return opacity;
};

const visibleBoxes = (): VisibleBox[] =>
  Array.from(document.querySelectorAll<HTMLElement | SVGGraphicsElement>("[data-layout-box]"))
    .map((element) => ({
      id: element.dataset.layoutBox || "(unnamed)",
      rect: element.getBoundingClientRect(),
      visible:
        window.getComputedStyle(element).visibility !== "hidden" &&
        accumulatedOpacity(element) > 0.05,
    }))
    .filter(({rect, visible}) => visible && rect.width > 1 && rect.height > 1)
    .map(({id, rect}) => ({id, rect}));

const collisionSize = (a: DOMRect, b: DOMRect) => ({
  width: Math.min(a.right, b.right) - Math.max(a.left, b.left),
  height: Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top),
});

export const LayoutCollisionGuard: React.FC = () => {
  const frame = useCurrentFrame();

  useLayoutEffect(() => {
    const boxes = visibleBoxes();
    for (let left = 0; left < boxes.length; left += 1) {
      for (let right = left + 1; right < boxes.length; right += 1) {
        const a = boxes[left];
        const b = boxes[right];
        if (a.id === b.id) {
          cancelRender(new Error(`Duplicate data-layout-box id "${a.id}" at frame ${frame}.`));
          return;
        }
        const overlap = collisionSize(a.rect, b.rect);
        if (overlap.width > 2 && overlap.height > 2) {
          cancelRender(
            new Error(
              `Text layout collision at frame ${frame}: "${a.id}" overlaps "${b.id}" by ` +
              `${overlap.width.toFixed(1)}x${overlap.height.toFixed(1)}px.`,
            ),
          );
          return;
        }
      }
    }
  }, [frame]);

  return null;
};
