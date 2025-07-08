import { excelColumnName } from './excelColumnName.js';
import { Selection } from './Selection.js';
import { Column } from './Column.js';
import { Row } from './Row.js';
import { EditCellCommand, ResizeColumnCommand, ResizeRowCommand } from './Command.js';

// ...existing code for the full Grid class, using the above imports...
export class Grid {
    /**
     * @param {HTMLCanvasElement} mainCanvas
     * @param {HTMLCanvasElement} colHeaderCanvas
     * @param {HTMLCanvasElement} rowHeaderCanvas
     * @param {number} rowCount
     * @param {number} colCount
     */
    constructor(mainCanvas, colHeaderCanvas, rowHeaderCanvas, rowCount, colCount) {
        this.mainCanvas = mainCanvas;
        this.colHeaderCanvas = colHeaderCanvas;
        this.rowHeaderCanvas = rowHeaderCanvas;
        this.mainCtx = mainCanvas.getContext('2d');
        this.colHeaderCtx = colHeaderCanvas.getContext('2d');
        this.rowHeaderCtx = rowHeaderCanvas.getContext('2d');
        this.rows = [];
        this.columns = [];
        this.selection = new Selection();
        this.undoStack = [];
        this.redoStack = [];
        this.data = [];
        this.scrollY = 0;
        this.scrollX = 0;
        this.headerHeight = 24;
        this.rowHeaderWidth = 50;
        this.resizingCol = -1;
        this.resizingRow = -1;
        this.isResizing = false;
        this.resizeStart = 0;
        this.resizeInitialSize = 0;
        this.isSelecting = false;
        this.resizeGuidePos = null;
        this.isRowHeaderSelecting = false;
        this.isColHeaderSelecting = false;
        this.autoScrollInterval = null;
        this.autoScrollDirection = { x: 0, y: 0 };

        // Generate Excel-style column names (A, B, ..., Z, AA, AB, ..., ALL)
        for (let i = 0; i < colCount; i++) {
            const name = excelColumnName(i);
            this.columns.push(new Column(i, name));
        }
        for (let i = 0; i < rowCount; i++) {
            this.rows.push(new Row(i, colCount));
        }

        this.initEvents();
        this.renderAll();
    }

    computeSelectionStats() {
        let values = [];
        for (let r = Math.min(this.selection.startRow, this.selection.endRow); r <= Math.max(this.selection.startRow, this.selection.endRow); r++) {
            for (let c = Math.min(this.selection.startCol, this.selection.endCol); c <= Math.max(this.selection.startCol, this.selection.endCol); c++) {
                let cell = this.rows[r]?.cells[c];
                if (cell) {
                    let num = Number(cell.value);
                    if (!isNaN(num)) {
                        values.push(num);
                    }
                }
            }
        }
        let count = values.length;
        let min = count > 0 ? Math.min(...values) : null;
        let max = count > 0 ? Math.max(...values) : null;
        let sum = count > 0 ? values.reduce((a, b) => a + b, 0) : 0;
        let avg = count > 0 ? sum / count : null;
        return { count, min, max, sum, avg };
    }

    loadData(data) {
        this.data = data;
        for (let i = 0; i < Math.min(data.length, this.rows.length); i++) {
            let rowData = data[i];
            let row = this.rows[i];
            let keys = Object.keys(rowData);
            for (let j = 0; j < Math.min(keys.length, row.cells.length); j++) {
                row.cells[j].value = rowData[keys[j]];
            }
        }
        this.renderAll();
    }

