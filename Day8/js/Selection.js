// Unified Selection class supporting all selection types from app.js
export class Selection {
    constructor() {
        // Start row/col and end row/col of selection
        this.startRow = 0;
        this.startCol = 0;
        this.endRow = 0;
        this.endCol = 0;
        // Selection type: 'cell', 'range', 'row', etc.
        this.type = '';
    }

    /**
     * True if (row, col) is in the selection
     * @param {number} row
     * @param {number} col
     */
    contains(row, col) {
        return (
            row >= Math.min(this.startRow, this.endRow) &&
            row <= Math.max(this.startRow, this.endRow) &&
            col >= Math.min(this.startCol, this.endCol) &&
            col <= Math.max(this.startCol, this.endCol)
        );
    }

    /**
     * True if row is in selected row-range
     * @param {number} row
     */
    isRowInRange(row) {
        return this.type === 'row-range' &&
            row >= Math.min(this.startRow, this.endRow) &&
            row <= Math.max(this.startRow, this.endRow);
    }

    /**
     * True if col is in selected column-range
     * @param {number} col
     */
    isColInRange(col) {
        return this.type === 'column-range' &&
            col >= Math.min(this.startCol, this.endCol) &&
            col <= Math.max(this.startCol, this.endCol);
    }
}