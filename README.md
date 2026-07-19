# 电影 Wordle (MovieGuesser)

仿 Wordle 的电影猜谜游戏。系统从内置库随机选一部电影作为答案，玩家有 **8 次机会**输入电影名猜测。每行对比六个字段（年份 / 评分 / 国家 / 导演 / 主演 / 类型），命中绿色，接近黄色 + 方向箭头，无关灰色；多值字段（导演/主演/类型）逐项着色。

## 数据来源

内置 992 部 IMDb Top 电影静态库（[src/data/movies_tmdb.json](src/data/movies_tmdb.json)），TMDb 中文补全 + IMDb 评分。纯前端、无外网依赖、无需 API key 即可游玩。

数据由 [scripts/fetch_movies.py](scripts/fetch_movies.py) 从 CSV 的 IMDb ID 经 TMDb `/find` + `/movie/{id}` (zh-CN) 拉取生成。重跑需 TMDb key（见脚本）。

## 运行

```bash
npm install
npm run dev      # 本地开发
npm run build    # 生产构建
npm run preview  # 预览构建产物
```

## 玩法规则

每行对比 6 字段：

| 字段 | 命中(绿) | 接近(黄+箭头) | 无关(灰) |
|------|---------|--------------|---------|
| 上映年份 | 差=0 | 差≤5，↑(答案更晚)/↓(答案更早) | 差>5 |
| 评分 | 差<0.05 | 差≤0.5，↑(答案更高)/↓(答案更低) | 差>0.5 |
| 国家 | 完全相同 | 同大洲 | 不同大洲 |
| 导演 | 逐项：命中的绿，未命中灰 | — | — |
| 主演 | 逐项：命中的绿，未命中灰 | — | — |
| 类型 | 逐项：命中的绿，未命中灰 | — | — |

- 年份/评分箭头以**答案为基准**指向：箭头总显（命中除外），仅接近时变黄。
- 输入框搜索内置库，下拉点选提交。
- 8 次内全字段命中 = 胜利；用完未中或点「👁 答案」主动揭晓。

## 提示

渐进提示（猜测栏下方，非弹窗）：
- 第 **3** 次未中：显示答案首位主演。
- 第 **5** 次未中：叠加答案简介首句。

## 设置

右上角「⚙ 设置」打开浮层：
- **主题**：☀ 白天 / ☾ 夜晚（默认白天，localStorage 持久化）。
- **难度筛选**：年份区间 + 类型多选 + 大洲多选，仅筛答案候选范围（玩家仍可猜全部 992 部）。空集回退全库。

## 项目结构

```
src/
├── data/
│   ├── movies_tmdb.json   # 992 部电影数据
│   └── library.ts         # search / pickAnswer / fetchDetails / Filter
├── logic/
│   ├── continents.ts      # ISO-2 -> 大洲
│   └── compare.ts         # 六字段对比 + 箭头 + hintFromOverview
├── components/
│   ├── GuessInput.tsx     # 搜索下拉选片
│   ├── GameTable.tsx      # 表格棋盘（共用表头）
│   ├── SettingsPanel.tsx  # 设置浮层（主题+难度筛选）
│   └── ResultBanner.tsx   # 胜负揭晓
├── App.tsx                # 游戏状态机
├── types.ts
├── main.tsx
└── styles.css
scripts/
├── top_films_list.csv     # IMDb Top 1000 片单（rank/title/year/rating/link_url）
└── fetch_movies.py        # TMDb 拉取脚本 -> movies_tmdb.json
```

## 扩充片库

编辑 [scripts/top_films_list.csv](scripts/top_films_list.csv) 追加 IMDb 片单行，再跑 `python3 scripts/fetch_movies.py`（需 TMDb key）重新生成 `movies_tmdb.json`。缓存 `scripts/movies_cache.json` 断点续跑。
