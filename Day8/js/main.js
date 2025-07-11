
import { Grid } from './Grid.js';
import { ScrollBar } from './Scrollbar.js';

// --- Setup canvases and grid ---
// Get references to the header and main grid canvases
const colHeaderCanvas = document.getElementById('colHeaderCanvas'); // Top column header canvas
const rowHeaderCanvas = document.getElementById('rowHeaderCanvas'); // Left row header canvas
const mainGridCanvas = document.getElementById('mainGridCanvas');   // Main grid canvas
// const statusBar = document.getElementById('statusBar');             // Status bar element

// Create the main grid instance with 10,000 columns and 500 rows
const grid = new Grid(mainGridCanvas, colHeaderCanvas, rowHeaderCanvas, 10000, 500);

// --- Scrollbar Setup ---
// Get references to the vertical and horizontal scrollbar containers
const vScrollbar = document.getElementById('v-scrollbar');
const hScrollbar = document.getElementById('h-scrollbar');

// Create and append the vertical scrollbar thumb element
const vThumb = document.createElement('div');
vThumb.className = 'thumb';
vScrollbar.appendChild(vThumb);

// Create and append the horizontal scrollbar thumb element
const hThumb = document.createElement('div');
hThumb.className = 'thumb';
hScrollbar.appendChild(hThumb);

// --- Helper functions to get total grid size ---
/**
 * Calculates the total height of all rows in the grid.
 * @returns {number} Total grid height in pixels
 */
function getTotalGridHeight() {
    return grid.rows.reduce((sum, row) => sum + row.height, 0);
}
/**
 * Calculates the total width of all columns in the grid.
 * @returns {number} Total grid width in pixels
 */
function getTotalGridWidth() {
    return grid.columns.reduce((sum, col) => sum + col.width, 0);
}

// --- Update scrollbar thumbs to reflect grid scroll state ---
/**
 * Updates the size and position of the scrollbar thumbs based on the grid's scroll position and visible area.
 */
function updateScrollbars() {
    // Vertical scrollbar
    const visibleHeight = mainGridCanvas.height;
    const totalHeight = getTotalGridHeight();
    const vRatio = visibleHeight / totalHeight;
    const vThumbHeight = Math.max(30, visibleHeight * vRatio); // Minimum thumb size
    const vMaxScroll = Math.max(0, totalHeight - visibleHeight);
    const vThumbTop = vMaxScroll ? (grid.scrollY / vMaxScroll) * (visibleHeight - vThumbHeight) : 0;
    vThumb.style.height = vThumbHeight + 'px';
    vThumb.style.top = vThumbTop + 'px';

    // Horizontal scrollbar
    const visibleWidth = mainGridCanvas.width;
    const totalWidth = getTotalGridWidth();
    const hRatio = visibleWidth / totalWidth;
    const hThumbWidth = Math.max(30, visibleWidth * hRatio); // Minimum thumb size
    const hMaxScroll = Math.max(0, totalWidth - visibleWidth);
    const hThumbLeft = hMaxScroll ? (grid.scrollX / hMaxScroll) * (visibleWidth - hThumbWidth) : 0;
    hThumb.style.width = hThumbWidth + 'px';
    hThumb.style.left = hThumbLeft + 'px';
}

// Patch grid.renderAll to also update scrollbars after rendering
grid.renderAll = (function (orig) {
    return function () {
        orig.call(grid);
        updateScrollbars();
    };
})(grid.renderAll);


// --- Scrollbar drag logic ---

// Vertical scrollbar drag state variables
let vDragging = false, vDragStartY = 0, vStartScrollY = 0;

// Start vertical thumb drag
vThumb.addEventListener('mousedown', e => {
    vDragging = true;
    vDragStartY = e.clientY;
    vStartScrollY = grid.scrollY;
    document.body.style.userSelect = 'none'; // Prevent text selection while dragging
});

