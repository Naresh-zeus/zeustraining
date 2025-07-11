import { ResizeColumnCommand } from '../Command.js';

export class ColResizer {
    constructor(grid) {
        this.grid = grid;
    }

    onMouseDown(e) {
        const { col, onColBorder } = this.grid.getColHeaderAt(e.offsetX);
        if (onColBorder && col >= 0) {
            this.grid.resizingCol = col;
            this.grid.isResizing = true;
            this.grid.resizeStart = e.clientX;
            this.grid.resizeInitialSize = this.grid.columns[col].width;
            this.grid.resizeGuidePos = null;
            document.body.style.cursor = 'col-resize';
        }
    }

    onMouseMove(e) {

        
        if (this.grid.isResizing && this.grid.resizingCol >= 0) {
            let delta = e.clientX - this.grid.resizeStart;
            let newWidth = Math.max(30, this.grid.resizeInitialSize + delta);
            this.grid.resizeGuidePos = e.offsetX;
            this.grid.renderAll();
            // Draw dashed guide line covering the whole grid height
            const ctx = this.grid.mainCtx;
            ctx.save();
            ctx.strokeStyle = "#137E43";
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]); // Dashed line: 6px dash, 6px gap
            ctx.beginPath();
            ctx.moveTo(this.grid.resizeGuidePos, 0);
            ctx.lineTo(this.grid.resizeGuidePos, this.grid.mainCanvas.height);
            ctx.stroke();
            ctx.setLineDash([]); // Reset dash
            ctx.restore();
            document.body.style.cursor = 'col-resize';

        }

    }

    onMouseUp(e) {
        if (this.grid.isResizing && this.grid.resizingCol >= 0) {
            let col = this.grid.resizingCol;
            let delta = e.clientX - this.grid.resizeStart;
            document.body.style.cursor = '';
            this.grid.resizeGuidePos = null;
            if (Math.abs(delta) > 2) {
                let oldWidth = this.grid.resizeInitialSize;
                let newWidth = Math.max(30, this.grid.resizeInitialSize + delta);
                this.grid.columns[col].width = oldWidth;
                this.grid.renderAll();
                this.grid.pushCommand(new ResizeColumnCommand(this.grid, col, oldWidth, newWidth));
            }
            this.grid.isResizing = false;
            this.grid.resizingCol = -1;
        }
    }

    hitTest(e){
        if(e.target.classlist && e.target.classlist.contains('col-resize')){
            return true;
        }
        else {
            return false;
        }
    }
}