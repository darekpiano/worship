class SongList {
    constructor(container) {
        this.container = container;
        this.songs = [];
        this.filteredSongs = [];
        this.onSelectCallback = null;
    }

    setSongs(songs) {
        this.songs = songs;
        this.filteredSongs = [...songs];
        this.render();
    }

    onSongSelect(callback) {
        this.onSelectCallback = callback;
    }

    filterSongs(query) {
        if (!query) {
            this.filteredSongs = [...this.songs];
        } else {
            const normalizedQuery = query.toLowerCase();
            this.filteredSongs = this.songs.filter(song => 
                song.title.toLowerCase().includes(normalizedQuery) ||
                song.subtitle.toLowerCase().includes(normalizedQuery)
            );
        }
        this.render();
    }

    filterByLetter(letter) {
        if (!letter) {
            this.filteredSongs = [...this.songs];
        } else {
            this.filteredSongs = this.songs.filter(song => 
                song.title.toLowerCase().startsWith(letter.toLowerCase())
            );
        }
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        
        if (this.filteredSongs.length === 0) {
            this.container.innerHTML = '<p class="no-songs">Nie znaleziono piosenek</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'songs-list';

        this.filteredSongs.forEach(song => {
            const li = document.createElement('li');
            li.className = 'song-item';
            
            const title = document.createElement('strong');
            title.textContent = song.title;
            
            const subtitle = document.createElement('span');
            subtitle.textContent = song.subtitle ? ` - ${song.subtitle}` : '';

            const key = document.createElement('span');
            key.className = 'song-key';
            key.textContent = song.key ? ` (${song.key})` : '';

            li.appendChild(title);
            li.appendChild(subtitle);
            li.appendChild(key);

            li.addEventListener('click', () => {
                // Remove active class from all items
                ul.querySelectorAll('.song-item').forEach(item => 
                    item.classList.remove('active')
                );
                
                // Add active class to clicked item
                li.classList.add('active');

                if (this.onSelectCallback) {
                    this.onSelectCallback(song.id);
                }
            });

            ul.appendChild(li);
        });

        this.container.appendChild(ul);
    }
} 