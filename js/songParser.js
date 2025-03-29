class SongParser {
    parse(content) {
        const lines = content.split('\n');
        const song = {
            metadata: {},
            sections: []
        };

        let currentSection = null;

        for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (!trimmedLine) {
                continue;
            }

            // Parse metadata
            if (trimmedLine.startsWith('{') && trimmedLine.endsWith('}')) {
                const metadataMatch = trimmedLine.match(/\{(\w+):\s*(.+?)\}/);
                if (metadataMatch) {
                    const [, key, value] = metadataMatch;
                    song.metadata[key] = value;
                }
                continue;
            }

            // Parse section start
            if (trimmedLine.startsWith('{start_of_')) {
                const sectionMatch = trimmedLine.match(/\{start_of_(\w+):\s*(.+?)\}/);
                if (sectionMatch) {
                    if (currentSection) {
                        song.sections.push(currentSection);
                    }
                    currentSection = {
                        name: sectionMatch[2],
                        type: sectionMatch[1],
                        lines: []
                    };
                }
                continue;
            }

            // Parse regular line with chords
            if (currentSection) {
                const parsedLine = this.parseLine(trimmedLine);
                if (parsedLine) {
                    currentSection.lines.push(parsedLine);
                }
            }
        }

        // Add last section if exists
        if (currentSection) {
            song.sections.push(currentSection);
        }

        return {
            id: song.metadata.id || '',
            title: song.metadata.title || '',
            subtitle: song.metadata.subtitle || '',
            key: song.metadata.key || '',
            year: song.metadata.year || '',
            sections: song.sections
        };
    }

    parseLine(line) {
        if (!line) return null;

        const chordPattern = /\[([^\]]+)\]/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = chordPattern.exec(line)) !== null) {
            // Add text before chord if exists
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: line.substring(lastIndex, match.index)
                });
            }

            // Add chord
            parts.push({
                type: 'chord',
                content: match[1]
            });

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text if exists
        if (lastIndex < line.length) {
            parts.push({
                type: 'text',
                content: line.substring(lastIndex)
            });
        }

        return parts.length > 0 ? parts : null;
    }
} 