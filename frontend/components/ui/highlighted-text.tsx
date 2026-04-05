import React from 'react';

interface HighlightedTextProps {
  text: string;
  query: string;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({ text, query }) => {
  if (!query.trim()) return <span>{text}</span>;

  // Helper to build an accent-insensitive regex
  const buildFlexibleRegex = (q: string) => {
    // Normalizamos el query para que la construcción del mapa sea consistente
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const charMap: Record<string, string> = {
      a: '[aáä]', á: '[aáä]',
      e: '[eéë]', é: '[eéë]',
      i: '[iíï]', í: '[iíï]',
      o: '[oóö]', ó: '[oóö]',
      u: '[uúü]', ú: '[uúü]', ü: '[uúü]',
    };

    const regexStr = escaped
      .split('')
      .map((char) => charMap[char.toLowerCase()] || char)
      .join('');

    return new RegExp(`(${regexStr})`, 'gi');
  };

  // Helper to remove accents for strictly string comparison
  const normalize = (str: string) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const parts = text.split(buildFlexibleRegex(query));
  const normalizedQuery = normalize(query);

  return (
    <>
      {parts.map((part, index) =>
        normalize(part) === normalizedQuery ? (
          <mark
            key={index}
            className="bg-teal-100 text-teal-800 rounded-[2px] px-0.5 not-italic font-semibold transition-colors"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
};
