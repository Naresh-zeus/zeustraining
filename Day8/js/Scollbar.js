export class ScrollBar {
    constructor(options) {
        this.orientation = options.orientation; // 'vertical' or 'horizontal'
        this.grid = options.grid;
        this.canvas = options.canvas;
        this.scrollbarElem = options.scrollbarElem;
        this.thumbElem = options.thumbElem;
        this.getTotalSize = options.getTotalSize;
        this.getVisibleSize = options.getVisibleSize;
        this.getScroll = options.getScroll;
        this.setScroll = options.setScroll;

        this.dragging = false;
        this.dragStart = 0;
        this.startScroll = 0;

        this.initEvents();
    }

    update() {
        const visible = this.getVisibleSize();
        const total = this.getTotalSize();
        const ratio = visible / total;
        const thumbSize = Math.max(30, visible * ratio);
        const maxScroll = Math.max(0, total - visible);
        const scroll = this.getScroll();
        const trackSize = visible - thumbSize;
        const thumbPos = maxScroll ? (scroll / maxScroll) * trackSize : 0;

        if (this.orientation === 'vertical') {
            this.thumbElem.style.height = thumbSize + 'px';
            this.thumbElem.style.top = thumbPos + 'px';
        } else {
            this.thumbElem.style.width = thumbSize + 'px';
            this.thumbElem.style.left = thumbPos + 'px';
        }
    }

    initEvents() {
        // Drag logic
        this.thumbElem.addEventListener('mousedown', e => {
            this.dragging = true;
            this.dragStart = this.orientation === 'vertical' ? e.clientY : e.clientX;
            this.startScroll = this.getScroll();
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', e => {
            if (this.dragging) {
                const visible = this.getVisibleSize();
                const total = this.getTotalSize();
                const maxScroll = Math.max(0, total - visible);
                const thumbSize = Math.max(30, visible * (visible / total));
                const trackSize = visible - thumbSize;
                let delta = (this.orientation === 'vertical' ? e.clientY : e.clientX) - this.dragStart;
                let ratio = delta / trackSize;
                this.setScroll(Math.max(0, Math.min(maxScroll, this.startScroll + ratio * maxScroll)));
                this.grid.renderAll();
            }
        });

        document.addEventListener('mouseup', () => {
            this.dragging = false;
            document.body.style.userSelect = '';
        });

        // Click on track to jump
        this.scrollbarElem.addEventListener('mousedown', e => {
            if (e.target !== this.thumbElem) {
                const rect = this.scrollbarElem.getBoundingClientRect();
                const clickPos = this.orientation === 'vertical'
                    ? e.clientY - rect.top
                    : e.clientX - rect.left;
                const visible = this.getVisibleSize();
                const total = this.getTotalSize();
                const maxScroll = Math.max(0, total - visible);
                const thumbSize = this.orientation === 'vertical'
                    ? this.thumbElem.offsetHeight
                    : this.thumbElem.offsetWidth;
                const trackSize = visible - thumbSize;
                let ratio = (clickPos - thumbSize / 2) / trackSize;
                this.setScroll(Math.max(0, Math.min(maxScroll, ratio * maxScroll)));
                this.grid.renderAll();
            }
        });
    }
}