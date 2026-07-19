import { useCallback, useEffect, useState } from 'react';
import {
  EMPTY_FILTER,
  fetchDetails,
  pickAnswerFiltered,
  type Filter,
} from './data/library';
import { compare, hintFromOverview } from './logic/compare';
import type { GuessResult, Movie } from './types';
import GuessInput from './components/GuessInput';
import GameTable from './components/GameTable';
import ResultBanner from './components/ResultBanner';
import SettingsPanel from './components/SettingsPanel';

const MAX_ATTEMPTS = 8;
const FILTER_KEY = 'mg_filter';
const THEME_KEY = 'mg_theme';

type Phase = 'playing' | 'won' | 'lost';
type Theme = 'dark' | 'light';

function loadFilter(): Filter {
  try {
    const raw = localStorage.getItem(FILTER_KEY);
    if (!raw) return EMPTY_FILTER;
    const f = JSON.parse(raw) as Filter;
    return {
      yearFrom: f.yearFrom,
      yearTo: f.yearTo,
      genres: Array.isArray(f.genres) ? f.genres : [],
      continents: Array.isArray(f.continents) ? f.continents : [],
      maxRank: f.maxRank,
    };
  } catch {
    return EMPTY_FILTER;
  }
}

function loadAnswer(filter: Filter): Movie {
  // 每次刷新/新开局都重选新答案
  return pickAnswerFiltered(filter);
}

export default function App() {
  const [filter, setFilter] = useState<Filter>(loadFilter);
  const [answer, setAnswer] = useState<Movie | null>(null);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [phase, setPhase] = useState<Phase>('playing');
  const [busy, setBusy] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const t = localStorage.getItem(THEME_KEY);
    if (t === 'light' || t === 'dark') return t; // 记忆优先
    // 无记忆：跟随系统，系统深色→夜晚，否则白天
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // 主题应用到 root + 持久化
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // toast 自动消失
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const startGame = useCallback((f: Filter) => {
    setAnswer(loadAnswer(f));
    setGuesses([]);
    setPhase('playing');
    setRevealed(false);
  }, []);

  useEffect(() => {
    startGame(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePick = useCallback(
    (s: { id: number }) => {
      if (!answer || phase !== 'playing' || busy) return;
      // 去重：已猜过的片不给猜
      if (guesses.some((g) => g.movie.id === s.id)) {
        setToast('这部电影已经猜过了');
        return;
      }
      setBusy(true);
      try {
        const guessMovie = fetchDetails(s.id);
        if (!guessMovie) return;
        const result = compare(guessMovie, answer);
        const next = [...guesses, result];
        setGuesses(next);
        if (result.won) {
          setPhase('won');
        } else if (next.length >= MAX_ATTEMPTS) {
          setPhase('lost');
        }
      } finally {
        setBusy(false);
      }
    },
    [answer, phase, busy, guesses]
  );

  const handleApplyFilter = useCallback(
    (f: Filter) => {
      setFilter(f);
      localStorage.setItem(FILTER_KEY, JSON.stringify(f));
      startGame(f);
    },
    [startGame]
  );

  const handleResetFilter = useCallback(() => {
    setFilter(EMPTY_FILTER);
    localStorage.removeItem(FILTER_KEY);
    startGame(EMPTY_FILTER);
  }, [startGame]);

  const handleRestart = useCallback(() => {
    startGame(filter);
  }, [filter, startGame]);

  const switchTheme = useCallback((t: Theme) => {
    setTheme(t);
  }, []);

  // 放弃、揭晓答案
  const handleReveal = useCallback(() => {
    setRevealed(true);
    setPhase('lost');
  }, []);

  const attemptsLeft = MAX_ATTEMPTS - guesses.length;

  if (!answer) return null;

  return (
    <div className="app">
      {toast && <div className="toast">{toast}</div>}
      <header className="header">
        <div className="header-row">
          <div>
            <h1>电影 Wordle</h1>
            <p className="subtitle">猜电影 · 8 次机会</p>
          </div>
          <div className="header-actions">
            <button
              className="reveal-btn"
              onClick={handleReveal}
              disabled={phase !== 'playing'}
              aria-label="显示答案"
            >
              👁 答案
            </button>
            <button
              className="settings-btn"
              onClick={() => setSettingsOpen(true)}
              aria-label="设置"
            >
              ⚙ 设置
            </button>
          </div>
        </div>
        <div className="legend">
          <span className="legend-item cell-correct">命中</span>
          <span className="legend-item cell-close">接近</span>
          <span className="legend-item cell-absent">无关</span>
        </div>
      </header>

      {settingsOpen && (
        <SettingsPanel
          filter={filter}
          theme={theme}
          onApply={(f) => {
            handleApplyFilter(f);
            setSettingsOpen(false);
          }}
          onReset={() => {
            handleResetFilter();
            setSettingsOpen(false);
          }}
          onTheme={switchTheme}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      <div className="attempts">剩余机会：{attemptsLeft}/{MAX_ATTEMPTS}</div>
      {phase === 'playing' && (
        <GuessInput disabled={busy} onPick={handlePick} />
      )}
      {phase === 'playing' && guesses.length >= 3 && (
        <div className="hint-line">
          <p>💡 主演：{answer.cast[0] ?? '—'}</p>
          {guesses.length >= 5 && (
            <p>📝 简介：{hintFromOverview(answer?.overview ?? '')}</p>
          )}
        </div>
      )}
      <GameTable guesses={guesses} maxAttempts={MAX_ATTEMPTS} />
      {(phase === 'won' || phase === 'lost') && (
        <ResultBanner
          won={phase === 'won'}
          revealed={revealed}
          answer={answer}
          attemptsUsed={guesses.length}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
