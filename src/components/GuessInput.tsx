import { useEffect, useMemo, useRef, useState } from 'react';
import { searchMovies } from '../data/library';
import type { MovieSuggestion } from '../types';

interface Props {
  disabled: boolean;
  onPick: (s: MovieSuggestion) => void;
}

// 高亮 query 子串
function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="match">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

export default function GuessInput({ disabled, onPick }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0); // 方向键选中索引
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => searchMovies(query), [query]);

  // 输入变化时重置选中
  useEffect(() => {
    setActive(0);
  }, [query]);

  // 挂载即聚焦
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  // Enter 确认 / 方向键导航 / Esc 关闭
  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (suggestions.length > 0) {
        const pick = suggestions[Math.min(active, suggestions.length - 1)];
        handlePick(pick);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setOpen(true);
        setActive((a) => (a + 1) % suggestions.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setOpen(true);
        setActive((a) => (a - 1 + suggestions.length) % suggestions.length);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="input-wrap" ref={boxRef}>
      <input
        ref={inputRef}
        className="guess-input"
        type="text"
        placeholder="输入电影名搜索，回车选首条…"
        value={query}
        disabled={disabled}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => suggestions.length && setOpen(true)}
        onKeyDown={handleKey}
      />
      {open && !disabled && query.trim() && suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              className={i === active ? 'active' : ''}
              onMouseDown={() => handlePick(s)}
              onMouseEnter={() => setActive(i)}
            >
              <Highlight text={s.title} q={query.trim()} />
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
