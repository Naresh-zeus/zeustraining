

// ColHeaderEvents.js - Handles column header mouse events for the grid
import { ResizeColumnCommand } from '../Command.js';

export class ColSelectionEvents {
    constructor(grid) {
        this.grid = grid;
    }

    onMouseDown(e) {
        const { col } = this.grid.getColHeaderAt(e.offsetX);
        if (col >= 0) {
            this.grid.isColHeaderSelecting = true;
            this.grid.selection.startCol = col;
            this.grid.selection.endCol = col;
            this.grid.selection.type = 'column-range';
            this.grid.selection.startRow = 0;
            this.grid.selection.endRow = this.grid.rows.length - 1;
            this.grid.renderAll();
        }
    }

    onMouseMove(e) {
        const { col, onColBorder } = this.grid.getColHeaderAt(e.offsetX);
        this.grid.lastMouseClientX = e.clientX;
        this.grid.lastMouseClientY = e.clientY;
        if (this.grid.isColHeaderSelecting && col >= 0) {
            this.grid.selection.endCol = col;
            this.grid.selection.type = 'column-range';
            this.grid.renderAll();
            this.grid.startAutoScroll(e.clientX, e.clientY);
        } else {
            this.grid.colHeaderCanvas.style.cursor = onColBorder ? 'col-resize' : 'default';
            this.grid.startAutoScroll(e.clientX, e.clientY);
        }
    }

    onMouseUp(e) {
        if (this.grid.isColHeaderSelecting) {
            this.grid.isColHeaderSelecting = false;
        }
    }

    hitTest(e){
        if(e.target === this.grid.colHeaderCanvas){
            return true;
        }
        else {
            return false;
        }
    }
}
