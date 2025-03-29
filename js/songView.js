class SongView {
    constructor(container) {
        this.container = container;
        this.currentSong = null;
        this.chordsVisible = true;
    }

    setSong(song) {
        this.currentSong = song;
        this.render();
    }

    toggleChords() {
        this.chordsVisible = !this.chordsVisible;
        this.container.classList.toggle('hide-chords', !this.chordsVisible);
    }

    render() {
        this.container.innerHTML = '';
        
        if (!this.currentSong) {
            this.container.innerHTML = '<p class="no-song">Wybierz piosenkę z listy</p>';
            return;
        }

        const songDiv = document.createElement('div');
        songDiv.className = 'song';

        // Header
        const header = document.createElement('div');
        header.className = 'song-header';

        const title = document.createElement('h2');
        title.textContent = this.currentSong.title;
        header.appendChild(title);

        if (this.currentSong.subtitle) {
            const subtitle = document.createElement('h3');
            subtitle.textContent = this.currentSong.subtitle;
            header.appendChild(subtitle);
        }

        if (this.currentSong.key) {
            const key = document.createElement('div');
            key.className = 'song-key';
            key.textContent = `Tonacja: ${this.currentSong.key}`;
            header.appendChild(key);
        }

        songDiv.appendChild(header);

        // Content
        const content = document.createElement('div');
        content.className = 'song-content';

        this.currentSong.sections.forEach(section => {
            if (section.name) {
                const sectionName = document.createElement('div');
                sectionName.className = `section-name ${section.type}`;
                sectionName.textContent = section.name;
                content.appendChild(sectionName);
            }

            section.lines.forEach(line => {
                const lineDiv = document.createElement('div');
                lineDiv.className = 'line';

                if (line.chords) {
                    const chordsSpan = document.createElement('div');
                    chordsSpan.className = 'chords';
                    chordsSpan.textContent = line.chords;
                    lineDiv.appendChild(chordsSpan);
                }

                const textSpan = document.createElement('div');
                textSpan.className = 'text';
                textSpan.textContent = line.text || ' ';
                lineDiv.appendChild(textSpan);

                content.appendChild(lineDiv);
            });

            // Add empty line after each section
            const emptyLine = document.createElement('div');
            emptyLine.className = 'line empty';
            content.appendChild(emptyLine);
        });

        songDiv.appendChild(content);
        this.container.appendChild(songDiv);
    }
} 