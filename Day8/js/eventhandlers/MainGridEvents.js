// MainGridEvents.js - Handles main grid mouse and keyboard events for the grid
export class MainGridEvents {
    constructor(grid) {
        this.grid = grid;
    }

    onMouseDown(e) {
        const { row, col } = this.grid.getCellAtMain(e.offsetX, e.offsetY);
        if (row >= 0 && col >= 0) {
            this.grid.selection.startRow = row;
            this.grid.selection.startCol = col;
            this.grid.selection.endRow = row;
            this.grid.selection.endCol = col;
            this.grid.selection.type = 'range';
            this.grid.isSelecting = true;
            this.grid.renderAll();
        }
    }

    onMouseMove(e) {
        this.grid.lastMouseClientX = e.clientX;
        this.grid.lastMouseClientY = e.clientY;
        if (this.grid.isSelecting) {
            const { row, col } = this.grid.getCellAtMain(e.offsetX, e.offsetY);
            if (row >= 0 && col >= 0) {
                this.grid.selection.endRow = row;
                this.grid.selection.endCol = col;
                this.grid.selection.type = 'range';
                this.grid.renderAll();
            }
            this.grid.startAutoScroll(e.clientX, e.clientY);
        } else {
            this.grid.startAutoScroll(e.clientX, e.clientY);
        }
    }

    onMouseUp(e) {
        this.grid.isSelecting = false;
    }

    onDoubleClick(e) {
        const { row, col } = this.grid.getCellAtMain(e.offsetX, e.offsetY);
        if (row >= 0 && col >= 0) {
            let cell = this.grid.rows[row].cells[col];
            cell.editing = true;
            this.grid.renderAll();
            this.grid.showEditor(row, col, cell.value);
        }
    }

    hitTest(e){
        if(e.target === this.grid.MainGridEvents){
            return true;
        }
        else {
            return false;
        }
    }
}
