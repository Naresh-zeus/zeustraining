export class Selection {
    constructor() {
        this.startRow = 0;
        this.startCol = 0;
        this.endRow = 0;
        this.endCol = 0;
        this.type = '';
    }
    contains(row, col) {
        return (
            row >= Math.min(this.startRow, this.endRow) &&
            row <= Math.max(this.startRow, this.endRow) &&
            col >= Math.min(this.startCol, this.endCol) &&
            col <= Math.max(this.startCol, this.endCol)
        );
    }
}