    initEvents() {

        document.addEventListener('mouseup', () => {
            this.isRowHeaderSelecting = false;
            this.isColHeaderSelecting = false;
            this.isSelecting = false;
            this.isResizing = false;
            this.resizingCol = -1;
            this.resizingRow = -1;
            this.resizeGuidePos = null;
            document.body.style.cursor = '';
            this.renderAll();
        });

        // Main grid canvas: scroll, selection, resizing, editing
        this.mainCanvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.mainCanvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.mainCanvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.mainCanvas.addEventListener('dblclick', this.onDoubleClick.bind(this));
        this.mainCanvas.addEventListener('wheel', this.onWheel.bind(this));

        // Column header: resizing, selection, editing
        this.colHeaderCanvas.addEventListener('mousedown', this.onColHeaderMouseDown.bind(this));
        this.colHeaderCanvas.addEventListener('mousemove', this.onColHeaderMouseMove.bind(this));
        this.colHeaderCanvas.addEventListener('mouseup', this.onColHeaderMouseUp.bind(this));
        this.colHeaderCanvas.addEventListener('dblclick', this.onColHeaderDoubleClick.bind(this));
        this.colHeaderCanvas.addEventListener('wheel', this.onWheel.bind(this));

        // Row header: resizing, selection
        this.rowHeaderCanvas.addEventListener('mousedown', this.onRowHeaderMouseDown.bind(this));
        this.rowHeaderCanvas.addEventListener('mousemove', this.onRowHeaderMouseMove.bind(this));
        this.rowHeaderCanvas.addEventListener('wheel', this.onWheel.bind(this));
        this.rowHeaderCanvas.addEventListener('mouseup', this.onRowHeaderMouseUp.bind(this));

        // Keyboard events for undo/redo, editing
        window.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    // --- Event handlers for main grid canvas ---
    onMouseDown(e) {
        const { row, col } = this.getCellAtMain(e.offsetX, e.offsetY);
        if (row >= 0 && col >= 0) {
            this.selection.startRow = row;
            this.selection.startCol = col;
            this.selection.endRow = row;
            this.selection.endCol = col;
            this.selection.type = 'range';
            this.isSelecting = true;
            this.renderAll();
        }
    }

    onMouseMove(e) {
        // Track last mouse position for auto-scroll
        this.lastMouseClientX = e.clientX;
        this.lastMouseClientY = e.clientY;
        if (this.isSelecting) {
            const { row, col } = this.getCellAtMain(e.offsetX, e.offsetY);
            if (row >= 0 && col >= 0) {
                this.selection.endRow = row;
                this.selection.endCol = col;
                this.selection.type = 'range';
                this.renderAll();
            }
            // Auto-scroll
            this.startAutoScroll(e.clientX, e.clientY);
        } else {
            // Stop auto-scroll if not selecting
            this.startAutoScroll(e.clientX, e.clientY);
        }
    }

    onMouseUp(e) {
        this.isSelecting = false;
    }
    onDoubleClick(e) {
        const { row, col } = this.getCellAtMain(e.offsetX, e.offsetY);
        if (row >= 0 && col >= 0) {
            let cell = this.rows[row].cells[col];
            cell.editing = true;
            this.renderAll();
            this.showEditor(row, col, cell.value);
        }
    }

    // --- Event handlers for column header canvas ---
    onColHeaderMouseDown(e) {
        const { col, onColBorder } = this.getColHeaderAt(e.offsetX);
        if (onColBorder) {
            this.resizingCol = col;
            this.isResizing = true;
            this.resizeStart = e.clientX;
            this.resizeInitialSize = this.columns[col].width;
            this.resizeGuidePos = null;
            document.body.style.cursor = 'col-resize';
            return;
        }
        if (col >= 0) {
            this.isColHeaderSelecting = true;
            this.selection.startCol = col;
            this.selection.endCol = col;
            this.selection.type = 'column-range';
            this.selection.startRow = 0;
            this.selection.endRow = this.rows.length - 1;
            this.renderAll();
        }
    }
    onColHeaderMouseMove(e) {
        this.lastMouseClientX = e.clientX;
        this.lastMouseClientY = e.clientY;
        const { col, onColBorder } = this.getColHeaderAt(e.offsetX);
        if (this.isColHeaderSelecting && col >= 0) {
            this.selection.endCol = col;
            this.selection.type = 'column-range';
            this.renderAll();
            this.startAutoScroll(e.clientX, e.clientY);
        } else {
            this.startAutoScroll(e.clientX, e.clientY);
        }
        if (this.isResizing && this.resizingCol >= 0) {
            let delta = e.clientX - this.resizeStart;
            let newWidth = Math.max(30, this.resizeInitialSize + delta);
            this.resizeGuidePos = e.offsetX;
            this.renderAll();
            // Draw guide line
            const ctx = this.colHeaderCtx;
            ctx.save();
            ctx.strokeStyle = "#137E43";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.resizeGuidePos, 0);
            ctx.lineTo(this.resizeGuidePos, this.headerHeight);
            ctx.stroke();
            ctx.restore();
            return;
        }
        this.colHeaderCanvas.style.cursor = onColBorder ? 'col-resize' : 'default';
    }
    onColHeaderMouseUp(e) {
        if (this.isResizing && this.resizingCol >= 0) {
            let col = this.resizingCol;
            let delta = e.clientX - this.resizeStart;
            if (Math.abs(delta) > 2) {
                let oldWidth = this.resizeInitialSize;
                let newWidth = Math.max(30, this.resizeInitialSize + delta);
                this.columns[col].width = newWidth;
                this.pushCommand(new ResizeColumnCommand(this, col, oldWidth, newWidth));
            }
        }
    }


    onColHeaderDoubleClick(e) {
        const { col } = this.getColHeaderAt(e.offsetX);
        if (col >= 0) {
            this.showColumnNameEditor(col, this.columns[col].name);
        }
    }

