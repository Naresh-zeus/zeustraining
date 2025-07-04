export class Cell {
    constructor(row, col, value) {
        this.row = row;
        this.col = col;
        this.value = value;
        this.selected = false;
        this.editing = false;
    }
}