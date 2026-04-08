# campus-system 项目规范与规则

本文档定义 **复旦校园百事通** 前端子项目 `campus-system` 在开发、协作与交付中 **必须遵守** 的规范。凡与本仓库或需求文档冲突之处，以 **课程/产品正式需求** 为准；冲突需在 PR 或文档中显式说明。

---

## 1. 技术栈与边界

- **必须使用**：React 19、Vite 8、react-router-dom 7、Ant Design 6（`antd`）。
- **默认模块系统**：ESM（`"type": "module"`）；新文件使用 `import`/`export`，禁止 CommonJS `require`。
- **语言**：业务与 UI 层以 **JavaScript（JSX）** 为主；若引入 TS，须有团队一致决策并更新本文件。
- **禁止**：在未获评审同意的情况下，引入与现有栈重复职责的大型库（第二套路由/UI 框架等）。

---

## 2. 目录与文件组织

- **页面/路由级组件**：放在 `src/pages/`（或经评审命名的等价目录），文件名使用 **PascalCase**（如 `BuildingList.jsx`）。
- **可复用组件**：放在 `src/components/`，按功能分子目录；同一组件目录内可含同名的 `.jsx`、`.css`（或 `.module.css`）。
- **共享逻辑**：`src/hooks/`、`src/utils/`、`src/api/`（或 `src/services/`），职责单一、禁止循环依赖。
- **静态资源**：`public/` 放无需打包路径引用的资源；`src/assets/` 放由 bundler 处理的资源。
- **规范文档**：`rules/rules.md` 仅描述「必须遵守的规则」；详细设计可另建 `docs/` 并经引用链入 README。

---

## 3. 代码风格（JavaScript / React）

- **缩进与格式**：与仓库现有风格一致（当前为 2 空格）；提交前运行 `npm run lint` 并 **零 ESLint 错误**。
- **引号**：优先单引号 `'`（与现有 `App.jsx` 一致），除非字符串内含大量单引号。
- **分号**：与仓库现有文件一致（当前无分号则保持无分号，全仓统一即可）。
- **组件**：
  - 函数组件 + Hooks；避免在无关场景使用类组件。
  - 组件文件默认 **一个主 export**（具名或默认二选一，同目录内统一）。
  - **列表渲染** 必须提供稳定、语义合理的 `key`（禁止用数组下标作为唯一 key，除非静态列表且永不变序）。
- **命名**：
  - 组件、类型（若日后引入 TS）：**PascalCase**。
  - 函数、变量、Hook：**camelCase**；自定义 Hook 必须以 `use` 开头。
  - 常量（模块级且意图为不变配置）：**UPPER_SNAKE_CASE** 或 `camelCase` 全仓选一种并统一。
- **副作用**：`useEffect` 依赖数组须完整、真实；禁止掩盖异步竞态（必要时用 `AbortController` 或取消标记）。
- **禁止**：在 JSX 中内联大块复杂逻辑；复杂条件提取为变量或子函数。

---

## 4. CSS 与 UI（Ant Design）

- **全局样式**：`src/index.css`；组件局部样式优先 **CSS Modules** 或 **同目录 `ComponentName.css`**，避免无节制全局选择器污染。
- **类名**：语义化、BEM 或与现有 `App.css` 风格一致；避免依赖第三方库的未文档化内部类名。
- **Ant Design**：
  - 使用 `antd` 官方 API（`ConfigProvider`、主题 token 等），尽量通过 **Design Token** 与组件 props 定制，少覆盖 `.ant-*` 全局样式。
  - 表单、表格、分页等 **必须与后端/接口文档约定的字段名一致**；前端不得擅自改写字段含义。
- **无障碍**：交互控件需提供可访问名称（`aria-label`、`label` 等）；图标按钮须说明用途；图内容提供有意义 `alt`（装饰图可用空 `alt` + `aria-hidden`）。

---

## 5. 路由与导航

- 路由定义 **集中管理**（如 `src/router.jsx` 或 `src/routes/`），禁止在多个文件中硬编码相同路径字符串散落各处——须抽到常量（如 `src/constants/routes.js`）。
- **URL 设计**：使用 **kebab-case** 或小写短路径（如 `/buildings/:id`），与产品术语一致。
- **权限**：若存在管理员与普通用户路由，须在布局或路由层做 **守卫**（未登录/无权限不得进入或统一跳转），禁止仅依赖「不渲染链接」作为唯一防护。

---

## 6. 数据层与 API

- **约定**：所有 HTTP 请求经统一封装（`src/api/client.js` 等），包含 baseURL、超时、错误拦截与（如有）Token 注入。
- **命名**：请求/响应字段与 **需求说明与数据库概念设计** 对齐（如 `Campus`、`Building`、`TeacherCourse`）；新增字段须在需求或 OpenAPI/注释中备案。
- **错误处理**：用户可见错误使用 `antd` `message` / `notification`；禁止只 `console.error` 而不提示。
- **状态**：服务端列表数据 loading / empty / error 三态须有 UI；避免静默失败。

---

## 7. 安全与隐私

- **凭证**：Token、密码等 **禁止写入仓库**；使用环境变量（`.env.local` 且已加入 `.gitignore`）。
- **XSS**：禁止 `dangerouslySetInnerHTML` 除非经过可信 sanitize；用户生成内容默认按纯文本展示。
- **外链**：`target="_blank"` 的链接须 `rel="noopener noreferrer"`。
- **日志**：生产构建中不得输出敏感信息（密码、Token、完整身份证号等）。

---

## 8. Git 与工作流

- **分支**：`main`/`master` 保持稳定；功能开发使用 `feature/<简述>`；修复使用 `fix/<简述>`。
- **提交信息**：使用清晰中文或英文 **完整句**，说明「做了什么、为何必要」；禁止无意义信息（如 `update`、`fix`）。
- **提交前**：必须可通过 `npm run build` 与 `npm run lint`（在本地或 CI 上一致）。
- **大文件**：禁止提交二进制大图、zip、node_modules；必要资源走 `git-lfs` 或外链并经评审。

---

## 9. 文档与需求一致性

- 业务实体关系（含 **教师—课程 M:N** 与 `TeacherCourse`）以 **`复旦校园百事通问答系统需求分析.md`**（及课设 ER 文档）为 **单一事实来源（SSOT）**。
- 前端模型（types、mock、表格列）变更时，须同步更新需求或 API 说明，或在 PR 中说明 **偏差与原因**。

---

## 10. 依赖与性能

- **新增依赖**：须说明用途、体积影响、许可证；优先使用维护活跃、体积合理的包。
- **性能**：路由级代码分割（`React.lazy` + `Suspense`）用于重型页面；大列表考虑虚拟滚动或分页；图片使用合适尺寸与格式。

---

## 11. 审查清单（PR / 自检）

提交代码前至少确认：

1. `npm run lint` 无报错。
2. `npm run build` 成功。
3. 新增/修改路由与菜单、权限一致。
4. 关键用户路径有 loading / 错误提示。
5. 未引入 Secrets；未无意扩大全局样式影响面。
6. 与需求文档中的实体、字段、关系 **无未说明冲突**。

---

## 12. 修订

- 本文件变更须经项目组认可；重大变更（技术栈、目录约定）须在 README 或 `docs/` 中留下迁移说明。

*最后更新：由项目组维护。*