    // --- Row header drag selection ---
    onRowHeaderMouseDown(e) {
        const { row, onRowBorder } = this.getRowHeaderAt(e.offsetY);
        if (onRowBorder) {
            this.resizingRow = row;
            this.isResizing = true;
            this.resizeStart = e.clientY;
            this.resizeInitialSize = this.rows[row].height;
            return;
        }
        if (row >= 0) {
            this.isRowHeaderSelecting = true;
            this.selection.startRow = row;
            this.selection.endRow = row;
            this.selection.type = 'row-range';
            this.selection.startCol = 0;
            this.selection.endCol = this.columns.length - 1;
            this.renderAll();
        }
    }
    onRowHeaderMouseMove(e) {
        this.lastMouseClientX = e.clientX;
        this.lastMouseClientY = e.clientY;
        const { row, onRowBorder } = this.getRowHeaderAt(e.offsetY);
        // Show row-resize cursor if near border and not currently resizing
        if (!this.isResizing && onRowBorder) {
            this.rowHeaderCanvas.style.cursor = 'row-resize';
        } else {
            this.rowHeaderCanvas.style.cursor = '';
        }
        if (this.isRowHeaderSelecting && row >= 0) {
            this.selection.endRow = row;
            this.selection.type = 'row-range';
            this.renderAll();
            this.startAutoScroll(e.clientX, e.clientY);
        } else {
            this.startAutoScroll(e.clientX, e.clientY);
        }
        if (this.isResizing && this.resizingRow >= 0) {
            let delta = e.clientY - this.resizeStart;
            let newHeight = Math.max(16, this.resizeInitialSize + delta);
            // Only visually update the row height for feedback, but do not commit it yet
            this.rows[this.resizingRow].__previewHeight = newHeight;
            this.rows[this.resizingRow].height = newHeight;
            this.renderAll();
            return;
        }
    }

    onRowHeaderMouseUp(e) {
        // Only handle resizing logic here if needed
        console.log("dfds")
        if (this.isResizing && this.resizingRow >= 0) {
            let row = this.resizingRow;
            let oldHeight = this.resizeInitialSize;
            let newHeight = this.rows[row].height;
            // Only push command if height actually changed
            if (Math.abs(newHeight - oldHeight) > 0.5) {
                // Reset the row height to the original before pushing the command
                this.rows[row].height = oldHeight;
                this.renderAll();
                this.pushCommand(new ResizeRowCommand(this, row, oldHeight, newHeight));
            }
        }
    }

    startAutoScroll(mouseX, mouseY) {
        // Only allow auto-scroll if mouse is down and dragging (selecting)
        if (!(this.isSelecting || this.isColHeaderSelecting || this.isRowHeaderSelecting)) {
            // Not dragging, stop auto-scroll if running
            if (this.autoScrollRAF) {
                cancelAnimationFrame(this.autoScrollRAF);
                this.autoScrollRAF = null;
            }
            this.autoScrollDirection = { x: 0, y: 0 };
            return;
        }

        const mainRect = this.mainCanvas.getBoundingClientRect();
        const edge = 30; // px from edge to start scrolling
        let dirX = 0, dirY = 0;

        if (mouseX < mainRect.left + edge) dirX = -1;
        else if (mouseX > mainRect.right - edge) dirX = 1;
        if (mouseY < mainRect.top + edge) dirY = -1;
        else if (mouseY > mainRect.bottom - edge) dirY = 1;

        this.autoScrollDirection = { x: dirX, y: dirY };

        if ((dirX !== 0 || dirY !== 0) && !this.autoScrollRAF) {
            const step = () => {
                this.doAutoScroll();
                if (this.autoScrollDirection.x !== 0 || this.autoScrollDirection.y !== 0) {
                    this.autoScrollRAF = requestAnimationFrame(step);
                } else {
                    this.autoScrollRAF = null;
                }
            };
            this.autoScrollRAF = requestAnimationFrame(step);
        } else if (dirX === 0 && dirY === 0 && this.autoScrollRAF) {
            cancelAnimationFrame(this.autoScrollRAF);
            this.autoScrollRAF = null;
        }
    }

