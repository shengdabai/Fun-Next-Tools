# 趣味 Next.js 项目集

13 个独立的 Next.js 小工具,每个是完整可独立 `npm run dev` 的项目。一半是出海 SaaS 工具(英文),一半是中文教学小应用。

> 整理归档于 2026-05-25,由 `~/Downloads/好玩有趣项目` 移入。

## 单项目启动

```bash
cd <项目目录>
npm install
npm run dev
```

## 项目清单

### 出海 / 通用工具
| 目录 | 应用 | 用途 |
|------|------|------|
| `clip-title-gen/` | YouTube Title Gen | 生成高点击率 YouTube 标题 |
| `domain-scorer/` | Domain Scorer | 域名价值即时评估 |
| `invoice-generator/` | Invoice Generator | 免费专业发票生成 |
| `link-in-bio/` | Link In Bio | 个人聚合链接页 |
| `meeting-cost-clock/` | Meeting Cost Clock | 实时计算会议成本 |
| `newsletter-digest/` | Newsletter Digest | 邮件简报摘要 |
| `price-pilot/` | Price Pilot | 短租房定价分析 |
| `resume-scorer/` | Resume Scorer | 简历即时评分 |
| `thread-forge/` | Thread Forge | 长文转 Twitter Thread |
| `habit-streak/` | Habit Streak | 习惯打卡连胜追踪 |

### 中文教学小应用
| 目录 | 应用 | 用途 |
|------|------|------|
| `stroke-order-trainer/` | 汉字笔顺练习器 | Chinese Stroke Order Trainer |
| `tone-trainer/` | 声调闯关 | Tone Trainer |
| `vocab-starmap/` | HSK 词汇星图 | Vocab Starmap |

## 约定

- 每个项目结构一致:`src/` + `package.json` + `next.config.js`
- 各自独立依赖,`node_modules` 未提交,首次运行需 `npm install`
