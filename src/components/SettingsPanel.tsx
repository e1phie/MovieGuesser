import { useMemo, useState } from 'react';
import { EASY_MAX_RANK, listContinents, listGenres, type Filter } from '../data/library';

type Theme = 'dark' | 'light';

interface Props {
  filter: Filter;
  theme: Theme;
  onApply: (f: Filter) => void;
  onReset: () => void;
  onTheme: (t: Theme) => void;
  onClose: () => void;
}

// 浮层设置面板：难度筛选 + 主题切换
export default function SettingsPanel({
  filter,
  theme,
  onApply,
  onReset,
  onTheme,
  onClose,
}: Props) {
  const [yearFrom, setYearFrom] = useState<string>(
    filter.yearFrom ? String(filter.yearFrom) : ''
  );
  const [yearTo, setYearTo] = useState<string>(
    filter.yearTo ? String(filter.yearTo) : ''
  );
  const [genres, setGenres] = useState<Set<string>>(new Set(filter.genres));
  const [continents, setContinents] = useState<Set<string>>(
    new Set(filter.continents)
  );
  const [easyMode, setEasyMode] = useState<boolean>(!!filter.maxRank);

  const allGenres = useMemo(() => listGenres(), []);
  const allContinents = useMemo(() => listContinents(), []);

  function toggle(set: Set<string>, v: string, setter: (s: Set<string>) => void) {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    setter(next);
  }

  function buildFilter(): Filter {
    return {
      yearFrom: yearFrom ? Number(yearFrom) || undefined : undefined,
      yearTo: yearTo ? Number(yearTo) || undefined : undefined,
      genres: Array.from(genres),
      continents: Array.from(continents),
      maxRank: easyMode ? EASY_MAX_RANK : undefined,
    };
  }

  function handleApply() {
    onApply(buildFilter());
  }

  function handleReset() {
    setYearFrom('');
    setYearTo('');
    setGenres(new Set());
    setContinents(new Set());
    setEasyMode(false);
    onReset();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>设置</h2>
          <button className="modal-close" onClick={onClose} aria-label="关闭">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* 难度预设 */}
          <div className="settings-group">
            <span className="settings-label">难度模式</span>
            <div className="theme-switch">
              <button
                className={!easyMode ? 'active' : ''}
                onClick={() => setEasyMode(false)}
              >
                普通（全部 992 部）
              </button>
              <button
                className={easyMode ? 'active' : ''}
                onClick={() => setEasyMode(true)}
              >
                简单（前 {EASY_MAX_RANK} 知名）
              </button>
            </div>
          </div>
          {/* 主题 */}
          <div className="settings-group">
            <span className="settings-label">主题</span>
            <div className="theme-switch">
              <button
                className={theme === 'light' ? 'active' : ''}
                onClick={() => onTheme('light')}
              >
                ☀ 白天
              </button>
              <button
                className={theme === 'dark' ? 'active' : ''}
                onClick={() => onTheme('dark')}
              >
                ☾ 夜晚
              </button>
            </div>
          </div>

          {/* 年份 */}
          <div className="settings-group">
            <span className="settings-label">年份区间</span>
            <div className="settings-row">
              <input
                className="year-input"
                type="number"
                placeholder="起始"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
              />
              <span>—</span>
              <input
                className="year-input"
                type="number"
                placeholder="结束"
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
              />
            </div>
          </div>

          {/* 类型 */}
          <div className="settings-group">
            <span className="settings-label">类型（多选）</span>
            <div className="settings-grid">
              {allGenres.map((g) => (
                <label key={g} className="checkbox">
                  <input
                    type="checkbox"
                    checked={genres.has(g)}
                    onChange={() => toggle(genres, g, setGenres)}
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>

          {/* 大洲 */}
          <div className="settings-group">
            <span className="settings-label">大洲（多选）</span>
            <div className="settings-grid">
              {allContinents.map((c) => (
                <label key={c} className="checkbox">
                  <input
                    type="checkbox"
                    checked={continents.has(c)}
                    onChange={() => toggle(continents, c, setContinents)}
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>

          <div className="settings-actions">
            <button className="settings-apply" onClick={handleApply}>
              应用并新开一局
            </button>
            <button className="settings-reset" onClick={handleReset}>
              重置
            </button>
          </div>
          <p className="settings-hint">
            仅筛选答案候选范围，你仍可猜测全部电影。
          </p>
        </div>
      </div>
    </div>
  );
}
