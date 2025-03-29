class AlphabetNav {
    constructor(container, onLetterSelect) {
        this.container = container;
        this.onLetterSelect = onLetterSelect;
        this.selectedLetter = null;
        this.render();
    }

    render() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        
        alphabet.forEach(letter => {
            const button = document.createElement('button');
            button.textContent = letter;
            button.className = 'letter-btn';
            
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                this.container.querySelectorAll('.letter-btn').forEach(btn => 
                    btn.classList.remove('active')
                );

                if (this.selectedLetter === letter) {
                    // If clicking the same letter, clear the filter
                    this.selectedLetter = null;
                    this.onLetterSelect('');
                } else {
                    // Select new letter
                    this.selectedLetter = letter;
                    button.classList.add('active');
                    this.onLetterSelect(letter);
                }
            });

            this.container.appendChild(button);
        });
    }
} 