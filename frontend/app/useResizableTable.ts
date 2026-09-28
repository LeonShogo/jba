"use client";

import { useState, type MouseEvent as ReactMouseEvent } from "react";

type TableLayout = {
  columnWidths: number[];
  rowHeights: Record<number, number>;
};

type ResizableTableOptions = {
  storageKey: string;
  initialColumnWidths: number[];
  minimumColumnWidths: number[];
  initialRowHeight: number;
  minimumRowHeight: number;
};

function loadLayout(
  storageKey: string,
  initialColumnWidths: number[],
): TableLayout {
  const fallback = {
    columnWidths: initialColumnWidths,
    rowHeights: {},
  };

  if (typeof window === "undefined") return fallback;

  try {
    const savedLayout = window.localStorage.getItem(storageKey);
    if (!savedLayout) return fallback;

    const parsedLayout = JSON.parse(savedLayout) as Partial<TableLayout>;
    if (
      !Array.isArray(parsedLayout.columnWidths) ||
      parsedLayout.columnWidths.length !== initialColumnWidths.length
    ) {
      return fallback;
    }

    return {
      columnWidths: parsedLayout.columnWidths,
      rowHeights: parsedLayout.rowHeights ?? {},
    };
  } catch {
    return fallback;
  }
}

export function useResizableTable({
  storageKey,
  initialColumnWidths,
  minimumColumnWidths,
  initialRowHeight,
  minimumRowHeight,
}: ResizableTableOptions) {
  const [layout, setLayout] = useState<TableLayout>(() =>
    loadLayout(storageKey, initialColumnWidths),
  );

  const gridTemplateColumns = layout.columnWidths
    .map((width) => `${width}%`)
    .join(" ");

  function saveLayout(nextLayout: TableLayout) {
    setLayout(nextLayout);
    window.localStorage.setItem(storageKey, JSON.stringify(nextLayout));
  }

  function startColumnResize(
    columnIndex: number,
    event: ReactMouseEvent<HTMLDivElement>,
  ) {
    event.preventDefault();

    const table = event.currentTarget.closest("[role='table']");
    if (!(table instanceof HTMLElement)) return;

    const startX = event.clientX;
    const tableWidth = table.getBoundingClientRect().width;
    const startLeftWidth = layout.columnWidths[columnIndex];
    const startRightWidth = layout.columnWidths[columnIndex + 1];

    function resize(moveEvent: MouseEvent) {
      const requestedChange =
        ((moveEvent.clientX - startX) / tableWidth) * 100;
      const minimumChange =
        minimumColumnWidths[columnIndex] - startLeftWidth;
      const maximumChange =
        startRightWidth - minimumColumnWidths[columnIndex + 1];
      const change = Math.min(
        maximumChange,
        Math.max(minimumChange, requestedChange),
      );
      const nextColumnWidths = [...layout.columnWidths];

      nextColumnWidths[columnIndex] = startLeftWidth + change;
      nextColumnWidths[columnIndex + 1] = startRightWidth - change;

      saveLayout({
        ...layout,
        columnWidths: nextColumnWidths,
      });
    }

    function stopResize() {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResize);
    }

    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResize);
  }

  function startRowResize(
    rowId: number,
    event: ReactMouseEvent<HTMLDivElement>,
  ) {
    event.preventDefault();

    const startY = event.clientY;
    const startHeight = layout.rowHeights[rowId] ?? initialRowHeight;

    function resize(moveEvent: MouseEvent) {
      const height = Math.max(
        minimumRowHeight,
        startHeight + moveEvent.clientY - startY,
      );

      saveLayout({
        ...layout,
        rowHeights: {
          ...layout.rowHeights,
          [rowId]: height,
        },
      });
    }

    function stopResize() {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResize);
    }

    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResize);
  }

  return {
    gridTemplateColumns,
    rowHeights: layout.rowHeights,
    startColumnResize,
    startRowResize,
  };
}