    doAutoScroll() {
        const scrollStep = 20;
        let changed = false;

        if (this.autoScrollDirection.x !== 0) {
            let totalWidth = this.columns.reduce((sum, col) => sum + col.width, 0);
            let newScrollX = this.scrollX + this.autoScrollDirection.x * scrollStep;
            newScrollX = Math.max(0, Math.min(totalWidth - this.mainCanvas.width, newScrollX));
            if (newScrollX !== this.scrollX) {
                this.scrollX = newScrollX;
                changed = true;
            }
        }
        if (this.autoScrollDirection.y !== 0) {
            let totalHeight = this.rows.reduce((sum, row) => sum + row.height, 0);
            let newScrollY = this.scrollY + this.autoScrollDirection.y * scrollStep;
            newScrollY = Math.max(0, Math.min(totalHeight - this.mainCanvas.height, newScrollY));
            if (newScrollY !== this.scrollY) {
                this.scrollY = newScrollY;
                changed = true;
            }
        }
        if (changed) {
            // Update selection based on last mouse position
            const mainRect = this.mainCanvas.getBoundingClientRect();
            const offsetX = this.lastMouseClientX - mainRect.left;
            const offsetY = this.lastMouseClientY - mainRect.top;

            if (this.isSelecting) {
                const { row, col } = this.getCellAtMain(offsetX, offsetY);
                if (row >= 0 && col >= 0) {
                    this.selection.endRow = row;
                    this.selection.endCol = col;
                    this.selection.type = 'range';
                }
            } else if (this.isColHeaderSelecting) {
                const { col } = this.getColHeaderAt(offsetX);
                if (col >= 0) {
                    this.selection.endCol = col;
                    this.selection.type = 'column-range';
                }
            } else if (this.isRowHeaderSelecting) {
                const { row } = this.getRowHeaderAt(offsetY);
                if (row >= 0) {
                    this.selection.endRow = row;
                    this.selection.type = 'row-range';
                }
            }
            this.renderAll();
        }
    }


    // --- Shared event handlers ---
    onWheel(e) {
        this.scrollY += e.deltaY;
        this.scrollX += e.deltaX;
        this.scrollY = Math.max(0, this.scrollY);
        this.scrollX = Math.max(0, this.scrollX);
        this.renderAll();
        e.preventDefault();
    }
    onKeyDown(e) {
        if (e.ctrlKey && e.key === 'z') {
            this.undo();
        } else if (e.ctrlKey && e.key === 'y') {
            this.redo();
        }
    }

    pushCommand(cmd) {

        cmd.execute();
        this.undoStack.push(cmd);
        this.redoStack = [];
        console.log('Command pushed:', this.undoStack);
    }
    undo() {
        console.log('Undoing command:');
        if (this.undoStack.length > 0) {
            let cmd = this.undoStack.pop();
            cmd.undo();
            this.redoStack.push(cmd);
        }
    }
    redo() {
        if (this.redoStack.length > 0) {
            let cmd = this.redoStack.pop();
            cmd.execute();
            this.undoStack.push(cmd);
        }
    }

    // --- Hit testing helpers ---
    getCellAtMain(px, py) {
        let x = -this.scrollX;
        let y = -this.scrollY;
        let col = -1, row = -1;
        // Find row
        let yy = y;
        for (let r = 0; r < this.rows.length; r++) {
            let h = this.rows[r].height;
            if (py >= yy && py < yy + h) {
                row = r;
                break;
            }
            yy += h;
            if (yy > this.mainCanvas.height) break;
        }
        // Find col
        let xx = x;
        for (let c = 0; c < this.columns.length; c++) {
            let w = this.columns[c].width;
            if (px >= xx && px < xx + w) {
                col = c;
                break;
            }
            xx += w;
            if (xx > this.mainCanvas.width) break;
        }
        return { row, col };
    }
    getColHeaderAt(px) {
        let x = -this.scrollX;
        let col = -1, onColBorder = false;
        for (let c = 0; c < this.columns.length; c++) {
            let w = this.columns[c].width;
            if (px >= x + w - 3 && px <= x + w + 3) {
                col = c;
                onColBorder = true;
                break;
            }
            if (px >= x && px < x + w) {
                col = c;
                break;
            }
            x += w;
            if (x > this.colHeaderCanvas.width) break;
        }
        return { col, onColBorder };
    }
    getRowHeaderAt(py) {
        let y = -this.scrollY;
        let row = -1, onRowBorder = false;
        for (let r = 0; r < this.rows.length; r++) {
            let h = this.rows[r].height;
            if (py >= y + h - 3 && py <= y + h + 3) {
                row = r;
                onRowBorder = true;
                break;
            }
            if (py >= y && py < y + h) {
                row = r;
                break;
            }
            y += h;
            if (y > this.rowHeaderCanvas.height) break;
        }
        return { row, onRowBorder };
    }

    // --- Editor popups ---

