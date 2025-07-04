// Create a wrapper to hold both containers side by side
const wrapper = document.createElement('div');
wrapper.style.display = 'flex';
wrapper.style.width = '100vw';
wrapper.style.height = '100vh';
wrapper.style.position = 'fixed';
wrapper.style.left = '0';
wrapper.style.top = '0';
document.body.appendChild(wrapper);

// Function to create a draggable container with a child
function createDraggableContainer(bgColor: string, childColor: string, left: number, top: number) {
    const bgDiv = document.createElement('div');
    bgDiv.style.flex = '1';
    bgDiv.style.position = 'relative';
    bgDiv.style.background = bgColor;
    bgDiv.style.overflow = 'hidden';

    const childDiv = document.createElement('div');
    childDiv.style.position = 'absolute';
    childDiv.style.width = '50px';
    childDiv.style.height = '50px';
    childDiv.style.left = `${left}px`;
    childDiv.style.top = `${top}px`;
    childDiv.style.background = childColor;
    childDiv.style.borderRadius = '8px';
    childDiv.style.touchAction = 'none';
    childDiv.style.cursor = 'grab';
    bgDiv.appendChild(childDiv);

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    function getBounds() {
        return {
            bgWidth: bgDiv.clientWidth,
            bgHeight: bgDiv.clientHeight,
            childWidth: childDiv.offsetWidth,
            childHeight: childDiv.offsetHeight
        };
    }

    childDiv.addEventListener('pointerdown', (e: PointerEvent) => {
        dragging = true;
        childDiv.setPointerCapture(e.pointerId);
        offsetX = e.clientX - childDiv.offsetLeft;
        offsetY = e.clientY - childDiv.offsetTop;
        childDiv.style.cursor = 'grabbing';
    });

    childDiv.addEventListener('pointermove', (e: PointerEvent) => {
        if (!dragging) return;
        const { bgWidth, bgHeight, childWidth, childHeight } = getBounds();
        let newLeft = e.clientX - offsetX;
        let newTop = e.clientY - offsetY;
        newLeft = Math.max(0, Math.min(bgWidth - childWidth, newLeft));
        newTop = Math.max(0, Math.min(bgHeight - childHeight, newTop));
        childDiv.style.left = `${newLeft}px`;
        childDiv.style.top = `${newTop}px`;
    });

    childDiv.addEventListener('pointerup', (e: PointerEvent) => {
        dragging = false;
        childDiv.releasePointerCapture(e.pointerId);
        childDiv.style.cursor = 'grab';
    });
    childDiv.addEventListener('pointercancel', (e: PointerEvent) => {
        dragging = false;
        childDiv.style.cursor = 'grab';
    });

    window.addEventListener('resize', () => {
        const { bgWidth, bgHeight, childWidth, childHeight } = getBounds();
        let left = parseInt(childDiv.style.left, 10);
        let top = parseInt(childDiv.style.top, 10);
        left = Math.max(0, Math.min(bgWidth - childWidth, left));
        top = Math.max(0, Math.min(bgHeight - childHeight, top));
        childDiv.style.left = `${left}px`;
        childDiv.style.top = `${top}px`;
    });

    return bgDiv;
}

// Create two containers with different colors
const container1 = createDraggableContainer('#e0e7ef', '#2ecc71', 100, 100);
const container2 = createDraggableContainer('#f7e0ef', '#e67e22', 100, 100);

wrapper.appendChild(container1);
wrapper.appendChild(container2);// Create a wrapper to hold both containers side by side
const wrapper = document.createElement('div');
wrapper.style.display = 'flex';
wrapper.style.width = '100vw';
wrapper.style.height = '100vh';
wrapper.style.position = 'fixed';
wrapper.style.left = '0';
wrapper.style.top = '0';
document.body.appendChild(wrapper);

// Function to create a draggable container with a child
function createDraggableContainer(bgColor: string, childColor: string, left: number, top: number) {
    const bgDiv = document.createElement('div');
    bgDiv.style.flex = '1';
    bgDiv.style.position = 'relative';
    bgDiv.style.background = bgColor;
    bgDiv.style.overflow = 'hidden';

    const childDiv = document.createElement('div');
    childDiv.style.position = 'absolute';
    childDiv.style.width = '50px';
    childDiv.style.height = '50px';
    childDiv.style.left = `${left}px`;
    childDiv.style.top = `${top}px`;
    childDiv.style.background = childColor;
    childDiv.style.borderRadius = '8px';
    childDiv.style.touchAction = 'none';
    childDiv.style.cursor = 'grab';
    bgDiv.appendChild(childDiv);

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    function getBounds() {
        return {
            bgWidth: bgDiv.clientWidth,
            bgHeight: bgDiv.clientHeight,
            childWidth: childDiv.offsetWidth,
            childHeight: childDiv.offsetHeight
        };
    }

    childDiv.addEventListener('pointerdown', (e: PointerEvent) => {
        dragging = true;
        childDiv.setPointerCapture(e.pointerId);
        offsetX = e.clientX - childDiv.offsetLeft;
        offsetY = e.clientY - childDiv.offsetTop;
        childDiv.style.cursor = 'grabbing';
    });

    childDiv.addEventListener('pointermove', (e: PointerEvent) => {
        if (!dragging) return;
        const { bgWidth, bgHeight, childWidth, childHeight } = getBounds();
        let newLeft = e.clientX - offsetX;
        let newTop = e.clientY - offsetY;
        newLeft = Math.max(0, Math.min(bgWidth - childWidth, newLeft));
        newTop = Math.max(0, Math.min(bgHeight - childHeight, newTop));
        childDiv.style.left = `${newLeft}px`;
        childDiv.style.top = `${newTop}px`;
    });

    childDiv.addEventListener('pointerup', (e: PointerEvent) => {
        dragging = false;
        childDiv.releasePointerCapture(e.pointerId);
        childDiv.style.cursor = 'grab';
    });
    childDiv.addEventListener('pointercancel', (e: PointerEvent) => {
        dragging = false;
        childDiv.style.cursor = 'grab';
    });

    window.addEventListener('resize', () => {
        const { bgWidth, bgHeight, childWidth, childHeight } = getBounds();
        let left = parseInt(childDiv.style.left, 10);
        let top = parseInt(childDiv.style.top, 10);
        left = Math.max(0, Math.min(bgWidth - childWidth, left));
        top = Math.max(0, Math.min(bgHeight - childHeight, top));
        childDiv.style.left = `${left}px`;
        childDiv.style.top = `${top}px`;
    });

    return bgDiv;
}

// Create two containers with different colors
const container1 = createDraggableContainer('#e0e7ef', '#2ecc71', 100, 100);
const container2 = createDraggableContainer('#f7e0ef', '#e67e22', 100, 100);

wrapper.appendChild(container1);
wrapper.appendChild(container2);