class DraggableChild {
    constructor(parentDiv, color, left, top) {
        this.childDiv = document.createElement('div');
        this.childDiv.className = 'draggable-child';
        this.childDiv.style.background = color;
        this.childDiv.style.left = left + 'px';
        this.childDiv.style.top = top + 'px';
        this.childDiv.style.position = 'absolute';
        this.childDiv.style.touchAction = 'none';
        this.childDiv.style.cursor = 'grab';
        parentDiv.appendChild(this.childDiv);

        this.dragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.parentDiv = parentDiv;

        this.initEvents();
    }

    getBounds() {
        return {
            bgWidth: this.parentDiv.clientWidth,
            bgHeight: this.parentDiv.clientHeight,
            childWidth: this.childDiv.offsetWidth,
            childHeight: this.childDiv.offsetHeight
        };
    }

    initEvents() {
        this.childDiv.addEventListener('pointerdown', (e) => {
            this.dragging = true;
            this.childDiv.setPointerCapture(e.pointerId);
            this.offsetX = e.clientX - this.childDiv.offsetLeft;
            this.offsetY = e.clientY - this.childDiv.offsetTop;
            this.childDiv.style.cursor = 'grabbing';
        });

        this.childDiv.addEventListener('pointermove', (e) => {
            if (!this.dragging) return;
            const { bgWidth, bgHeight, childWidth, childHeight } = this.getBounds();
            let newLeft = e.clientX - this.offsetX;
            let newTop = e.clientY - this.offsetY;
            newLeft = Math.max(0, Math.min(bgWidth - childWidth, newLeft));
            newTop = Math.max(0, Math.min(bgHeight - childHeight, newTop));
            this.childDiv.style.left = newLeft + 'px';
            this.childDiv.style.top = newTop + 'px';
        });

        this.childDiv.addEventListener('pointerup', (e) => {
            this.dragging = false;
            this.childDiv.releasePointerCapture(e.pointerId);
            this.childDiv.style.cursor = 'grab';
        });

        this.childDiv.addEventListener('pointercancel', (e) => {
            this.dragging = false;
            this.childDiv.style.cursor = 'grab';
        });

        window.addEventListener('resize', () => {
            const { bgWidth, bgHeight, childWidth, childHeight } = this.getBounds();
            let leftPos = parseInt(this.childDiv.style.left, 10);
            let topPos = parseInt(this.childDiv.style.top, 10);
            leftPos = Math.max(0, Math.min(bgWidth - childWidth, leftPos));
            topPos = Math.max(0, Math.min(bgHeight - childHeight, topPos));
            this.childDiv.style.left = leftPos + 'px';
            this.childDiv.style.top = topPos + 'px';
        });
    }
}

class DraggableContainer {
    constructor(bgColor, childColor, left, top) {
        this.bgDiv = document.createElement('div');
        this.bgDiv.className = 'bg-container';
        this.bgDiv.style.background = bgColor;
        this.bgDiv.style.position = 'relative';
        this.bgDiv.style.flex = '1';
        this.bgDiv.style.overflow = 'hidden';

        this.child = new DraggableChild(this.bgDiv, childColor, left, top);
    }

    getElement() {
        return this.bgDiv;
    }
}

// Create a wrapper to hold both containers side by side
var wrapper = document.createElement('div');
wrapper.id = 'main-wrapper';
wrapper.style.display = 'flex';
wrapper.style.width = '100vw';
wrapper.style.height = '100vh';
wrapper.style.position = 'fixed';
wrapper.style.left = '0';
wrapper.style.top = '0';
document.body.appendChild(wrapper);

// Create two containers with different colors
var container1 = new DraggableContainer('#e0e7ef', '#2ecc71', 100, 100);
var container2 = new DraggableContainer('#f7e0ef', '#e67e22', 100, 100);

wrapper.appendChild(container1.getElement());
wrapper.appendChild(container2.getElement());