    showEditor(row, col, value) {
        let x = 0;
        for (let c = 0; c < col; c++) x += this.columns[c].width;
        let y = 0;
        for (let r = 0; r < row; r++) y += this.rows[r].height;

        // Get cell dimensions
        const cellWidth = this.columns[col].width;
        const cellHeight = this.rows[row].height;

        // Create input
        let input = document.createElement('input');
        input.type = 'text';
        input.value = value;

        // Determine alignment: right for integer, left for text
        let isInteger = /^-?\d+$/.test(value.trim());
        input.style.textAlign = isInteger ? 'right' : 'left';
        input.style.paddingLeft = isInteger ? '0px' : '3px';
        input.style.paddingRight = isInteger ? '3px' : '0px';

        // Style input to fit exactly inside the cell, no zoom, no border
        input.style.position = 'absolute';
        // Calculate left position for right/left alignment
        let cellLeft = this.mainCanvas.getBoundingClientRect().left + x;
        let cellTop = this.mainCanvas.getBoundingClientRect().top + y;
        let inputWidth = cellWidth;
        // For right-aligned (integer), shift input to the right edge
        if (isInteger) {
            // Optionally, you can make the input a bit narrower for visual effect (e.g., -4px)
            inputWidth = cellWidth; // or cellWidth - 2 if you want a gap
            input.style.left = (cellLeft + cellWidth - inputWidth) + 'px';
        } else {
            // Left-aligned (string)
            input.style.left = cellLeft + 'px';
        }
        input.style.top = cellTop + 'px';
        input.style.width = inputWidth + 'px';
        input.style.height = cellHeight + 'px';
        input.style.fontSize = '14px';
        input.style.fontFamily = 'sans-serif';
        input.style.fontWeight = 'normal';
        // input.style.padding = input.style.padding || '3px';
        input.style.margin = '0px';
        input.style.border = 'none';
        input.style.outline = 'none';
        input.style.background = 'transparent';
        input.style.color = '#000';
        input.style.zIndex = 1000;
        input.style.boxSizing = 'border-box';

        document.body.appendChild(input);
        input.focus();
        input.select();

        input.addEventListener('blur', () => {
            let oldValue = this.rows[row].cells[col].value;
            let newValue = input.value;
            this.rows[row].cells[col].editing = false;
            document.body.removeChild(input);
            if (oldValue !== newValue) {
                this.pushCommand(new EditCellCommand(this, row, col, oldValue, newValue));
            } else {
                this.renderAll();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });
    }

    // --- Rendering ---
    renderAll() {
        this.renderColHeader();
        this.renderRowHeader();
        this.renderMainGrid();
        // if (typeof statusBar !== 'undefined') {
        //     const stats = this.computeSelectionStats();
        //     statusBar.textContent = `Count: ${stats.count}  Min: ${stats.min}  Max: ${stats.max}  Sum: ${stats.sum}  Avg: ${stats.avg}`;
        // }
    }

    renderColHeader() {
        const ctx = this.colHeaderCtx;
        ctx.clearRect(0, 0, this.colHeaderCanvas.width, this.colHeaderCanvas.height);

        // Check if we're in row selection mode - if so, highlight entire column header
        let isRowSelection = (
            this.selection.type === 'row' ||
            this.selection.type === 'row-range'
        );

        // Fill entire column header background if row or row-range is selected
        if (isRowSelection) {
            ctx.fillStyle = "#CAEAD8"; // Light green background
            ctx.fillRect(0, 0, this.colHeaderCanvas.width, this.headerHeight);

            // Draw dark green bottom edge for entire column header
            ctx.save();
            ctx.strokeStyle = "#137E43";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, this.headerHeight - 1.5);
            ctx.lineTo(this.colHeaderCanvas.width, this.headerHeight - 1.5);
            ctx.stroke();
            ctx.restore();
        }
        let x = -this.scrollX;
        for (let c = 0; c < this.columns.length; c++) {
            let col = this.columns[c];
            let isColRange =
                (this.selection.type === 'column-range' &&
                    c >= Math.min(this.selection.startCol, this.selection.endCol) &&
                    c <= Math.max(this.selection.startCol, this.selection.endCol));
            let isSelectedCol =
                (this.selection.type === 'column' && this.selection.startCol === c) || isColRange;

            if (!isRowSelection) {
                if (isSelectedCol) {
                    ctx.fillStyle = "#137E43"; // Dark green for selected column header
                } else {
                    ctx.fillStyle = "#F5F5F5";
                }
                ctx.fillRect(x, 0, col.width, this.headerHeight);
            }
            if (x > this.colHeaderCanvas.width) break;
            if (x + col.width >= 0) {
                // Highlight if this is the selected column header for the active cell
                // ...inside renderColHeader()...
                let isColRange =
                    (this.selection.type === 'column-range' &&
                        c >= Math.min(this.selection.startCol, this.selection.endCol) &&
                        c <= Math.max(this.selection.startCol, this.selection.endCol));
                let isSelectedCol =
                    (this.selection.type === 'column' && this.selection.startCol === c) || isColRange;

                if (!isRowSelection) {
                    if (isSelectedCol) {
                        ctx.fillStyle = "#137E43"; // Dark green for selected column header (single or range)
                    } else if (
                        (this.selection.type === 'cell' && c === this.selection.startCol) ||
                        ((this.selection.type === 'range' || this.selection.type === 'cell') &&
                            c >= Math.min(this.selection.startCol, this.selection.endCol) &&
                            c <= Math.max(this.selection.startCol, this.selection.endCol))
                    ) {
                        ctx.fillStyle = "#CAEAD8"; // Light green
                    } else {
                        ctx.fillStyle = "#F5F5F5"; // Default gray
                    }
                    ctx.fillRect(x, 0, col.width, this.headerHeight);

                    // Draw dark green underline for active cell or range
                    if (
                        (this.selection.type === 'cell' && c === this.selection.startCol) ||
                        ((this.selection.type === 'range' || this.selection.type === 'cell') &&
                            c >= Math.min(this.selection.startCol, this.selection.endCol) &&
                            c <= Math.max(this.selection.startCol, this.selection.endCol))
                    ) {
                        ctx.save();
                        ctx.strokeStyle = "#137E43";
                        ctx.lineWidth = 3;
                        ctx.beginPath();
                        ctx.moveTo(x, this.headerHeight - 1.5);
                        ctx.lineTo(x + col.width, this.headerHeight - 1.5);
                        ctx.stroke();
                        ctx.restore();
                    }
                }

                ctx.strokeStyle = "#bbb"; // greyish grid line
                ctx.strokeRect(x + 0.5, 0 + 0.5, col.width, this.headerHeight);

                // Set text color (white for selected column, black for others)
                ctx.fillStyle = (isSelectedCol && !isRowSelection) ? "#fff" : "#616174";
                ctx.font = "14px sans-serif";
                // Center the column name
                const text = col.name;
                const textWidth = ctx.measureText(text).width;
                const textX = x + (col.width - textWidth) / 2;
                ctx.textBaseline = "bottom";
                ctx.fillText(text, textX, this.headerHeight - 3);
            }
            x += col.width;
        }
    }

