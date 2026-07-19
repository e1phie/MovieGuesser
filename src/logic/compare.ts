import type { FieldCell, FieldItem, FieldKey, GuessResult, Movie, Status } from '../types';
import { continentOf } from './continents';

const YEAR_TOLERANCE = 5;
const RATING_TOLERANCE = 0.5;

// ISO-2 -> 中文名（常见国，未知回退原码）
const COUNTRY_ZH: Record<string, string> = {
  CN: '中国', HK: '中国香港', TW: '中国台湾', MO: '中国澳门',
  JP: '日本', KR: '韩国', IN: '印度', US: '美国', CA: '加拿大',
  GB: '英国', FR: '法国', DE: '德国', IT: '意大利', ES: '西班牙',
  RU: '俄罗斯', AU: '澳大利亚', NZ: '新西兰', TH: '泰国', IR: '伊朗',
  TR: '土耳其', MX: '墨西哥', BR: '巴西', AR: '阿根廷', SE: '瑞典',
  DK: '丹麦', NO: '挪威', FI: '芬兰', NL: '荷兰', BE: '比利时',
  CH: '瑞士', AT: '奥地利', IE: '爱尔兰', PL: '波兰', CZ: '捷克',
  HU: '匈牙利', GR: '希腊', UA: '乌克兰', IL: '以色列', AE: '阿联酋',
  SA: '沙特', ID: '印尼', VN: '越南', PH: '菲律宾', MY: '马来西亚',
  SG: '新加坡', PK: '巴基斯坦', BD: '孟加拉国', EG: '埃及', ZA: '南非',
  NG: '尼日利亚', KE: '肯尼亚', MA: '摩洛哥', DZ: '阿尔及利亚',
  CL: '智利', CO: '哥伦比亚', PE: '秘鲁', VE: '委内瑞拉', KZ: '哈萨克斯坦',
  PT: '葡萄牙', IS: '冰岛', RO: '罗马尼亚', CU: '古巴', JM: '牙买加',
  GH: '加纳', CM: '喀麦隆', TZ: '坦桑尼亚', ET: '埃塞俄比亚', TN: '突尼斯',
};

function countryLabel(iso2: string): string {
  return COUNTRY_ZH[iso2.toUpperCase()] ?? iso2.toUpperCase();
}

function intersect(a: string[], b: string[]): string[] {
  const sb = new Set(b.map((s) => s.toLowerCase()));
  return a.filter((s) => sb.has(s.toLowerCase()));
}

function join(arr: string[]): string {
  return arr.length ? arr.join('、') : '—';
}

function compareYear(guess: number, answer: number): FieldCell {
  if (guess === 0) return { status: 'absent', display: '—' };
  const diff = answer - guess; // 以答案为基准：答案>猜→↑(答案更晚)，答案<猜→↓
  const arrow = diff > 0 ? 'up' : diff < 0 ? 'down' : undefined;
  const status =
    diff === 0
      ? 'correct'
      : Math.abs(diff) <= YEAR_TOLERANCE
        ? 'close'
        : 'absent';
  return { status, arrow, display: String(guess) };
}

function compareRating(guess: number, answer: number): FieldCell {
  if (!guess) return { status: 'absent', display: '—' };
  const diff = answer - guess; // 答案>猜→↑(答案更高)
  const arrow = diff > 0 ? 'up' : diff < 0 ? 'down' : undefined;
  const status =
    Math.abs(diff) < 0.05
      ? 'correct'
      : Math.abs(diff) <= RATING_TOLERANCE
        ? 'close'
        : 'absent';
  return { status, arrow, display: guess.toFixed(1) };
}

function compareCountries(guess: string[], answer: string[]): FieldCell {
  const answerSet = new Set(answer.map((s) => s.toLowerCase()));
  const items: FieldItem[] = guess.map((iso2) => {
    const inAnswer = answerSet.has(iso2.toLowerCase());
    let status: Status;
    if (inAnswer) {
      status = 'correct';
    } else {
      // 与答案任一国同大洲 → 黄
      const sameCont = answer.some(
        (a) => continentOf(a) === continentOf(iso2)
      );
      status = sameCont ? 'close' : 'absent';
    }
    return { value: countryLabel(iso2), status };
  });
  const allCorrect = items.length > 0 && items.every((it) => it.status === 'correct');
  const anyHit = items.some(
    (it) => it.status === 'correct' || it.status === 'close'
  );
  return {
    status: allCorrect ? 'correct' : anyHit ? 'close' : 'absent',
    display: join(guess.map(countryLabel)),
    items,
  };
}

// 多值字段逐项着色：命中 correct(绿)，未命中 absent(灰)。
// 整体 status：全部命中 correct；否则 absent（无黄概念）。
function compareItems(guess: string[], answer: string[]): FieldCell {
  const answerSet = new Set(answer.map((s) => s.toLowerCase()));
  const items: FieldItem[] = guess.map((v) => ({
    value: v,
    status: answerSet.has(v.toLowerCase()) ? 'correct' : 'absent',
  }));
  const allCorrect = items.length > 0 && items.every((it) => it.status === 'correct');
  // 显示用：未命中项灰、命中项绿，逐项渲染（display 仅兜底）
  return {
    status: allCorrect ? 'correct' : intersect(guess, answer).length > 0 ? 'close' : 'absent',
    display: join(guess),
    items,
  };
}

export function compare(guess: Movie, answer: Movie): GuessResult {
  const cells: Record<FieldKey, FieldCell> = {
    year: compareYear(guess.year, answer.year),
    rating: compareRating(guess.rating, answer.rating),
    country: compareCountries(guess.countries, answer.countries),
    director: compareItems(guess.director, answer.director),
    cast: compareItems(guess.cast, answer.cast),
    genre: compareItems(guess.genres, answer.genres),
  };

  const allCorrect = (Object.keys(cells) as FieldKey[]).every(
    (k) => cells[k].status === 'correct'
  );

  return { movie: guess, cells, won: allCorrect };
}

export function displayAnswer(field: FieldKey, m: Movie): string {
  switch (field) {
    case 'year':
      return String(m.year);
    case 'rating':
      return m.rating ? m.rating.toFixed(1) : '—';
    case 'country':
      return join(m.countries.map(countryLabel));
    case 'director':
      return join(m.director);
    case 'cast':
      return join(m.cast);
    case 'genre':
      return join(m.genres);
  }
}

// 取简介首句作为提示。按中文句末标点(。！？)截取，含标点；无标点取前 50 字。
export function hintFromOverview(overview: string): string {
  const s = overview.trim();
  if (!s) return '（暂无简介）';
  const m = s.match(/^[^。！？]*[。！？]/);
  if (m) return m[0];
  return s.slice(0, 50) + '…';
}
