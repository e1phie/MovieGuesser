import { useEffect, useMemo, useRef, useState } from 'react';
import { searchMovies } from '../data/library';
import type { MovieSuggestion } from '../types';

interface Props {
  disabled: boolean;
  onPick: (s: MovieSuggestion) => void;
}

export default function GuessInput({ disabled, onPick }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => searchMovies(query), [query]);

  // 点外部关下拉
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function handlePick(s: MovieSuggestion) {
    onPick(s);
    setQuery('');
    setOpen(false);
  }

  return (
    <div className="input-wrap" ref={boxRef}>
      <input
        className="guess-input"
        type="text"
        placeholder="输入电影名搜索…"
        value={query}
        disabled={disabled}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => suggestions.length && setOpen(true)}
      />
      {open && !disabled && query.trim() && suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((s) => (
            <li key={s.id} onMouseDown={() => handlePick(s)}>
              {s.title}
              {s.year ? ` (${s.year})` : ''}
            </li>
          ))}
        </ul>
      )}
      {open && !disabled && query.trim() && suggestions.length === 0 && (
        <ul className="suggestions">
          <li className="empty">无结果</li>
        </ul>
      )}
    </div>
  );
}