    renderRowHeader() {
        const ctx = this.rowHeaderCtx;
        ctx.clearRect(0, 0, this.rowHeaderCanvas.width, this.rowHeaderCanvas.height);

        // Check if we're in column selection mode - if so, highlight entire row header
        let isColumnSelection = (
            this.selection.type === 'column' ||
            this.selection.type === 'column-range'
        );

        // Fill entire row header background if column or column-range is selected
        if (isColumnSelection) {
            ctx.fillStyle = "#CAEAD8"; // Light green background
            ctx.fillRect(0, 0, this.rowHeaderWidth, this.rowHeaderCanvas.height);

            // Draw dark green right edge for entire row header
            ctx.save();
            ctx.strokeStyle = "#137E43";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(this.rowHeaderWidth - 1.5, 0);
            ctx.lineTo(this.rowHeaderWidth - 1.5, this.rowHeaderCanvas.height);
            ctx.stroke();
            ctx.restore();
        }

        let y = -this.scrollY;
        for (let r = 0; r < this.rows.length; r++) {
            let row = this.rows[r];
            let rowY = y;
            let isRowRange =
                (this.selection.type === 'row-range' &&
                    r >= Math.min(this.selection.startRow, this.selection.endRow) &&
                    r <= Math.max(this.selection.startRow, this.selection.endRow));
            let isSelectedRow = (this.selection.type === 'row' && this.selection.startRow === r) || isRowRange;

            // Highlight for cell/cell-range selection
            let isCellRange =
                (this.selection.type === 'range' || this.selection.type === 'cell') &&
                r >= Math.min(this.selection.startRow, this.selection.endRow) &&
                r <= Math.max(this.selection.startRow, this.selection.endRow);

            if (!isColumnSelection) {
                if (isSelectedRow) {
                    ctx.fillStyle = "#137E43"; // Dark green for selected row header (single or range)
                } else if (isCellRange) {
                    ctx.fillStyle = "#CAEAD8"; // Light green for cell/cell-range selection
                } else {
                    ctx.fillStyle = "#f0f0f0";
                }
                ctx.fillRect(0, rowY, this.rowHeaderWidth, row.height);
            }

            if (!isColumnSelection && isCellRange) {
                ctx.save();
                ctx.strokeStyle = "#137E43";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(this.rowHeaderWidth - 1.5, rowY);
                ctx.lineTo(this.rowHeaderWidth - 1.5, rowY + row.height);
                ctx.stroke();
                ctx.restore();
            }

            if (rowY > this.rowHeaderCanvas.height) break;
            if (rowY + row.height >= 0) {
                // Draw grid line
                ctx.strokeStyle = "#bbb";
                ctx.strokeRect(0 + 0.5, rowY + 0.5, this.rowHeaderWidth, row.height);

                // Set text color (white for selected row/range, black for others)
                ctx.fillStyle = isSelectedRow ? "#fff" : "#616174";
                ctx.font = "14px sans-serif";
                ctx.textAlign = "right";
                ctx.textBaseline = "bottom";
                ctx.fillText((r + 1).toString(), this.rowHeaderWidth - 6, rowY + row.height - 3);
                ctx.textAlign = "left";
            }
            y += row.height;
        }
    }

