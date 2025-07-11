export class RowSelectionEvents {
    constructor(grid) {
        this.grid = grid;
    }

    onMouseDown(e) {
        const { row } = this.grid.getRowHeaderAt(e.offsetY);
        if (row >= 0) {
            this.grid.isRowHeaderSelecting = true;
            this.grid.selection.startRow = row;
            this.grid.selection.endRow = row;
            this.grid.selection.type = 'row-range';
            this.grid.selection.startCol = 0;
            this.grid.selection.endCol = this.grid.columns.length - 1;
            this.grid.renderAll();
        }
    }

    onMouseMove(e) {
        const { row, onRowBorder } = this.grid.getRowHeaderAt(e.offsetY);
        this.grid.lastMouseClientX = e.clientX;
        this.grid.lastMouseClientY = e.clientY;
        if (this.grid.isRowHeaderSelecting && row >= 0) {
            this.grid.selection.endRow = row;
            this.grid.selection.type = 'row-range';
            this.grid.renderAll();
            this.grid.startAutoScroll(e.clientX, e.clientY);
        }
    }

    onMouseUp(e) {
        if (this.grid.isRowHeaderSelecting) {
            this.grid.isRowHeaderSelecting = false;
        }
    }

    hitTest(e){
        if(e.target === this.grid.rowHeaderCanvas){
            return true;
        }
        else {
            return false;
        }
    }
}
