import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { searchVillages, VillageListItem } from '../api/client';

interface VillageSearchProps {
  onVillageSelect: (id: string, name: string) => void;
  selectedVillageId?: string;
}

export default function VillageSearch({ onVillageSelect, selectedVillageId }: VillageSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VillageListItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 0) {
        setLoading(true);
        try {
          const res = await searchVillages(query);
          setResults(res);
          setIsOpen(true);
        } catch (err) {
          console.error('Search failed', err);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectVillage = (village: VillageListItem) => {
    onVillageSelect(village.id, village.name);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <SearchIcon className="absolute left-3 w-4 h-4 text-zinc-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search villages..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-earth-primary/50 text-sm"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 text-zinc-400 hover:text-zinc-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-zinc-500">Searching...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((village) => (
                <li key={village.id}>
                  <button
                    onClick={() => handleSelectVillage(village)}
                    className="w-full text-left px-4 py-3 hover:bg-earth-primary/10 transition-colors border-b border-zinc-100 last:border-b-0"
                  >
                    <p className="font-medium text-earth-primary">{village.name}</p>
                    <p className="text-xs text-zinc-500">ID: {village.id}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-zinc-500">No villages found</div>
          )}
        </div>
      )}
    </div>
  );
}