    renderMainGrid() {
        const ctx = this.mainCtx;
        ctx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);

        let y = -this.scrollY;
        for (let r = 0; r < this.rows.length; r++) {
            let row = this.rows[r];
            let rowY = y;
            if (rowY > this.mainCanvas.height) break;
            if (rowY + row.height >= 0) {
                let x = Math.floor(-this.scrollX);

                // Check if this row is selected
                let isSelectedRow = (this.selection.type === 'row' && this.selection.startRow === r);

                for (let c = 0; c < this.columns.length; c++) {
                    let col = this.columns[c];
                    if (x > this.mainCanvas.width) break;
                    if (x + col.width >= 0) {
                        let cell = row.cells[c];

                        // Check if this column is selected
                        let isSelectedColumn = (this.selection.type === 'column' && this.selection.startCol === c);

                        let bgColor = "#fff"; // Default white

                        // Light green for column or row selection (except anchor cell)
                        if (
                            (this.selection.type === 'column' && this.selection.startCol === c) ||
                            (this.selection.type === 'column-range' &&
                                c >= Math.min(this.selection.startCol, this.selection.endCol) &&
                                c <= Math.max(this.selection.startCol, this.selection.endCol))
                        ) {
                            if (!(r === this.selection.startRow && c === this.selection.startCol)) {
                                bgColor = "#CAEAD8";
                            }
                        } else if (
                            (this.selection.type === 'row' && this.selection.startRow === r) ||
                            (this.selection.type === 'row-range' &&
                                r >= Math.min(this.selection.startRow, this.selection.endRow) &&
                                r <= Math.max(this.selection.startRow, this.selection.endRow))
                        ) {
                            if (!(r === this.selection.startRow && c === this.selection.startCol)) {
                                bgColor = "#CAEAD8";
                            }
                        }

                        // Light green for range selection, except anchor cell
                        if (
                            (this.selection.type === "range" || this.selection.type === "cell") &&
                            this.selection.contains(r, c) &&
                            !(r === this.selection.startRow && c === this.selection.startCol)
                        ) {
                            bgColor = "#CAEAD8";
                        }

                        ctx.fillStyle = bgColor;
                        ctx.fillRect(x, rowY, col.width, row.height);

                        // Draw grid line
                        ctx.strokeStyle = "#d0d0d0";
                        ctx.strokeRect(x + 0.5, rowY + 0.5, col.width, row.height);

                        // Draw cell value
                        ctx.fillStyle = "#000";
                        ctx.font = "14px sans-serif";
                        // If integer, right-align; else, left-align
                        let isInteger = /^-?\d+$/.test((cell.value || '').toString().trim());
                        if (isInteger) {
                            ctx.textAlign = "right";
                            ctx.fillText(cell.value, x + col.width - 4, rowY + row.height - 2);
                        } else {
                            ctx.textAlign = "left";
                            ctx.fillText(cell.value, x + 4, rowY + row.height - 2);
                        }
                        ctx.textBaseline = "bottom";

                        // Draw green border for active cell (only if not in column/row selection mode)
                        // if (
                        //     this.selection.type === "cell" &&
                        //     r === this.selection.startRow &&
                        //     c === this.selection.startCol
                        // ) {
                        //     ctx.save();
                        //     ctx.strokeStyle = "#137E43";
                        //     ctx.lineWidth = 2;
                        //     ctx.strokeRect(x + 1, rowY + 1, col.width - 2, row.height - 2);
                        //     ctx.restore();
                        // }


                        // Draw dark green left and right edges for selected column
                        if (isSelectedColumn) {
                            ctx.save();
                            ctx.strokeStyle = "#137E43";
                            ctx.lineWidth = 3;

                            // Left edge
                            ctx.beginPath();
                            ctx.moveTo(x + 1.5, rowY);
                            ctx.lineTo(x + 1.5, rowY + row.height);
                            ctx.stroke();

                            // Right edge
                            ctx.beginPath();
                            ctx.moveTo(x + col.width - 1.5, rowY);
                            ctx.lineTo(x + col.width - 1.5, rowY + row.height);
                            ctx.stroke();

                            ctx.restore();
                        }

                        // Draw dark green top and bottom edges for selected row
                        if (isSelectedRow) {
                            ctx.save();
                            ctx.strokeStyle = "#137E43";
                            ctx.lineWidth = 3;

                            // Top edge
                            ctx.beginPath();
                            ctx.moveTo(x, rowY + 1.5);
                            ctx.lineTo(x + col.width, rowY + 1.5);
                            ctx.stroke();

                            // Bottom edge
                            ctx.beginPath();
                            ctx.moveTo(x, rowY + row.height - 1.5);
                            ctx.lineTo(x + col.width, rowY + row.height - 1.5);
                            ctx.stroke();

                            ctx.restore();
                        }
                    }
                    x += col.width;
                }
            }
            y += row.height;
        }
        // Draw green border and fill handle for selected cell or range
        if (this.selection.type === "range" || this.selection.type === "cell") {
            const minRow = Math.min(this.selection.startRow, this.selection.endRow);
            const maxRow = Math.max(this.selection.startRow, this.selection.endRow);
            const minCol = Math.min(this.selection.startCol, this.selection.endCol);
            const maxCol = Math.max(this.selection.startCol, this.selection.endCol);

            // Calculate top-left and bottom-right coordinates
            let x = -this.scrollX;
            for (let c = 0; c < minCol; c++) x += this.columns[c].width;
            let y = -this.scrollY;
            for (let r = 0; r < minRow; r++) y += this.rows[r].height;

            let w = 0;
            for (let c = minCol; c <= maxCol; c++) w += this.columns[c].width;
            let h = 0;
            for (let r = minRow; r <= maxRow; r++) h += this.rows[r].height;

            ctx.save();
            ctx.strokeStyle = "#137E43";
            ctx.lineWidth = 2;

            // Draw Excel-style border
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + w, y);
            ctx.moveTo(x + w, y - 1);
            ctx.lineTo(x + w, y + h - 4);
            ctx.moveTo(x + w - 4, y + h);
            ctx.lineTo(x, y + h);
            ctx.moveTo(x, y + h + 1);
            ctx.lineTo(x, y - 1);
            ctx.stroke();

