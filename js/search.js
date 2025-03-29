class Search {
    constructor(input, onSearch) {
        this.input = input;
        this.onSearch = onSearch;
        this.setupEventListeners();
    }

    setupEventListeners() {
        let debounceTimeout;
        
        this.input.addEventListener('input', () => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                this.onSearch(this.input.value.trim());
            }, 300);
        });

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clear();
            }
        });
    }

    clear() {
        this.input.value = '';
        this.onSearch('');
    }
} 