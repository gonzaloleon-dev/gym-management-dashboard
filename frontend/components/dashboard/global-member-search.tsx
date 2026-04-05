'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { mockMembers, type Member } from '@/lib/mock-data';
import { MemberDetailsModal } from '@/components/dashboard/member-details-modal';

import { HighlightedText } from '@/components/ui/highlighted-text';

export function GlobalMemberSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Member[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Búsqueda dinámica: coincide con cualquier parte del nombre o apellido
  useEffect(() => {
    const normalize = (str: string) =>
      str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    const q = normalize(query.trim());
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const filtered = mockMembers
      .filter((m) => normalize(m.name).includes(q))
      .slice(0, 8);
    setResults(filtered);
    setIsOpen(true);
  }, [query]);

  // Cerrar dropdown al clickear fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectMember = useCallback((member: Member) => {
    setSelectedMember(member);
    setSheetOpen(true);
    setIsOpen(false);
    setQuery('');
  }, []);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <>
      <div ref={containerRef} className="relative w-full max-w-xs">
        {/* Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar alumno..."
            className="w-full h-9 pl-9 pr-8 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all shadow-sm"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-2.5 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown: solo nombres */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
            {results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-400 text-center">
                Sin resultados para &ldquo;{query}&rdquo;
              </div>
            ) : (
              <ul className="py-1">
                {results.map((member) => (
                  <li key={member.id}>
                    <button
                      onClick={() => handleSelectMember(member)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition-colors"
                    >
                      <HighlightedText text={member.name} query={query.trim()} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Sheet de detalles — sin cambiar de pestaña */}
      <MemberDetailsModal
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        member={selectedMember}
      />
    </>
  );
}

