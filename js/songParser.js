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
                // Najpierw zbieramy same akordy
                const chordLine = line.match(/^([A-G][#b]?(?:\/[A-G][#b]?|m|maj|dim|aug|sus[24]|[0-9])*\s*)+$/);
                
                if (chordLine) {
                    // To jest linia z akordami - zapisujemy ją do następnej linii z tekstem
                    currentSection.pendingChords = line.trim().split(/\s+/);
                } else {
                    // To jest linia z tekstem
                    const chordPositions = [];
                    const text = line;
                    
                    if (currentSection.pendingChords) {
                        // Jeśli mamy zapisane akordy z poprzedniej linii, dodajemy je na początku tekstu
                        chordPositions.push({
                            chord: currentSection.pendingChords.join(' '),
                            position: 0
                        });
                        delete currentSection.pendingChords;
                    }
                    
                    if (text.trim() || chordPositions.length > 0) {
                        currentSection.lines.push({
                            chordPositions,
                            text: text.trim()
                        });
                    }
                }
            }
        }

        return song;
    }
} 