// Handle vertical thumb drag movement
document.addEventListener('mousemove', e => {
    if (vDragging) {
        const visibleHeight = mainGridCanvas.height;
        const totalHeight = getTotalGridHeight();
        const vMaxScroll = Math.max(0, totalHeight - visibleHeight);
        const trackHeight = visibleHeight - vThumb.offsetHeight;
        if (trackHeight > 0) {
            let delta = e.clientY - vDragStartY;
            let ratio = delta / trackHeight;
            grid.scrollY = Math.max(0, Math.min(vMaxScroll, vStartScrollY + ratio * vMaxScroll));
            grid.renderAll();
        }
    }
});

// End vertical thumb drag
document.addEventListener('mouseup', () => {
    vDragging = false;
    document.body.style.userSelect = '';
});

// Horizontal scrollbar drag state variables
let hDragging = false, hDragStartX = 0, hStartScrollX = 0;

// Start horizontal thumb drag
hThumb.addEventListener('mousedown', e => {
    hDragging = true;
    hDragStartX = e.clientX;
    hStartScrollX = grid.scrollX;
    document.body.style.userSelect = 'none'; // Prevent text selection while dragging
});

// Handle horizontal thumb drag movement
document.addEventListener('mousemove', e => {
    if (hDragging) {
        const visibleWidth = mainGridCanvas.width;
        const totalWidth = getTotalGridWidth();
        const hMaxScroll = Math.max(0, totalWidth - visibleWidth);
        const trackWidth = visibleWidth - hThumb.offsetWidth;
        if (trackWidth > 0) {
            let delta = e.clientX - hDragStartX;
            let ratio = delta / trackWidth;
            grid.scrollX = Math.max(0, Math.min(hMaxScroll, hStartScrollX + ratio * hMaxScroll));
            grid.renderAll();
        }
    }
});

// End horizontal thumb drag
document.addEventListener('mouseup', () => {
    hDragging = false;
    document.body.style.userSelect = '';
});

// --- Scrollbar track click logic ---

// Click on vertical scrollbar track to jump scroll position
vScrollbar.addEventListener('mousedown', e => {
    if (e.target !== vThumb) {
        const rect = vScrollbar.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const visibleHeight = mainGridCanvas.height;
        const totalHeight = getTotalGridHeight();
        const vMaxScroll = Math.max(0, totalHeight - visibleHeight);
        const vThumbHeight = vThumb.offsetHeight;
        const trackHeight = visibleHeight - vThumbHeight;
        let ratio = (clickY - vThumbHeight / 2) / trackHeight;
        grid.scrollY = Math.max(0, Math.min(vMaxScroll, ratio * vMaxScroll));
        grid.renderAll();
    }
});

// Click on horizontal scrollbar track to jump scroll position
hScrollbar.addEventListener('mousedown', e => {
    if (e.target !== hThumb) {
        const rect = hScrollbar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const visibleWidth = mainGridCanvas.width;
        const totalWidth = getTotalGridWidth();
        const hMaxScroll = Math.max(0, totalWidth - visibleWidth);
        const hThumbWidth = hThumb.offsetWidth;
        const trackWidth = visibleWidth - hThumbWidth;
        let ratio = (clickX - hThumbWidth / 2) / trackWidth;
        grid.scrollX = Math.max(0, Math.min(hMaxScroll, ratio * hMaxScroll));
        grid.renderAll();
    }
});

// --- Initial scrollbar update ---
updateScrollbars();

// --- Responsive grid/canvas resizing logic ---
/**
 * Resizes the grid and all canvases to fit the window, maintaining sharp rendering on high-DPI screens.
 * Also repositions scrollbars and status bar.
 */
