import type { FieldCell, FieldKey, GuessResult } from '../types';

const FIELDS: FieldKey[] = ['year', 'rating', 'country', 'director', 'cast', 'genre'];
const LABELS: Record<FieldKey, string> = {
  year: '年份',
  rating: '评分',
  country: '国家',
  director: '导演',
  cast: '主演',
  genre: '类型',
};
const MULTI: Set<FieldKey> = new Set(['country', 'director', 'cast', 'genre']);

function Cell({
  cell,
  field,
  flip,
  delay,
}: {
  cell: FieldCell;
  field: FieldKey;
  flip?: boolean;
  delay?: number;
}) {
  const cls = `cell cell-${cell.status}${flip ? ' cell-flip' : ''}`;
  const style = flip ? { animationDelay: `${delay ?? 0}ms` } : undefined;
  // 多值：逐项 chip 着色
  if (MULTI.has(field)) {
    return (
      <td className={cls} style={style}>
        <div className="cell-items">
          {cell.items?.map((it, i) => (
            <span key={i} className={`chip chip-${it.status}`}>
              {it.value}
            </span>
          )) ?? cell.display}
        </div>
      </td>
    );
  }
  // 单值
  return (
    <td className={cls} style={style}>
      <span className="cell-value">
        {cell.display}
        {cell.arrow === 'up' && <span className="arrow"> ↑</span>}
        {cell.arrow === 'down' && <span className="arrow"> ↓</span>}
      </span>
    </td>
  );
}

export default function GameTable({
  guesses,
  maxAttempts,
}: {
  guesses: GuessResult[];
  maxAttempts: number;
}) {
  const empties = Math.max(0, maxAttempts - guesses.length);
  return (
    <table className="game-table">
      <thead>
        <tr>
          <th className="th-title">电影</th>
          {FIELDS.map((f) => (
            <th key={f}>{LABELS[f]}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {guesses.map((g, i) => {
          // 仅最新一行播翻转动画
          const flip = i === guesses.length - 1;
          const delay = (j: number) => j * 90;
          return (
            <tr key={i}>
              <td
                className={`cell-title${flip ? ' cell-flip' : ''}`}
                style={flip ? { animationDelay: `${delay(0)}ms` } : undefined}
              >
                <span className="cell-value">{g.movie.title}</span>
              </td>
              {FIELDS.map((f, j) => (
                <Cell
                  key={f}
                  cell={g.cells[f]}
                  field={f}
                  flip={flip}
                  delay={delay(j + 1)}
                />
              ))}
            </tr>
          );
        })}
        {Array.from({ length: empties }).map((_, i) => (
          <tr key={`empty-${i}`} className="row-empty">
            <td className="cell-title" />
            {FIELDS.map((f) => (
              <td key={f} className="cell cell-placeholder" />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
