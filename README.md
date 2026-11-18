# FRAME · 放映室

个人视频生成提示词工作台：内置 773 条分镜提示词（MiniMax H3 / Seedance 2.5 / Seedance 2.0 / Veo 3）与本地缩略图，集提示词实验室、智能体助手、导演技能库、素材库于一体。原生 HTML/CSS/JS + Python 标准库实现，零运行时依赖，单文件即可完全离线使用。

![FRAME 分镜库](studio-test-artifacts/desktop-library.png)

| 提示词实验室 | 移动端 |
| --- | --- |
| ![提示词实验室](studio-test-artifacts/desktop-prompt-lab.png) | ![移动端](studio-test-artifacts/mobile-library.png) |

## 功能

- **分镜库**：773 条视频提示词，缩略图全部本地化；支持关键词搜索、模型 / 时长 / 画幅 / 分类筛选、相似分镜推荐；外部导入条目带 NEW 徽标；漫剧 / 短剧分类收录写实漫剧合镜链与竖屏短剧案例
- **精选首屏**：打开默认展示离线质量评分筛出的 117 条精选（提示词长度、镜头语言、光线 / 运动 / 声音、结构化段落加权，模型配额与分类分散排序），首屏不再被低质与重复条目淹没；「查看全库」或任意搜索 / 筛选即回到全部 773 条；四个筛选控件收进单个「筛选」按钮，激活条件数以徽标提示
- **收藏与标签**：按收藏夹分组、自定义标签，支持 JSON 备份导出 / 导入
- **中英双语界面**，深色 / 浅色主题一键切换
- **提示词实验室**：草稿编辑、版本历史（含版本对照 diff）、创作笔记；提示词解剖、智能补全、一键增强
- **分镜序列板**：把草稿与灵感分镜按拍摄顺序排列，逐镜写连续性备注，一键导出 CSV / JSON / Markdown 制片表，或直接打印成白底黑字的纸质制片表
- **智能体助手**：接入你自己的 LLM 与文生图 API，基于所选分镜或整块序列板优化提示词、生成关键帧图片；序列板整场送入上下文后逐镜改写，每块结果回写到对应草稿，服装、道具、光线与轴线保持前后镜一致
- **导演技能库**：内置 5 套署名开源导演技能（H3 导演方法、H3 语法与硬限制、Seedance 2.5 导演方法、短剧分镜与连戏、漫剧角色锁定导演），注入系统提示词约束改写与关键图拆解，可一键「用技能改写」
- **素材库**：生成的图片与提示词按组保存，启用技能时自动打上技能标签归组，随时插入草稿复用
- **效率工具**：命令面板（含技能切换）、最近使用、卡片一键复制、撤销
- **新手引导**：首次打开自动弹出聚光灯分步导览（搜索→分镜卡片→创作台→导航→智能体→命令面板），高亮真实界面并滚动定位；可跳过、看完自动标记，顶栏问号或命令面板随时重看；支持方向键翻步、Esc 退出，中英双语、移动端不溢出
- **完全离线**：数据与缩略图全部内嵌进单个 HTML 文件，断网可用

## 快速开始

需要 Python 3.8+（仅标准库，无需安装任何依赖）。

### 方式一：直接打开（纯前端）

双击 `video-prompt-studio.html` 即可浏览、搜索、收藏、编辑提示词。此模式下智能体联网功能受浏览器跨域限制，建议用方式二。

### 方式二：本机服务（推荐，完整功能）

```bash
python start_studio.py
```

自动打开 http://127.0.0.1:8787 。页面与 API 中转同源，智能体请求不再受 CORS 限制。

可选参数：

```bash
python start_studio.py --port 8789      # 更换端口
python start_studio.py --no-browser     # 不自动打开浏览器
```

仓库还附带经典版页面 `minimax-h3-prompt-assistant.html`（早前的轻量助手），同样可直接打开。

## 智能体配置

1. 用方式二启动服务，打开页面右下角的「智能体助手」→「智能体设置」
2. 填写你的网关地址（OpenAI 兼容接口，如 `https://你的网关/v1`）、API Key、模型名；文生图接口同理
3. 点「测试连接」确认可用，然后从任意分镜卡片插入智能体，即可优化提示词或生成关键帧图片
4. 在智能体面板的「导演技能」下拉中选择技能（或命令面板搜「技能」），改写与关键图拆解会遵循该技能的方法与硬限制；来源链接可直接查看上游仓库

**安全说明**

- API Key 只保存在浏览器 localStorage，不写入任何文件、不上传任何服务器
- 本机服务仅绑定 `127.0.0.1`，校验 Host 与 `X-Studio-Relay` 请求头，不发送开放 CORS 头，其他网站无法调用
- 请求链路只有：浏览器 → 本机进程 → 你自己的网关，不经过任何第三方
- 支持 SSE 流式输出

## 快捷键

| 按键 | 功能 |
| --- | --- |
| `Ctrl/⌘ + K` | 命令面板 |
| `/` | 聚焦搜索框 |
| `N` | 新建草稿 |
| `Ctrl/⌘ + S` | 保存状态 |

