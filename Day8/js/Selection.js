// Unified Selection class supporting all selection types from app.js
export class Selection {
    constructor() {
        this.startRow = 0;
        this.startCol = 0;
        this.endRow = 0;
        this.endCol = 0;
        this.type = ''; // 'cell', 'range', 'row', 'row-range', 'column', 'column-range'
    }
    contains(row, col) {
        return (
            row >= Math.min(this.startRow, this.endRow) &&
            row <= Math.max(this.startRow, this.endRow) &&
            col >= Math.min(this.startCol, this.endCol) &&
            col <= Math.max(this.startCol, this.endCol)
        );
    }
    isRowInRange(row) {
        return this.type === 'row-range' &&
            row >= Math.min(this.startRow, this.endRow) &&
            row <= Math.max(this.startRow, this.endRow);
    }
    isColInRange(col) {
        return this.type === 'column-range' &&
            col >= Math.min(this.startCol, this.endCol) &&
            col <= Math.max(this.startCol, this.endCol);
    }
}