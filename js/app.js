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
        this.backButton = document.querySelector('.back-button');

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

        // Check if there's a song ID in the URL hash
        const songId = window.location.hash.slice(1);
        if (songId) {
            this.loadAndDisplaySong(songId);
        }
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
        if (!this.fontSizeIncrease || !this.fontSizeDecrease || !this.searchInput || 
            !this.alphabet || !this.songsList || !this.toggleChords || !this.backButton) {
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

        // Back button
        this.backButton.addEventListener('click', () => this.showSongsList());

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
                window.location.hash = songId;
            }
        });

        // Handle browser back button
        window.addEventListener('popstate', () => {
            const songId = window.location.hash.slice(1);
            if (songId) {
                this.loadAndDisplaySong(songId);
            } else {
                this.showSongsList();
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
            
            document.body.classList.add('song-detail');
            
            this.displaySong(song);
        } catch (error) {
            console.error('Error loading song:', error);
            this.songView.innerHTML = '<p>Error loading song</p>';
        }
    }

    displaySong(song) {
        const songView = document.querySelector('.song-view');
        songView.innerHTML = '';

        // Tytuł i autor
        const title = document.createElement('h2');
        title.textContent = song.title;
        songView.appendChild(title);

        if (song.author) {
            const subtitle = document.createElement('div');
            subtitle.className = 'subtitle';
            subtitle.textContent = song.author;
            songView.appendChild(subtitle);
        }

        // Sekcje
        song.sections.forEach(section => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'section';

            const sectionTitle = document.createElement('h3');
            sectionTitle.textContent = section.name;
            sectionDiv.appendChild(sectionTitle);

            section.lines.forEach(line => {
                const lineDiv = document.createElement('div');
                lineDiv.className = 'line';

                // Dodajemy akordy
                line.chordPositions.forEach(({chord, position}) => {
                    const chordSpan = document.createElement('span');
                    chordSpan.className = 'chord';
                    chordSpan.textContent = chord;
                    chordSpan.style.left = `${position}ch`;
                    lineDiv.appendChild(chordSpan);
                });

                // Dodajemy tekst
                const textSpan = document.createElement('span');
                textSpan.className = 'text';
                textSpan.textContent = line.text;
                lineDiv.appendChild(textSpan);

                sectionDiv.appendChild(lineDiv);
            });

            songView.appendChild(sectionDiv);
        });
    }

    showSongsList() {
        document.body.classList.remove('song-detail');
        this.songView.innerHTML = '';
        window.location.hash = '';
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