            // Draw Excel-style fill handle
            ctx.fillStyle = "rgb(16,124,65)";
            ctx.fillRect(x + w - 2.8, y + h - 2.8, 4.5, 4.5);

            ctx.restore();
        }

        // Highlight the whole selected column with dark green lines
        if (this.selection.type === 'column') {
            const colIdx = this.selection.startCol;
            if (colIdx >= 0 && colIdx < this.columns.length) {
                // Calculate x position and width of the selected column
                let x = -this.scrollX;
                for (let c = 0; c < colIdx; c++) x += this.columns[c].width;
                const colWidth = this.columns[colIdx].width;

                // Calculate y position and total height of visible grid
                let y = -this.scrollY;
                let totalHeight = 0;
                for (let r = 0; r < this.rows.length; r++) {
                    if (y + this.rows[r].height >= 0 && y <= this.mainCanvas.height) {
                        totalHeight += this.rows[r].height;
                    }
                    y += this.rows[r].height;
                    if (y > this.mainCanvas.height) break;
                }
                y = -this.scrollY; // reset y to top

                // Draw dark green border around the column
                ctx.save();
                ctx.strokeStyle = "#137E43";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x + 1.5, 0); // left
                ctx.lineTo(x + 1.5, totalHeight);
                ctx.moveTo(x + colWidth - 1.5, 0); // right
                ctx.lineTo(x + colWidth - 1.5, totalHeight);
                ctx.moveTo(x, 1.5); // top
                ctx.lineTo(x + colWidth, 1.5);
                ctx.moveTo(x, totalHeight - 1.5); // bottom
                ctx.lineTo(x + colWidth, totalHeight - 1.5);
                ctx.stroke();
                ctx.restore();
            }
        }
        // Draw thick green border for row-range selection
        if (this.selection.type === "row-range") {
            const minRow = Math.min(this.selection.startRow, this.selection.endRow);
            const maxRow = Math.max(this.selection.startRow, this.selection.endRow);

            // Calculate y position and total height of the selected rows
            let y = -this.scrollY;
            for (let r = 0; r < minRow; r++) y += this.rows[r].height;
            let h = 0;
            for (let r = minRow; r <= maxRow; r++) h += this.rows[r].height;

            ctx.save();
            ctx.strokeStyle = "#137E43";
            ctx.lineWidth = 3;
            ctx.strokeRect(0, y, this.mainCanvas.width, h);
            ctx.restore();
        }

        // Draw thick green border for column-range selection
        if (this.selection.type === "column-range") {
            const minCol = Math.min(this.selection.startCol, this.selection.endCol);
            const maxCol = Math.max(this.selection.startCol, this.selection.endCol);

            // Calculate x position and total width of the selected columns
            let x = -this.scrollX;
            for (let c = 0; c < minCol; c++) x += this.columns[c].width;
            let w = 0;
            for (let c = minCol; c <= maxCol; c++) w += this.columns[c].width;

            ctx.save();
            ctx.strokeStyle = "#137E43";
            ctx.lineWidth = 3;
            ctx.strokeRect(x, 0, w, this.mainCanvas.height);
            ctx.restore();
        }
    }
} // End of renderMainGrid()