## 构建

修改 `studio.template.html` / `studio.css` / `studio.js` 后重新生成单文件页面：

```bash
python build_studio.py     # 输出 video-prompt-studio.html
node --check studio.js     # 语法检查（可选）
```

## 测试

```bash
# 单元测试（28 项）：构建产物完整性 + 本机服务行为
python -B -m unittest test_studio_build test_studio_server -q

# 浏览器端到端（57 项）：需先启动静态服务与无头 Chrome
python -m http.server 8786 --bind 127.0.0.1
# 另开终端：Chrome --headless=new --remote-debugging-port=9335 --user-data-dir=studio-test-artifacts/chrome-profile about:blank
node test_studio_browser.cjs

# 中继端到端（6 项）：自动拉起假上游 + 本机服务 + 无头 Chrome，测完自动清理
node test_studio_relay_browser.cjs
```

浏览器测试需要本机安装 Chrome 与 Node.js 22+（使用内置 WebSocket）。测试截图与结果输出在 `studio-test-artifacts/`。仓库附带 GitHub Actions CI（`.github/workflows/ci.yml`），推送与 PR 自动跑单元、构建与两组浏览器端到端；Linux 下可用 `CHROME_BIN` 环境变量指定 Chrome 路径。

## 离线分发包

离线包不再随仓库存储（避免超出 GitHub 大文件限制）：到 [Releases 页面](https://github.com/XiaoDi37/H3_Prompts/releases) 下载 `FRAME-studio-offline.zip`（单文件页面 + 启动脚本 + NOTICE + 全部 758 张缩略图），解压即用，适合拷到无网环境。

修改数据或页面后本地重建：

```bash
python build_offline.py   # 输出 FRAME-studio-offline.zip 并做 CRC 校验
```

## 目录结构

```
├── video-prompt-studio.html          # FRAME 单文件成品（离线可用）
├── minimax-h3-prompt-assistant.html  # 经典版助手页面
├── start_studio.py                   # 本机服务：页面托管 + 同源 API 中转
├── studio.template.html              # FRAME 页面模板
├── studio.css / studio.js            # FRAME 样式与逻辑源码
├── build_studio.py                   # 单文件构建器
├── prompts.json                      # 773 条提示词数据
├── titles_zh.json / thumbs_ext.json  # 中文标题 / 缩略图扩展名映射
├── thumbs/                           # 773 张本地缩略图
├── scrape.py / download_thumbs.py / fix_meta.py  # 数据抓取与处理脚本
├── import_sources.py                 # 外部开源仓库提示词导入管线（去重 + 缩略图）
├── NOTICE                            # 第三方来源与许可证声明
├── build_page.py                     # 经典版页面构建器
├── test_studio_build.py / test_studio_server.py  # 单元测试
├── test_studio_browser.cjs           # 浏览器端到端测试
├── test_studio_relay_browser.cjs     # 中继端到端测试
├── studio-test-artifacts/            # 测试截图与结果
├── build_offline.py                  # 离线分发包构建器（CRC 校验）
└── .github/workflows/ci.yml          # CI：单元 + 构建 + 浏览器/中继端到端
```

## 数据来源

提示词与缩略图来自以下公开来源，版权归原作者所有，本仓库仅供个人学习与备份使用；逐条署名保留在 `prompts.json` 的 `author` / `source_link` 字段，完整许可证声明见 [NOTICE](NOTICE)。

| 来源 | 条目 | 许可证 |
| --- | --- | --- |
| [beatapi.io/minimax-h3-prompts](https://beatapi.io/minimax-h3-prompts) | 550 | 公开社区案例，逐条署名 |
| [xianyu110/awesome-minimax-h3-prompts](https://github.com/xianyu110/awesome-minimax-h3-prompts) | 70 | MIT |
| [flaqai/awesome-minimax-h3-video-prompts](https://github.com/flaqai/awesome-minimax-h3-video-prompts) | 84 | MIT |
| [kinovi-ai/awesome-seedance-2-5-prompts](https://github.com/kinovi-ai/awesome-seedance-2-5-prompts) | 24 | MIT |
| [liu-kaining/Awesome-Veo3-Prompts](https://github.com/liu-kaining/Awesome-Veo3-Prompts) | 30 | MIT |

导演技能改编自 [penposs/minimax-h3-video-prompt](https://github.com/penposs/minimax-h3-video-prompt)（MIT）与 [xxjrq/seedance-minimax-prompts](https://github.com/xxjrq/seedance-minimax-prompts)（代码 MIT、内容 CC BY 4.0），为浓缩改写而非原文复制，技能面板内附来源链接。

重新导入或增量合并外部仓库（先按上表地址浅克隆到 `external-sources/`，该目录已 gitignore）：

```bash
python import_sources.py   # 读取 external-sources/，按 URL 与正文去重后合并进 prompts.json
```

## 技术栈

- 前端：原生 HTML / CSS / JavaScript，无框架、无 npm 依赖
- 服务端：Python 标准库（`http.server` + `urllib`），单文件启动
- 测试：Python `unittest` + Node.js CDP 驱动的真实浏览器端到端测试