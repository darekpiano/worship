class SongParser {
    parse(content) {
        const lines = content.split('\n');
        const song = {
            title: '',
            author: '',
            sections: []
        };

        let currentSection = null;

        for (const line of lines) {
            if (line.trim() === '') continue;

            if (line.startsWith('{title:')) {
                song.title = line.replace('{title:', '').replace('}', '').trim();
            } else if (line.startsWith('{artist:')) {
                song.author = line.replace('{artist:', '').replace('}', '').trim();
            } else if (line.startsWith('{start_of_')) {
                const match = line.match(/{start_of_(\w+):\s*(.*)}/);
                if (match) {
                    const [, type, name] = match;
                    currentSection = {
                        name: name || type.charAt(0).toUpperCase() + type.slice(1),
                        lines: []
                    };
                    song.sections.push(currentSection);
                }
            } else if (line.startsWith('{end_of_')) {
                currentSection = null;
            } else if (currentSection && !line.startsWith('{')) {
                const chordLine = line.match(/\[(.*?)\]/g)?.join(' ') || '';
                const textLine = line.replace(/\[.*?\]/g, '').trim();
                
                if (textLine || chordLine) {
                    currentSection.lines.push({
                        chords: chordLine,
                        text: textLine
                    });
                }
            }
        }

        return song;
    }
} 