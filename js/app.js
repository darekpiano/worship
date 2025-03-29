// Main application class
class App {
    constructor() {
        this.songParser = new SongParser();
        this.songList = new SongList(document.getElementById('songList'));
        this.songView = new SongView(document.getElementById('songView'));
        this.search = new Search(document.getElementById('searchInput'));
        this.alphabetNav = new AlphabetNav(document.getElementById('alphabetNav'));
        this.fontSizeController = new FontSizeController();
        
        this.setupEventListeners();
        this.loadSongs();
    }

    setupEventListeners() {
        // Toggle chords visibility
        document.getElementById('toggleChords').addEventListener('click', () => {
            document.body.classList.toggle('hide-chords');
            localStorage.setItem('chordsVisible', !document.body.classList.contains('hide-chords'));
        });

        // Font size controls
        document.getElementById('increaseFont').addEventListener('click', () => {
            this.fontSizeController.increase();
        });

        document.getElementById('decreaseFont').addEventListener('click', () => {
            this.fontSizeController.decrease();
        });

        // Search
        this.search.onSearch((query) => {
            this.songList.filterSongs(query);
        });

        // Alphabet navigation
        this.alphabetNav.onLetterSelect((letter) => {
            this.songList.filterByLetter(letter);
        });

        // Song selection
        this.songList.onSongSelect((songId) => {
            this.loadAndDisplaySong(songId);
        });

        // Load user preferences
        const chordsVisible = localStorage.getItem('chordsVisible') !== 'false';
        if (!chordsVisible) {
            document.body.classList.add('hide-chords');
        }
    }

    loadSongs() {
        // Use embedded songs data
        if (typeof SONGS_DATA !== 'undefined' && SONGS_DATA.length > 0) {
            const songs = SONGS_DATA.map(songData => this.songParser.parse(songData));
            this.songList.setSongs(songs);
            this.alphabetNav.initialize(songs);

            // Load first song if available
            if (songs.length > 0) {
                this.loadAndDisplaySong(songs[0].id);
            }
        } else {
            console.error('No songs data available');
        }
    }

    loadAndDisplaySong(songId) {
        const song = SONGS_DATA.find(s => s.id === songId);
        if (song) {
            const parsedSong = this.songParser.parse(song);
            this.songView.displaySong(parsedSong);
        } else {
            console.error('Song not found:', songId);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
}); 