class FontSizeController {
    constructor(increaseBtn, decreaseBtn, container) {
        this.increaseBtn = increaseBtn;
        this.decreaseBtn = decreaseBtn;
        this.container = container;
        this.currentSize = 16; // Default size in pixels
        this.minSize = 12;
        this.maxSize = 24;
        this.step = 2;

        this.loadSavedSize();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.increaseBtn.addEventListener('click', () => this.increase());
        this.decreaseBtn.addEventListener('click', () => this.decrease());
    }

    increase() {
        if (this.currentSize < this.maxSize) {
            this.currentSize += this.step;
            this.updateSize();
        }
    }

    decrease() {
        if (this.currentSize > this.minSize) {
            this.currentSize -= this.step;
            this.updateSize();
        }
    }

    updateSize() {
        this.container.style.fontSize = `${this.currentSize}px`;
        this.saveSize();
        this.updateButtonStates();
    }

    updateButtonStates() {
        this.increaseBtn.disabled = this.currentSize >= this.maxSize;
        this.decreaseBtn.disabled = this.currentSize <= this.minSize;
    }

    saveSize() {
        localStorage.setItem('fontSize', this.currentSize.toString());
    }

    loadSavedSize() {
        const savedSize = localStorage.getItem('fontSize');
        if (savedSize) {
            this.currentSize = parseInt(savedSize, 10);
            this.updateSize();
        }
    }
} 