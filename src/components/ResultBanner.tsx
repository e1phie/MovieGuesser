import { displayAnswer } from '../logic/compare';
import type { FieldKey, Movie } from '../types';
import Fireworks from './Fireworks';
import { useEffect } from 'react';

const FIELDS: FieldKey[] = ['year', 'rating', 'country', 'director', 'cast', 'genre'];
const LABELS: Record<FieldKey, string> = {
  year: '年份',
  rating: '评分',
  country: '国家',
  director: '导演',
  cast: '主演',
  genre: '类型',
};

interface Props {
  won: boolean;
  revealed?: boolean;
  answer: Movie;
  attemptsUsed: number;
  onRestart: () => void;
}

export default function ResultBanner({ won, revealed, answer, attemptsUsed, onRestart }: Props) {
  // 回车新开一局（延迟注册，避免猜中时的同一 Enter 事件误触发）
  useEffect(() => {
    let onKey: ((e: KeyboardEvent) => void) | null = null;
    const t = setTimeout(() => {
      onKey = (e: KeyboardEvent) => {
        if (e.key !== 'Enter') return;
        const el = document.activeElement;
        if (el && el.tagName === 'INPUT') return;
        onRestart();
      };
      window.addEventListener('keydown', onKey);
    }, 300);
    return () => {
      clearTimeout(t);
      if (onKey) window.removeEventListener('keydown', onKey);
    };
  }, [onRestart]);

  return (
    <div className="result-overlay">
      {won && <Fireworks />}
      <div className={`result-card ${won ? 'won' : 'lost'}`}>
        <h2>{won ? '🎉 猜中了！' : revealed ? '👀 已揭晓答案' : '😢 机会用完'}</h2>
        <p className="answer-title">
          答案：<strong>{answer.title}</strong>
          {answer.year ? ` (${answer.year})` : ''}
        </p>
        {answer.overview && (
          <p className="answer-overview">{answer.overview}</p>
        )}
        <div className="answer-fields">
          {FIELDS.map((f) => (
            <div key={f} className="answer-field">
              <span className="answer-field-label">{LABELS[f]}</span>
              <span>{displayAnswer(f, answer)}</span>
            </div>
          ))}
        </div>
        <p className="banner-meta">
          {won ? `用了 ${attemptsUsed} 次` : revealed ? '主动揭晓' : `8 次未中`}
        </p>
        <button className="restart-btn" onClick={onRestart}>
          再来一局（Enter）
        </button>
      </div>
    </div>
  );
}