function resizeGrid() {
    const container = document.getElementById('container');
    const vScrollbar = document.getElementById('v-scrollbar');
    const hScrollbar = document.getElementById('h-scrollbar');
    const statusBar = document.getElementById('statusBar');

    // Calculate available width/height
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Header and row header sizes
    const rowHeaderWidth = 50;
    const colHeaderHeight = 24;
    const scrollbarSize = 16;
    const statusBarHeight = 24;

    // Set container size
    container.style.width = width + 'px';
    container.style.height = height + 'px';

    // Use devicePixelRatio for sharp rendering
    const dpr = window.devicePixelRatio || 1;

    // Set canvas sizes (physical pixels)
    const colHeaderCanvas = document.getElementById('colHeaderCanvas');
    const rowHeaderCanvas = document.getElementById('rowHeaderCanvas');
    const mainGridCanvas = document.getElementById('mainGridCanvas');

    // Logical sizes
    const colHeaderLogicalWidth = width - rowHeaderWidth - scrollbarSize;
    const colHeaderLogicalHeight = colHeaderHeight;
    const rowHeaderLogicalWidth = rowHeaderWidth;
    const rowHeaderLogicalHeight = height - colHeaderHeight - scrollbarSize - statusBarHeight;
    const mainGridLogicalWidth = width - rowHeaderWidth - scrollbarSize;
    const mainGridLogicalHeight = height - colHeaderHeight - scrollbarSize - statusBarHeight;

    // Set canvas pixel sizes for high-DPI
    colHeaderCanvas.width = colHeaderLogicalWidth * dpr;
    colHeaderCanvas.height = colHeaderLogicalHeight * dpr;
    rowHeaderCanvas.width = rowHeaderLogicalWidth * dpr;
    rowHeaderCanvas.height = rowHeaderLogicalHeight * dpr;
    mainGridCanvas.width = mainGridLogicalWidth * dpr;
    mainGridCanvas.height = mainGridLogicalHeight * dpr;

    // Set CSS sizes (logical px)
    colHeaderCanvas.style.width = colHeaderLogicalWidth + 'px';
    colHeaderCanvas.style.height = colHeaderLogicalHeight + 'px';
    rowHeaderCanvas.style.width = rowHeaderLogicalWidth + 'px';
    rowHeaderCanvas.style.height = rowHeaderLogicalHeight + 'px';
    mainGridCanvas.style.width = mainGridLogicalWidth + 'px';
    mainGridCanvas.style.height = mainGridLogicalHeight + 'px';

    // Scale contexts for sharpness
    colHeaderCanvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    rowHeaderCanvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    mainGridCanvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);

    // Set positions
    colHeaderCanvas.style.left = rowHeaderWidth + 'px';
    colHeaderCanvas.style.top = '0px';

    rowHeaderCanvas.style.left = '0px';
    rowHeaderCanvas.style.top = colHeaderHeight + 'px';

    mainGridCanvas.style.left = rowHeaderWidth + 'px';
    mainGridCanvas.style.top = colHeaderHeight + 'px';

    // Scrollbars
    vScrollbar.style.top = colHeaderHeight + 'px';
    vScrollbar.style.bottom = (scrollbarSize + statusBarHeight) + 'px';
    vScrollbar.style.right = '0px';
    vScrollbar.style.width = scrollbarSize + 'px';

    hScrollbar.style.left = rowHeaderWidth + 'px';
    hScrollbar.style.right = scrollbarSize + 'px';
    hScrollbar.style.bottom = '0px';
    hScrollbar.style.height = scrollbarSize + 'px';

    // Status bar
    statusBar.style.left = '0px';
    statusBar.style.right = '0px';
    statusBar.style.bottom = scrollbarSize + 'px';
    statusBar.style.height = statusBarHeight + 'px';

    // Rerender grid and scrollbars
    if (typeof grid !== 'undefined' && grid.renderAll) grid.renderAll();
}

// Listen for window resize events to keep grid responsive
window.addEventListener('resize', resizeGrid);
resizeGrid();

// --- Example data generation (not loaded by default) ---
/**
 * Example: Generate 50,000 records for grid demo/testing
 */
const data = [];
for (let i = 1; i <= 50000; i++) {
    data.push({
        id: i,
        firstName: `Raj${i}`,
        lastName: `Solanki${i}`,
        Age: 20 + (i % 40),
        Salary: 100000 + (i * 10)
    });
}

// To load data into the grid, uncomment the following line:
// grid.loadData(data);