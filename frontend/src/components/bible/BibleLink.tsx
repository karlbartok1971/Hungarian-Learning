
import React from 'react';
import { Book } from 'lucide-react';

interface BibleLinkProps {
    text: string;
}

export const BibleLink: React.FC<BibleLinkProps> = ({ text }) => {
    // Regex to match patterns like "요한 3:16", "John 3:16", "롬 8:28", "Gen 1:1"
    // Korean characters, English characters, dots, spaces, numbers, colon, verse ranges
    // Regex to match patterns like "요한 3:16", "John 3:16", "Máté 6:9", "1.János 1:9"
    // Supports Korean, English, and Hungarian (Accented characters)
    const bibleRegex = /([가-힣A-Za-z\u00C0-\u00FF0-9\.]+)\s([0-9]+)[:\.]([0-9]+(?:-[0-9]+)?)/g;

    if (!text) return null;

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = bibleRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        const [fullMatch] = match;

        parts.push(
            <a
                key={match.index}
                href={`https://www.bible.com/ko/bible/88/${encodeURIComponent(fullMatch.replace(/\s/g, '+'))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-baseline gap-0.5 text-blue-600 font-semibold hover:text-blue-800 hover:bg-blue-50 px-1 -mx-1 rounded transition-all duration-200 group"
                title="성경 구절 보기"
                onClick={(e) => e.stopPropagation()}
            >
                <Book className="h-3 w-3 self-center opacity-70 group-hover:opacity-100" />
                {fullMatch}
            </a>
        );

        lastIndex = match.index + fullMatch.length;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return <>{parts}</>;
};
