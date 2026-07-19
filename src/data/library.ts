import type { Movie, MovieSuggestion } from '../types';
import { continentOf } from '../logic/continents';
import moviesJson from './movies_tmdb.json';

// 本地静态库数据层（替代 TMDb API）。
// search / pickAnswer / details 全部同步，无外网依赖。

const MOVIES: Movie[] = moviesJson as Movie[];

const BY_ID = new Map<number, Movie>(MOVIES.map((m) => [m.id, m]));

export interface Filter {
  yearFrom?: number; // 含，空/0 = 不限
  yearTo?: number; // 含，空/0 = 不限
  genres: string[]; // 任一命中（并集），空 = 不限
  continents: string[]; // 任一命中，空 = 不限
}

export function searchMovies(query: string): MovieSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return MOVIES.filter((m) => m.title.toLowerCase().includes(q))
    .slice(0, 8)
    .map((m) => ({ id: m.id, title: m.title, year: m.year }));
}

export function fetchDetails(id: number): Movie | null {
  return BY_ID.get(id) ?? null;
}

export function pickAnswer(): Movie {
  const i = Math.floor(Math.random() * MOVIES.length);
  return MOVIES[i];
}

// 从全库提取类型清单（去重）
export function listGenres(): string[] {
  const s = new Set<string>();
  for (const m of MOVIES) for (const g of m.genres) s.add(g);
  return Array.from(s).sort((a, b) => a.localeCompare(b, 'zh'));
}

// 从全库提取出现的大洲清单（去重，按固定顺序）
const CONTINENT_ORDER = ['亚洲', '欧洲', '北美', '南美', '非洲', '大洋洲', '其他'];
export function listContinents(): string[] {
  const present = new Set<string>();
  for (const m of MOVIES) for (const c of m.countries) present.add(continentOf(c));
  return CONTINENT_ORDER.filter((c) => present.has(c));
}

export function matches(m: Movie, f: Filter): boolean {
  // 年份
  if (f.yearFrom && m.year < f.yearFrom) return false;
  if (f.yearTo && m.year > f.yearTo) return false;
  // 类型
  if (f.genres.length > 0) {
    const hit = m.genres.some((g) => f.genres.includes(g));
    if (!hit) return false;
  }
  // 大洲
  if (f.continents.length > 0) {
    const hit = m.countries.some((c) => f.continents.includes(continentOf(c)));
    if (!hit) return false;
  }
  return true;
}

export function pickAnswerFiltered(f: Filter): Movie {
  const pool = MOVIES.filter((m) => matches(m, f));
  const usePool = pool.length > 0 ? pool : MOVIES; // 空集回退全库
  const i = Math.floor(Math.random() * usePool.length);
  return usePool[i];
}

export const EMPTY_FILTER: Filter = { genres: [], continents: [] };
