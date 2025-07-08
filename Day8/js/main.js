import { Grid } from './Grid.js';
import { ScrollBar } from './ScrollBar.js';

// --- Setup canvases and grid ---
const colHeaderCanvas = document.getElementById('colHeaderCanvas');
const rowHeaderCanvas = document.getElementById('rowHeaderCanvas');
const mainGridCanvas = document.getElementById('mainGridCanvas');
const statusBar = document.getElementById('statusBar');

const grid = new Grid(mainGridCanvas, colHeaderCanvas, rowHeaderCanvas, 10000, 500);

function excelColumnName(n) {
    let name = "";
    while (n >= 0) {
        name = String.fromCharCode((n % 26) + 65) + name;
        n = Math.floor(n / 26) - 1;
    }
    return name;
}

// --- Scrollbar Setup ---
const vScrollbar = document.getElementById('v-scrollbar');
const hScrollbar = document.getElementById('h-scrollbar');

// Create thumb elements
const vThumb = document.createElement('div');
vThumb.className = 'thumb';
vScrollbar.appendChild(vThumb);

const hThumb = document.createElement('div');
hThumb.className = 'thumb';
hScrollbar.appendChild(hThumb);

// Helper to get total grid size
function getTotalGridHeight() {
    return grid.rows.reduce((sum, row) => sum + row.height, 0);
}
function getTotalGridWidth() {
    return grid.columns.reduce((sum, col) => sum + col.width, 0);
}

// Update scrollbar thumbs
function updateScrollbars() {
    // Vertical
    const visibleHeight = mainGridCanvas.height;
    const totalHeight = getTotalGridHeight();
    const vRatio = visibleHeight / totalHeight;
    const vThumbHeight = Math.max(30, visibleHeight * vRatio);
    const vMaxScroll = Math.max(0, totalHeight - visibleHeight);
    const vThumbTop = vMaxScroll ? (grid.scrollY / vMaxScroll) * (visibleHeight - vThumbHeight) : 0;
    vThumb.style.height = vThumbHeight + 'px';
    vThumb.style.top = vThumbTop + 'px';

    // Horizontal
    const visibleWidth = mainGridCanvas.width;
    const totalWidth = getTotalGridWidth();
    const hRatio = visibleWidth / totalWidth;
    const hThumbWidth = Math.max(30, visibleWidth * hRatio);
    const hMaxScroll = Math.max(0, totalWidth - visibleWidth);
    const hThumbLeft = hMaxScroll ? (grid.scrollX / hMaxScroll) * (visibleWidth - hThumbWidth) : 0;
    hThumb.style.width = hThumbWidth + 'px';
    hThumb.style.left = hThumbLeft + 'px';
}
grid.renderAll = (function (orig) {
    return function () {
        orig.call(grid);
        updateScrollbars();
    };
})(grid.renderAll);

// Drag logic for vertical scrollbar
let vDragging = false, vDragStartY = 0, vStartScrollY = 0;
vThumb.addEventListener('mousedown', e => {
    vDragging = true;
    vDragStartY = e.clientY;
    vStartScrollY = grid.scrollY;
    document.body.style.userSelect = 'none';
});
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
document.addEventListener('mouseup', () => {
    vDragging = false;
    document.body.style.userSelect = '';
});

// Drag logic for horizontal scrollbar
let hDragging = false, hDragStartX = 0, hStartScrollX = 0;
hThumb.addEventListener('mousedown', e => {
    hDragging = true;
    hDragStartX = e.clientX;
    hStartScrollX = grid.scrollX;
    document.body.style.userSelect = 'none';
});
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
document.addEventListener('mouseup', () => {
    hDragging = false;
    document.body.style.userSelect = '';
});

// Click on scrollbar track to jump
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

// Initial update
updateScrollbars();

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
window.addEventListener('resize', resizeGrid);
resizeGrid();

// Generate 50,000 records
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

// Load into grid
grid.loadData(data);