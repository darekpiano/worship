// Main application class
class SongbookApp {
    constructor() {
        // Wait for DOM to be ready
        this.initializeAfterDOMLoaded();
    }

    initializeAfterDOMLoaded() {
        // Initialize DOM elements
        this.searchInput = document.getElementById('searchInput');
        this.songsList = document.querySelector('.songs-list');
        this.songView = document.querySelector('.song-view');
        this.alphabet = document.querySelector('.alphabet');
        this.fontSizeIncrease = document.getElementById('fontSizeIncrease');
        this.fontSizeDecrease = document.getElementById('fontSizeDecrease');
        this.toggleChords = document.getElementById('toggleChords');

        // Initialize other properties
        this.songs = [];
        this.currentLetter = null;
        this.songParser = new SongParser();
        this.currentFontSize = parseInt(localStorage.getItem('fontSize')) || 16;
        document.documentElement.style.fontSize = `${this.currentFontSize}px`;
        
        // Initialize chord visibility
        const chordsVisible = localStorage.getItem('chordsVisible') !== 'false';
        this.toggleChordsVisibility(chordsVisible, false);
        
        // Start the app
        this.init();
    }

    async init() {
        await this.loadSongs();
        this.setupEventListeners();
        this.displaySongsList();
    }

    async loadSongs() {
        try {
            // Get list of all song files
            const songIds = Array.from({ length: 15 }, (_, i) => `song${i + 1}`);
            const loadPromises = songIds.map(id => this.loadSongData(id));
            this.songs = (await Promise.all(loadPromises)).filter(song => song !== null);
            this.songs.sort((a, b) => a.title.localeCompare(b.title));
            console.log('Loaded songs:', this.songs);
        } catch (error) {
            console.error('Error loading songs:', error);
        }
    }

    async loadSongData(songId) {
        try {
            const response = await fetch(`songs/${songId}.chordpro`);
            if (!response.ok) {
                console.log(`Song ${songId} not found`);
                return null;
            }
            const content = await response.text();
            const song = this.songParser.parse(content);
            song.id = songId;
            return song;
        } catch (error) {
            console.error(`Error loading song ${songId}:`, error);
            return null;
        }
    }

    setupEventListeners() {
        if (!this.fontSizeIncrease || !this.fontSizeDecrease || !this.searchInput || !this.alphabet || !this.songsList || !this.toggleChords) {
            console.error('Required DOM elements not found');
            return;
        }

        // Font size controls
        this.fontSizeIncrease.addEventListener('click', () => this.changeFontSize(1));
        this.fontSizeDecrease.addEventListener('click', () => this.changeFontSize(-1));

        // Toggle chords
        this.toggleChords.addEventListener('click', () => {
            const chordsVisible = !document.body.classList.contains('hide-chords');
            this.toggleChordsVisibility(!chordsVisible);
        });

        // Search input
        this.searchInput.addEventListener('input', () => {
            this.currentLetter = null;
            this.displaySongsList();
            this.updateAlphabetHighlight();
        });

        // Alphabet navigation
        this.alphabet.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const letter = e.target.textContent;
                this.currentLetter = this.currentLetter === letter ? null : letter;
                this.searchInput.value = '';
                this.displaySongsList();
                this.updateAlphabetHighlight();
            }
        });

        // Song selection
        this.songsList.addEventListener('click', (e) => {
            const songItem = e.target.closest('.song-item');
            if (songItem) {
                const songId = songItem.dataset.songId;
                this.loadAndDisplaySong(songId);
            }
        });
    }

    displaySongsList() {
        if (!this.songsList) return;

        const searchTerm = this.searchInput.value.toLowerCase();
        let filteredSongs = this.songs;

        if (searchTerm) {
            filteredSongs = this.songs.filter(song => 
                song.title.toLowerCase().includes(searchTerm) ||
                song.author.toLowerCase().includes(searchTerm)
            );
        } else if (this.currentLetter) {
            filteredSongs = this.songs.filter(song => 
                song.title.charAt(0).toUpperCase() === this.currentLetter
            );
        }

        this.songsList.innerHTML = filteredSongs.map(song => `
            <div class="song-item" data-song-id="${song.id}">
                <h3>${song.title}</h3>
                <p>${song.author}</p>
            </div>
        `).join('');
    }

    updateAlphabetHighlight() {
        if (!this.alphabet) return;

        const buttons = this.alphabet.querySelectorAll('button');
        buttons.forEach(button => {
            button.classList.toggle('active', button.textContent === this.currentLetter);
        });
    }

    async loadAndDisplaySong(songId) {
        if (!this.songView) return;

        try {
            const response = await fetch(`songs/${songId}.chordpro`);
            if (!response.ok) throw new Error('Song not found');
            
            const content = await response.text();
            const song = this.songParser.parse(content);
            
            this.songView.innerHTML = `
                <h2>${song.title}</h2>
                <div class="subtitle">${song.author}</div>
                ${song.sections.map(section => `
                    <div class="section">
                        ${section.name ? `<h3>${section.name}</h3>` : ''}
                        ${section.lines.map(line => `
                            <div class="line">
                                ${line.chordPositions.map(cp => `
                                    <span class="chord" style="left: ${cp.position}ch">${cp.chord}</span>
                                `).join('')}
                                <span class="text">${line.text}</span>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            `;
        } catch (error) {
            console.error('Error loading song:', error);
            this.songView.innerHTML = '<p>Error loading song</p>';
        }
    }

    changeFontSize(delta) {
        this.currentFontSize = Math.max(12, Math.min(24, this.currentFontSize + delta));
        document.documentElement.style.fontSize = `${this.currentFontSize}px`;
        localStorage.setItem('fontSize', this.currentFontSize);
    }

    toggleChordsVisibility(visible, save = true) {
        document.body.classList.toggle('hide-chords', !visible);
        this.toggleChords.classList.toggle('active', visible);
        if (save) {
            localStorage.setItem('chordsVisible', visible);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SongbookApp();
}); 