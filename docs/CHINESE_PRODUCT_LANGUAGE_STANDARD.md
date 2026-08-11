# CareerOS 简体中文产品语言标准

## 原则

简体中文模式以自然、简洁、可操作的中文为主。CareerOS 自有的导航、按钮、筛选、状态、验证、空状态、确认信息和分析标签均须显示中文；内部枚举和持久化值继续使用稳定的英文值，展示层通过 `src/i18n` 转换。

可保留英文的内容仅限官方品牌或岗位名称（没有通行中文名时）、技术名称、官方链接、用户输入和明确标注为原文的来源内容。

## 推荐用语

| English                 | 简体中文       |
| ----------------------- | -------------- |
| Opportunities           | 机会           |
| Applications            | 申请           |
| Action Centre           | 行动中心       |
| Career Intelligence     | 职业情报       |
| Knowledge Graph         | 职业知识图谱   |
| Gap Analysis            | 差距分析       |
| Recruitment Calendar    | 招聘日历       |
| Official source         | 官方来源       |
| Last verified           | 最近核验       |
| Verification required   | 待重新核验     |
| Estimated profile match | 预计资料匹配度 |

## 日期与格式

- 绝对日期：`2026年8月11日`
- 相对日期：`今天`、`明天`、`3天后`、`已逾期2天`
- 中文眉题不得强制大写或使用过宽字距。
- 官方数据缺失时使用“未公开”或省略该行，不得补造占位值。

## 工程约束

- 词典键必须保持 en / zh-CN 对齐。
- `displayUiValue` 只负责展示，不得改变存储值。
- 新增枚举时必须同时添加中文展示映射和测试。
- 切换语言不得重置资料、申请、岗位、路线图或用户备注。
