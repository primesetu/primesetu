import { useCallback, useEffect } from 'react';

interface UseGridKeyboardProps {
  selectedCell: { r: number, c: number } | null;
  setSelectedCell: (cell: { r: number, c: number } | null) => void;
  editingCell: { r: number, c: number } | null;
  setEditingCell: (cell: { r: number, c: number } | null) => void;
  rowsCount: number;
  columnsCount: number;
  startEditing: (r: number, c: number, char?: string) => void;
  finishEditing: () => void;
  handleCellChange: (r: number, c: number, val: any) => void;
  anchorCell: { r: number, c: number } | null;
  setAnchorCell: (cell: { r: number, c: number } | null) => void;
  selectionRange: { r1: number, c1: number, r2: number, c2: number } | null;
  setSelectionRange: (range: { r1: number, c1: number, r2: number, c2: number } | null) => void;
  editValue: string;
}

export const useGridKeyboard = ({
  selectedCell,
  setSelectedCell,
  editingCell,
  setEditingCell,
  rowsCount,
  columnsCount,
  startEditing,
  finishEditing,
  handleCellChange,
  anchorCell,
  setAnchorCell,
  selectionRange,
  setSelectionRange,
  editValue
}: UseGridKeyboardProps) => {
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Block global navigation if an input is focused but we're not in grid editing mode
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" && !editingCell) return;
    
    if (!selectedCell) return;
    const { r, c } = selectedCell;

    if (editingCell) {
      if (e.key === "Enter") {
        if (e.ctrlKey || e.metaKey) {
          // Ctrl+Enter: Fill entire range with current edit value
          if (selectionRange) {
            const minR = Math.min(selectionRange.r1, selectionRange.r2);
            const maxR = Math.max(selectionRange.r1, selectionRange.r2);
            const minC = Math.min(selectionRange.c1, selectionRange.c2);
            const maxC = Math.max(selectionRange.c1, selectionRange.c2);
            for (let row = minR; row <= maxR; row++) {
              for (let col = minC; col <= maxC; col++) {
                handleCellChange(row, col, editValue);
              }
            }
          }
        }
        finishEditing();
        e.preventDefault();
      }
      if (e.key === "Escape") {
        setEditingCell(null);
      }
      return;
    }

    // Ctrl+A Select All Cells
    if (e.key === "a" && (e.ctrlKey || e.metaKey)) {
      setSelectionRange({ r1: 1, c1: 0, r2: rowsCount, c2: columnsCount - 1 });
      e.preventDefault();
    }

    // Navigation & Shift Selection
    if (e.key === "ArrowUp") {
      const nextR = Math.max(1, r - 1);
      if (e.shiftKey && anchorCell) {
        setSelectedCell({ r: nextR, c });
        setSelectionRange({ r1: anchorCell.r, c1: anchorCell.c, r2: nextR, c2: c });
      } else {
        setSelectedCell({ r: nextR, c });
        setAnchorCell({ r: nextR, c });
        setSelectionRange({ r1: nextR, c1: c, r2: nextR, c2: c });
      }
      e.preventDefault();
    }
    if (e.key === "ArrowDown") {
      const nextR = Math.min(rowsCount, r + 1);
      if (e.shiftKey && anchorCell) {
        setSelectedCell({ r: nextR, c });
        setSelectionRange({ r1: anchorCell.r, c1: anchorCell.c, r2: nextR, c2: c });
      } else {
        setSelectedCell({ r: nextR, c });
        setAnchorCell({ r: nextR, c });
        setSelectionRange({ r1: nextR, c1: c, r2: nextR, c2: c });
      }
      e.preventDefault();
    }
    if (e.key === "ArrowLeft") {
      const nextC = Math.max(0, c - 1);
      if (e.shiftKey && anchorCell) {
        setSelectedCell({ r, c: nextC });
        setSelectionRange({ r1: anchorCell.r, c1: anchorCell.c, r2: r, c2: nextC });
      } else {
        setSelectedCell({ r, c: nextC });
        setAnchorCell({ r, c: nextC });
        setSelectionRange({ r1: r, c1: nextC, r2: r, c2: nextC });
      }
      e.preventDefault();
    }
    if (e.key === "ArrowRight") {
      const nextC = Math.min(columnsCount - 1, c + 1);
      if (e.shiftKey && anchorCell) {
        setSelectedCell({ r, c: nextC });
        setSelectionRange({ r1: anchorCell.r, c1: anchorCell.c, r2: r, c2: nextC });
      } else {
        setSelectedCell({ r, c: nextC });
        setAnchorCell({ r, c: nextC });
        setSelectionRange({ r1: r, c1: nextC, r2: r, c2: nextC });
      }
      e.preventDefault();
    }
    
    if (e.key === "Enter") {
      startEditing(r, c);
      e.preventDefault();
    }

    // Direct typing to start editing (Excel behavior)
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      startEditing(r, c, e.key);
      e.preventDefault();
    }

    if (e.key === "Delete" || e.key === "Backspace") {
      handleCellChange(r, c, "");
    }
  }, [selectedCell, editingCell, rowsCount, columnsCount, startEditing, finishEditing, handleCellChange, setSelectedCell, setEditingCell, anchorCell, setAnchorCell, selectionRange, setSelectionRange, editValue]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};

