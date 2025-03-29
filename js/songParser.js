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
                const chordPositions = [];
                let text = line;
                let position = 0;

                // Znajdujemy wszystkie akordy w nawiasach kwadratowych
                const chordRegex = /\[([^\]]+)\]/g;
                let match;
                let lastIndex = 0;
                let cleanText = '';

                while ((match = chordRegex.exec(text)) !== null) {
                    const chord = match[1];
                    const chordStartIndex = match.index;
                    
                    // Dodajemy tekst przed akordem do czystego tekstu
                    cleanText += text.substring(lastIndex, chordStartIndex);
                    
                    // Zapisujemy pozycję akordu względem czystego tekstu
                    chordPositions.push({
                        chord: chord,
                        position: cleanText.length
                    });
                    
                    lastIndex = chordStartIndex + match[0].length;
                }
                
                // Dodajemy pozostały tekst
                cleanText += text.substring(lastIndex);
                
                if (cleanText.trim() || chordPositions.length > 0) {
                    currentSection.lines.push({
                        chordPositions,
                        text: cleanText.trim()
                    });
                }
            }
        }

        return song;
    }
} 