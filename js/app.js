// Main application class
class App {
    constructor() {
        this.songParser = new SongParser();
        this.songsList = document.getElementById('songsList');
        this.songView = document.getElementById('songView');
        this.searchInput = document.getElementById('searchInput');
        this.searchButton = document.getElementById('searchButton');
        this.fontSizeIncrease = document.getElementById('fontSizeIncrease');
        this.fontSizeDecrease = document.getElementById('fontSizeDecrease');

        this.currentFontSize = parseInt(localStorage.getItem('fontSize')) || 16;
        document.documentElement.style.fontSize = `${this.currentFontSize}px`;
        
        this.songs = [];
        this.init();
    }

    async init() {
        await this.loadSongs();
        this.setupEventListeners();
        this.loadLastSong();
    }

    async loadSongs() {
        try {
            for (const songId of SONGS_LIST) {
                const response = await fetch(`songs/${songId}.chordpro`);
                if (!response.ok) continue;

                const content = await response.text();
                const song = this.songParser.parse(content);
                song.id = songId;
                this.songs.push(song);
            }

            this.songs.sort((a, b) => a.title.localeCompare(b.title));
            this.renderSongsList();
        } catch (error) {
            console.error('Error loading songs:', error);
        }
    }

    setupEventListeners() {
        // Font size controls
        this.fontSizeIncrease.addEventListener('click', () => this.changeFontSize(1));
        this.fontSizeDecrease.addEventListener('click', () => this.changeFontSize(-1));

        // Search handling
        this.searchButton.addEventListener('click', () => this.toggleSearch());
        this.searchInput.addEventListener('input', () => {
            const isSearching = this.searchInput.value.length > 0;
            document.body.classList.toggle('searching', isSearching);
            this.filterSongs();
        });

        // Handle back button
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.songId) {
                this.loadAndDisplaySong(e.state.songId);
            } else {
                this.showSearch();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideSearch();
            }
        });
    }

    toggleSearch() {
        const isSearching = document.body.classList.toggle('searching');
        if (isSearching) {
            this.searchInput.focus();
        } else {
            this.searchInput.value = '';
            this.filterSongs();
        }
    }

    hideSearch() {
        document.body.classList.remove('searching');
        this.searchInput.value = '';
        this.filterSongs();
    }

    filterSongs() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const filteredSongs = this.songs.filter(song => 
            song.title.toLowerCase().includes(searchTerm)
        );
        this.renderSongsList(filteredSongs);
    }

    renderSongsList(songs = this.songs) {
        this.songsList.innerHTML = songs
            .map(song => `
                <div class="song-item" data-id="${song.id}">
                    <h3>${song.title}</h3>
                    ${song.subtitle ? `<p>${song.subtitle}</p>` : ''}
                </div>
            `)
            .join('');

        this.songsList.querySelectorAll('.song-item').forEach(item => {
            item.addEventListener('click', () => {
                const songId = item.dataset.id;
                this.loadAndDisplaySong(songId);
                history.pushState({ songId }, '', `#${songId}`);
                this.hideSearch();
            });
        });
    }

    async loadAndDisplaySong(songId) {
        try {
            const response = await fetch(`songs/${songId}.chordpro`);
            if (!response.ok) throw new Error('Failed to load song');

            const content = await response.text();
            const song = this.songParser.parse(content);
            song.id = songId;
            this.displaySong(song);
            localStorage.setItem('lastSongId', songId);
        } catch (error) {
            console.error('Error loading song:', error);
        }
    }

    displaySong(song) {
        this.songView.innerHTML = `
            <h2>${song.title}</h2>
            ${song.subtitle ? `<p class="subtitle">${song.subtitle}</p>` : ''}
            ${song.sections.map(section => `
                <div class="section ${section.type}">
                    <h3>${section.name}</h3>
                    ${section.lines.map(line => `
                        <div class="line">
                            ${line.map(part => 
                                part.type === 'chord' 
                                    ? `<span class="chord">${part.content}</span>`
                                    : `<span class="text">${part.content}</span>`
                            ).join('')}
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        `;
    }

    showSearch() {
        document.body.classList.add('searching');
        this.songView.innerHTML = '';
        this.searchInput.focus();
    }

    loadLastSong() {
        const songId = localStorage.getItem('lastSongId');
        const hash = window.location.hash.slice(1);

        if (hash) {
            this.loadAndDisplaySong(hash);
        } else if (songId) {
            this.loadAndDisplaySong(songId);
        } else {
            this.showSearch();
        }
    }

    changeFontSize(delta) {
        this.currentFontSize = Math.max(12, Math.min(24, this.currentFontSize + delta));
        document.documentElement.style.fontSize = `${this.currentFontSize}px`;
        localStorage.setItem('fontSize', this.currentFontSize);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
}); 