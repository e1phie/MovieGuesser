export interface Movie {
  id: number;
  title: string;
  year: number; // release_date 取年
  rating: number; // IMDb 评分
  overview: string; // 简介
  countries: string[]; // ISO-2 production_countries
  director: string[]; // 导演姓名
  cast: string[]; // top 5 cast 姓名
  genres: string[]; // 类型名
}

export type Status = 'correct' | 'close' | 'absent';

// 单值字段(年份/国家/评分)：用 status + display + arrow
// 多值字段(类型/导演/主演)：用 items，每子项独立着色
export interface FieldItem {
  value: string;
  status: Status;
}

export interface FieldCell {
  status: Status; // 单值字段整体状态；多值字段此处=全部命中则correct
  arrow?: 'up' | 'down'; // 年份/评分专用
  display: string; // 单值字段展示文本
  items?: FieldItem[]; // 多值字段逐项着色
}

export type FieldKey = 'year' | 'rating' | 'country' | 'director' | 'cast' | 'genre';

export interface GuessResult {
  movie: Movie;
  cells: Record<FieldKey, FieldCell>;
  won: boolean;
}

// TMDb 搜索下拉项（轻量）
export interface MovieSuggestion {
  id: number;
  title: string;
  year: number;
}
