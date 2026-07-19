# 电影 Wordle (MovieGuesser)

仿 Wordle 的电影猜谜游戏。系统随机选一部电影作为答案，玩家有 **8 次机会**输入电影名猜测。每行对比四个固定字段（年份 / 国家 / 主演 / 类型），命中绿色，接近黄色 + 方向箭头，无关灰色。

## 数据来源

内置 100 部知名电影静态库（[src/data/movies.ts](src/data/movies.ts)），纯前端、无外网依赖、无需 API key。

## 运行

```bash
npm install
npm run dev      # 本地开发
npm run build    # 生产构建
npm run preview  # 预览构建产物
```

## 玩法规则

| 字段 | 命中(绿) | 接近(黄) | 无关(灰) |
|------|---------|---------|---------|
| 上映年份 | 差=0 | 差≤5，附 ↑(猜大)/↓(猜小) | 差>5 |
| 国家 | 完全相同 | 同大洲 | 不同大洲 |
| 主演 | 完全相同 | 有交集 | 无交集 |
| 类型 | 完全相同 | 有交集 | 无交集 |

- 输入框搜索内置电影库，下拉点选提交。
- 8 次内全绿 = 胜利；用完未中则揭晓答案。
- 「再来一局」随机换一部。同会话刷新页面答案不变（sessionStorage 缓存）。

## 项目结构

```
src/
├── data/
│   ├── movies.ts     # 100 部电影静态数据 + 国名->大洲映射
│   └── library.ts   # search / pickAnswer / fetchDetails 本地查询
├── logic/
│   ├── continents.ts # 大洲判定
│   └── compare.ts    # 四字段对比，返回 GuessResult
├── components/
│   ├── GuessInput.tsx   # 搜索下拉选片
│   ├── GuessRow.tsx     # 单行 4 格
│   ├── GameBoard.tsx    # 8 行网格
│   └── ResultBanner.tsx # 胜负揭晓
├── App.tsx          # 游戏状态机
├── types.ts
├── main.tsx
└── styles.css
```

## 扩充片库

编辑 [src/data/movies.ts](src/data/movies.ts) 的 `MOVIES` 数组，追加 `{ id, title, year, countries, cast, genres }`。id 保持唯一。`scripts/test.py` 是 TMDb 抓取脚本参考（需外网 + key），可用于批量拉取后手动转成本地数据。
