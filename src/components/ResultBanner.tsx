import { displayAnswer } from '../logic/compare';
import type { FieldKey, Movie } from '../types';

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
  return (
    <div className={`banner ${won ? 'banner-won' : 'banner-lost'}`}>
      <h2>{won ? '🎉 猜中了！' : revealed ? '👀 已揭晓答案' : '😢 机会用完'}</h2>
      <p className="answer-title">
        答案：<strong>{answer.title}</strong>
        {answer.year ? ` (${answer.year})` : ''}
      </p>
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
        再来一局
      </button>
    </div>
  );
}
