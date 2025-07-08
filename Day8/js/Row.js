import { Cell } from './Cell.js';
export class Row {
    constructor(index, colCount) {
        this.index = index;
        this.cells = [];
        for (let i = 0; i < colCount; i++) {
            this.cells.push(new Cell(index, i, ""));
        }
        this.height = 24;
        this.selected = false;
    }
}
