export class Command {
    execute() { }
    undo() { }
}

export class EditCellCommand extends Command {
    constructor(grid, row, col, oldValue, newValue) {
        super();
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }
    execute() {
        this.grid.rows[this.row].cells[this.col].value = this.newValue;
        this.grid.renderAll();
    }
    undo() {
        this.grid.rows[this.row].cells[this.col].value = this.oldValue;
        this.grid.renderAll();
    }
}

export class ResizeColumnCommand extends Command {
    constructor(grid, col, oldWidth, newWidth) {
        super();
        this.grid = grid;
        this.col = col;
        this.oldWidth = oldWidth;
        this.newWidth = newWidth;
    }
    execute() {
        this.grid.columns[this.col].width = this.newWidth;
        this.grid.renderAll();
    }
    undo() {
        this.grid.columns[this.col].width = this.oldWidth;
        this.grid.renderAll();
    }
}

export class ResizeRowCommand extends Command {
    constructor(grid, row, oldHeight, newHeight) {
        super();
        this.grid = grid;
        this.row = row;
        this.oldHeight = oldHeight;
        this.newHeight = newHeight;
    }
    execute() {
        this.grid.rows[this.row].height = this.newHeight;
        this.grid.renderAll();
    }
    undo() {
        this.grid.rows[this.row].height = this.oldHeight;
        this.grid.renderAll();
    }
}