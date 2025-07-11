import { ResizeRowCommand } from '../Command.js';

export class RowResizer {
    constructor(grid) {
        this.grid = grid;
        this.isResizing = false;
        this.resizingRow = -1;
        this.resizeStart = 0;
        this.resizeInitialSize = 0;
        this.resizeGuidePos = null;
    }

    onMouseDown(e) {
        const { row, onRowBorder } = this.grid.getRowHeaderAt(e.offsetY);
        if (onRowBorder && row >= 0) {
            this.grid.resizingRow = row;
            this.grid.isResizing = true;
            this.grid.resizeStart = e.clientY;
            this.grid.resizeInitialSize = this.grid.rows[row].height;
            this.grid.resizeGuidePos = null;
            document.body.style.cursor = 'row-resize';
        }
    }

    onMouseMove(e) {
        if (this.grid.isResizing && this.grid.resizingRow >= 0) {
            let delta = e.clientY - this.grid.resizeStart;
            let newHeight = Math.max(16, this.grid.resizeInitialSize + delta);
            this.grid.resizeGuidePos = e.offsetY;
            this.grid.renderAll();
            // Draw guide line
            const ctx = this.grid.rowHeaderCtx;
            ctx.save();
            ctx.strokeStyle = "#137E43";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, this.grid.resizeGuidePos);
            ctx.lineTo(this.grid.rowHeaderCanvas.width, this.grid.resizeGuidePos);
            ctx.stroke();
            ctx.restore();
            document.body.style.cursor = 'row-resize';
        }
    }

    onMouseUp(e) {
        if (this.grid.isResizing && this.grid.resizingRow >= 0) {
            let row = this.grid.resizingRow;
            let delta = e.clientY - this.grid.resizeStart;
            document.body.style.cursor = '';
            this.grid.resizeGuidePos = null;
            let oldHeight = this.grid.resizeInitialSize;
            let newHeight = Math.max(16, this.grid.resizeInitialSize + delta);
            if (Math.abs(newHeight - oldHeight) > 0.5) {
                this.grid.rows[row].height = oldHeight;
                this.grid.renderAll();
                this.grid.pushCommand(new ResizeRowCommand(this.grid, row, oldHeight, newHeight));
            }
            this.grid.isResizing = false;
            this.grid.resizingRow = -1;
        }
    }

    hitTest(e){
        if(e.target.classlist && e.target.classlist.contains('row-resize')){
            return true;
        }
        else {
            return false;
        }
    }
}
