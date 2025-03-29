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
            } else if (line.startsWith('{author:')) {
                song.author = line.replace('{author:', '').replace('}', '').trim();
            } else if (line.startsWith('{start_of_')) {
                const sectionName = line.match(/{start_of_(\w+)}/)?.[1] || '';
                currentSection = {
                    name: sectionName.charAt(0).toUpperCase() + sectionName.slice(1),
                    lines: []
                };
                song.sections.push(currentSection);
            } else if (line.startsWith('{end_of_')) {
                currentSection = null;
            } else if (currentSection) {
                const chordLine = line.match(/\[(.*?)\]/g)?.join(' ') || '';
                const textLine = line.replace(/\[.*?\]/g, '');
                
                if (textLine.trim() || chordLine) {
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