'use strict';

const CATALOG = JSON.parse(document.getElementById('catalog-data').textContent);
const ITEMS = new Map(CATALOG.map(item => [item.id, item]));
const STORE_KEY = 'frame_studio_v1';
const RELAY = window.__STUDIO_RELAY__ || '';
const PAGE_SIZE = 24;
const FEATURED_ID = 'generated-with-minimax-h3-on-116099-010115027';
const CURATED_IDS = /*__CURATED_IDS__*/[];
const CURATED_RANK = new Map(CURATED_IDS.map((id,index)=>[id,index]));
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
const now = () => new Date().toISOString();
const clone = value => JSON.parse(JSON.stringify(value));
const ICONS = {
  plus:'M12 5v14M5 12h14', minus:'M5 12h14', close:'m6 6 12 12M6 18 18 6', search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  library:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8',
  folder:'M3 7V4h6l2 3h10v13H3z', edit:'m16 3 5 5-12 12-6 1 1-6zM14 5l5 5',
  archive:'M3 4h18v4H3zM5 8v13h14V8M10 12h4', arrow:'M5 12h14m-5-5 5 5-5 5',
  panel:'M3 3h18v18H3zM15 3v18', menu:'M3 6h18M3 12h18M3 18h18',
  sun:'M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  moon:'M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10', copy:'M9 9h12v12H9zM5 15H3V3h12v2',
  history:'M3 11a9 9 0 1 1 2 7M3 4v7h7M12 7v5l3 2',
  download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5', upload:'M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5',
  play:'m8 4 12 8-12 8z', more:'M5 12h.01M12 12h.01M19 12h.01',
  check:'m5 12 4 4L19 6', trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',
  film:'M3 3h18v18H3zM7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4',
  clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 7v5l3 2', tag:'M3 3h8l10 10-8 8L3 11zM7 7h.01',
  spark:'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM18.5 15l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z',
  send:'M22 2 11 13M22 2 15 22l-4-9-9-4z', stop:'M7 7h10v10H7z',
  sliders:'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  image:'M3 3h18v18H3zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21',
  layers:'m12 3 9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
  bookmark:'M6 3h12v18l-6-4-6 4z',
  printer:'M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z',
  help:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.2 9.3a2.8 2.8 0 1 1 5.4 1c0 1.9-2.6 2.2-2.6 4M12 17.2h.01',
  compass:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1z',
  star:'M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.4l6.1-.8z',
  branch:'M6 9v6M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9',
  grid:'M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z',
  shuffle:'M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5'
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[name] || ICONS.film}"/></svg>`;
const TEXT = {
  zh: {
    skip:'跳到内容',brandCaption:'我的视频创作工作台',newDraft:'新建创作',workspace:'工作空间',collections:'我的收藏夹',newFolder:'新建收藏夹',localStorage:'本地保存 · 属于你自己',backupHint:'定期备份，让灵感安心留存。',backupManage:'备份与迁移',menu:'展开导航',offlineReady:'离线灵感库',theme:'切换深浅主题',editor:'创作台',search:'搜索',searchPlaceholder:'搜索灵感、中文标题、场景或标签…',duration:'视频时长',aspect:'视频画幅',tags:'标签',reset:'重置',sort:'排序',loadMore:'加载更多灵感',attribution:'案例来自 BeatAPI 与 MIT 开源库，原作者及来源随条目保留。',personalUse:'仅供个人学习与创作参考',closeEditor:'收起创作台',emptyEditorTitle:'灵感的下一步，是你的创作。',emptyEditorText:'选一个喜欢的案例，使用模板开始。原始提示词始终为你保留。',blankDraft:'从空白开始',stepFind:'寻找灵感',stepEdit:'改成你的故事',stepCopy:'复制去生成',draftName:'创作名称',untitled:'未命名创作',saveToFolder:'收藏到文件夹',addTag:'添加标签',tagPlaceholder:'添加标签，按回车确认',editTab:'编辑提示词',referenceTab:'原文对照',versionsTab:'版本',promptLabel:'PROMPT / 提示词',promptPlaceholder:'描述你想生成的画面、动作、镜头和氛围…',notes:'创作备注',notesHint:'备注不会被复制',notesPlaceholder:'记录要修改的主体、参考风格、生成平台或实验结果…',referenceHint:'原文只读，不会因编辑而改变。',versionsHint:'保存关键节点，随时回到之前的想法。',copyOriginal:'复制原文',saveVersion:'保存版本',copyToGenerate:'复制去生成',noApi:'不连接生成 API，不消耗生成额度。',close:'关闭',originalPrompt:'原始提示词',useTemplate:'使用此模板',originalSource:'原作者来源',cancel:'取消',confirm:'确定',backupExplanation:'收藏、标签、收藏夹、草稿、版本和素材组都保存在当前浏览器。导出备份后，可在另一台设备或浏览器中导入。',fullBackup:'完整工作台备份',fullBackupHint:'包含全部个人数据与素材图片，不含案例视频或缩略图。',export:'导出',importBackup:'导入与合并',importBackupHint:'相同条目合并，冲突草稿另存副本，不覆盖本地编辑。',chooseFile:'选择文件',legacyImport:'旧页面收藏迁移',legacyHint:'支持旧版“导出收藏”JSON，或读取同一浏览器可访问的旧收藏。',readLegacy:'读取旧收藏',storageNote:'离线文件与本地服务的浏览器存储不互通；清理浏览器数据会删除本地记录，请先备份。',library:'灵感库',favorites:'我的收藏',drafts:'我的草稿',all:'全部',allModels:'全部模型',allDurations:'全部时长',allAspects:'全部画幅',allTags:'全部标签',sourceOrder:'精选顺序',allOrder:'全部条目 · 来源序',curatedResults:'{n} 条精选灵感',curatedNote:'评分精选 {n} 条 · 搜索或筛选可查全库 {total} 条',allNote:'全库 {total} 条 · 来源序',showAllLibrary:'查看全库',backToCurated:'回到精选',filters:'筛选',shortest:'时长从短到长',longest:'时长从长到短',titleOrder:'标题排序',recent:'最近编辑',libraryTitle:'把灵感，变成下一帧。',libraryDescription:'浏览真实案例，收集喜欢的风格，为你的下一个故事找到起点。',favoritesDescription:'值得再看一次的画面，留给下一次创作。',draftsDescription:'每一个未完成的想法，都值得继续。',folderDescription:'把同一项目的灵感，放在一起。',statPrompts:'个视频案例',statCategories:'种创作类型',statFavorites:'个灵感已收藏',items:'条',results:'{n} 条灵感',draftResults:'{n} 份草稿',visibleCount:'已展示 {n} / {total}',approxRatios:'画幅筛选按近似比例分组，卡片保留真实画幅',draftSearch:'搜索草稿名称、提示词或备注…',noResults:'还没有找到匹配的灵感',noResultsHint:'试试其他关键词，或放宽筛选条件。',noFavorites:'把喜欢的画面留下来',noFavoritesHint:'点击案例上的收藏按钮，你的灵感会出现在这里。',noDrafts:'下一个故事，从这里开始',noDraftsHint:'使用一个模板，或新建一份空白创作。',browseLibrary:'去灵感库看看',favorite:'收藏模板',favorited:'已收藏',removeFavorite:'取消收藏',preview:'查看案例',removeTag:'移除标签',ungrouped:'未分组收藏',original:'原文',chars:'{n} 字符',autosaved:'已自动保存到本机',saving:'正在保存…',saveFailed:'本地保存失败；请立即导出备份，避免丢失本次编辑。',storageCorrupt:'已有本地数据无法读取，未覆盖它；请先导出或检查浏览器存储。',versionName:'版本名称',versionDefault:'版本 {n}',versionSaved:'版本已保存',versionLimit:'每份草稿最多保存 200 个版本，请先导出备份。',noVersions:'还没有保存的版本',noVersionsHint:'点击下方“保存版本”，给当前想法留一个快照。',restore:'恢复此版本',restoreTitle:'恢复历史版本？',restoreHint:'当前内容会先保存为恢复前快照，再载入选择的版本。',beforeRestore:'恢复前自动快照',restored:'已恢复，原内容已保留为快照',noReference:'这是空白创作，没有关联的原始模板。',sourceDetails:'查看来源案例',templateLoaded:'模板已载入，原文保持不变',continueDraft:'继续编辑',deleteDraft:'删除草稿',deleteDraftTitle:'删除这份草稿？',deleteDraftHint:'这会删除草稿及其版本，不影响原始模板。建议先导出备份。',deleted:'已删除',copied:'提示词已复制，可以粘贴到生成工具',copyFailed:'自动复制不可用，请选中文本后按 Ctrl/Cmd+C。',nameRequired:'请输入名称',folderName:'收藏夹名称',folderPlaceholder:'例如：产品广告 / 新片参考',folderExists:'已有同名收藏夹',renameFolder:'重命名收藏夹',deleteFolder:'删除收藏夹',deleteFolderHint:'收藏内容不会删除，将移至未分组收藏。',folderCreated:'收藏夹已创建',folderRenamed:'收藏夹已重命名',savedToFolder:'已收藏并加入收藏夹',tagLimit:'最多添加 30 个标签',savedTag:'已添加标签并收藏模板',videoOnline:'在线播放 · 需要联网',playVideo:'播放参考视频',videoFailed:'视频暂时无法加载，请查看原始页面；提示词仍可使用。',externalLink:'打开原始页面',backupExported:'已导出完整备份',backupReady:'准备合并：{f} 条收藏 · {c} 个收藏夹 · {d} 份草稿 · {a} 组素材',mergeBackup:'确认合并',imported:'已合并导入，原有创作保留',invalidBackup:'无法导入：文件格式或内容无效，未更改任何数据。',fileTooLarge:'文件超过 50 MB，请选择较小的 JSON 备份。',noLegacy:'没有找到可访问的旧收藏；请在旧页面导出 JSON 后选择文件导入。',conflictCopy:'导入副本',oldFavorites:'旧版收藏',untagged:'无标签',readOnly:'只读',savedAt:'保存于 {time}',seconds:'{n} 秒',aspectOther:'其他画幅',workingOn:'正在编辑',firstVersion:'初始版本',emptyPrompt:'先写一点提示词，再复制或保存版本。',unsavedElsewhere:'另一个窗口更新了数据。此窗口已停止写入，请先导出当前内容，再刷新合并。',formInputLabel:'名称',backupComplete:'备份',draftCreated:'新创作已建立',heroTitle:'下一帧，\n由你想象。',heroDescription:'从一个画面出发，让灵感成为你的作品。',heroAction:'从此刻开始创作',featuredCase:'精选案例',agent:'智能体助手',agentLauncher:'智能体',closeAgent:'收起助手',agentSettings:'智能体设置',agentSettingsHint:'兼容 OpenAI 接口格式；地址可填 Base URL 或完整接口路径。密钥仅保存在本机浏览器，不会发往任何第三方。',agentLLM:'语言模型 · 优化与对话',agentImage:'文生图 · 关键素材',baseUrl:'API 地址',apiKey:'API 密钥',model:'模型名称',imageSize:'输出尺寸',imageCount:'每次生成数量',testConnection:'测试连接',testing:'测试中…',testOk:'连接成功',testFailed:'连接失败：{msg}',save:'保存',agentSaved:'智能体设置已保存到本机',agentInvalidUrl:'API 地址需为 http(s) 链接',agentWelcome:'你好，我是你的分镜助手。在卡片、预览或创作台点「插入助手」，把分镜交给我；我可以按你的要求改写提示词，也拆解关键画面并生成图片素材。先在设置里连接你的语言模型与文生图 API。',agentPlaceholder:'告诉助手你的需求，例如：改成雨夜霓虹氛围…',agentSend:'发送',agentStop:'停止',agentImprove:'优化提示词',agentImages:'生成关键图',agentClear:'清空对话',agentInsert:'插入助手',agentSendDraft:'把当前创作交给助手',agentHint:'对话与图片仅留在本页；设置与密钥保存在本机。',agentContextCatalog:'分镜',agentContextDraft:'创作',agentContextRemove:'移除上下文',agentInserted:'已插入分镜，告诉助手你想怎么改。',agentDraftInserted:'已插入当前创作。',agentNeedContext:'先在页面中选择一个分镜或创作插入助手，再开始优化或生成图片。',agentNeedLLM:'尚未配置语言模型 API。',agentNeedImage:'尚未配置文生图 API。',agentOpenSettings:'打开设置',agentImproveDefault:'请优化这个分镜提示词，让画面更电影感、细节更完整。',agentImagesDefault:'请提取这个分镜的关键画面，生成可直接用于文生图的素材描述。',agentThinking:'正在思考…',agentGenerating:'正在生成关键图 {done}/{total}…',agentStopped:'（已停止）',agentImproved:'改进后的提示词',agentApply:'应用到创作台',agentApplied:'已应用到创作台',agentCopyBlock:'复制',agentDownload:'下载',agentImageFailed:'生成失败：{msg}',agentImagePending:'生成中…',agentKeyImages:'关键图片素材',agentStatusNone:'未连接 API · 点击配置',agentStatusReady:'LLM {llm} · 图像 {img}',agentStatusLLM:'LLM {llm} · 图像未配置',agentStatusImage:'图像 {img} · LLM 未配置',agentNetworkError:'网络请求失败，请检查地址、网络或接口 CORS 设置。',agentNetTimeout:'连接超时：20 秒内未收到响应，网关可能过载或地址指向了无响应的服务。',agentNetMixed:'混合内容被浏览器拦截：当前页面是 https，而接口是 http。请改用 https 接口，或以本地文件方式打开本页。',agentNetCors:'接口网络可达，但浏览器跨域（CORS）校验未通过：网关未返回允许浏览器调用的响应头，此类接口通常只支持服务端调用。',agentNetCorsFile:'接口网络可达，但拒绝了浏览器跨域（CORS）请求。双击打开（file://）时 Origin 为 null，多数网关不允许。请在本机运行 python start_studio.py，用自动打开的 http://127.0.0.1:8787 页面配置模型，请求会自动经本机中转。',agentNetUnreachable:'无法访问该地址：DNS 解析、TCP 连接或 TLS 握手失败。请核对域名与端口、确认服务已启动、检查代理或 VPN 是否覆盖浏览器。',agentCorsHint:'浏览器直连要求接口允许跨域（CORS）。若连接失败：在本机运行 python start_studio.py，浏览器会自动打开 http://127.0.0.1:8787，在该页面设置里直接填写网关地址与密钥即可，请求自动经本机中转，密钥仍只留在本机。',agentRelayHint:'当前页面由本机服务托管：直接填写网关地址与密钥即可，所有请求自动经本机中转，无跨域限制；密钥只经过本机服务发往你填写的网关。',agentNetRelayDown:'本机中转服务没有响应：请确认 start_studio.py 仍在运行，然后重试或刷新页面。',agentAuthError:'密钥无效或权限不足（{status}）。',agentEndpointError:'接口路径不存在（404），请检查 API 地址。',agentRateError:'请求被限流或额度不足（429）。',agentHttpError:'接口返回错误（{status}）。',agentBadOutput:'模型返回内容无法解析。',agentSpecFallback:'未配置语言模型，直接使用分镜提示词生成关键图。',agentCleared:'对话已清空',skillLabel:'导演技能',skillNone:'无技能 · 通用',skillApply:'用技能改写',skillSet:'已启用技能：{name}',skillSource:'查看技能来源',assets:'素材库',assetsTitle:'素材，成组留存。',assetsDescription:'智能体生成的关键图与提示词按组保存，随时取用、继续打磨。',assetSearch:'搜索素材组名称、提示词或画面描述…',assetSortNew:'最近创建',assetSortOld:'最早创建',assetResults:'{n} 组素材',assetGroups:'组素材',assetImages:'张图片',assetStorage:'本地占用',assetSample:'示例',assetSampleHint:'这是示例素材组，展示分组格式，可随时删除。',noAssets:'还没有素材组',noAssetsHint:'在智能体中生成关键图或优化提示词后，点击「存入素材库」，图片与提示词会成为一组。',assetGenCta:'生成新素材',openAgentAction:'打开智能体',assetOpen:'打开素材组',assetDetail:'素材详情',assetName:'素材组名称',assetSaveTitle:'存入素材库',assetSaveImages:'存入素材库',agentSaveAsset:'存素材',assetSaved:'已存入素材库',assetSavedView:'已入库 · 查看',assetLimit:'素材组已达上限（100 组），请先删除不用的组或导出备份。',assetDeleteTitle:'删除这组素材？',assetDeleteHint:'组内的图片与提示词会一并删除，不影响创作台草稿。建议先导出备份。',assetApplied:'素材提示词已应用到创作台',assetInsert:'送入智能体',assetInserted:'已插入素材组，可以继续优化或生成新图。',agentContextAsset:'素材',assetPromptLabel:'PROMPT / 提示词',assetCopyPrompt:'复制提示词',assetRequest:'生成要求',assetFromAgent:'智能体生成',assetCountLabel:'{n} 张图片',assetPromptOnly:'提示词素材',assetSpecPrompt:'画面提示词',assetDownloadImage:'下载图片',storageFull:'本地保存失败：存储空间不足。请在素材库删除不用的素材组，或导出备份后重试。',assetEmptyGallery:'这一组只保存了提示词，没有图片。',labTitle:'提示词实验室',labHint:'离线分析六个电影维度，无需连接 API。',labScore:'完整度',labMissing:'缺失维度',labComplete:'六维齐全',labElements:'识别到的元素',labNone:'还没有识别到电影元素，试试下面的补全建议。',labFix:'补全',labEnhance:'一键增强',dimSubject:'主体',dimCamera:'镜头',dimLight:'光线',dimMotion:'动态',dimMood:'氛围',dimStyle:'风格',labAdded:'已补全{dim}描述',labEnhanced:'已加入「{name}」增强',searchExpanded:'智能扩展：{terms}',relatedShots:'相似分镜',recentView:'最近使用',recentTitle:'最近，你在打磨这些。',recentDescription:'复制、使用或查看过的分镜会留在这里，随时回到上一次的思路。',noRecent:'还没有使用记录',noRecentHint:'复制或使用一个分镜后，它会出现在这里。',copyShot:'复制提示词',undo:'撤销',undone:'已撤销',favoriteRemoved:'已取消收藏',paletteTitle:'命令面板',palettePlaceholder:'搜索命令或分镜标题…',paletteActions:'命令',paletteShots:'分镜',paletteEmpty:'没有匹配的命令或分镜',paletteHint:'↑↓ 选择 · Enter 执行 · Esc 关闭',cmdLang:'切换语言',cmdCopy:'复制当前提示词',intentCinematic:'更电影感',intentRain:'雨夜霓虹',intentSlow:'慢镜头特写',intentVertical:'竖屏 5 秒',intentFix:'补全缺失维度',sequence:'序列板',sequenceTitle:'分镜，排成一场戏。',sequenceDescription:'把草稿与灵感分镜按拍摄顺序排列，写下连续性备注，一键导出制片表。',boardResults:'{n} 个分镜',boardSearch:'搜索序列板标题、提示词或连续性备注…',noBoard:'序列板还是空的',noBoardHint:'在灵感卡片或草稿上点击「加入序列板」，把分镜排进你的拍摄顺序。',boardAdd:'加入序列板',boardAdded:'已加入序列板',boardExists:'该分镜已在序列板中',boardLimit:'序列板最多 200 个分镜，请先移除不用的条目。',boardNote:'连续性',boardNotePlaceholder:'连续性备注：服装、道具、光线、上一镜衔接…',boardMoveUp:'上移',boardMoveDown:'下移',boardRemove:'移出序列板',boardOpen:'打开',boardExportCsv:'导出 CSV',boardExportJson:'导出 JSON',boardExportMd:'导出 Markdown',boardExported:'制片表已导出',boardEmptyExport:'序列板没有可导出的分镜（缺失条目已跳过）。',boardAddCurrent:'加入当前创作',boardCurrentNone:'创作台还没有打开的草稿。',boardMissing:'来源已删除',boardToAgent:'送入智能体',boardPrint:'打印制片表',agentContextBoard:'序列板',boardContextInserted:'已插入序列板（{n} 镜），改写与关键图会保持前后镜连续性。',diffTitle:'版本对照',diffVersion:'对照',diffSummary:'「{name}」 → 当前编辑 · 绿色 +{added} 为新增，红色 −{removed} 为删除',diffIdentical:'版本与当前编辑内容完全一致。',guideTitle:'新手引导',guideEyebrow:'新手引导',guideSkip:'跳过',guidePrev:'上一步',guideNext:'下一步',guideFinish:'完成',guideStep:'第 {n} / {total} 步',guideFinished:'引导完成，可随时从命令面板或顶栏问号重看。',guideSearchT:'搜索与筛选',guideSearchB:'输入关键词即可搜索全库分镜，中文会自动扩展英文同义词，标题与完整提示词都在搜索范围内。',guideCardT:'灵感分镜卡片',guideCardB:'每张卡片是一个真实案例。悬停可见复制、插入智能体、加入序列板与收藏；点「使用此模板」把它变成你的创作。',guideWorkspaceT:'创作台',guideWorkspaceB:'点「使用此模板」或按 N 新建空白草稿，把灵感改成你的故事；原始提示词始终为你保留。',guideAgentT:'智能体助手',guideAgentB:'接入你自己的 LLM 与文生图 API，把单镜或整场戏交给助手改写、生成关键帧。',guidePaletteT:'命令面板',guidePaletteB:'命令面板是全台的快捷入口：命令、分镜、设置都能搜到。',guideChFind:'找灵感',guideChMake:'改成你的',guideChScene:'拼出一场戏',guideChFlow:'效率与安心',guideWelcomeT:'欢迎来到 FRAME 放映室',guideWelcomeB:'这是你的个人视频创作工作台：773 条真实分镜案例、4 个模型、28 个分类，全部离线可用。接下来用两分钟走完一遍完整创作流程。',guideWelcomeP1:'找灵感：搜索、筛选、元素墙，挑中喜欢的画面。',guideWelcomeP2:'改成你的：在创作台改写提示词、保存版本、评审试片。',guideWelcomeP3:'拼出一场戏：序列板排镜、连戏体检、导出制片表。',guideWelcomeTip:'随时可以点「跳过」；之后从顶栏问号或命令面板输入「新手引导」即可重看。',guideSearchP1:'按 / 键直接聚焦搜索框，无需动鼠标。',guideSearchP2:'试试「雨夜」「赛博朋克」「黄金时刻」这类画面词。',guideSearchP3:'搜索与分类、筛选、排序可以叠加使用。',guideSearchTip:'试一试：引导结束后搜索「雨夜」，看看中文如何命中英文提示词。',guideFiltersT:'筛选、排序与精选首屏',guideFiltersB:'首屏默认展示 117 条编辑精选；用筛选与排序快速缩小范围，找到最合适的参考。',guideFiltersP1:'点「筛选」展开模型、时长、画幅、标签四个维度。',guideFiltersP2:'排序支持精选顺序、试片高分、时长与标题等口径。',guideFiltersP3:'点「查看全库」离开精选首屏，浏览全部 773 条。',guideFiltersTip:'试一试：筛选后点「重置」，一键清空所有条件。',guideCardP1:'卡片徽章是离线质量评分，帮你优先看高完成度案例。',guideCardP2:'点开卡片看大图预览、相似推荐与完整原文。',guideCardP3:'预览里可导出 PNG / Markdown 配方卡，方便分享归档。',guideCardTip:'试一试：点开任意卡片，再点「使用此模板」直接开始创作。',guideTabsT:'分类与键盘选片',guideTabsB:'28 个分类覆盖运镜、光影、氛围等常见需求；桌面端还能完全用键盘挑片。',guideTabsP1:'J / K 上下移动选择环，Enter 直接使用。',guideTabsP2:'C 复制提示词，B 加入序列板，Esc 清除选择。',guideTabsP3:'窄屏下键盘提示自动隐藏，点按操作不受影响。',guideTabsTip:'试一试：引导结束后按 J / K 连选三张卡片，感受选片节奏。',guideWorkspaceP1:'「原文对照」页签随时回看原始案例，只读不改。',guideWorkspaceP2:'创作备注、标签、收藏夹与收藏帮你组织草稿。',guideWorkspaceP3:'Ctrl/⌘ + S 保存版本，「复制去生成」不消耗任何额度。',guideWorkspaceTip:'窄屏下创作台以抽屉打开，点右上角关闭即可回到灵感库。',guideLabT:'提示词实验室与体检',guideLabB:'创作台内置两层离线质量工具，不连接任何 API 也能用。',guideLabP1:'实验室按六个电影维度打分，一键补全缺失维度或整体增强。',guideLabP2:'体检基于全库实证区间与链镜语法，共八条规则。',guideLabP3:'问题可一键修复、复制修复后文本或导出报告。',guideLabTip:'体检只建议、不拦截：复制与生成永远不受影响。',guideVersionsT:'版本谱系与试片评审',guideVersionsB:'每次保存都会挂在当前基线之后，形成可回溯的分支谱系。',guideVersionsP1:'版本树支持回滚、另存分支与两两 diff 对照。',guideVersionsP2:'试片评审按五个维度打分，并标记最佳试片。',guideVersionsP3:'勾选两条试片并排对照；试片高分排序与卡片徽章随评分更新。',guideVersionsTip:'试一试：生成样片后把链接填进试片评审，边看边打分。',guideBoardT:'序列板：拼出一场戏',guideBoardB:'把分镜按叙事顺序排成一场戏，逐镜写备注，统一交给智能体或导出。',guideBoardP1:'拖拽调整顺序，或从卡片、元素墙直接加入。',guideBoardP2:'「整场送智能体」让助手保持全片一致性。',guideBoardP3:'打印制片表，或导出 CSV / JSON / Markdown。',guideBoardTip:'试一试：在灵感库按 B，把当前选中的卡片直接加入序列板。',guideBoardLintT:'连戏体检与时长预算',guideBoardLintB:'序列板会自动检查整场戏的连贯性，并汇总总时长。',guideBoardLintP1:'五条规则：画幅跳变、模型切换、备注缺失、超出预算、重复分镜。',guideBoardLintP2:'点击问题直接跳转定位到对应镜头行。',guideBoardLintP3:'时长预算默认 60 秒，可在工具栏随时调整。',guideBoardLintTip:'体检面板默认收起，点工具栏的「连戏体检」徽章展开。',guideMoodT:'元素墙：按元素反查',guideMoodB:'不知道搜什么？从 160 个电影元素词出发，反查包含它们的分镜海报。',guideMoodP1:'六个维度任选元素，支持任一命中或全部命中。',guideMoodP2:'按命中数、精选优先或随机漫步排序，随时换一批。',guideMoodP3:'拖拽海报到序列板，或勾选后批量加入。',guideMoodTip:'试一试：勾选「雨」「霓虹」两三个元素，点「加入序列板」。',guideRecipeT:'短剧结构配方工坊',guideRecipeB:'选一个节奏骨架，定时长与镜数，一键生成通过体检的链镜草稿。',guideRecipeP1:'骨架 × 模型 × 时长 × 镜数 × 画幅 × 基调自由组合。',guideRecipeP2:'链镜预览实时生成，默认组合即通过连戏体检。',guideRecipeP3:'「随机配方」找灵感，「生成草稿」直接进创作台。',guideRecipeTip:'试一试：12 秒 9:16 的「黄金三秒钩子」骨架，很适合短剧开头。',guideAgentP1:'接入你自己的 LLM 与文生图接口，密钥只保存在本机浏览器。',guideAgentP2:'逐镜改写、整场重写、生成关键帧，对话与图片仅留在本页。',guideAgentP3:'设置里的网关探测只读 /models，绝不发起付费调用。',guideAgentP4:'浏览器直连失败时，运行 python start_studio.py 走本机中转。',guideAgentTip:'试一试：填好地址与密钥后先点「测试连接」，再保存。',guidePaletteP1:'Ctrl/⌘ + K 唤起，可搜命令与分镜标题。',guidePaletteP2:'↑↓ 选择、Enter 执行、Esc 关闭。',guidePaletteP3:'N 新建、/ 搜索、J/K 选片、C 复制、B 入板、Ctrl+S 存版本。',guidePaletteTip:'在面板输入「新手引导」，随时可以重看本导览。',guideBackupT:'备份与数据主权',guideBackupB:'收藏、草稿、版本与设置全部保存在当前浏览器，属于你自己。',guideBackupP1:'「导出」生成完整 JSON 备份，不含视频与缩略图。',guideBackupP2:'导入自动合并，冲突草稿另存副本，不覆盖本地编辑。',guideBackupP3:'离线文件与本地服务的存储不互通，清理浏览器数据前请先备份。',guideBackupTip:'换设备或换浏览器前，记得先导出一份完整备份。祝创作顺利！',lintTab:'体检',lintModel:'校验模型',lintModelAuto:'跟随来源案例',lintLevel:'显示阈值',lintLevelAll:'全部问题',lintLevelWarn:'警告及以上',lintLevelError:'仅严重',lintRules:'规则开关',lintRerun:'重新体检',lintRerunDone:'已按当前规则重新体检',lintExport:'导出报告',lintExported:'体检报告已导出',lintCopyFixed:'复制修复后',lintReset:'恢复默认',lintFix:'修复',lintFixed:'已应用修复',lintPass:'当前阈值下未发现问题',lintHint:'规则来自全库案例的实证区间与链镜语法约定，只建议不拦截；复制与生成不受影响。',lintBadgeTitle:'体检发现 {n} 个问题',lintSummary_error:'严重 {n}',lintSummary_warn:'警告 {n}',lintSummary_info:'提示 {n}',lintNoDraft:'先打开一份创作再体检。',cmdLint:'体检当前创作',lintRule_numbering:'镜号连续',lintRule_stamps:'时间戳语法',lintRule_duration:'时长经验区间',lintRule_aspect:'画幅经验集',lintRule_pacing:'镜头节奏',lintRule_assets:'素材编号对位',lintRule_length:'信息密度',lintRule_whitespace:'空白整洁',lintNumbering:'镜号不连续或重复（共 {n} 镜），可一键重排。',lintStampsMissing:'第 2 镜起缺少 At 时间戳，无法核对节奏。',lintStampsOrder:'时间戳非单调递增，存在重叠或倒序。',lintStampsOverflow:'末镜起点 {at}s 已超出总时长 {total}s。',lintStampsFirst:'首镜时间戳应为 0 或省略。',lintDurationMissing:'未标注时长：请在提示词中写明秒数，或关联来源案例。',lintDurationRange:'{d}s 超出 {model} 案例经验区间 {min}–{max}s。',lintAspect:'{aspect} 不在 {model} 案例出现过的画幅中。',lintPacingDense:'{n} 镜 / {total}s，平均 {avg}s 一镜，切镜偏密。',lintPacingSlow:'平均 {avg}s 一镜，单镜偏长，确认是否有意为之。',lintAssetsNone:'引用了 {n} 处 @素材编号，但素材库为空，编号无法对位。',lintAssetsCheck:'引用了 {n} 处 @素材编号，交付前核对与素材组顺序一致。',lintLength:'仅 {n} 字符，信息偏薄；补充主体、镜头、光线与氛围。',lintWhitespace:'存在多余空行或行尾空白，可一键清理。',lineageHint:'版本按分支谱系排列，保存新版本会挂在当前基线之后。',branchVersion:'从此分支',branched:'已载入分支基线，编辑后保存即成新分支',baseVersion:'基线',takeAdd:'登记试片',takeEdit:'编辑试片',takeDialogTitle:'试片评审',takeLabel:'试片名称',takeLabelPh:'如：第 2 次生成 · 运镜更稳',takeUrl:'视频链接（可选）',takeUrlPh:'https://… 或留空仅评分',takeUrlInvalid:'链接需以 http(s):// 开头',takeNotes:'评审备注',takeNotesPh:'哪里好、哪里要改…',takeScore_follow:'指令遵循',takeScore_visual:'画面质感',takeScore_motion:'运动自然',takeScore_continuity:'连戏一致',takeScore_sound:'声音表现',takeBest:'设为最佳',takeBestOff:'取消最佳',takeAvg:'均分',takeDelete:'删除试片',takeDeleted:'试片已删除',takeSaved:'试片已记录',takeLimit:'每个版本最多 20 条试片',takeNone:'还没有试片记录',takeNoneHint:'生成后把结果链接与五维评分记在这里，让好版本沉淀下来。',takeCompare:'对比两条试片',takeCompareTitle:'试片对照',takeCompareHint:'勾选两条试片后对照播放与评分。',takeSelected:'已选 {n}/2',takeOpen:'播放',takeNoVideo:'未附视频链接',takeUntitled:'未命名试片',sortMyBest:'试片高分',takeBadgeTitle:'最佳试片均分',boardLint:'连戏体检',boardBudget:'时长预算',boardLintPass:'序列连戏检查通过',boardLintIssues:'{n} 处连戏风险',boardRule_aspectJump:'画幅跳变',boardRule_modelJump:'模型混用',boardRule_noteGap:'缺连戏备注',boardRule_overBudget:'超出预算',boardRule_duplicate:'重复镜头',boardMsg_aspectJump:'SC {a} → SC {b}：{x} 切到 {y}，成片会有黑边或裁切跳变。',boardMsg_modelJump:'SC {a} → SC {b}：{x} 与 {y} 画风可能不一致。',boardMsg_noteGap:'SC {a} 与 SC {b} 之间没有连戏备注，补充主体 / 光线 / 机位衔接。',boardMsg_overBudget:'全片约 {total}s，超出预算 {budget}s。',boardMsg_duplicate:'SC {a} 与 SC {b} 引用同一素材，确认是否有意重复。',boardJump:'定位',boardLintHint:'规则只看序列结构与备注，不改动内容。',moodboard:'元素墙',moodTitle:'元素反查 · 灵感墙',moodDescription:'从全库 {total} 条提示词里抽取电影元素，点选组合，反查同气质画面；拖拽海报即可进序列板。',moodSearch:'搜索元素或画面…',moodDim:'元素维度',moodDimAll:'全部维度',moodMode:'匹配方式',moodModeAny:'任一命中',moodModeAll:'全部命中',moodSize:'墙面密度',moodSort:'排序',moodSortHits:'命中数',moodSortCurated:'精选优先',moodSortRandom:'随机漫步',moodShuffle:'换一批',moodReset:'清空选择',moodBulkAdd:'加入序列板',moodSelected:'已选 {n} 张',moodHits:'命中 {n} 个元素',moodEmpty:'没有匹配的元素组合',moodEmptyHint:'减少元素或切换「任一命中」再试。',moodDragHint:'拖拽海报到序列板，或勾选后批量加入。',moodElements:'元素索引',moodWall:'灵感墙',moodPicked:'已选海报',recipeOpen:'短剧配方',recipeTitle:'短剧结构配方工坊',recipeHint:'选节奏骨架，定时长与镜数，一键生成通过体检的链镜草稿。',recipeSkeleton:'节奏骨架',recipeDuration:'总时长',recipeShots:'镜头数',recipeAspect:'画幅',recipeTone:'基调',recipeRandom:'随机配方',recipeReset:'重置',recipePreview:'链镜预览',recipeCreate:'生成草稿',recipeCreated:'配方草稿已创建',skeleton_hook:'黄金三秒钩子',skeleton_reversal:'双重反转',skeleton_slowburn:'情绪慢热',skeleton_hook_desc:'开场即冲突，三秒抓住观众，结尾留钩子。',skeleton_reversal_desc:'铺垫—反转—再反转，情绪两次落地。',skeleton_slowburn_desc:'氛围先行，情绪层层堆叠，结尾一击。',tone_suspense:'悬疑',tone_romance:'甜宠',tone_revenge:'复仇',tone_comedy:'轻喜',tone_healing:'治愈',previewCard:'导出配方卡',previewCardMd:'Markdown',cardExported:'配方卡已导出',cardMdExported:'Markdown 已导出',probeTitle:'网关能力探测',probeRun:'开始探测',probeRunning:'探测中…',probeHint:'只读探测 /models 与连通性，不发起任何付费生成调用。',probeReach:'接口可达',probeCors:'跨域许可',probeRelay:'本机中转',probeModels:'模型列表',probeUsage:'额度用量',probeNeedsCall:'需真实调用后才知道',probeOk:'通过',probeFail:'失败',probeUnknown:'未探测',probeNoBase:'请先填写 API 地址',probeDone:'探测完成',probeLast:'上次探测 {time}',probeModelCount:'{n} 个模型',probeRelayOn:'已启用 · 密钥不出本机',probeRelayOff:'未启用 · 直连需 CORS',kbdHint:'J/K 移动 · Enter 使用 · C 复制 · B 入板'
  },
  en: {
    skip:'Skip to content',brandCaption:'Your video creation workspace',newDraft:'New creation',workspace:'Workspace',collections:'Collections',newFolder:'New collection',localStorage:'Local storage · Yours to keep',backupHint:'Back up your ideas, keep them safe.',backupManage:'Backup & migration',menu:'Open navigation',offlineReady:'Offline library',theme:'Toggle color theme',editor:'Workspace',search:'Search',searchPlaceholder:'Search ideas, titles, scenes or tags…',duration:'Video duration',aspect:'Aspect ratio',tags:'Tags',reset:'Reset',sort:'Sort',loadMore:'Load more ideas',attribution:'Examples from BeatAPI and MIT-licensed open libraries. Original authors and sources are credited.',personalUse:'For personal learning and creative reference',closeEditor:'Close workspace',emptyEditorTitle:'The next frame starts with you.',emptyEditorText:'Find an example you love and make it your own. The original prompt stays untouched.',blankDraft:'Start from scratch',stepFind:'Find inspiration',stepEdit:'Make it your story',stepCopy:'Copy to generate',draftName:'Creation name',untitled:'Untitled creation',saveToFolder:'Save to collection',addTag:'Add tag',tagPlaceholder:'Type a tag, press Enter',editTab:'Edit prompt',referenceTab:'Original',versionsTab:'Versions',promptLabel:'PROMPT',promptPlaceholder:'Describe the scene, action, camera movement and mood…',notes:'Creative notes',notesHint:'Not included when copying',notesPlaceholder:'Keep subject changes, style references, generation tools or experiment results here…',referenceHint:'The original is read-only and never changes with your edits.',versionsHint:'Save milestones and return to earlier ideas anytime.',copyOriginal:'Copy original',saveVersion:'Save version',copyToGenerate:'Copy to generate',noApi:'No generation API connected. No credits consumed.',close:'Close',originalPrompt:'ORIGINAL PROMPT',useTemplate:'Use template',originalSource:'Original source',cancel:'Cancel',confirm:'Confirm',backupExplanation:'Favorites, tags, collections, drafts, versions and asset groups stay in this browser. Export a backup to transfer them to another device or browser.',fullBackup:'Full workspace backup',fullBackupHint:'Includes all personal data and asset images, without case videos or thumbnails.',export:'Export',importBackup:'Import & merge',importBackupHint:'Matching items merge; conflicting drafts become copies. Local edits are not overwritten.',chooseFile:'Choose file',legacyImport:'Migrate old favorites',legacyHint:'Import JSON from the old page, or read old favorites accessible in this browser.',readLegacy:'Read old favorites',storageNote:'File mode and the local server use separate browser storage. Clearing browser data deletes local records; export first.',library:'Inspiration',favorites:'Favorites',drafts:'My drafts',all:'All',allModels:'All models',allDurations:'All durations',allAspects:'All aspects',allTags:'All tags',sourceOrder:'Curated order',allOrder:'All entries · source order',curatedResults:'{n} curated ideas',curatedNote:'Quality-ranked {n} picks · search or filter to browse all {total}',allNote:'All {total} entries · source order',showAllLibrary:'Browse all',backToCurated:'Back to picks',filters:'Filters',shortest:'Shortest first',longest:'Longest first',titleOrder:'By title',recent:'Recently edited',libraryTitle:'Your idea. The next frame.',libraryDescription:'Explore real examples, collect your favorite styles, and find a starting point for your next story.',favoritesDescription:'The frames worth keeping for your next creation.',draftsDescription:'Every unfinished idea deserves another look.',folderDescription:'Keep the inspiration for one project together.',statPrompts:'video examples',statCategories:'creative categories',statFavorites:'saved inspirations',items:'items',results:'{n} ideas',draftResults:'{n} drafts',visibleCount:'Showing {n} / {total}',approxRatios:'Aspect filters group nearby ratios; cards retain actual ratios',draftSearch:'Search draft names, prompts or notes…',noResults:'No matching inspiration yet',noResultsHint:'Try another keyword or relax the filters.',noFavorites:'Keep the frames you love',noFavoritesHint:'Favorite an example and your inspiration will appear here.',noDrafts:'Your next story starts here',noDraftsHint:'Use a template or create a blank draft.',browseLibrary:'Explore the library',favorite:'Favorite template',favorited:'Favorited',removeFavorite:'Remove favorite',preview:'View example',removeTag:'Remove tag',ungrouped:'Unsorted favorites',original:'Original',chars:'{n} characters',autosaved:'Auto-saved locally',saving:'Saving…',saveFailed:'Local save failed. Export a backup now to protect your edits.',storageCorrupt:'Stored data could not be read. It has not been overwritten; check or export storage first.',versionName:'Version name',versionDefault:'Version {n}',versionSaved:'Version saved',versionLimit:'Each draft supports 200 versions. Export a backup first.',noVersions:'No saved versions yet',noVersionsHint:'Save a version below to capture this moment.',restore:'Restore version',restoreTitle:'Restore this version?',restoreHint:'Your current content will be saved as a recovery snapshot before restoring.',beforeRestore:'Automatic pre-restore snapshot',restored:'Restored. Previous content is preserved.',noReference:'This is a blank creation without an original template.',sourceDetails:'View source example',templateLoaded:'Template loaded. The original is unchanged.',continueDraft:'Continue editing',deleteDraft:'Delete draft',deleteDraftTitle:'Delete this draft?',deleteDraftHint:'This deletes the draft and its versions, not the original template. Consider exporting first.',deleted:'Deleted',copied:'Prompt copied. Paste it into your generation tool.',copyFailed:'Automatic copy unavailable. Select the text and press Ctrl/Cmd+C.',nameRequired:'Enter a name',folderName:'Collection name',folderPlaceholder:'e.g. Product films / New project',folderExists:'A collection with this name already exists',renameFolder:'Rename collection',deleteFolder:'Delete collection',deleteFolderHint:'Favorites will not be deleted. They move to Unsorted favorites.',folderCreated:'Collection created',folderRenamed:'Collection renamed',savedToFolder:'Favorited and added to collection',tagLimit:'Maximum 30 tags per item',savedTag:'Tag added and template favorited',videoOnline:'Online playback · Internet required',playVideo:'Play reference video',videoFailed:'Video could not load. Open the original page; the prompt is still available.',externalLink:'Open original page',backupExported:'Full backup exported',backupReady:'Ready to merge: {f} favorites · {c} collections · {d} drafts · {a} asset groups',mergeBackup:'Confirm merge',imported:'Import merged. Existing creations are preserved.',invalidBackup:'Import rejected: invalid file format or contents. Nothing was changed.',fileTooLarge:'File exceeds 50 MB. Choose a smaller JSON backup.',noLegacy:'No accessible old favorites found. Export JSON from the old page and choose that file.',conflictCopy:'Imported copy',oldFavorites:'Old favorites',untagged:'No tags',readOnly:'Read-only',savedAt:'Saved {time}',seconds:'{n}s',aspectOther:'Other ratios',workingOn:'Editing',firstVersion:'Initial version',emptyPrompt:'Write a prompt before copying or saving a version.',unsavedElsewhere:'Another window updated the data. Writes are paused here. Export this content, then reload and merge.',formInputLabel:'Name',backupComplete:'Backup',draftCreated:'New creation started',heroTitle:'The next frame\nis yours.',heroDescription:'Begin with a single image and let it become your story.',heroAction:'Start creating now',featuredCase:'Featured case',agent:'Agent copilot',agentLauncher:'Copilot',closeAgent:'Close copilot',agentSettings:'Copilot settings',agentSettingsHint:'OpenAI-compatible endpoints; enter a base URL or a full endpoint path. Keys stay in this browser and are never sent to third parties.',agentLLM:'Language model · rewrite & chat',agentImage:'Text-to-image · key assets',baseUrl:'API endpoint',apiKey:'API key',model:'Model',imageSize:'Output size',imageCount:'Images per run',testConnection:'Test connection',testing:'Testing…',testOk:'Connected',testFailed:'Connection failed: {msg}',save:'Save',agentSaved:'Copilot settings saved locally',agentInvalidUrl:'API endpoint must be an http(s) URL',agentWelcome:'Hi, I am your shot copilot. Insert a shot from any card, preview or the workspace, then ask me to rewrite the prompt or design key frames and generate image assets. Connect your LLM and image APIs in settings first.',agentPlaceholder:'Tell the copilot what you need, e.g. make it a rainy neon night…',agentSend:'Send',agentStop:'Stop',agentImprove:'Rewrite prompt',agentImages:'Key images',agentClear:'Clear chat',agentInsert:'Send to copilot',agentSendDraft:'Send current creation to copilot',agentHint:'Chats and images stay on this page; settings and keys stay on this device.',agentContextCatalog:'Shot',agentContextDraft:'Creation',agentContextRemove:'Remove context',agentInserted:'Shot inserted. Tell the copilot how to change it.',agentDraftInserted:'Current creation inserted.',agentNeedContext:'Insert a shot or creation first, then rewrite or generate images.',agentNeedLLM:'No language model API configured yet.',agentNeedImage:'No text-to-image API configured yet.',agentOpenSettings:'Open settings',agentImproveDefault:'Rewrite this shot prompt with a more cinematic, fully detailed result.',agentImagesDefault:'Extract the key frames of this shot as ready-to-use image prompts.',agentThinking:'Thinking…',agentGenerating:'Generating key images {done}/{total}…',agentStopped:'(stopped)',agentImproved:'Improved prompt',agentApply:'Apply to workspace',agentApplied:'Applied to the workspace',agentCopyBlock:'Copy',agentDownload:'Download',agentImageFailed:'Generation failed: {msg}',agentImagePending:'Rendering…',agentKeyImages:'Key image assets',agentStatusNone:'No API connected · click to configure',agentStatusReady:'LLM {llm} · images {img}',agentStatusLLM:'LLM {llm} · images not configured',agentStatusImage:'Images {img} · LLM not configured',agentNetworkError:'Network request failed. Check the endpoint, connection or CORS policy.',agentNetTimeout:'Connection timed out: no response within 20s. The gateway may be overloaded or the address points at an unresponsive service.',agentNetMixed:'Mixed content blocked: this page is https but the endpoint is http. Use an https endpoint or open this page as a local file.',agentNetCors:'The endpoint is reachable, but the browser CORS check failed: the gateway returns no headers permitting browser calls. Such APIs usually support server-side use only.',agentNetCorsFile:'The endpoint is reachable but rejected the browser CORS request. Opened via file:// the Origin is null, which most gateways disallow. Run python start_studio.py on this machine and configure the model in the page it opens at http://127.0.0.1:8787; requests are relayed locally.',agentNetUnreachable:'Cannot reach this address: DNS, TCP connection or TLS handshake failed. Verify host and port, make sure the service is running, and check whether your proxy/VPN covers the browser.',agentCorsHint:'Direct browser calls require the endpoint to allow CORS. If a connection fails: run python start_studio.py on this machine; the browser opens http://127.0.0.1:8787, where you can enter the gateway URL and key directly. Requests are relayed locally and keys stay on this machine.',agentRelayHint:'This page is hosted by the local service: enter your gateway URL and key directly. Every request is relayed through this machine with no CORS limits; keys only travel from the local service to the gateway you entered.',agentNetRelayDown:'The local relay service is not responding. Make sure start_studio.py is still running, then retry or reload the page.',agentAuthError:'Invalid key or insufficient permissions ({status}).',agentEndpointError:'Endpoint not found (404). Check the API URL.',agentRateError:'Rate limited or out of quota (429).',agentHttpError:'API error ({status}).',agentBadOutput:'Could not parse the model response.',agentSpecFallback:'No LLM configured; using the shot prompt directly for key images.',agentCleared:'Chat cleared',skillLabel:'Director skill',skillNone:'No skill · general',skillApply:'Rewrite with skill',skillSet:'Skill enabled: {name}',skillSource:'View skill source',assets:'Assets',assetsTitle:'Assets, kept in groups.',assetsDescription:'Key images and prompts from the copilot are saved as groups, ready to reuse and refine.',assetSearch:'Search group names, prompts or image descriptions…',assetSortNew:'Newest first',assetSortOld:'Oldest first',assetResults:'{n} asset groups',assetGroups:'groups',assetImages:'images',assetStorage:'Local size',assetSample:'Sample',assetSampleHint:'This is a sample group showing the format. Delete it anytime.',noAssets:'No asset groups yet',noAssetsHint:'Generate key images or rewrite a prompt in the copilot, then hit "Save to assets" to group images with their prompt.',assetGenCta:'New assets',openAgentAction:'Open copilot',assetOpen:'Open asset group',assetDetail:'Asset group',assetName:'Group name',assetSaveTitle:'Save to assets',assetSaveImages:'Save to assets',agentSaveAsset:'Save',assetSaved:'Saved to assets',assetSavedView:'Saved · view',assetLimit:'Asset limit reached (100 groups). Delete unused groups or export a backup first.',assetDeleteTitle:'Delete this asset group?',assetDeleteHint:'Its images and prompt are deleted together. Workspace drafts are unaffected. Consider exporting first.',assetApplied:'Asset prompt applied to the workspace',assetInsert:'Send to copilot',assetInserted:'Asset group inserted. Keep refining or generating.',agentContextAsset:'Asset',assetPromptLabel:'PROMPT',assetCopyPrompt:'Copy prompt',assetRequest:'Request',assetFromAgent:'From copilot',assetCountLabel:'{n} images',assetPromptOnly:'Prompt only',assetSpecPrompt:'Image prompt',assetDownloadImage:'Download',storageFull:'Local save failed: storage is full. Delete unused asset groups or export a backup, then retry.',assetEmptyGallery:'This group holds a prompt only, without images.',labTitle:'Prompt lab',labHint:'Offline analysis of six cinematic dimensions. No API needed.',labScore:'Completeness',labMissing:'Missing',labComplete:'All six dimensions present',labElements:'Detected elements',labNone:'No cinematic elements detected yet. Try the suggestions below.',labFix:'Add',labEnhance:'One-tap enhancers',dimSubject:'Subject',dimCamera:'Camera',dimLight:'Light',dimMotion:'Motion',dimMood:'Mood',dimStyle:'Style',labAdded:'Added {dim} description',labEnhanced:'Applied the "{name}" enhancement',searchExpanded:'Expanded: {terms}',relatedShots:'Similar shots',recentView:'Recent',recentTitle:'Recently in your hands.',recentDescription:'Shots you copied, used or viewed stay here for a quick return.',noRecent:'No recent activity',noRecentHint:'Copy or use a shot and it will appear here.',copyShot:'Copy prompt',undo:'Undo',undone:'Undone',favoriteRemoved:'Removed from favorites',paletteTitle:'Command palette',palettePlaceholder:'Search commands or shot titles…',paletteActions:'Commands',paletteShots:'Shots',paletteEmpty:'No matching commands or shots',paletteHint:'↑↓ select · Enter run · Esc close',cmdLang:'Switch language',cmdCopy:'Copy current prompt',intentCinematic:'More cinematic',intentRain:'Rainy neon night',intentSlow:'Slow-motion close-up',intentVertical:'Vertical 5 seconds',intentFix:'Fill missing dimensions',sequence:'Sequence',sequenceTitle:'Shots, arranged into a scene.',sequenceDescription:'Order drafts and catalog shots into a shooting sequence, add continuity notes and export a production sheet.',boardResults:'{n} shots',boardSearch:'Search board titles, prompts or continuity notes…',noBoard:'The board is empty',noBoardHint:'Use "Add to board" on any library card or draft to arrange your shooting order.',boardAdd:'Add to board',boardAdded:'Added to the board',boardExists:'This shot is already on the board',boardLimit:'The board holds up to 200 shots. Remove unused entries first.',boardNote:'Continuity',boardNotePlaceholder:'Continuity note: wardrobe, props, lighting, match cut…',boardMoveUp:'Move up',boardMoveDown:'Move down',boardRemove:'Remove from board',boardOpen:'Open',boardExportCsv:'Export CSV',boardExportJson:'Export JSON',boardExportMd:'Export Markdown',boardExported:'Production sheet exported',boardEmptyExport:'No exportable shots on the board (missing entries are skipped).',boardAddCurrent:'Add current creation',boardCurrentNone:'No draft is open in the workspace.',boardMissing:'Source deleted',boardToAgent:'Send to copilot',boardPrint:'Print sheet',agentContextBoard:'Sequence',boardContextInserted:'Sequence inserted ({n} shots). Rewrites and key frames will keep continuity across shots.',diffTitle:'Version compare',diffVersion:'Compare',diffSummary:'"{name}" → current edit · green +{added} added, red −{removed} removed',diffIdentical:'This version matches the current edit exactly.',guideTitle:'Guided tour',guideEyebrow:'Guided tour',guideSkip:'Skip',guidePrev:'Back',guideNext:'Next',guideFinish:'Finish',guideStep:'Step {n} of {total}',guideFinished:'Tour complete. Reopen it anytime from the command palette or the help button.',guideSearchT:'Search & filter',guideSearchB:'Type to search the whole library; Chinese queries auto-expand to English synonyms, and both titles and full prompts are searched.',guideCardT:'Inspiration cards',guideCardB:'Each card is a real example. Hover to copy, send to the copilot, add to the board or favorite; hit "Use template" to make it yours.',guideWorkspaceT:'Workspace',guideWorkspaceB:'Hit "Use template" or press N for a blank draft and make the idea yours; the original prompt is always kept.',guideAgentT:'Agent copilot',guideAgentB:'Connect your own LLM and text-to-image APIs, then hand a single shot or a whole scene to the copilot for rewrites and key frames.',guidePaletteT:'Command palette',guidePaletteB:'The palette is the universal entry point: commands, shots and settings are all searchable.',guideChFind:'Find inspiration',guideChMake:'Make it yours',guideChScene:'Build the scene',guideChFlow:'Flow & safety',guideWelcomeT:'Welcome to FRAME',guideWelcomeB:'Your personal video-prompt workbench: 773 real shot cases, 4 models and 28 categories, fully offline. The next two minutes walk the whole creative flow.',guideWelcomeP1:'Find inspiration: search, filters and the mood wall to pick a frame you love.',guideWelcomeP2:'Make it yours: rewrite prompts, save versions and review takes in the workspace.',guideWelcomeP3:'Build the scene: order shots on the board, run continuity lint, export the sheet.',guideWelcomeTip:'Skip anytime; reopen later from the help button or by typing "Guided tour" in the palette.',guideSearchP1:'Press / to focus the search box without touching the mouse.',guideSearchP2:'Try visual words like "rainy night", "cyberpunk" or "golden hour".',guideSearchP3:'Search stacks with categories, filters and sorting.',guideSearchTip:'Try it: after the tour, search "雨夜" and watch Chinese hit English prompts.',guideFiltersT:'Filters, sorting & curated picks',guideFiltersB:'The first screen shows 117 editor picks; filters and sorting narrow things down fast.',guideFiltersP1:'Open "Filters" for model, duration, aspect and tag dimensions.',guideFiltersP2:'Sort by curated order, best takes, duration or title.',guideFiltersP3:'"Browse all" leaves the curated picks and shows all 773 shots.',guideFiltersTip:'Try it: hit "Reset" after filtering to clear everything in one tap.',guideCardP1:'Card badges are offline quality scores, surfacing the most complete cases first.',guideCardP2:'Open a card for the large preview, related shots and the full original prompt.',guideCardP3:'Export a PNG / Markdown recipe card from the preview for sharing and archiving.',guideCardTip:'Try it: open any card, then hit "Use template" to start creating.',guideTabsT:'Categories & keyboard picking',guideTabsB:'28 categories cover camera, light, mood and more; on desktop you can pick shots entirely by keyboard.',guideTabsP1:'J / K move the selection ring, Enter uses the shot.',guideTabsP2:'C copies the prompt, B adds to the board, Esc clears the selection.',guideTabsP3:'On narrow screens the keyboard hint hides; tapping still works.',guideTabsTip:'Try it: after the tour, press J / K to pick three cards in a row.',guideWorkspaceP1:'The "Reference" tab keeps the original case read-only, always one click away.',guideWorkspaceP2:'Notes, tags, folders and favorites keep your drafts organized.',guideWorkspaceP3:'Ctrl/⌘ + S saves a version; "Copy to generate" never spends any quota.',guideWorkspaceTip:'On narrow screens the workspace opens as a drawer; close it from the top-right.',guideLabT:'Prompt lab & lint',guideLabB:'Two offline quality layers live inside the workspace — no API needed.',guideLabP1:'The lab scores six cinematic dimensions and fills or enhances them in one tap.',guideLabP2:'Lint checks eight rules built from empirical ranges and chain-shot syntax.',guideLabP3:'Fix issues in one tap, copy the fixed text or export a report.',guideLabTip:'Lint only advises, never blocks: copying and generating are always unaffected.',guideVersionsT:'Version lineage & take review',guideVersionsB:'Every save hangs off the current baseline, forming a branchable lineage tree.',guideVersionsP1:'Roll back, save as a branch, or diff any two versions.',guideVersionsP2:'Score takes on five dimensions and mark the best take.',guideVersionsP3:'Select two takes to compare side by side; best-take sorting and card badges follow your scores.',guideVersionsTip:'Try it: paste a generated clip URL into take review and score it while watching.',guideBoardT:'Sequence board: build a scene',guideBoardB:'Order shots into a scene, write per-shot notes, then hand the whole scene to the copilot or export it.',guideBoardP1:'Drag to reorder, or add straight from cards and the mood wall.',guideBoardP2:'"Send scene to copilot" keeps the whole film consistent.',guideBoardP3:'Print the production sheet, or export CSV / JSON / Markdown.',guideBoardTip:'Try it: press B in the library to add the selected card to the board.',guideBoardLintT:'Continuity lint & duration budget',guideBoardLintB:'The board checks scene continuity automatically and totals the runtime.',guideBoardLintP1:'Five rules: aspect jumps, model switches, missing notes, over budget, duplicates.',guideBoardLintP2:'Click an issue to jump straight to the offending shot row.',guideBoardLintP3:'The budget defaults to 60s and is editable right in the toolbar.',guideBoardLintTip:'The lint panel starts collapsed; open it from the toolbar badge.',guideMoodT:'Mood wall: search by element',guideMoodB:'Not sure what to search? Start from 160 cinematic element terms and find the shots that contain them.',guideMoodP1:'Pick elements across six dimensions; match any or all of them.',guideMoodP2:'Sort by hits, curated first or a random walk; reshuffle anytime.',guideMoodP3:'Drag posters onto the board, or check several and add them in bulk.',guideMoodTip:'Try it: check "rain" and "neon", then hit "Add to board".',guideRecipeT:'Short-drama recipe workshop',guideRecipeB:'Pick a rhythm skeleton, set duration and shot count, and generate a lint-clean chain draft in one tap.',guideRecipeP1:'Combine skeleton × model × duration × shots × aspect × tone freely.',guideRecipeP2:'The chain preview renders live; the default combo passes continuity lint.',guideRecipeP3:'"Random recipe" for inspiration, "Create draft" to jump into the workspace.',guideRecipeTip:'Try it: the 12s 9:16 "3-second hook" skeleton is a great short-drama opener.',guideAgentP1:'Bring your own LLM and text-to-image endpoints; keys stay in this browser only.',guideAgentP2:'Per-shot rewrites, whole-scene passes and key frames; chats and images stay on this page.',guideAgentP3:'The gateway probe in settings only reads /models — it never fires paid calls.',guideAgentP4:'If direct connection fails, run python start_studio.py and use the local relay.',guideAgentTip:'Try it: hit "Test connection" after filling in the endpoint and key, then save.',guidePaletteP1:'Ctrl/⌘ + K opens it; search commands and shot titles.',guidePaletteP2:'↑↓ to select, Enter to run, Esc to close.',guidePaletteP3:'N new draft, / search, J/K pick, C copy, B board, Ctrl+S save version.',guidePaletteTip:'Type "Guided tour" in the palette to replay this walkthrough anytime.',guideBackupT:'Backup & data ownership',guideBackupB:'Favorites, drafts, versions and settings all live in this browser — they are yours.',guideBackupP1:'"Export" writes a full JSON backup, without videos or thumbnails.',guideBackupP2:'Import merges automatically; conflicting drafts are kept as copies, never overwritten.',guideBackupP3:'Offline-file and local-server storage are separate; back up before clearing browser data.',guideBackupTip:'Export a full backup before switching devices or browsers. Happy creating!',lintTab:'Lint',lintModel:'Check against',lintModelAuto:'Follow source case',lintLevel:'Show threshold',lintLevelAll:'All issues',lintLevelWarn:'Warnings and up',lintLevelError:'Errors only',lintRules:'Rule switches',lintRerun:'Re-run lint',lintRerunDone:'Re-ran lint with current rules',lintExport:'Export report',lintExported:'Lint report exported',lintCopyFixed:'Copy fixed',lintReset:'Reset rules',lintFix:'Fix',lintFixed:'Fix applied',lintPass:'No issues at the current threshold',lintHint:'Rules come from empirical ranges across the catalog and chain-shot grammar conventions. Advisory only; copying and generation are never blocked.',lintBadgeTitle:'Lint found {n} issues',lintSummary_error:'{n} errors',lintSummary_warn:'{n} warnings',lintSummary_info:'{n} notes',lintNoDraft:'Open a creation first, then run lint.',cmdLint:'Lint current creation',lintRule_numbering:'Shot numbering',lintRule_stamps:'Timestamp grammar',lintRule_duration:'Duration range',lintRule_aspect:'Aspect set',lintRule_pacing:'Shot pacing',lintRule_assets:'Asset reference mapping',lintRule_length:'Information density',lintRule_whitespace:'Whitespace hygiene',lintNumbering:'Shot numbers skip or repeat ({n} shots). Renumber in one tap.',lintStampsMissing:'Shots 2+ lack At timestamps, so pacing cannot be verified.',lintStampsOrder:'Timestamps are not monotonically increasing; overlap or reversal detected.',lintStampsOverflow:'Last shot starts at {at}s, beyond the {total}s total.',lintStampsFirst:'The first shot timestamp should be 0 or omitted.',lintDurationMissing:'No duration stated: write seconds in the prompt or link a source case.',lintDurationRange:'{d}s falls outside the empirical {min}–{max}s range of {model} cases.',lintAspect:'{aspect} never appears among {model} cases.',lintPacingDense:'{n} shots / {total}s = {avg}s per shot; cutting very dense.',lintPacingSlow:'{avg}s per shot is a long take; confirm it is intentional.',lintAssetsNone:'{n} @asset references but the asset library is empty; numbers cannot map.',lintAssetsCheck:'{n} @asset references; verify order against asset groups before delivery.',lintLength:'Only {n} characters; add subject, camera, light and mood.',lintWhitespace:'Extra blank lines or trailing whitespace; clean in one tap.',lineageHint:'Versions form a lineage tree; new saves branch from the current base.',branchVersion:'Branch here',branched:'Branch base loaded; edit and save to create the branch',baseVersion:'Base',takeAdd:'Log take',takeEdit:'Edit take',takeDialogTitle:'Take review',takeLabel:'Take label',takeLabelPh:'e.g. Run 2 · steadier camera',takeUrl:'Video URL (optional)',takeUrlPh:'https://… or leave empty to score only',takeUrlInvalid:'URL must start with http(s)://',takeNotes:'Review notes',takeNotesPh:'What worked, what to fix…',takeScore_follow:'Prompt fidelity',takeScore_visual:'Visual quality',takeScore_motion:'Motion realism',takeScore_continuity:'Continuity',takeScore_sound:'Sound',takeBest:'Mark best',takeBestOff:'Unmark best',takeAvg:'Avg',takeDelete:'Delete take',takeDeleted:'Take deleted',takeSaved:'Take logged',takeLimit:'Up to 20 takes per version',takeNone:'No takes yet',takeNoneHint:'Log the result URL and five scores after each generation so the best version stands out.',takeCompare:'Compare two takes',takeCompareTitle:'Take comparison',takeCompareHint:'Tick two takes to compare playback and scores side by side.',takeSelected:'{n}/2 selected',takeOpen:'Play',takeNoVideo:'No video URL attached',takeUntitled:'Untitled take',sortMyBest:'Best takes',takeBadgeTitle:'Best take average',boardLint:'Continuity check',boardBudget:'Duration budget',boardLintPass:'Sequence continuity check passed',boardLintIssues:'{n} continuity risks',boardRule_aspectJump:'Aspect jump',boardRule_modelJump:'Model mix',boardRule_noteGap:'Missing continuity note',boardRule_overBudget:'Over budget',boardRule_duplicate:'Duplicate shot',boardMsg_aspectJump:'SC {a} → SC {b}: {x} cuts to {y}; expect letterbox or crop jumps.',boardMsg_modelJump:'SC {a} → SC {b}: {x} vs {y} may not match in style.',boardMsg_noteGap:'No continuity note between SC {a} and SC {b}; note subject / light / camera links.',boardMsg_overBudget:'Total ≈ {total}s exceeds the {budget}s budget.',boardMsg_duplicate:'SC {a} and SC {b} reference the same source; confirm the repeat is intentional.',boardJump:'Jump',boardLintHint:'Rules inspect structure and notes only; nothing is modified.',moodboard:'Moodboard',moodTitle:'Element moodboard',moodDescription:'Cinematic elements mined from all {total} prompts; combine chips to reverse-search frames with the same mood, then drag posters onto the board.',moodSearch:'Search elements or frames…',moodDim:'Dimension',moodDimAll:'All dimensions',moodMode:'Match mode',moodModeAny:'Any match',moodModeAll:'All match',moodSize:'Wall density',moodSort:'Sort',moodSortHits:'Most hits',moodSortCurated:'Curated first',moodSortRandom:'Random walk',moodShuffle:'Shuffle',moodReset:'Clear selection',moodBulkAdd:'Add to board',moodSelected:'{n} selected',moodHits:'{n} element hits',moodEmpty:'No frames match this element mix',moodEmptyHint:'Remove elements or switch to "Any match".',moodDragHint:'Drag posters onto the sequence board, or tick and bulk-add.',moodElements:'Element index',moodWall:'Mood wall',moodPicked:'Picked posters',recipeOpen:'Drama recipe',recipeTitle:'Short-drama recipe workshop',recipeHint:'Pick a rhythm skeleton, set duration and shots, and create a lint-clean chain draft in one click.',recipeSkeleton:'Rhythm skeleton',recipeDuration:'Total duration',recipeShots:'Shot count',recipeAspect:'Aspect',recipeTone:'Tone',recipeRandom:'Randomize',recipeReset:'Reset',recipePreview:'Chain preview',recipeCreate:'Create draft',recipeCreated:'Recipe draft created',skeleton_hook:'3-second hook',skeleton_reversal:'Double reversal',skeleton_slowburn:'Slow burn',skeleton_hook_desc:'Conflict from frame one, grab the viewer in three seconds, end on a hook.',skeleton_reversal_desc:'Setup — twist — twist again; two emotional landings.',skeleton_slowburn_desc:'Mood first, emotion stacked layer by layer, one final punch.',tone_suspense:'Suspense',tone_romance:'Romance',tone_revenge:'Revenge',tone_comedy:'Light comedy',tone_healing:'Healing',previewCard:'Export recipe card',previewCardMd:'Markdown',cardExported:'Recipe card exported',cardMdExported:'Markdown exported',probeTitle:'Gateway capability probe',probeRun:'Run probe',probeRunning:'Probing…',probeHint:'Read-only probe of /models and reachability; never fires paid generation calls.',probeReach:'Endpoint reachable',probeCors:'CORS',probeRelay:'Local relay',probeModels:'Model list',probeUsage:'Usage & quota',probeNeedsCall:'Requires a real call',probeOk:'OK',probeFail:'Failed',probeUnknown:'Not probed',probeNoBase:'Enter an API base URL first',probeDone:'Probe complete',probeLast:'Last probe {time}',probeModelCount:'{n} models',probeRelayOn:'Active · keys stay on this machine',probeRelayOff:'Off · direct calls need CORS',kbdHint:'J/K move · Enter use · C copy · B board'
  }
};
const CATEGORY_ZH = {'cinematic story':'电影叙事','music video':'音乐视频','product commercial':'产品广告','fashion':'时尚大片','action':'动作场景','anime':'动漫','vlog':'生活记录','cinematic travel':'旅行风光','gameplay':'游戏画面','animation':'动画','horror':'惊悚悬疑','motion graphics':'动态图形','comedy':'喜剧','title sequence':'片头设计','brand film':'品牌短片','viral short':'创意短片','animals':'动物世界','architecture':'建筑空间','camera move':'运镜技法','character':'人物表演','documentary':'纪实科教','editing':'剪辑续写','food':'美食饮品','vfx':'特效转场','reference':'参考生成','manhua drama':'漫剧','short drama':'短剧','other':'其他'};
const ASPECT_ORDER = ['2.39:1','2.35:1','21:9','1.85:1','16:9','3:2','4:3','5:4','1:1','4:5','3:4','2:3','9:16','9:21','other'];
const categoryCounts = new Map();
CATALOG.forEach(item => categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1));
const categories = [...categoryCounts.keys()].sort((a,b) => categoryCounts.get(b) - categoryCounts.get(a));
const modelCounts = new Map();
CATALOG.forEach(item => modelCounts.set(item.model, (modelCounts.get(item.model) || 0) + 1));
const models = [...modelCounts.keys()].sort((a,b) => modelCounts.get(b) - modelCounts.get(a));
const IMPORTED_PREFIXES = ['xm-','fq-','sd-','veo-','zs-','zl-'];
const SEARCH_INDEX = new Map(CATALOG.map(d => [d.id, [d.title,d.title_zh,d.prompt,d.author,d.category,CATEGORY_ZH[d.category]].join(' ').toLowerCase()]));
const DEFAULT_AGENT = {llm:{baseUrl:'',apiKey:'',model:''},image:{baseUrl:'',apiKey:'',model:'',size:'1024x1024',count:2}};
const DIMS = [
  {key:'subject',hue:28},{key:'camera',hue:199},{key:'light',hue:45},
  {key:'motion',hue:152},{key:'mood',hue:320},{key:'style',hue:262}
];
const dimLabel = key => t('dim'+key[0].toUpperCase()+key.slice(1));
const CINE_TERMS = [
  {dim:'subject',re:/\b(woman|man|girl|boy|person|people|character|traveler|astronaut|robot|cat|kitten|dog|puppy|bird|fish|dragon|warrior|samurai|dancer|chef|child|couple|crowd|figure|protagonist|model|athlete)\b/gi,zh:'人物/主体'},
  {dim:'subject',re:/\b(car|vehicle|motorcycle|boat|ship|train|airplane|aircraft|rocket|bicycle)\b/gi,zh:'载具主体'},
  {dim:'subject',re:/\b(product|perfume|watch|sneaker|jewelry|cocktail|coffee|cake|sushi|noodles)\b/gi,zh:'物件主体'},
  {dim:'camera',re:/\b(close-?up|wide shot|aerial|drone|tracking shot|dolly|panning|pan\b|tilt|zoom|handheld|steadicam|crane|orbit|pov|macro|over-the-shoulder|low angle|high angle|dutch angle|anamorphic|depth of field|bokeh|35mm|50mm|85mm)\b/gi,zh:'镜头语言'},
  {dim:'light',re:/\b(neon|golden hour|sunset|sunrise|backlight|backlit|rim light|volumetric|candlelight|moonlight|sunlight|sunbeam|soft light|hard light|chiaroscuro|silhouette|glow|lantern|fluorescent|studio light|natural light|dusk|dawn|lens flare)\b/gi,zh:'光线设计'},
  {dim:'motion',re:/\b(slow motion|slow-motion|timelapse|time-lapse|hyperlapse|speed ramp|floating|drifting|running|walking|dancing|spinning|falling|rising|flying|swimming|crashing|exploding|morphing|flowing|swirling|gliding|sprinting)\b/gi,zh:'动态节奏'},
  {dim:'mood',re:/\b(serene|melancholy|melancholic|eerie|tense|joyful|dreamy|nostalgic|ominous|romantic|epic|intimate|chaotic|peaceful|mysterious|dramatic|whimsical|haunting|tranquil|suspense|lonely|solitude)\b/gi,zh:'情绪氛围'},
  {dim:'style',re:/\b(cinematic|film grain|documentary|anime|animation|cyberpunk|noir|vintage|retro|futuristic|minimalist|surreal|photorealistic|hyperrealistic|watercolor|oil painting|stop motion|claymation|vhs|imax|monochrome|black and white|teal and orange|color grade)\b/gi,zh:'影像风格'}
];
const DIM_FIX = {
  subject:'a lone traveler in a weathered coat stands at the center of the frame',
  camera:'shot on a 35mm anamorphic lens, slow dolly-in, shallow depth of field',
  light:'volumetric golden-hour light with soft rim lighting and gentle lens flare',
  motion:'subtle slow-motion movement, drifting particles and a gentle camera push',
  mood:'a quiet, contemplative mood with a sense of wonder',
  style:'cinematic color grade, fine film grain, photorealistic detail'
};
const ENHANCERS = [
  {id:'cinematic',zh:'电影感',en:'Cinematic',phrase:'cinematic composition, anamorphic lens flare, teal-and-orange color grade, fine film grain'},
  {id:'rain',zh:'雨夜霓虹',en:'Rain neon',phrase:'rain-soaked night streets, neon reflections on wet asphalt, glowing signage in the mist'},
  {id:'slow',zh:'慢镜头',en:'Slow motion',phrase:'elegant slow motion, suspended droplets and drifting dust, 120fps feel'},
  {id:'golden',zh:'黄金时刻',en:'Golden hour',phrase:'warm golden-hour sunlight, long soft shadows, honeyed backlight'}
];
const SKILLS = [
  {id:'h3-director',model:'MiniMax H3',zh:'H3 导演方法',en:'H3 Director Method',source:'penposs/minimax-h3-video-prompt · MIT',source_link:'https://github.com/penposs/minimax-h3-video-prompt',
   body:'Design from the user goal, never by copying a stored example. Build an internal requirement ledger tagged must-appear / must-preserve / may-vary / forbidden. Pick ONE primary capability path (text-to-video, first/last frame, multimodal reference, or precise edit) plus helpers; route edit requests to precise-edit and motion/camera preservation to reference. Assign each asset exactly one primary role (identity, product, scene/style, motion/camera, first/last frame, voice/music), number them as Image1/Video1/Audio1, and state conflict priority. Organize the prompt as director instructions covering: finished-film definition (duration, ratio, medium, concept), asset roles, subject invariants, action and timeline, camera language, visual system, sound system, and only high-probability failure constraints. Single shot = continuous chain (opening composition -> main action -> camera reaction -> state change -> closing composition); multi-shot = time segments each with one main task, one camera intent and one transition exit, covering the duration exactly with no overlap or reversal. Lock observable invariants (face, hair, body, wardrobe; product outline, proportions, part count, label, logo, color, material) instead of a vague "keep consistent". Precise edit = minimal diff: preserve everything unnamed, list final states, sync lighting/shadow/reflection/sound. Text/UI = exact whitelist with spelling, case, count and position. Sound = separate dialogue/music/ambience/SFX layers with speaker, timing and lip-sync. Length: single edit 1-4 sentences; single shot 100-400 Chinese chars; 15s multi-shot 400-1400; never exceed 7000 chars. Before delivery re-check coverage, asset binding, timeline, consistency, camera compatibility, text/sound and completeness; fix then re-check. Output only the final prompt when the user asks for prompt-only.'},
  {id:'h3-grammar',model:'MiniMax H3',zh:'H3 语法与硬限制',en:'H3 Grammar & Limits',source:'xxjrq/seedance-minimax-prompts · MIT',source_link:'https://github.com/xxjrq/seedance-minimax-prompts',
   body:'Target MiniMax H3 (Hailuo). Hard limits: duration integer 4-15 s (never clamp or silently adjust); prompt <=7000 chars; native 32 kHz stereo audio generated with video; 24 FPS; local H3-Base is 768p, 2K only via the official API (H3-Context-IR and H3-Regenerate-2K are NOT open-sourced). Modes: text-to-video (0 images), first-frame (1 first image), last-frame (1 last image), first-last-frame (2 keyframe images), ref2va (any video/audio, more than 2 images, or non-keyframe roles). FL2VA modes accept keyframe images only, no video/audio. Ref2VA limits: <=9 images, <=3 videos, <=3 audio, <=12 files total; each video/audio 2-15 s, total <=15 s; audio never alone. Base-mode prompt = exactly three fields in order: integrated_multimodal_description, overall_soundscape, non_diegetic_music. ref2va = six sections in order: subject_definitions, summary, retention_analysis, detailed_description, overall_soundscape, non_diegetic_music. Shots: [Shot 1] no timestamp; later [Shot N] At MM:SS.mmm with strictly increasing cuts inside the duration; state style and initial composition in Shot 1; camera motion as natural English (type + amplitude + speed). Speakers (S1),(S2); dialogue as <d>[Language] exact words</d>, never translated; on-screen text in double quotes verbatim. overall_soundscape 1-4 sentences (N/A only for complete silence); non_diegetic_music 1-3 sentences (N/A if no audience-only score). Ref2VA labels <Subject N>/<Picture N>/<Video N>/<Audio N> defined once and consistent; retention markers fully_preserved/partially_preserved/attribute_transfer/weak_reference for visible content and fully_copy/partially_copy/reference/weak_reference for audio. Always describe sound. Never invent endpoints or pricing; mark non-official claims as community practice.'},
  {id:'seedance-director',model:'Seedance 2.5',zh:'Seedance 2.5 导演方法',en:'Seedance 2.5 Director',source:'xxjrq/seedance-minimax-prompts · MIT',source_link:'https://github.com/xxjrq/seedance-minimax-prompts',
   body:'Target ByteDance Seedance 2.5, an audio-video joint generation model. Modes: text-to-video, image-to-video (>=1 image or a first/last frame), video-extension (>=1 reference video, extend at most twice), video-edit (>=1 reference video). Hard max 30 s per generation; if longer, plan the first 30 s now and note that extensions (max two) are separate generations. Always write audio intent (dialogue, sound design, music). Collect in order: mode, duration, subject with stable attributes, scene (setting/lighting/mood), ordered action beats, one dominant camera move per shot (size/angle/lens), audio intent, references each with ONE job (first frame, identity, camera grammar, motion, music), and constraints/negatives. Repeat stable identity/wardrobe/setting in a continuity line. Name camera moves and performance blocking explicitly. Distinguish "edit this clip" from "reference this clip"; never let two references define the same identity or style. Official facts only: 30 s per generation, two extensions, joint audio-video, precise reference control, white-model control, green-screen editing, professional camera movement, performance blocking. First/last-frame mechanics, @Image1/@Video1/@Audio1 inline syntax, reference-count limits and aspect-ratio lists are community practice, never official. Never present third-party API features (native 4K, extra routes, relaxed moderation, pricing, endpoints) as ByteDance official. Keep examples original; no movie/TV/brand IP or celebrities.'},
  {id:'drama-storyboard',model:'MiniMax H3',zh:'短剧分镜与连戏',en:'Short-Drama Storyboard & Continuity',source:'zenstory-ai/drama-skills · MIT',source_link:'https://github.com/zenstory-ai/drama-skills',
   body:'Turn a locked screenplay plus visual bible into a shot list where every cut has a dramatic reason and every handoff keeps continuity. Per shot record: source scene id, duration, dramatic purpose, size/angle, camera move (fixed is a valid choice; push in only for hooks and reversals), start state -> ordered action -> end state, on-screen text, and sound (dialogue/VO/OS, key SFX, silence). Size duration from dialogue and action volume, respecting the target model minimum; when a beat is shorter than the model minimum, merge consecutive beats into one multi-shot generation ([Shot 1] without timestamp, later [Shot N] At MM:SS.mmm, cuts strictly increasing inside the duration) instead of clamping. For three-plus characters or complex repositioning write a blocking ruler at scene head: positions, axis, eyelines, prop ownership; simple two-hand scenes state it inside each shot start/end. First-frame prompts freeze exactly the start instant; keep continuity lock words verbatim inside their scope; add a last-frame prompt only when the closing composition must lock, and pair it with the first frame. Keep one uniform style and one key-light direction per scene; only explicitly marked flashback, dream or POV shots may shift grade or style. Derive a next first frame from the confirmed previous one for same-camera cuts to lock continuity. Bind references by what is actually visible in frame: list character/look/location/prop entries with the control scope limited to visible parts; off-frame mentions go to an off-screen list; one primary role per image (identity, subject, wardrobe state, space, composition, scale, effect, first frame, last frame, style); at most one first and one last frame per shot and a last frame requires a first; when over the model limit drop in order first frame -> speaking/core-action character -> key prop -> scene -> other characters -> style. Estimate dialogue seconds with pauses, breaths and reactions; never speed up performance to fit. Keep shot numbers stable across revisions: reorder/tweak keeps the number, inserted shots get new numbers, merged or scrapped shots retire the number forever. Cover every screenplay scene or declare skipped scenes with reasons. Deliver the shot list plus first/last-frame prompts; never generate media or submit paid jobs.'},
  {id:'manhua-lock',model:'Seedance 2.5',zh:'漫剧角色锁定导演',en:'Manhua Character-Lock Director',source:'liyue-aigc/seedance-2-5-video-director · MIT',source_link:'https://github.com/liyue-aigc/seedance-2-5-video-director',
   body:'Design, diagnose and rewrite copy-ready Seedance 2.5 prompts for manhua/comic-drama and acted relationship scenes; planning and text only, never submit paid generation jobs. Select exactly ONE primary mode: basic-multimodal (new 4-30 s), timestamp-30s (exact 30 s timeline), long-video (30-180 s), video-extension, video-edit, clay-renderer (white-model motion/composition control), seamless-transition (bridge two sources), multi-grid-storyboard (animate planned panels); treat character/wardrobe locking, multi-person locking, timbre reference, BGM removal, creative transfer, perspective reconstruction and green-screen as specialist capabilities added on top. Preserve every explicit user parameter (duration, ratio, dialogue, asset role, protected elements); label inferred defaults (15 s, 16:9) as supplemented. Inventory only supplied media, normalize labels to @Image N / @Video N / @Audio N keeping order, and build an asset lock table: label | role | active time | preserve | do not inherit. A character reference image locks the whole visible character including wardrobe, not just face identity; bind each person to ONE identity source and keep face, body proportions, clothing and role independent across people. Write continuity locks only for relevant invariants: identity, count, wardrobe, prop ownership, geography, subject scale, camera axis, light direction, palette, material, voice, protected footage. Timestamp segments must be continuous, non-overlapping and sum exactly to the duration with one boundary convention (0-5s, 5-10s); give each segment enough time for its actions and reduce event count before compressing actions; audit spoken lines against performance time leaving listening, breath, interruption and reaction room, shortening dialogue before forcing delivery. Make emotion and physics causal: faces react after lines are heard, bodies move after contact, tears/blush/falling never precede their trigger. One primary camera move per beat, physically compatible with framing changes. Extension: normalize to prepend-before-source or append-after-source with explicit handoff into the source first/last frame, describe only the new interval, preserve the original, prohibit unexplained resets; ask placement when unspecified. Edit: annotation/location + exact target + add/remove/replace/change + effective time, plus an explicit unchanged list. Put dialogue, SFX, ambience, timbre source, BGM and subtitle policy in explicit audio instructions. When adapting a user example, transfer only the named dimensions (structure/granularity by default); never copy it mechanically. Audit duration, dialogue capacity, reference roles, mode syntax, continuity and contradictions before delivery; output only the requested deliverable (brief, script, diagnosis, revision or final prompt).'}
];
const activeSkill = () => SKILLS.find(s => s.id === state.settings.skill) || null;
const skillName = id => { const s = SKILLS.find(x => x.id === id); return s ? (state.settings.lang === 'zh' ? s.zh : s.en) : ''; };
function analyzePrompt(text) {
  const source=String(text||''),hits=[];
  for (const entry of CINE_TERMS) {
    let count=0;
    for (const match of source.matchAll(entry.re)) { hits.push({dim:entry.dim,term:match[0],zh:entry.zh});if (++count>=2) break; }
  }
  const present=new Set(hits.map(h=>h.dim));
  const missing=DIMS.map(d=>d.key).filter(k=>!present.has(k));
  return {hits,present,missing,score:Math.round(present.size/DIMS.length*100)};
}
const MODEL_STATS = (() => {
  const stats = new Map();
  for (const d of CATALOG) {
    let s = stats.get(d.model);
    if (!s) { s = {min:Infinity,max:0,aspects:new Set()}; stats.set(d.model,s); }
    if (d.duration_seconds > 0) { s.min = Math.min(s.min,d.duration_seconds); s.max = Math.max(s.max,d.duration_seconds); }
    s.aspects.add(d.aspect);
  }
  return stats;
})();
const LINT_RULES = [
  {id:'numbering',sev:'error'},
  {id:'stamps',sev:'error'},
  {id:'duration',sev:'warn'},
  {id:'aspect',sev:'warn'},
  {id:'pacing',sev:'warn'},
  {id:'assets',sev:'warn'},
  {id:'length',sev:'warn'},
  {id:'whitespace',sev:'info'}
];
const SEV_RANK = {info:1,warn:2,error:3};
const LINT_LEVELS = ['all','warn','error'];
const defaultLint = () => ({rules:Object.fromEntries(LINT_RULES.map(r=>[r.id,true])),level:'all'});
function cleanLint(value) {
  const rules = {};
  for (const r of LINT_RULES) rules[r.id] = value?.rules?.[r.id] !== false;
  return {rules,level:LINT_LEVELS.includes(value?.level)?value.level:'all'};
}
const parseSpokenDuration = text => { const m = text.match(/(\d+(?:\.\d+)?)\s*-?\s*(?:seconds?|secs?|s\b|秒)/i); return m ? Number(m[1]) : 0; };
function parseShots(text) {
  const shots = []; const re = /\[Shot\s*(\d+)\]\s*(At\s*(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?)?/g; let m;
  while ((m = re.exec(text))) shots.push({no:Number(m[1]),hasStamp:!!m[2],stamp:m[2]?Number(m[3])*60+Number(m[4])+(m[5]?Number('0.'+m[5]):0):null});
  return shots;
}
const fmtStamp = s => { const ms = Math.max(0,Math.round(s*1000)); return String(Math.floor(ms/60000)).padStart(2,'0')+':'+String(Math.floor(ms%60000/1000)).padStart(2,'0')+'.'+String(ms%1000).padStart(3,'0'); };
function lintPrompt(text, meta, lint) {
  const issues = []; const on = id => lint.rules[id] !== false;
  const shots = parseShots(text);
  const stats = MODEL_STATS.get(meta.model);
  const seconds = meta.duration_seconds || parseSpokenDuration(text);
  if (on('numbering') && shots.length && shots.some((s,i)=>s.no!==i+1)) issues.push({rule:'numbering',sev:'error',fix:'renumber',vars:{n:shots.length}});
  if (on('stamps') && shots.length > 1) {
    let kind = '';
    if (shots.slice(1).some(s=>!s.hasStamp)) kind = 'missing';
    else if (shots[0].hasStamp && shots[0].stamp !== 0) kind = 'first';
    else if (shots.some((s,i)=>i>0&&s.stamp<=shots[i-1].stamp)) kind = 'order';
    else if (seconds>0 && shots[shots.length-1].stamp>=seconds) kind = 'overflow';
    if (kind) issues.push({rule:'stamps',sev:'error',fix:'restamp',vars:{kind,at:shots[shots.length-1].stamp,total:seconds}});
  }
  if (on('duration')) {
    if (!seconds) issues.push({rule:'duration',sev:'warn',vars:{kind:'missing'}});
    else if (stats && (seconds<stats.min||seconds>stats.max)) issues.push({rule:'duration',sev:'warn',vars:{kind:'range',d:seconds,model:meta.model,min:stats.min,max:stats.max}});
  }
  if (on('aspect') && stats && meta.aspect && !stats.aspects.has(meta.aspect)) issues.push({rule:'aspect',sev:'warn',vars:{aspect:meta.aspect,model:meta.model}});
  if (on('pacing') && seconds > 0) {
    const n = shots.length || 1;
    const avg = seconds/n;
    if (n > 1 && avg < 1.2) issues.push({rule:'pacing',sev:'warn',vars:{kind:'dense',n,total:seconds,avg:avg.toFixed(1)}});
    else if (avg > 15) issues.push({rule:'pacing',sev:'info',vars:{kind:'slow',n,total:seconds,avg:n>1?avg.toFixed(1):String(seconds)}});
  }
  const refs = text.match(/@(?:Image|Video|Audio|图片|视频|音频)\s*\d+/g);
  if (on('assets') && refs) issues.push({rule:'assets',sev:state.assets.length?'info':'warn',vars:{n:refs.length}});
  const len = text.trim().length;
  if (on('length') && len < 200) issues.push({rule:'length',sev:'warn',vars:{n:len}});
  if (on('whitespace') && (/\n{3,}/.test(text)||/[ \t]+\n/.test(text)||/[ \t]+$/.test(text))) issues.push({rule:'whitespace',sev:'info',fix:'cleanup',vars:{}});
  return issues;
}
function lintFixText(text, fix, meta) {
  if (fix === 'renumber') { let i = 0; return text.replace(/\[Shot\s*\d+\]/g,()=>`[Shot ${++i}]`); }
  if (fix === 'cleanup') return text.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').replace(/[ \t]+$/,'');
  if (fix === 'restamp') {
    const shots = parseShots(text); const seconds = meta.duration_seconds || parseSpokenDuration(text);
    if (shots.length < 2 || !(seconds > 0)) return text;
    const step = seconds/shots.length; let i = 0;
    return text.replace(/\[Shot\s*\d+\]\s*(?:At\s*\d{1,2}:\d{2}(?:\.\d{1,3})?)?/g,()=>{ const idx = i++; return idx === 0 ? `[Shot ${idx+1}]` : `[Shot ${idx+1}] At ${fmtStamp(step*idx)}`; });
  }
  return text;
}
const lintVisible = (issue,level) => level === 'all' || SEV_RANK[issue.sev] >= SEV_RANK[level];
const SEARCH_SYNONYMS = {
  '雨':['rain','rainy','rainfall','storm'],'夜':['night','midnight','nocturnal'],'霓虹':['neon'],'雪':['snow','snowy','blizzard'],
  '海':['ocean','sea','underwater','waves'],'森林':['forest','woods','jungle'],'城市':['city','urban','skyline'],'沙漠':['desert','dune'],
  '山':['mountain','peak'],'太空':['space','cosmic','galaxy','nebula'],'猫':['cat','kitten'],'狗':['dog','puppy'],'鸟':['bird','flock'],
  '花':['flower','bloom','blossom'],'火':['fire','flame','ember'],'水':['water','liquid'],'慢镜头':['slow motion','slow-motion'],
  '航拍':['aerial','drone'],'特写':['close-up','closeup','macro'],'延时':['timelapse','time-lapse'],'日落':['sunset','golden hour','dusk'],
  '日出':['sunrise','dawn'],'赛博朋克':['cyberpunk'],'动漫':['anime','animation'],'复古':['vintage','retro'],'黑白':['monochrome','noir','black and white'],
  '舞蹈':['dance','dancing','dancer'],'美食':['food','cooking','chef'],'汽车':['car','vehicle','driving'],'机器人':['robot','android','mecha'],
  '龙':['dragon'],'武士':['samurai','warrior','sword'],'魔法':['magic','magical','spell'],'恐怖':['horror','eerie','haunting'],
  '浪漫':['romantic','romance'],'孤独':['lonely','solitude'],'史诗':['epic','majestic'],'雾':['fog','mist','haze'],'云':['cloud','clouds'],
  '星空':['stars','starry','milky way'],'极光':['aurora','northern lights'],'瀑布':['waterfall'],'海滩':['beach','shore','coast'],
  '船':['boat','ship','sailing'],'火车':['train','railway'],'飞机':['airplane','aircraft'],'眼睛':['eye','eyes'],'人群':['crowd','people'],
  '孩子':['child','children'],'婚礼':['wedding','bride'],'冲浪':['surf','surfing'],'滑雪':['ski','snowboard'],'潜水':['diving','underwater'],
  '咖啡':['coffee','cafe'],'香水':['perfume','fragrance'],'街景':['street','urban'],'寺庙':['temple','shrine'],'城堡':['castle'],
  '废墟':['ruins','abandoned'],'灯笼':['lantern'],'烟花':['fireworks'],'剪影':['silhouette'],'逆光':['backlight','backlit'],
  '烛光':['candlelight','candle'],'月光':['moonlight','moon'],'舞台':['stage','concert'],'音乐':['music','musician'],'吉他':['guitar'],
  '钢琴':['piano'],'电影':['cinematic','film'],'胶片':['film grain','35mm'],'纪录片':['documentary'],'广告':['commercial','advertisement'],
  '产品':['product'],'时尚':['fashion','runway'],'珠宝':['jewelry'],'手表':['watch'],'代码':['code','programming'],'镜子':['mirror','reflection'],
  '冰':['ice','frozen','glacier'],'烟':['smoke'],'蒸汽':['steam'],'阴影':['shadow'],'光斑':['bokeh','lens flare']
};
function expandTerms(ts) {
  const extra=new Set();
  for (const term of ts) {
    const keys=Object.keys(SEARCH_SYNONYMS).filter(k=>term.includes(k));
    for (const key of keys) {
      if (keys.some(other=>other.length>key.length&&other.includes(key))) continue;
      SEARCH_SYNONYMS[key].forEach(a=>extra.add(a));
    }
  }
  return [...extra];
}
const CATEGORY_HUE = {'cinematic story':38,'music video':320,'product commercial':199,'fashion':340,'action':4,'anime':262,'vlog':152,'cinematic travel':174,'gameplay':222,'animation':24,'horror':356,'motion graphics':210,'comedy':52,'title sequence':80,'brand film':44,'viral short':14,'animals':110,'architecture':232,'camera move':190,'character':285,'documentary':160,'editing':65,'food':28,'vfx':250,'reference':270,'manhua drama':292,'short drama':16,'other':215};
const SHOT_NO = new Map(CATALOG.map((d,i)=>[d.id,i+1]));
const timecode = s => { const n=Math.max(0,Math.round(s)); return '00:'+String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')+':00'; };
let RELATED_INDEX=null;
function relatedShots(id) {
  if (!RELATED_INDEX) RELATED_INDEX=new Map(CATALOG.map(d=>[d.id,{terms:new Set(analyzePrompt(d.prompt).hits.map(h=>h.term.toLowerCase())),category:d.category,aspect:d.aspect_group}]));
  const base=RELATED_INDEX.get(id);if(!base)return[];
  return CATALOG.filter(d=>d.id!==id).map(d=>{
    const other=RELATED_INDEX.get(d.id);
    let score=(other.category===base.category?3:0)+(other.aspect===base.aspect?1:0);
    for (const term of other.terms) if (base.terms.has(term)) score++;
    return {d,score};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,4).map(x=>x.d);
}
let state = {schema:1,settings:{lang:'zh',theme:'dark',skill:'',agent:{...clone(DEFAULT_AGENT),probe:cleanProbe(null)},guideSeen:false,lint:defaultLint(),boardBudget:60},favorites:{},folders:[],drafts:[],activeDraftId:null,assets:[],recent:[],board:[]};
let storageBlocked = false;
let storageProblem = '';
let lastWrite = null;
let ui = {view:'library',folderId:null,q:'',category:'',model:'',duration:'',aspect:'',tag:'',sort:'source',limit:PAGE_SIZE,editorTab:'edit',previewId:null,editorOpen:false,agentOpen:false,assetId:null,assetSort:'new',staggerNext:true,lintModel:'auto',compareSel:[],takeEdit:null,focusIndex:-1,mood:{terms:[],dim:'',mode:'any',size:3,sort:'hits',q:'',seed:1},moodSel:new Set(),boardLintOpen:false,recipe:null};
const agent = {messages:[],context:null,busy:false,controller:null,current:null};
let autosaveTimer, searchTimer, toastTimer;
let formCallback = null;
let pendingImport = null;
let importSelection = 0;
let guide = {open:false,index:0,lastFocus:null,startView:'library'};

function requireText(value, max, allowEmpty = true) {
  if (typeof value !== 'string' || value.length > max || (!allowEmpty && !value.trim())) throw new Error('Invalid text');
  return value;
}
function requireArray(value, max) {
  if (!Array.isArray(value) || value.length > max) throw new Error('Invalid list');
  return value;
}
function validDate(value) {
  requireText(value, 40, false);
  if (!Number.isFinite(Date.parse(value))) throw new Error('Invalid date');
  return value;
}
function cleanTags(value) { return [...new Set(requireArray(value,30).map(x => requireText(x,40,false).trim()))]; }
function cleanAgentSettings(value) {
  const v = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const llm = v.llm && typeof v.llm === 'object' ? v.llm : {};
  const image = v.image && typeof v.image === 'object' ? v.image : {};
  const text = (x,max) => requireText(typeof x === 'string' ? x : '', max);
  return {
    llm:{baseUrl:text(llm.baseUrl,500),apiKey:text(llm.apiKey,500),model:text(llm.model,120)},
    image:{baseUrl:text(image.baseUrl,500),apiKey:text(image.apiKey,500),model:text(image.model,120),size:['auto','1024x1024','1536x1024','1024x1536'].includes(image.size)?image.size:'1024x1024',count:[1,2,3,4].includes(image.count)?image.count:2}
  };
}
function cleanSkill(value) { return SKILLS.some(s => s.id === value) ? value : ''; }
const TAKE_SCORE_KEYS = ['follow','visual','motion','continuity','sound'];
function cleanTakes(value) {
  let bestSeen = false;
  return requireArray(value ?? [], 20).map(k => {
    if (!k || typeof k !== 'object') throw new Error('Invalid take');
    const scores = {};
    for (const key of TAKE_SCORE_KEYS) { const n = Number(k.scores?.[key]); scores[key] = Number.isFinite(n) ? Math.max(0,Math.min(5,Math.round(n*2)/2)) : 0; }
    const url = requireText(k.url ?? '', 2000);
    if (url && !/^https?:/i.test(url)) throw new Error('Invalid take url');
    const best = !!k.best && !bestSeen;
    if (best) bestSeen = true;
    return {id:requireText(k.id,100,false),url,label:requireText(k.label??'',80),scores,notes:requireText(k.notes??'',2000),best,createdAt:validDate(k.createdAt)};
  });
}
function cleanProbe(value) {
  const v = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const status = x => ['ok','fail','unknown'].includes(x) ? x : 'unknown';
  return {at:typeof v.at==='string'&&Number.isFinite(Date.parse(v.at))?v.at:'',base:requireText(typeof v.base==='string'?v.base:'',500),reach:status(v.reach),cors:status(v.cors),relay:status(v.relay),models:status(v.models),modelCount:Number.isFinite(Number(v.modelCount))?Math.max(0,Math.floor(Number(v.modelCount))):0,modelSample:requireArray(v.modelSample??[],8).map(x=>requireText(String(x),120))};
}
function cleanAssets(value) {
  const list = requireArray(value ?? [], 100);
  const ids = new Set();
  return list.map(a => {
    if (!a || typeof a !== 'object') throw new Error('Invalid asset');
    const id = requireText(a.id, 100, false);
    if (ids.has(id)) throw new Error('Duplicate asset');
    ids.add(id);
    const images = requireArray(a.images ?? [], 12).map(im => {
      const src = requireText(im?.src, 4000000, false);
      if (!/^(data:image\/|https?:|thumbs\/)/.test(src)) throw new Error('Invalid asset image');
      return {id:requireText(im.id,100,false),src,caption:requireText(im.caption??'',200),prompt:requireText(im.prompt??'',4000)};
    });
    const imageIds = new Set(images.map(im => im.id));
    if (imageIds.size !== images.length) throw new Error('Duplicate asset image');
    const sourceId = a.sourceId ?? null;
    if (sourceId !== null && !ITEMS.has(sourceId)) throw new Error('Unknown asset source');
    return {id,name:requireText(a.name,160),prompt:requireText(a.prompt??'',100000),sourceId,sourceTitle:requireText(a.sourceTitle??'',200),skill:cleanSkill(a.skill),createdAt:validDate(a.createdAt),updatedAt:validDate(a.updatedAt),images};
  });
}
function sampleAsset() {
  const d = ITEMS.get(FEATURED_ID);
  const timestamp = '2026-11-05T12:00:00.000Z';
  const title = d.title_zh || d.title;
  return {id:'sample-asset-group',name:'示例 · '+title,prompt:d.prompt,sourceId:d.id,sourceTitle:title,createdAt:timestamp,updatedAt:timestamp,images:[{id:'sample-asset-image',src:d.thumb,caption:title,prompt:d.prompt.slice(0,600)}]};
}
function validateState(input) {
  if (!input || input.schema !== 1 || !input.settings || !['zh','en'].includes(input.settings.lang) || !['light','dark'].includes(input.settings.theme)) throw new Error('Invalid workspace');
  const folders = requireArray(input.folders,200).map(f => ({id:requireText(f.id,100,false),name:requireText(f.name,80,false).trim(),createdAt:validDate(f.createdAt)}));
  const folderIds = new Set(folders.map(f => f.id));
  if (folderIds.size !== folders.length) throw new Error('Duplicate collection');
  if (!input.favorites || typeof input.favorites !== 'object' || Array.isArray(input.favorites) || Object.keys(input.favorites).length > CATALOG.length) throw new Error('Invalid favorites');
  const favorites = {};
  for (const [id,f] of Object.entries(input.favorites)) {
    if (!ITEMS.has(id) || !f || (f.folderId !== null && !folderIds.has(f.folderId))) throw new Error('Unknown favorite');
    favorites[id] = {folderId:f.folderId,tags:cleanTags(f.tags),createdAt:validDate(f.createdAt)};
  }
  const drafts = requireArray(input.drafts||[],500).map(d => {
    if (d.sourceId !== null && !ITEMS.has(d.sourceId)) throw new Error('Unknown source');
    const rawVersions = requireArray(d.versions,200);
    const versions = rawVersions.map((v,i) => {
      const earlier = rawVersions.slice(0,i);
      const parentId = typeof v.parentId==='string' && earlier.some(x=>x.id===v.parentId) ? v.parentId : (i>0 ? rawVersions[i-1].id : null);
      return {id:requireText(v.id,100,false),name:requireText(v.name,80,false),prompt:requireText(v.prompt,100000),notes:requireText(v.notes,10000),createdAt:validDate(v.createdAt),parentId,takes:cleanTakes(v.takes)};
    });
    if (new Set(versions.map(v => v.id)).size !== versions.length) throw new Error('Duplicate version');
    const baseVersionId = typeof d.baseVersionId==='string' && versions.some(v=>v.id===d.baseVersionId) ? d.baseVersionId : null;
    return {id:requireText(d.id,100,false),sourceId:d.sourceId,name:requireText(d.name,160),prompt:requireText(d.prompt,100000),notes:requireText(d.notes,10000),createdAt:validDate(d.createdAt),updatedAt:validDate(d.updatedAt),versions,baseVersionId};
  });
  if (new Set(drafts.map(d => d.id)).size !== drafts.length) throw new Error('Duplicate draft');
  const activeDraftId = input.activeDraftId ?? null;
  if (activeDraftId !== null && !drafts.some(d => d.id === activeDraftId)) throw new Error('Unknown draft');
  const recentIds = new Set();
  const recent = requireArray(input.recent ?? [], 12).map(r => {
    const id = requireText(r.id, 100, false);
    if (!ITEMS.has(id)) throw new Error('Unknown recent');
    if (recentIds.has(id)) throw new Error('Duplicate recent');
    recentIds.add(id);
    return {id, at: validDate(r.at)};
  });
  const boardIds = new Set();
  const board = requireArray(input.board ?? [], 200).filter(b => {
    if (!b || typeof b.id !== 'string' || boardIds.has(b.id)) return false;
    if (b.kind !== 'draft' && b.kind !== 'shot') return false;
    if (typeof b.refId !== 'string' || !b.refId) return false;
    boardIds.add(b.id);
    return true;
  }).map(b => ({id:requireText(b.id,100,false),kind:b.kind,refId:requireText(b.refId,100,false),note:requireText(b.note??'',2000)}));
  const budget = Number(input.settings.boardBudget);
  return {schema:1,settings:{lang:input.settings.lang,theme:input.settings.theme,skill:cleanSkill(input.settings.skill),agent:{...cleanAgentSettings(input.settings.agent),probe:cleanProbe(input.settings.agent?.probe)},guideSeen:!!input.settings.guideSeen,lint:cleanLint(input.settings.lint),boardBudget:Number.isFinite(budget)&&budget>0?Math.min(600,Math.round(budget)):60},folders,favorites,drafts,activeDraftId,assets:cleanAssets(input.assets),recent,board};
}
try {
  const saved = localStorage.getItem(STORE_KEY);
  if (saved) { state = validateState(JSON.parse(saved)); lastWrite = saved; }
  else state.assets = [sampleAsset()];
} catch {
  storageBlocked = true;
  storageProblem = 'storageCorrupt';
}
let savedStateSnapshot = JSON.stringify(state);
function t(key, vars = {}) {
  let text = TEXT[state.settings.lang][key] || key;
  for (const [k,v] of Object.entries(vars)) text = text.replaceAll('{'+k+'}', String(v));
  return text;
}
function categoryName(key) { return state.settings.lang === 'zh' ? CATEGORY_ZH[key] || key : key.replace(/\b\w/g, c => c.toUpperCase()); }
function titleFor(d) { return state.settings.lang === 'zh' ? d.title_zh || d.title : d.title; }
function altTitle(d) { const alt = state.settings.lang === 'zh' ? d.title : d.title_zh; return alt !== titleFor(d) ? alt : ''; }
function currentDraft() { return state.drafts.find(d => d.id === state.activeDraftId); }
function dateLabel(date) { return new Date(date).toLocaleString(state.settings.lang === 'zh' ? 'zh-CN' : 'en-US', {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}); }
function safeLink(url) { try { const u = new URL(url); return ['https:','http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } }
let undoAction=null;
function toast(message,action=null) { clearTimeout(toastTimer);undoAction=action;const el=$('#toast');el.innerHTML=escapeHTML(message)+(action?`<button class="toast-action" id="toastAction">${escapeHTML(action.label)}</button>`:'');el.hidden=false;toastTimer=setTimeout(()=>{el.hidden=true;undoAction=null;},action?6000:3500); }
function touchRecent(id) {
  if (!ITEMS.has(id)) return;
  state.recent=[{id,at:now()},...state.recent.filter(r=>r.id!==id)].slice(0,12);
  queueSave();renderNav();
}
function withStoreLock(action) {
  return navigator.locks ? navigator.locks.request(STORE_KEY, action) : Promise.resolve().then(action);
}
function commitState(next) {
  if (storageBlocked) { showStorageWarning(); return false; }
  try {
    if (localStorage.getItem(STORE_KEY) !== lastWrite) {
      storageBlocked=true;storageProblem='unsavedElsewhere';showStorageWarning();return false;
    }
    const serialized = JSON.stringify(next);
    localStorage.setItem(STORE_KEY, serialized);
    lastWrite = serialized;
    savedStateSnapshot = serialized;
    storageProblem = '';
    $('#storageWarning').hidden = true;
    $('#saveStatus').textContent = t('autosaved');
    return true;
  } catch { storageProblem='saveFailed'; showStorageWarning(); return false; }
}
function saveState() {
  clearTimeout(autosaveTimer);
  return withStoreLock(() => commitState(state)).catch(() => { storageProblem='saveFailed';showStorageWarning();return false; });
}
function changeState(change) {
  clearTimeout(autosaveTimer);
  return withStoreLock(() => {
    const next=clone(state);
    change(next);
    if (!commitState(next)) throw new Error(t(storageProblem));
    state=next;
  });
}
function showStorageWarning() {
  if (!storageProblem) return;
  $('#storageWarning').textContent=t(storageProblem);
  $('#storageWarning').hidden=false;
  $('#saveStatus').textContent=t(storageProblem);
}
function queueSave() { $('#saveStatus').textContent=t('saving'); clearTimeout(autosaveTimer); autosaveTimer=setTimeout(saveState,350); }
function setStaticText() {
  document.documentElement.lang = state.settings.lang === 'zh' ? 'zh-CN' : 'en';
  document.documentElement.dataset.theme = state.settings.theme;
  document.title = 'FRAME · ' + t('brandCaption');
  $$('[data-t]').forEach(el => el.textContent=t(el.dataset.t));
  $$('[data-placeholder]').forEach(el => el.placeholder=t(el.dataset.placeholder));
  $('#searchInput').placeholder=t(ui.view==='assets'?'assetSearch':ui.view==='drafts'?'draftSearch':'searchPlaceholder');
  $('#agentConfigHint').textContent=t(RELAY?'agentRelayHint':'agentCorsHint');
  $$('[data-label]').forEach(el => el.setAttribute('aria-label',t(el.dataset.label)));
  $$('[data-title]').forEach(el => { el.title=t(el.dataset.title); el.setAttribute('aria-label',t(el.dataset.title)); });
  $$('[data-icon]').forEach(el => el.innerHTML=icon(el.dataset.icon));
  $('#themeToggle').innerHTML=icon(state.settings.theme === 'light' ? 'moon' : 'sun');
  $('#langToggle').textContent=state.settings.lang === 'zh' ? 'EN' : '中文';
  $('#sidebar').setAttribute('aria-label',t('workspace'));
  $('#editorPanel').setAttribute('aria-label',t('editor'));
  $('#agentPanel').setAttribute('aria-label',t('agent'));
  $('#cardGrid').setAttribute('aria-label',t(ui.view === 'drafts' ? 'drafts' : ui.view === 'assets' ? 'assets' : 'library'));
  syncAgentBusy();
  showStorageWarning();
}
function navButton(view, glyph, label, count) {
  return `<button class="nav-item ${ui.view===view?'active':''}" data-view="${view}" ${ui.view===view?'aria-current="page"':''}>${icon(glyph)}<span class="label">${escapeHTML(label)}</span><span class="count">${count}</span></button>`;
}
function renderNav() {
  $('#mainNav').innerHTML=navButton('library','library',t('library'),CATALOG.length)+navButton('moodboard','grid',t('moodboard'),ui.mood.terms.length)+navButton('favorites','heart',t('favorites'),Object.keys(state.favorites).length)+navButton('drafts','edit',t('drafts'),state.drafts.length)+navButton('sequence','film',t('sequence'),state.board.length)+navButton('assets','layers',t('assets'),state.assets.length)+navButton('recent','history',t('recentView'),state.recent.length);
  $('#folderList').innerHTML=state.folders.map(f => `<div class="folder-row"><button class="nav-item ${ui.view==='folder'&&ui.folderId===f.id?'active':''}" data-folder="${escapeHTML(f.id)}">${icon('folder')}<span class="label">${escapeHTML(f.name)}</span><span class="count">${Object.values(state.favorites).filter(x=>x.folderId===f.id).length}</span></button><button class="icon-button folder-menu" data-rename-folder="${escapeHTML(f.id)}" aria-label="${escapeHTML(t('renameFolder')+' '+f.name)}">${icon('edit')}</button></div>`).join('');
  if (!state.folders.length) $('#folderList').innerHTML=`<button class="nav-item empty-folder" data-action="new-folder">${icon('folder')}<span class="label">${t('newFolder')}</span></button>`;
  const unsorted = Object.values(state.favorites).filter(f => !f.folderId).length;
  if (unsorted) $('#folderList').insertAdjacentHTML('beforeend',`<button class="nav-item ${ui.view==='folder'&&ui.folderId===null?'active':''}" data-unsorted="true">${icon('archive')}<span class="label">${t('ungrouped')}</span><span class="count">${unsorted}</span></button>`);
}
function selectOptions(el, entries, value) {
  el.replaceChildren(...entries.map(([v,label]) => { const o=document.createElement('option');o.value=v;o.textContent=label;return o; }));
  el.value=entries.some(([v])=>v===value)?value:'';
}
function renderFilters() {
  const isDraft = ui.view==='drafts';
  const isAsset = ui.view==='assets';
  const isBoard = ui.view==='sequence';
  const isMood = ui.view==='moodboard';
  $('.search-section').hidden=isMood;
  $('#filterRow').hidden=isDraft||isBoard||isMood;
  $('#categoryTabs').hidden=isDraft||isAsset||isBoard||isMood;
  $('#modelFilter').hidden=isAsset;
  $('#durationFilter').hidden=isAsset;
  $('#aspectFilter').hidden=isAsset;
  $('#tagFilter').hidden=isAsset;
  $('#resetFilters').hidden=isAsset;
  $('#searchInput').placeholder=t(isAsset?'assetSearch':isDraft?'draftSearch':isBoard?'boardSearch':'searchPlaceholder');
  selectOptions($('#modelFilter'),[['',t('allModels')],...models.map(m=>[m,m])],ui.model);
  const durations=[...new Set(CATALOG.map(d=>d.duration_seconds))].sort((a,b)=>a-b);
  selectOptions($('#durationFilter'),[['',t('allDurations')],...durations.map(n=>[String(n),t('seconds',{n})])],ui.duration);
  const present = new Set(CATALOG.map(d=>d.aspect_group));
  selectOptions($('#aspectFilter'),[['',t('allAspects')],...ASPECT_ORDER.filter(a=>present.has(a)).map(a=>[a,a==='other'?t('aspectOther'):a])],ui.aspect);
  const tags = [...new Set(Object.values(state.favorites).flatMap(f=>f.tags))].sort((a,b)=>a.localeCompare(b));
  if (ui.tag && !tags.includes(ui.tag)) ui.tag='';
  selectOptions($('#tagFilter'),[['',t('allTags')],...tags.map(tag=>[tag,tag])],ui.tag);
  if (isAsset) selectOptions($('#sortFilter'),[['new',t('assetSortNew')],['old',t('assetSortOld')],['title',t('titleOrder')]],ui.assetSort);
  else selectOptions($('#sortFilter'),[['source',t('sourceOrder')],['all',t('allOrder')],['mybest',t('sortMyBest')],['short',t('shortest')],['long',t('longest')],['title',t('titleOrder')]],ui.sort);
  syncFilterAffordances();
  $('#categoryTabs').innerHTML=[['',t('all')],...categories.map(c=>[c,categoryName(c)])].map(([key,label])=>`<button class="category-tab ${key===ui.category?'active':''}" data-category="${escapeHTML(key)}" aria-pressed="${key===ui.category}">${escapeHTML(label)}</button>`).join('');
}
function syncFilterAffordances() {
  const activeFilters=[ui.model,ui.duration,ui.aspect,ui.tag].filter(Boolean).length;
  const filterable=ui.view==='library'||ui.view==='favorites'||ui.view==='folder'||ui.view==='recent';
  $('#filterToggle').hidden=!filterable;
  if (!filterable) closeFilterPopover();
  $('#filterCount').hidden=!activeFilters;
  $('#filterCount').textContent=activeFilters;
  $('#resetFilters').hidden=!filterable||!(activeFilters||ui.q.trim());
}
function terms() { return ui.q.trim().toLowerCase().split(/\s+/).filter(Boolean); }
function matchTerm(hay,term) { return hay.includes(term)||expandTerms([term]).some(a=>hay.includes(a)); }
function highlight(text) {
  const ts=[...new Set([...terms(),...expandTerms(terms())])].sort((a,b)=>b.length-a.length);
  if (!ts.length) return escapeHTML(text);
  const expression = new RegExp(ts.map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'gi');
  let result='',offset=0;
  for (const match of String(text).matchAll(expression)) { result+=escapeHTML(text.slice(offset,match.index))+'<mark>'+escapeHTML(match[0])+'</mark>';offset=match.index+match[0].length; }
  return result+escapeHTML(text.slice(offset));
}
function filteredItems() {
  const ts=terms();
  if (ui.view==='drafts') return state.drafts.filter(d=>ts.every(x=>(d.name+' '+d.prompt+' '+d.notes).toLowerCase().includes(x))).sort((a,b)=>Date.parse(b.updatedAt)-Date.parse(a.updatedAt));
  if (ui.view==='assets') {
    const groups=state.assets.filter(a=>ts.every(x=>(a.name+' '+a.prompt+' '+a.sourceTitle+' '+skillName(a.skill)+' '+a.images.map(im=>im.caption+' '+im.prompt).join(' ')).toLowerCase().includes(x)));
    if (ui.assetSort==='old') groups.sort((a,b)=>Date.parse(a.createdAt)-Date.parse(b.createdAt));
    else if (ui.assetSort==='title') groups.sort((a,b)=>a.name.localeCompare(b.name,state.settings.lang));
    else groups.sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt));
    return groups;
  }
  let result=CATALOG.filter(d=>{
    const fav=state.favorites[d.id];
    if (ui.view==='favorites'&&!fav) return false;
    if (ui.view==='folder'&&(!fav||fav.folderId!==ui.folderId)) return false;
    if (ui.view==='recent'&&!state.recent.some(r=>r.id===d.id)) return false;
    if (ui.category&&d.category!==ui.category) return false;
    if (ui.model&&d.model!==ui.model) return false;
    if (ui.duration&&d.duration_seconds!==Number(ui.duration)) return false;
    if (ui.aspect&&d.aspect_group!==ui.aspect) return false;
    if (ui.tag&&(!fav||!fav.tags.includes(ui.tag))) return false;
    return ts.every(x=>matchTerm(SEARCH_INDEX.get(d.id)+' '+(fav?.tags.join(' ')||''),x));
  });
  if (ui.view==='recent') { const order=new Map(state.recent.map((r,i)=>[r.id,i]));result.sort((a,b)=>order.get(a.id)-order.get(b.id));return result; }
  if (ui.sort==='short') result.sort((a,b)=>a.duration_seconds-b.duration_seconds);
  if (ui.sort==='long') result.sort((a,b)=>b.duration_seconds-a.duration_seconds);
  if (ui.sort==='title') result.sort((a,b)=>titleFor(a).localeCompare(titleFor(b),state.settings.lang));
  if (ui.sort==='mybest') { const score=d=>{const k=bestTakeFor(d.id);return k?takeAvg(k):-1;};result.sort((a,b)=>score(b)-score(a)||(CURATED_RANK.get(a.id)??999)-(CURATED_RANK.get(b.id)??999)); }
  if (ui.sort==='source'&&ui.view!=='drafts') result.sort((a,b)=>(CURATED_RANK.get(a.id)??999)-(CURATED_RANK.get(b.id)??999));
  return result;
}
function promptCard(item,index=0) {
  const fav=state.favorites[item.id];
  const selected=currentDraft()?.sourceId===item.id;
  return `<article class="prompt-card ${selected?'is-selected':''}" data-item-id="${escapeHTML(item.id)}" style="--hue:${CATEGORY_HUE[item.category]??215};--i:${index%12}"><div class="card-media"><button class="media-open" data-preview="${escapeHTML(item.id)}" aria-label="${escapeHTML(t('preview')+': '+titleFor(item))}"><img src="${escapeHTML(item.thumb)}" alt="${escapeHTML(titleFor(item))}" loading="lazy" decoding="async">${item.video?`<span class="play-indicator">${icon('play')}</span>`:''}</button>${IMPORTED_PREFIXES.some(p=>item.id.startsWith(p))?'<span class="new-badge">NEW</span>':''}<span class="duration-badge">${escapeHTML(item.duration)}</span><button class="card-copy icon-button" data-copy-shot="${escapeHTML(item.id)}" title="${escapeHTML(t('copyShot'))}" aria-label="${escapeHTML(t('copyShot')+': '+titleFor(item))}">${icon('copy')}</button><button class="card-agent icon-button" data-agent-insert="${escapeHTML(item.id)}" title="${escapeHTML(t('agentInsert'))}" aria-label="${escapeHTML(t('agentInsert')+': '+titleFor(item))}">${icon('spark')}</button><button class="card-board icon-button" data-board-add-shot="${escapeHTML(item.id)}" title="${escapeHTML(t('boardAdd'))}" aria-label="${escapeHTML(t('boardAdd')+': '+titleFor(item))}">${icon('film')}</button><button class="card-heart icon-button ${fav?'is-favorite':''}" data-favorite="${escapeHTML(item.id)}" aria-label="${escapeHTML(t(fav?'removeFavorite':'favorite'))}" aria-pressed="${!!fav}">${icon('heart')}</button></div><div class="card-body"><div class="card-slate"><span>SC ${String(SHOT_NO.get(item.id)).padStart(3,'0')}</span><span class="slate-tc">TC ${timecode(item.duration_seconds)}</span>${lintBadge(item)}${takeBadge(item)}</div><div class="card-category"><span>${escapeHTML(categoryName(item.category))}</span><span>${escapeHTML(item.aspect)}</span></div><h2 class="card-title">${highlight(titleFor(item))}</h2>${altTitle(item)?`<p class="card-alt">${escapeHTML(altTitle(item))}</p>`:''}<p class="card-excerpt">${highlight(item.prompt.slice(0,180))}</p>${fav?.tags.length?`<div class="card-tags">${fav.tags.map(tag=>`<button class="tag" data-filter-tag="${escapeHTML(tag)}">${escapeHTML(tag)}</button>`).join('')}</div>`:''}<div class="card-footer"><span class="card-author" title="${escapeHTML(item.author)}">${escapeHTML(item.author)}</span><button class="button use-template" data-use="${escapeHTML(item.id)}">${selected?icon('check'):icon('arrow')}<span>${t(selected?'continueDraft':'useTemplate')}</span></button></div></div></article>`;
}
function draftCard(d) {
  const source=ITEMS.get(d.sourceId);
  return `<article class="draft-card" data-draft-id="${escapeHTML(d.id)}"><div class="draft-card-top"><span class="draft-symbol">${icon('edit')}</span><span class="draft-card-tools"><button class="icon-button" data-board-add-draft="${escapeHTML(d.id)}" title="${escapeHTML(t('boardAdd'))}" aria-label="${escapeHTML(t('boardAdd')+': '+(d.name||t('untitled')))}">${icon('film')}</button><button class="icon-button" data-delete-draft="${escapeHTML(d.id)}" aria-label="${escapeHTML(t('deleteDraft'))}">${icon('trash')}</button></span></div><h3>${highlight(d.name||t('untitled'))}</h3><p class="draft-excerpt">${highlight(d.prompt.slice(0,220))}</p><div class="draft-card-tags"><span class="tag">${d.versions.length} ${t('versionsTab')}</span>${source?`<span class="tag">${escapeHTML(categoryName(source.category))}</span>`:''}</div><div class="draft-card-footer"><span>${dateLabel(d.updatedAt)}</span><button class="button use-template" data-edit-draft="${escapeHTML(d.id)}">${t('continueDraft')}${icon('arrow')}</button></div></article>`;
}
function assetCover(a) {
  const images=a.images.slice(0,4);
  if (!images.length) return `<span class="asset-cover-empty">${icon('edit')}<span>${escapeHTML(a.prompt.slice(0,90)||t('assetPromptOnly'))}</span></span>`;
  return `<span class="asset-collage n${images.length}">${images.map(im=>`<img src="${escapeHTML(im.src)}" alt="${escapeHTML(im.caption)}" loading="lazy" decoding="async">`).join('')}</span>`;
}
function assetCard(a) {
  const count=a.images.length;
  return `<article class="asset-card" data-asset-id="${escapeHTML(a.id)}"><button class="asset-cover" data-asset-open="${escapeHTML(a.id)}" aria-label="${escapeHTML(t('assetOpen')+': '+a.name)}">${assetCover(a)}<span class="asset-count">${icon(count?'image':'edit')}<span>${count?t('assetCountLabel',{n:count}):t('assetPromptOnly')}</span></span></button><div class="card-body"><div class="card-category"><span>${escapeHTML(a.sourceTitle||t('assetFromAgent'))}</span><span>${dateLabel(a.createdAt)}</span></div><h2 class="card-title">${highlight(a.name||t('untitled'))}</h2><p class="card-excerpt">${highlight(a.prompt.slice(0,180))}</p>${a.skill?`<div class="card-tags"><span class="tag">${escapeHTML(skillName(a.skill))}</span></div>`:''}<div class="card-footer"><span class="card-author">${icon('layers')}<span>${escapeHTML(a.sourceTitle||t('assetFromAgent'))}</span></span><span class="asset-card-actions"><button class="icon-button" data-asset-copy="${escapeHTML(a.id)}" title="${escapeHTML(t('assetCopyPrompt'))}" aria-label="${escapeHTML(t('assetCopyPrompt'))}">${icon('copy')}</button><button class="icon-button" data-asset-agent="${escapeHTML(a.id)}" title="${escapeHTML(t('assetInsert'))}" aria-label="${escapeHTML(t('assetInsert'))}">${icon('spark')}</button><button class="icon-button" data-asset-delete="${escapeHTML(a.id)}" title="${escapeHTML(t('assetDeleteTitle'))}" aria-label="${escapeHTML(t('assetDeleteTitle'))}">${icon('trash')}</button><button class="button use-template" data-asset-open="${escapeHTML(a.id)}">${t('assetOpen')}${icon('arrow')}</button></span></div></div></article>`;
}
function boardSource(entry) {
  if (entry.kind==='draft') {
    const d=state.drafts.find(x=>x.id===entry.refId);if(!d)return null;
    const src=ITEMS.get(d.sourceId);
    return {title:d.name||t('untitled'),prompt:d.prompt,model:src?.model||'',duration:src?.duration||'',aspect:src?.aspect||'',category:src?.category||'',author:src?.author||'',source_link:src?.source_link||'',seconds:src?.duration_seconds||0,open:'draft'};
  }
  const item=ITEMS.get(entry.refId);if(!item)return null;
  return {title:titleFor(item),prompt:item.prompt,model:item.model,duration:item.duration,aspect:item.aspect,category:item.category,author:item.author,source_link:item.source_link,seconds:item.duration_seconds||0,open:'shot'};
}
function boardEntries() {
  const ts=terms();
  return state.board.map((entry,i)=>({entry,i,src:boardSource(entry)})).filter(x=>!ts.length||ts.every(q=>((x.src?.title||'')+' '+x.entry.note+' '+(x.src?.prompt||'')).toLowerCase().includes(q)));
}
function boardCard(x) {
  const {entry,i,src}=x;
  const no='SC '+String(i+1).padStart(3,'0');
  const remove=`<button class="icon-button" data-board-remove="${escapeHTML(entry.id)}" title="${escapeHTML(t('boardRemove'))}" aria-label="${escapeHTML(t('boardRemove'))}">${icon('trash')}</button>`;
  if (!src) return `<article class="board-row is-missing" data-board-id="${escapeHTML(entry.id)}"><span class="board-no">${no}</span><div class="board-main"><h3>${t('boardMissing')}</h3><p class="board-meta">${escapeHTML(entry.kind==='draft'?t('drafts'):t('library'))} · ${escapeHTML(entry.refId)}</p></div><div class="board-actions">${remove}</div></article>`;
  const meta=[src.model,src.duration,src.aspect,categoryName(src.category)].filter(Boolean).join(' · ');
  return `<article class="board-row" data-board-id="${escapeHTML(entry.id)}"><span class="board-no">${no}</span><div class="board-main"><h3>${highlight(src.title)}</h3><p class="board-meta">${escapeHTML(meta)}</p><p class="board-excerpt">${highlight(src.prompt.slice(0,140))}</p><textarea class="board-note" rows="2" maxlength="2000" data-board-note="${escapeHTML(entry.id)}" placeholder="${escapeHTML(t('boardNotePlaceholder'))}" aria-label="${escapeHTML(t('boardNote'))}">${escapeHTML(entry.note)}</textarea></div><div class="board-actions"><button class="icon-button board-up" data-board-up="${escapeHTML(entry.id)}" title="${escapeHTML(t('boardMoveUp'))}" aria-label="${escapeHTML(t('boardMoveUp'))}" ${i===0?'disabled':''}>${icon('arrow')}</button><button class="icon-button board-down" data-board-down="${escapeHTML(entry.id)}" title="${escapeHTML(t('boardMoveDown'))}" aria-label="${escapeHTML(t('boardMoveDown'))}" ${i===state.board.length-1?'disabled':''}>${icon('arrow')}</button><button class="icon-button" data-board-open="${escapeHTML(entry.id)}" title="${escapeHTML(t('boardOpen'))}" aria-label="${escapeHTML(t('boardOpen')+': '+src.title)}">${icon(src.open==='draft'?'edit':'play')}</button>${remove}</div></article>`;
}
async function addToBoard(kind,refId) {
  if (state.board.some(b=>b.kind===kind&&b.refId===refId)) {toast(t('boardExists'));return;}
  if (state.board.length>=200) {toast(t('boardLimit'));return;}
  await changeState(next=>{next.board.push({id:uid(),kind,refId,note:''});});
  renderNav();if(ui.view==='sequence')renderLibrary();
  toast(t('boardAdded'),{label:t('sequence'),run:()=>setView('sequence')});
}
async function moveBoard(id,delta) {
  await changeState(next=>{const i=next.board.findIndex(b=>b.id===id);const j=i+delta;if(i<0||j<0||j>=next.board.length)return;const [e]=next.board.splice(i,1);next.board.splice(j,0,e);});
  renderLibrary();
}
async function removeBoard(id) {
  await changeState(next=>{next.board=next.board.filter(b=>b.id!==id);});
  renderNav();renderLibrary();
}
function boardRows() {
  return state.board.map((entry,i)=>{const src=boardSource(entry);return src?{no:i+1,title:src.title,model:src.model,duration:src.duration,aspect:src.aspect,category:categoryName(src.category),prompt:src.prompt,continuity_note:entry.note,author:src.author,source_link:src.source_link}:null;}).filter(Boolean);
}
function exportBoard(format) {
  const rows=boardRows();
  if (!rows.length) {toast(t('boardEmptyExport'));return;}
  let content,type,ext;
  if (format==='csv') {
    const esc=v=>'"'+String(v??'').replaceAll('"','""')+'"';
    const head=['no','title','model','duration','aspect','category','prompt','continuity_note','author','source_link'];
    content='﻿'+[head.join(','),...rows.map(r=>head.map(k=>esc(r[k])).join(','))].join('\r\n');
    type='text/csv;charset=utf-8';ext='csv';
  } else if (format==='json') {
    content=JSON.stringify(rows,null,2);type='application/json';ext='json';
  } else {
    content=rows.map(r=>`## SC ${String(r.no).padStart(3,'0')} · ${r.title}\n\n${[r.model,r.duration,r.aspect,r.category].filter(Boolean).join(' · ')}\n\n\`\`\`\n${r.prompt}\n\`\`\`\n\n> ${t('boardNote')}: ${r.continuity_note||'—'}\n`).join('\n');
    type='text/markdown;charset=utf-8';ext='md';
  }
  const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='frame-board-'+new Date().toISOString().slice(0,10)+'.'+ext;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
  toast(t('boardExported'));
}
function boardContextEntries() {
  return state.board.map((entry,i)=>({entry,i,src:boardSource(entry)})).filter(x=>x.src);
}
function lintBoard() {
  const rows=boardContextEntries();const issues=[];
  for(let i=1;i<rows.length;i++){
    const A=rows[i-1],B=rows[i];
    if(A.src.aspect&&B.src.aspect&&A.src.aspect!==B.src.aspect)issues.push({rule:'aspectJump',sev:'warn',vars:{a:A.i+1,b:B.i+1,x:A.src.aspect,y:B.src.aspect},ids:[B.entry.id]});
    if(A.src.model&&B.src.model&&A.src.model!==B.src.model)issues.push({rule:'modelJump',sev:'info',vars:{a:A.i+1,b:B.i+1,x:A.src.model,y:B.src.model},ids:[B.entry.id]});
    if(!B.entry.note.trim())issues.push({rule:'noteGap',sev:'info',vars:{a:A.i+1,b:B.i+1},ids:[B.entry.id]});
  }
  const total=rows.reduce((s,r)=>s+(r.src.seconds||0),0);
  if(total>state.settings.boardBudget)issues.push({rule:'overBudget',sev:'warn',vars:{total,budget:state.settings.boardBudget},ids:rows.length?[rows[rows.length-1].entry.id]:[]});
  const seen=new Map();
  for(const r of rows){
    const key=r.entry.kind==='draft'?(state.drafts.find(d=>d.id===r.entry.refId)?.sourceId||r.entry.refId):r.entry.refId;
    if(seen.has(key))issues.push({rule:'duplicate',sev:'info',vars:{a:seen.get(key)+1,b:r.i+1},ids:[r.entry.id]});
    else seen.set(key,r.i);
  }
  return issues;
}
function renderBoardLint() {
  const isBoard=ui.view==='sequence';
  const issues=isBoard?lintBoard():[];
  const toggle=$('#boardLintToggle');
  if(toggle){toggle.setAttribute('aria-expanded',String(ui.boardLintOpen));const count=toggle.querySelector('.board-lint-count');count.textContent=issues.length;count.hidden=!issues.length;toggle.classList.toggle('has-issues',issues.length>0);}
  const panel=$('#boardLint');
  panel.hidden=!isBoard||!ui.boardLintOpen;
  if(panel.hidden)return;
  panel.innerHTML=`<div class="board-lint-head">${icon('film')}<strong>${issues.length?t('boardLintIssues',{n:issues.length}):t('boardLintPass')}</strong><span>${t('boardLintHint')}</span></div>`+(issues.length?`<div class="board-lint-issues">${issues.map(x=>`<article class="lint-issue sev-${x.sev}"><span class="lint-dot" aria-hidden="true"></span><div class="lint-issue-body"><strong>${escapeHTML(t('boardRule_'+x.rule))}</strong><p>${escapeHTML(t('boardMsg_'+x.rule,x.vars))}</p></div>${x.ids[0]?`<button class="text-button lint-fix" data-board-jump="${escapeHTML(x.ids[0])}">${icon('arrow')}${t('boardJump')}</button>`:''}</article>`).join('')}</div>`:`<div class="lint-empty">${icon('check')}<p>${t('boardLintPass')}</p></div>`);
}
let MOOD_INDEX=null;
function moodIndex() {
  if (MOOD_INDEX) return MOOD_INDEX;
  const byItem=new Map(),byTerm=new Map();
  for (const d of CATALOG) {
    const a=analyzePrompt(d.prompt),terms=new Map();
    for (const h of a.hits) {
      const key=h.term.toLowerCase();
      const e=terms.get(key)||{term:key,dim:h.dim,zh:h.zh,n:0};e.n++;terms.set(key,e);
      let entry=byTerm.get(key);
      if(!entry){entry={term:key,dim:h.dim,zh:h.zh,ids:new Set()};byTerm.set(key,entry);}
      entry.ids.add(d.id);
    }
    byItem.set(d.id,[...terms.values()]);
  }
  MOOD_INDEX={byItem,byTerm};
  return MOOD_INDEX;
}
function seededRand(seed) { let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;}; }
function moodItems() {
  const idx=moodIndex(),sel=ui.mood.terms,q=ui.mood.q.trim().toLowerCase();
  const list=CATALOG.filter(d=>{
    const terms=idx.byItem.get(d.id)||[];
    if(ui.mood.dim&&!terms.some(e=>e.dim===ui.mood.dim))return false;
    if(sel.length){const have=new Set(terms.map(e=>e.term));if(ui.mood.mode==='all'?!sel.every(x=>have.has(x)):!sel.some(x=>have.has(x)))return false;}
    if(q&&!(SEARCH_INDEX.get(d.id).includes(q)||terms.some(e=>e.term.includes(q)||e.zh.includes(q))))return false;
    return true;
  });
  const hits=d=>{const have=new Set((idx.byItem.get(d.id)||[]).map(e=>e.term));return sel.filter(x=>have.has(x)).length;};
  if(ui.mood.sort==='hits')list.sort((a,b)=>hits(b)-hits(a)||(CURATED_RANK.get(a.id)??999)-(CURATED_RANK.get(b.id)??999));
  else if(ui.mood.sort==='curated')list.sort((a,b)=>(CURATED_RANK.get(a.id)??999)-(CURATED_RANK.get(b.id)??999));
  else{const rnd=seededRand(ui.mood.seed);const order=new Map(list.map(d=>[d.id,rnd()]));list.sort((a,b)=>order.get(a.id)-order.get(b.id));}
  return list;
}
function moodCard(item,index) {
  const idx=moodIndex(),terms=idx.byItem.get(item.id)||[];
  const sel=new Set(ui.mood.terms),matched=terms.filter(e=>sel.has(e.term));
  const shown=(matched.length?matched:terms).slice(0,4);
  const checked=ui.moodSel.has(item.id);
  return `<article class="mood-card ${checked?'is-checked':''}" draggable="true" data-mood-drag="${escapeHTML(item.id)}" data-item-id="${escapeHTML(item.id)}" style="--hue:${CATEGORY_HUE[item.category]??215};--i:${index%12}"><div class="mood-poster"><img src="${escapeHTML(item.thumb)}" alt="${escapeHTML(titleFor(item))}" loading="lazy" decoding="async"><label class="mood-check"><input type="checkbox" data-mood-select="${escapeHTML(item.id)}" ${checked?'checked':''} aria-label="${escapeHTML(titleFor(item))}"><span aria-hidden="true">${icon('check')}</span></label><span class="mood-hits">${t('moodHits',{n:matched.length||terms.length})}</span><button class="mood-preview icon-button" data-preview="${escapeHTML(item.id)}" title="${escapeHTML(t('preview'))}" aria-label="${escapeHTML(t('preview')+': '+titleFor(item))}">${icon('play')}</button></div><div class="mood-info"><strong>${highlight(titleFor(item))}</strong><div class="mood-chips-mini">${shown.map(e=>`<span class="lab-chip" style="--hue:${DIMS.find(d=>d.key===e.dim).hue}" title="${escapeHTML(e.zh)}">${escapeHTML(e.term)}</span>`).join('')}</div><div class="mood-actions"><button class="button use-template" data-use="${escapeHTML(item.id)}">${icon('edit')}<span>${t('useTemplate')}</span></button><button class="icon-button" data-board-add-shot="${escapeHTML(item.id)}" title="${escapeHTML(t('boardAdd'))}" aria-label="${escapeHTML(t('boardAdd')+': '+titleFor(item))}">${icon('film')}</button></div></div></article>`;
}
function renderMoodControls() {
  const idx=moodIndex();
  selectOptions($('#moodDim'),[['',t('moodDimAll')],...DIMS.map(d=>[d.key,dimLabel(d.key)])],ui.mood.dim);
  $('#moodMode').value=ui.mood.mode;$('#moodSort').value=ui.mood.sort;
  $('#moodSize').value=ui.mood.size;$('#moodSizeOut').textContent=ui.mood.size;
  const q=ui.mood.q.trim().toLowerCase();
  let entries=[...idx.byTerm.values()];
  if(ui.mood.dim)entries=entries.filter(e=>e.dim===ui.mood.dim);
  if(q)entries=entries.filter(e=>e.term.includes(q)||e.zh.includes(q));
  entries.sort((a,b)=>b.ids.size-a.ids.size);
  const active=new Set(ui.mood.terms);
  const top=entries.slice(0,60);
  for(const term of ui.mood.terms)if(!top.some(e=>e.term===term)&&idx.byTerm.has(term))top.unshift(idx.byTerm.get(term));
  $('#moodChips').innerHTML=top.length?top.map(e=>`<button class="mood-chip ${active.has(e.term)?'on':''}" data-mood-term="${escapeHTML(e.term)}" style="--hue:${DIMS.find(d=>d.key===e.dim).hue}" aria-pressed="${active.has(e.term)}" title="${escapeHTML(e.zh)}"><span>${escapeHTML(e.term)}</span><small>${e.ids.size}</small></button>`).join(''):`<span class="mood-chips-none">${t('labNone')}</span>`;
  $('#moodBulkAdd').disabled=!ui.moodSel.size;
  $('#moodSelCount').textContent=ui.moodSel.size?t('moodSelected',{n:ui.moodSel.size}):'';
}
async function addManyToBoard(ids) {
  const fresh=ids.filter(id=>ITEMS.has(id)&&!state.board.some(b=>b.kind==='shot'&&b.refId===id));
  if(!fresh.length){toast(t('boardExists'));return;}
  const take=fresh.slice(0,Math.max(0,200-state.board.length));
  if(!take.length){toast(t('boardLimit'));return;}
  await changeState(next=>{for(const id of take)next.board.push({id:uid(),kind:'shot',refId:id,note:''});});
  ui.moodSel.clear();renderNav();renderLibrary();
  toast(t('boardAdded')+' ×'+take.length,{label:t('sequence'),run:()=>setView('sequence')});
}
function resetMood() {
  ui.mood.terms=[];ui.mood.q='';ui.mood.dim='';ui.moodSel.clear();ui.limit=PAGE_SIZE;
  $('#moodSearch').value='';
  renderNav();renderLibrary();
}
const RECIPE_MODEL_MAX={'MiniMax H3':15,'Veo 3':8,'Seedance 2.5':30,'Seedance 2.0':15};
const RECIPE_TONES=[
  {id:'suspense',phrase:'cold suspense lighting, held breaths, a distant low hum'},
  {id:'romance',phrase:'warm soft light, gentle smiles, tender pauses'},
  {id:'revenge',phrase:'hard shadows, clenched jaws, a low driving pulse'},
  {id:'comedy',phrase:'bright even light, quick reactions, playful foley pops'},
  {id:'healing',phrase:'golden haze, slow exhales, quiet ambient warmth'}
];
const RECIPE_SKELETONS=[
  {id:'hook',beats:[
    {w:1.2,zhDo:'开场即冲突，一个反常画面抓住观众',enDo:'open mid-conflict with one arresting, unusual frame'},
    {w:2,zhDo:'交代处境，压力升级',enDo:'establish the stakes and let the pressure build'},
    {w:1.4,zhDo:'预期被打破，真相露出一角',enDo:'break the expectation and reveal a corner of the truth'},
    {w:1,zhDo:'留一个未解悬念，勾住下一集',enDo:'end on an unresolved question that pulls into the next episode'}]},
  {id:'reversal',beats:[
    {w:1.8,zhDo:'建立看似稳固的局面',enDo:'build a situation that feels stable'},
    {w:1.3,zhDo:'第一次反转，局面倾斜',enDo:'let the first reversal tilt the situation'},
    {w:1.5,zhDo:'代价加码，情绪逼近顶点',enDo:'raise the cost and push emotion toward its peak'},
    {w:1.2,zhDo:'第二次反转，推翻刚才的判断',enDo:'let the second reversal overturn the fresh assumption'},
    {w:1,zhDo:'情绪落地，余味收束',enDo:'land the emotion and close with an aftertaste'}]},
  {id:'slowburn',beats:[
    {w:2,zhDo:'空间与光线先行，人物小小一个',enDo:'let space and light lead, the figure small within them'},
    {w:1.6,zhDo:'一个细节泄露心事',enDo:'let one small detail betray a hidden feeling'},
    {w:1.6,zhDo:'情绪层层叠加，呼吸变慢',enDo:'stack the emotion layer by layer as breathing slows'},
    {w:1,zhDo:'结尾一个动作或台词完成释放',enDo:'release everything with one final gesture or line'}]}
];
const RECIPE_CAMERAS=['slow dolly-in on the subject','handheld follow with subtle sway','static wide holding the space','tight close-up with shallow depth of field','gentle orbit around the subject','low-angle push with a slow tilt up'];
const defaultRecipe=()=>({skeleton:'hook',model:'MiniMax H3',duration:12,shots:4,aspect:'9:16',tone:'suspense'});
function recipeMaxShots(r) { return Math.min(6,Math.max(2,Math.floor(r.duration/2))); }
function recipePrompt(r) {
  const sk=RECIPE_SKELETONS.find(s=>s.id===r.skeleton)||RECIPE_SKELETONS[0];
  const tone=RECIPE_TONES.find(x=>x.id===r.tone)||RECIPE_TONES[0];
  const n=Math.min(r.shots,recipeMaxShots(r)),D=r.duration;
  const assign=Array.from({length:n},(_,i)=>sk.beats[Math.floor(i*sk.beats.length/n)]);
  const counts=new Map();assign.forEach(b=>counts.set(b,(counts.get(b)||0)+1));
  const weights=assign.map(b=>b.w/counts.get(b));
  const totalW=weights.reduce((a,b)=>a+b,0);
  const lines=[`Short-drama chain in a ${r.tone} tone. Total duration: ${D}s. Aspect ${r.aspect}. One continuous story: keep the subject's face, wardrobe, props and key-light direction locked across every shot.`];
  let acc=0;
  for(let i=0;i<n;i++){
    const start=acc;acc+=D*weights[i]/totalW;
    const cam=RECIPE_CAMERAS[(i+sk.beats.length)%RECIPE_CAMERAS.length];
    lines.push(`[Shot ${i+1}]${i===0?'':' At '+fmtStamp(start)} ${assign[i].enDo}; ${cam}; ${tone.phrase}; hand off cleanly into the next shot's opening composition.`);
  }
  lines.push('overall soundscape: continuous room tone, one key action sound per shot, dialogue kept short enough to breathe; no non-diegetic music unless the scene calls for it.');
  return lines.join('\n');
}
function renderRecipe() {
  const r=ui.recipe;
  const maxDur=RECIPE_MODEL_MAX[r.model]||30;
  if(r.duration>maxDur)r.duration=maxDur;
  if(r.duration<4)r.duration=4;
  r.shots=Math.min(Math.max(2,r.shots),recipeMaxShots(r));
  selectOptions($('#recipeSkeleton'),RECIPE_SKELETONS.map(s=>[s.id,t('skeleton_'+s.id)]),r.skeleton);
  selectOptions($('#recipeModel'),Object.keys(RECIPE_MODEL_MAX).map(m=>[m,m]),r.model);
  selectOptions($('#recipeTone'),RECIPE_TONES.map(x=>[x.id,t('tone_'+x.id)]),r.tone);
  $('#recipeAspect').value=r.aspect;
  $('#recipeDuration').max=maxDur;$('#recipeDuration').value=r.duration;$('#recipeDurationOut').textContent=r.duration+'s';
  $('#recipeShotsOut').textContent=r.shots;
  $('#recipeShotsDown').disabled=r.shots<=2;$('#recipeShotsUp').disabled=r.shots>=recipeMaxShots(r);
  const sk=RECIPE_SKELETONS.find(s=>s.id===r.skeleton);
  $('#recipeSkeletonDesc').textContent=t('skeleton_'+r.skeleton+'_desc');
  $('#recipePreview').textContent=recipePrompt(r);
}
function openRecipe() { ui.recipe=ui.recipe||defaultRecipe();renderRecipe();$('#recipeDialog').showModal(); }
function randomRecipe() {
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const r=ui.recipe;
  r.skeleton=pick(RECIPE_SKELETONS).id;r.model=pick(Object.keys(RECIPE_MODEL_MAX));r.tone=pick(RECIPE_TONES).id;r.aspect=pick(['9:16','16:9','1:1','4:5']);
  r.duration=4+Math.floor(Math.random()*((RECIPE_MODEL_MAX[r.model]||30)-3));
  r.shots=2+Math.floor(Math.random()*(recipeMaxShots(r)-1));
  renderRecipe();
}
function createRecipeDraft() {
  const r=ui.recipe,text=recipePrompt(r);
  $('#recipeDialog').close();
  startDraft();
  const draft=currentDraft();if(!draft)return;
  draft.prompt=text;
  draft.name=(t('skeleton_'+r.skeleton)+' · '+t('tone_'+r.tone)+' · '+r.duration+'s').slice(0,160);
  draft.notes=`${r.model} · ${r.aspect} · ${r.shots} shots`;
  draft.updatedAt=now();
  $('#draftName').value=draft.name;$('#promptEditor').value=draft.prompt;$('#draftNotes').value=draft.notes;
  updateEditorCounters();renderLab();renderLint();saveState();renderLibrary();
  toast(t('recipeCreated'));
}
function shotNo(i) { return 'SC '+String(i+1).padStart(3,'0'); }
function insertBoardToAgent() {
  const shots=boardContextEntries();
  if (!shots.length) {toast(t('boardEmptyExport'));return;}
  agent.context={kind:'board'};openAgent();
  pushMessage({id:uid(),role:'note',text:t('boardContextInserted',{n:shots.length}),spin:false});
  renderAgentContext();
}
function renderPrintSheet() {
  const rows=boardRows();
  $('#printSheet').innerHTML=`<header><h1>FRAME · ${escapeHTML(t('sequenceTitle'))}</h1><p>${escapeHTML(dateLabel(now()))} · ${escapeHTML(t('boardResults',{n:rows.length}))}</p></header>`+rows.map(r=>`<section class="print-shot"><h2>${shotNo(r.no-1)} · ${escapeHTML(r.title)}</h2><p class="print-meta">${escapeHTML([r.model,r.duration,r.aspect,r.category].filter(Boolean).join(' · '))}</p><pre>${escapeHTML(r.prompt)}</pre><p class="print-note"><b>${escapeHTML(t('boardNote'))}:</b> ${escapeHTML(r.continuity_note||'—')}</p>${r.author||r.source_link?`<p class="print-src">${escapeHTML([r.author,r.source_link].filter(Boolean).join(' · '))}</p>`:''}</section>`).join('');
}
function printBoard() {
  if (!boardRows().length) {toast(t('boardEmptyExport'));return;}
  renderPrintSheet();document.body.classList.add('printing-board');
  window.print();
  document.body.classList.remove('printing-board');
}
function renderFeatured() {
  const visible=ui.view==='library'&&!ui.q.trim()&&!ui.category&&!ui.model&&!ui.duration&&!ui.aspect&&!ui.tag&&ui.sort==='source';
  $('#featuredScene').hidden=!visible;
  if (!visible) return;
  const item=ITEMS.get(FEATURED_ID), img=$('#featuredImage');
  if (img.dataset.id!==item.id) { img.dataset.id=item.id;img.src=item.thumb;img.alt=titleFor(item); }
  $('#featuredName').textContent=titleFor(item);
}
function assetStatsHTML() {
  const groups=state.assets.length;
  const images=state.assets.reduce((n,a)=>n+a.images.length,0);
  const bytes=new Blob([JSON.stringify(state.assets)]).size;
  const size=bytes>=1048576?(bytes/1048576).toFixed(1)+' MB':Math.max(1,Math.round(bytes/1024))+' KB';
  return `<div class="stat-item"><b>${groups}</b><span>${t('assetGroups')}</span></div><div class="stat-item"><b>${images}</b><span>${t('assetImages')}</span></div><div class="stat-item"><b>${size}</b><span>${t('assetStorage')}</span></div>`;
}
function renderLibrary() {
  renderFeatured();
  syncFilterAffordances();
  const isAsset=ui.view==='assets';
  const isBoard=ui.view==='sequence';
  const isMood=ui.view==='moodboard';
  const folder=state.folders.find(f=>f.id===ui.folderId);
  const label=ui.view==='folder'?(folder?.name||t('ungrouped')):t(ui.view==='recent'?'recentView':ui.view);
  $('#breadcrumbCurrent').textContent=label;
  $('#viewTitle').textContent=ui.view==='library'?t('libraryTitle'):isAsset?t('assetsTitle'):isBoard?t('sequenceTitle'):isMood?t('moodTitle'):ui.view==='recent'?t('recentTitle'):label;
  $('#viewEyebrow').textContent={library:'THE INSPIRATION LIBRARY',favorites:'CURATED BY YOU',drafts:'IDEAS IN PROGRESS',folder:'YOUR CREATIVE COLLECTION',assets:'YOUR ASSET SHELF',recent:'RECENTLY USED',sequence:'THE SHOOTING BOARD',moodboard:'ELEMENT REVERSE INDEX'}[ui.view];
  $('#viewDescription').textContent=isMood?t('moodDescription',{total:CATALOG.length}):t({library:'libraryDescription',favorites:'favoritesDescription',drafts:'draftsDescription',folder:'folderDescription',assets:'assetsDescription',recent:'recentDescription',sequence:'sequenceDescription'}[ui.view]);
  $('#libraryStats').hidden=!(ui.view==='library'||isAsset||isMood);
  $('#libraryStats').classList.toggle('asset-stats',isAsset);
  $('#libraryStats').innerHTML=isMood?`<div class="stat-item"><b>${moodIndex().byTerm.size}</b><span>${t('moodElements')}</span></div><div class="stat-item"><b>${CATALOG.length}</b><span>${t('moodWall')}</span></div><div class="stat-item"><b>${ui.moodSel.size}</b><span>${t('moodPicked')}</span></div>`:isAsset?assetStatsHTML():`<div class="stat-item"><b>${CATALOG.length}</b><span>${t('statPrompts')}</span></div><div class="stat-item"><b>${categories.length}</b><span>${t('statCategories')}</span></div><div class="stat-item"><b>${Object.keys(state.favorites).length}</b><span>${t('statFavorites')}</span></div>`;
  $('#headingTools').innerHTML=isAsset?`<button class="button primary asset-new" data-action="open-agent">${icon('spark')}<span>${t('assetGenCta')}</span></button>`:isBoard?`<button class="button primary" id="boardAddCurrent">${icon('edit')}<span>${t('boardAddCurrent')}</span></button><button class="button" id="boardToAgent">${icon('spark')}<span>${t('boardToAgent')}</span></button><button class="button" id="boardPrint">${icon('printer')}<span>${t('boardPrint')}</span></button><span class="board-export-group"><button class="button" data-board-export="csv">${icon('download')}<span>${t('boardExportCsv')}</span></button><button class="button" data-board-export="json">${icon('download')}<span>${t('boardExportJson')}</span></button><button class="button" data-board-export="md">${icon('download')}<span>${t('boardExportMd')}</span></button></span><button class="button board-lint-toggle" id="boardLintToggle" aria-expanded="false" aria-controls="boardLint">${icon('film')}<span>${t('boardLint')}</span><span class="board-lint-count" hidden></span></button><label class="board-budget"><span>${t('boardBudget')}</span><input id="boardBudget" type="number" min="5" max="600" step="5" value="${state.settings.boardBudget}" aria-label="${escapeHTML(t('boardBudget'))}"><span>s</span></label>`:folder?`<button class="icon-button" data-rename-folder="${escapeHTML(folder.id)}" aria-label="${t('renameFolder')}">${icon('edit')}</button><button class="icon-button" data-delete-folder="${escapeHTML(folder.id)}" aria-label="${t('deleteFolder')}">${icon('trash')}</button>`:ui.view==='library'?`<button class="button recipe-open" id="recipeOpen">${icon('film')}<span>${t('recipeOpen')}</span></button>`:'';
  $('#moodControls').hidden=!isMood;
  if(isMood)renderMoodControls();
  const result=isBoard?boardEntries():isMood?moodItems():filteredItems();
  const pristine=ui.view==='library'&&!ui.q.trim()&&!ui.category&&!ui.model&&!ui.duration&&!ui.aspect&&!ui.tag;
  const curated=pristine&&ui.sort==='source';
  const shown=curated?result.filter(d=>CURATED_RANK.has(d.id)).sort((a,b)=>CURATED_RANK.get(a.id)-CURATED_RANK.get(b.id)):result;
  $('#resultCount').textContent=t(isBoard?'boardResults':isAsset?'assetResults':ui.view==='drafts'?'draftResults':curated?'curatedResults':'results',{n:shown.length});
  $('#kbdHint').textContent=t('kbdHint');
  $('#kbdHint').hidden=window.innerWidth<=760||isMood||isBoard||isAsset||ui.view==='drafts';
  const extra=expandTerms(terms());
  const notes=[];
  if (ui.view==='drafts') notes.push(t('recent'));
  if (ui.aspect&&!isAsset&&!isBoard) notes.push(t('approxRatios'));
  if (extra.length&&!isAsset&&!isBoard&&ui.view!=='drafts') notes.push(t('searchExpanded',{terms:extra.slice(0,4).join(' · ')}));
  if (pristine) notes.push(t(curated?'curatedNote':'allNote',{n:CURATED_IDS.length,total:CATALOG.length}));
  $('#resultNote').textContent=notes.join(' · ');
  $('#curatedToggle').hidden=!pristine||!(ui.sort==='source'||ui.sort==='all');
  $('#curatedToggle').textContent=t(curated?'showAllLibrary':'backToCurated');
  $('#cardGrid').classList.toggle('draft-grid',ui.view==='drafts');
  $('#cardGrid').classList.toggle('asset-grid',isAsset);
  $('#cardGrid').classList.toggle('board-grid',isBoard);
  $('#cardGrid').classList.toggle('mood-grid',isMood);
  $('#cardGrid').dataset.size=isMood?ui.mood.size:'';
  $('#cardGrid').classList.toggle('stagger',!!ui.staggerNext);ui.staggerNext=false;
  $('#cardGrid').innerHTML=shown.slice(0,ui.limit).map(isBoard?boardCard:isAsset?assetCard:isMood?moodCard:ui.view==='drafts'?draftCard:promptCard).join('');
  $('#loadMore').hidden=shown.length<=ui.limit;
  $('#pageCount').textContent=shown.length?t('visibleCount',{n:Math.min(ui.limit,shown.length),total:shown.length}):'';
  $('#emptyState').hidden=!!shown.length;
  if (!shown.length) {
    const filtered=!!(ui.q||ui.category||ui.model||ui.duration||ui.aspect||ui.tag);
    const type=isMood?'moodEmpty':filtered?'noResults':isBoard?'noBoard':isAsset?'noAssets':ui.view==='drafts'?'noDrafts':ui.view==='recent'?'noRecent':'noFavorites';
    const action=isMood?'data-action="mood-reset"':filtered?'data-action="reset"':isBoard?'data-view="library"':isAsset?'data-action="open-agent"':ui.view==='drafts'?'data-action="new-draft"':'data-view="library"';
    const actionLabel=isMood?'moodReset':filtered?'reset':isBoard?'browseLibrary':isAsset?'openAgentAction':ui.view==='drafts'?'newDraft':'browseLibrary';
    $('#emptyState').innerHTML=`<div class="empty-icon">${icon(isMood?'grid':filtered?'search':isBoard?'film':isAsset?'layers':ui.view==='drafts'?'edit':ui.view==='recent'?'history':'heart')}</div><h2>${t(type)}</h2><p>${t(type+'Hint')}</p><button class="button" ${action}>${t(actionLabel)}</button>`;
  }
  renderBoardLint();
  applyKbdFocus();
}
function applyKbdFocus(scroll=false) {
  $$('#cardGrid .kbd-focus').forEach(el=>el.classList.remove('kbd-focus'));
  if(ui.focusIndex<0)return;
  const cards=$$('#cardGrid .prompt-card');
  if(ui.focusIndex>=cards.length)ui.focusIndex=cards.length-1;
  const el=cards[ui.focusIndex];
  if(!el){ui.focusIndex=-1;return;}
  el.classList.add('kbd-focus');
  if(scroll)el.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function setView(view,folderId=null) {
  ui.view=view;ui.folderId=folderId;ui.category='';ui.model='';ui.duration='';ui.aspect='';ui.tag='';ui.q='';ui.limit=PAGE_SIZE;ui.staggerNext=true;ui.focusIndex=-1;ui.moodSel.clear();
  $('#searchInput').value='';
  document.body.classList.remove('sidebar-visible');
  syncDrawers();renderNav();renderFilters();renderLibrary();$('#contentScroll').scrollTop=0;
}
function toggleFavorite(id) {
  if (state.favorites[id]) {
    const removed=clone(state.favorites[id]);
    delete state.favorites[id];
    saveState();renderNav();renderFilters();renderLibrary();renderOrganization();
    if (ui.previewId===id) renderPreviewFavorite();
    toast(t('favoriteRemoved'),{label:t('undo'),run:()=>{state.favorites[id]=removed;saveState();renderNav();renderFilters();renderLibrary();renderOrganization();if(ui.previewId===id)renderPreviewFavorite();toast(t('undone'));}});
    return;
  }
  state.favorites[id]={folderId:null,tags:[],createdAt:now()};
  saveState();renderNav();renderFilters();renderLibrary();renderOrganization();
  if (ui.previewId===id) renderPreviewFavorite();
}
function ensureFavorite(id) { if (!state.favorites[id]) state.favorites[id]={folderId:null,tags:[],createdAt:now()};return state.favorites[id]; }
function renderOrganization() {
  const draft=currentDraft();const source=draft&&ITEMS.get(draft.sourceId);
  $('#organizeSection').hidden=!source;
  if (!source) return;
  const fav=state.favorites[source.id];
  $('#editorFavorite').innerHTML=icon('heart')+t(fav?'favorited':'favorite');
  $('#editorFavorite').classList.toggle('is-favorite',!!fav);
  $('#editorFavorite').setAttribute('aria-pressed',String(!!fav));
  selectOptions($('#editorFolder'),[['',fav?t('ungrouped'):t('saveToFolder')],...state.folders.map(f=>[f.id,f.name])],fav?.folderId||'');
  $('#editorTags').innerHTML=(fav?.tags||[]).map(tag=>`<button class="user-tag" data-remove-tag="${escapeHTML(tag)}" aria-label="${escapeHTML(t('removeTag')+': '+tag)}">${escapeHTML(tag)}${icon('close')}</button>`).join('');
}
function selectEditorTab(tab) {
  ui.editorTab=tab;
  for (const [key,id] of [['edit','editPane'],['reference','referencePane'],['versions','versionsPane'],['lint','lintPane']]) {
    $('#'+id).hidden=key!==tab;
    const button=$(`[data-tab="${key}"]`);button.classList.toggle('active',key===tab);button.setAttribute('aria-selected',String(key===tab));button.tabIndex=key===tab?0:-1;
  }
}
function renderEditor() {
  const draft=currentDraft();
  $('#editorEmpty').hidden=!!draft;
  $('#editorContent').hidden=!draft;
  $('#editorFooter').hidden=!draft;
  if (!draft) return;
  $('#draftName').value=draft.name;
  $('#promptEditor').value=draft.prompt;
  $('#draftNotes').value=draft.notes;
  updateEditorCounters();renderLab();renderLint();
  const source=ITEMS.get(draft.sourceId);
  $('#editorSource').hidden=!source;
  if (source) $('#editorSource').innerHTML=`<img src="${escapeHTML(source.thumb)}" alt=""><div class="source-info"><span>${t('original')} · ${escapeHTML(source.model)}</span><strong>${escapeHTML(titleFor(source))}</strong><button class="text-button" data-preview="${escapeHTML(source.id)}">${t('sourceDetails')}${icon('arrow')}</button></div>`;
  renderOrganization();
  $('#referenceText').textContent=source?.prompt||t('noReference');
  $('#referenceMeta').textContent=source?[titleFor(source),source.duration,source.aspect,source.author].join(' · '):'';
  $('#copyOriginal').disabled=!source;
  renderVersions();selectEditorTab(ui.editorTab);
  $('#saveStatus').textContent=t(storageProblem||'autosaved');
}
function updateEditorCounters() {
  const draft=currentDraft();if (!draft) return;
  $('#promptLength').textContent=t('chars',{n:draft.prompt.length});
  $('#copyDraft').disabled=!draft.prompt.trim();
  $('#saveVersion').disabled=!draft.prompt.trim();
}
function syncDrawers() {
  const narrow=window.innerWidth<=1180;
  document.body.classList.toggle('editor-collapsed',!ui.editorOpen);
  document.body.classList.toggle('editor-visible',ui.editorOpen);
  document.body.classList.toggle('agent-visible',ui.agentOpen);
  $('#editorToggle').setAttribute('aria-expanded',String(ui.editorOpen));
  $('#editorPanel').inert=!ui.editorOpen;
  $('#agentPanel').inert=!ui.agentOpen;
  $('#agentLauncher').setAttribute('aria-expanded',String(ui.agentOpen));
  const sideOpen=document.body.classList.contains('sidebar-visible')&&window.innerWidth<=760;
  const overlay=narrow&&(ui.editorOpen||ui.agentOpen);
  $('#sidebar').inert=window.innerWidth<=760&&!sideOpen||overlay;
  $('#main').inert=overlay||sideOpen;
  $('#drawerScrim').hidden=!(overlay||sideOpen);
}
function openEditor() { ui.editorOpen=true;ui.agentOpen=false;document.body.classList.remove('sidebar-visible');syncDrawers(); }
function startDraft(sourceId=null) {
  saveState();
  const active=currentDraft();
  if (sourceId&&active?.sourceId===sourceId) { openEditor();return; }
  if (state.drafts.length>=500) { toast(t('saveFailed'));return; }
  const source=ITEMS.get(sourceId);const timestamp=now();
  if (source) touchRecent(source.id);
  const draft={id:uid(),sourceId:source?.id||null,name:source?titleFor(source):t('untitled'),prompt:source?.prompt||'',notes:'',createdAt:timestamp,updatedAt:timestamp,versions:[],baseVersionId:null};
  state.drafts.unshift(draft);state.activeDraftId=draft.id;ui.editorTab='edit';
  saveState();renderNav();renderEditor();renderLibrary();openEditor();toast(t(source?'templateLoaded':'draftCreated'));$('#draftName').focus();
}
function openDraft(id) { saveState();state.activeDraftId=id;ui.editorTab='edit';saveState();renderEditor();renderLibrary();openEditor(); }
function updateDraft(field,value) { const draft=currentDraft();if (!draft) return;draft[field]=value;draft.updatedAt=now();updateEditorCounters();if(field==='prompt'){clearTimeout(labTimer);labTimer=setTimeout(()=>{renderLab();renderLint();},120);}queueSave(); }
function takeAvg(k) { return TAKE_SCORE_KEYS.reduce((s,key)=>s+(k.scores[key]||0),0)/TAKE_SCORE_KEYS.length; }
function findTake(takeId) {
  const draft=currentDraft();if(!draft)return null;
  for(const v of draft.versions){const k=v.takes.find(x=>x.id===takeId);if(k)return {version:v,take:k};}
  return null;
}
function bestTakeFor(sourceId) {
  let best=null;
  for(const d of state.drafts){if(d.sourceId!==sourceId)continue;for(const v of d.versions)for(const k of v.takes)if(k.best&&(!best||takeAvg(k)>takeAvg(best)))best=k;}
  return best;
}
function takeBadge(item) { const k=bestTakeFor(item.id);return k?`<span class="take-badge" title="${escapeHTML(t('takeBadgeTitle'))}">${icon('star')}${takeAvg(k).toFixed(1)}</span>`:''; }
function versionTree(draft) {
  const byParent=new Map();
  for(const v of draft.versions){const p=v.parentId||'';if(!byParent.has(p))byParent.set(p,[]);byParent.get(p).push(v);}
  const out=[],seen=new Set();
  const walk=(parent,depth)=>{for(const v of byParent.get(parent)||[]){out.push({v,depth});seen.add(v.id);walk(v.id,depth+1);}};
  walk('',0);
  for(const v of draft.versions)if(!seen.has(v.id))out.push({v,depth:0});
  return out;
}
function takeRowHTML(v,k) {
  const avg=takeAvg(k).toFixed(1);
  const checked=ui.compareSel.includes(k.id);
  const play=safeLink(k.url)?`<a class="icon-button take-play" href="${escapeHTML(safeLink(k.url))}" target="_blank" rel="noopener noreferrer" title="${escapeHTML(t('takeOpen'))}" aria-label="${escapeHTML(t('takeOpen'))}">${icon('play')}</a>`:'';
  return `<div class="take-row ${k.best?'is-best':''}" data-take-row="${escapeHTML(k.id)}"><label class="take-check" title="${escapeHTML(t('takeCompare'))}"><input type="checkbox" data-take-select="${escapeHTML(k.id)}" ${checked?'checked':''} aria-label="${escapeHTML(t('takeCompare')+': '+(k.label||t('takeUntitled')))}"><span aria-hidden="true">${icon('check')}</span></label><button class="icon-button take-best ${k.best?'on':''}" data-take-best="${escapeHTML(v.id)}:${escapeHTML(k.id)}" title="${escapeHTML(t(k.best?'takeBestOff':'takeBest'))}" aria-label="${escapeHTML(t(k.best?'takeBestOff':'takeBest'))}" aria-pressed="${k.best}">${icon('star')}</button><div class="take-main"><strong>${escapeHTML(k.label||t('takeUntitled'))}</strong><span class="take-avg" title="${escapeHTML(t('takeAvg'))}">${avg}</span>${k.notes?`<p class="take-notes">${escapeHTML(k.notes)}</p>`:''}</div><div class="take-actions">${play}<button class="icon-button" data-take-edit="${escapeHTML(v.id)}:${escapeHTML(k.id)}" title="${escapeHTML(t('takeEdit'))}" aria-label="${escapeHTML(t('takeEdit'))}">${icon('edit')}</button><button class="icon-button" data-take-del="${escapeHTML(v.id)}:${escapeHTML(k.id)}" title="${escapeHTML(t('takeDelete'))}" aria-label="${escapeHTML(t('takeDelete'))}">${icon('trash')}</button></div></div>`;
}
function renderVersions() {
  const draft=currentDraft();if (!draft) return;
  $('#versionCount').textContent=draft.versions.length;
  ui.compareSel=ui.compareSel.filter(id=>findTake(id));
  const hasTakes=draft.versions.some(v=>v.takes.length);
  $('#takeCompareBar').hidden=!hasTakes;
  if (hasTakes) $('#takeCompareBar').innerHTML=`<span class="take-sel-count">${t('takeSelected',{n:ui.compareSel.length})}</span><button class="button" id="takeCompareOpen" ${ui.compareSel.length===2?'':'disabled'}>${icon('film')}<span>${t('takeCompare')}</span></button><span class="take-bar-hint">${t('takeCompareHint')}</span>`;
  $('#versionsList').innerHTML=draft.versions.length?versionTree(draft).map(({v,depth})=>{
    const isBase=draft.baseVersionId===v.id;
    const takes=v.takes.length?`<div class="take-list">${v.takes.map(k=>takeRowHTML(v,k)).join('')}</div>`:`<p class="take-none">${t('takeNone')}</p>`;
    return `<article class="version-item ${isBase?'is-base':''}" style="--depth:${Math.min(depth,6)}" data-version-node="${escapeHTML(v.id)}"><div class="version-heading"><span class="version-node" aria-hidden="true"></span><strong>${escapeHTML(v.name)}</strong>${isBase?`<span class="base-chip">${t('baseVersion')}</span>`:''}<span>${dateLabel(v.createdAt)}</span></div><p>${escapeHTML(v.prompt.slice(0,100))}</p>${takes}<div class="version-actions"><button class="text-button" data-diff-version="${escapeHTML(v.id)}">${icon('copy')}${t('diffVersion')}</button><button class="text-button" data-restore-version="${escapeHTML(v.id)}">${icon('history')}${t('restore')}</button><button class="text-button" data-branch-version="${escapeHTML(v.id)}">${icon('branch')}${t('branchVersion')}</button><button class="text-button take-add" data-take-add="${escapeHTML(v.id)}">${icon('star')}${t('takeAdd')}</button></div></article>`;
  }).join(''):`<div class="empty-versions">${icon('history')}<h3>${t('noVersions')}</h3><p>${t('noVersionsHint')}</p></div>`;
}
function openTakeDialog(versionId,takeId=null) {
  const draft=currentDraft();const v=draft?.versions.find(x=>x.id===versionId);if(!v)return;
  if(!takeId&&v.takes.length>=20){toast(t('takeLimit'));return;}
  const k=takeId?v.takes.find(x=>x.id===takeId):null;
  ui.takeEdit={versionId,takeId};
  $('#takeDialogTitle').textContent=t(k?'takeEdit':'takeDialogTitle');
  $('#takeLabel').value=k?.label||'';$('#takeUrl').value=k?.url||'';$('#takeNotes').value=k?.notes||'';$('#takeError').textContent='';
  $('#takeSliders').innerHTML=TAKE_SCORE_KEYS.map(key=>`<div class="take-slider"><label class="field-label" for="takeScore-${key}">${t('takeScore_'+key)}</label><input type="range" id="takeScore-${key}" min="0" max="5" step="0.5" value="${k?k.scores[key]:3}"><output for="takeScore-${key}">${(k?k.scores[key]:3).toFixed(1)}</output></div>`).join('');
  $('#takeDialog').showModal();$('#takeLabel').focus();
}
function saveTakeFromDialog() {
  const draft=currentDraft();const edit=ui.takeEdit;if(!draft||!edit)return;
  const v=draft.versions.find(x=>x.id===edit.versionId);if(!v)return;
  const url=$('#takeUrl').value.trim();
  if(url&&!safeLink(url)){$('#takeError').textContent=t('takeUrlInvalid');return;}
  const scores={};for(const key of TAKE_SCORE_KEYS)scores[key]=Number($('#takeScore-'+key).value);
  const data={url,label:$('#takeLabel').value.trim(),scores,notes:$('#takeNotes').value.trim()};
  if(edit.takeId){const k=v.takes.find(x=>x.id===edit.takeId);if(k)Object.assign(k,data);}
  else v.takes.push({id:uid(),...data,best:false,createdAt:now()});
  draft.updatedAt=now();saveState();$('#takeDialog').close();renderVersions();renderLibrary();toast(t('takeSaved'));
}
function toggleTakeBest(versionId,takeId) {
  const draft=currentDraft();const v=draft?.versions.find(x=>x.id===versionId);const k=v?.takes.find(x=>x.id===takeId);if(!k)return;
  const turnOn=!k.best;
  for(const x of v.takes)x.best=false;
  k.best=turnOn;
  saveState();renderVersions();renderLibrary();
}
function deleteTake(versionId,takeId) {
  const draft=currentDraft();const v=draft?.versions.find(x=>x.id===versionId);if(!v)return;
  const index=v.takes.findIndex(x=>x.id===takeId);if(index<0)return;
  const [removed]=v.takes.splice(index,1);
  ui.compareSel=ui.compareSel.filter(id=>id!==takeId);
  saveState();renderVersions();renderLibrary();
  toast(t('takeDeleted'),{label:t('undo'),run:()=>{const target=currentDraft()?.versions.find(x=>x.id===versionId);if(!target)return;target.takes.splice(Math.min(index,target.takes.length),0,removed);saveState();renderVersions();renderLibrary();toast(t('undone'));}});
}
function toggleTakeSelect(takeId,checked) {
  if(checked){ui.compareSel=[...ui.compareSel.filter(id=>id!==takeId),takeId].slice(-2);}
  else ui.compareSel=ui.compareSel.filter(id=>id!==takeId);
  renderVersions();
}
function openTakeCompare() {
  const picks=ui.compareSel.map(findTake).filter(Boolean);
  if(picks.length!==2)return;
  $('#takeCompareGrid').innerHTML=picks.map(({version,take:k})=>{
    const url=safeLink(k.url);
    const media=url?`<video controls playsinline preload="metadata" src="${escapeHTML(url)}"></video>`:`<div class="take-compare-novideo">${icon('film')}<span>${t('takeNoVideo')}</span></div>`;
    const rows=TAKE_SCORE_KEYS.map(key=>`<div class="compare-score"><span>${t('takeScore_'+key)}</span><span class="compare-bar"><i style="width:${k.scores[key]/5*100}%"></i></span><b>${k.scores[key].toFixed(1)}</b></div>`).join('');
    return `<section class="take-compare-col ${k.best?'is-best':''}"><header><strong>${escapeHTML(k.label||t('takeUntitled'))}</strong>${k.best?`<span class="base-chip best-chip">${icon('star')}${t('takeBest')}</span>`:''}</header><p class="take-compare-version">${escapeHTML(version.name)} · ${dateLabel(k.createdAt)}</p>${media}<div class="compare-scores">${rows}<div class="compare-score total"><span>${t('takeAvg')}</span><b>${takeAvg(k).toFixed(1)}</b></div></div>${k.notes?`<p class="take-compare-notes">${escapeHTML(k.notes)}</p>`:''}</section>`;
  }).join('');
  $('#takeCompare').showModal();
}
function openForm({title,description='',value='',label='',confirm='confirm',input=true,onConfirm}) {
  $('#formTitle').textContent=title;$('#formDescription').textContent=description;$('#formDescription').hidden=!description;
  $('#formInput').hidden=!input;$('#formLabel').hidden=!input;$('#formLabel').textContent=label||t('formInputLabel');
  $('#formInput').value=value;$('#formInput').required=input;$('#formError').textContent='';$('#formSubmit').textContent=t(confirm);
  formCallback=onConfirm;$('#formDialog').showModal();if(input){$('#formInput').focus();$('#formInput').select();}else $('#formSubmit').focus();
}
function saveVersion() {
  const draft=currentDraft();if (!draft||!draft.prompt.trim()) return;
  if (draft.versions.length>=200) {toast(t('versionLimit'));return;}
  openForm({title:t('saveVersion'),label:t('versionName'),value:t('versionDefault',{n:draft.versions.length+1}),onConfirm:async name=>{
    await changeState(next=>{
      const target=next.drafts.find(d=>d.id===draft.id);
      const id=uid();
      const parentId=target.baseVersionId||target.versions[target.versions.length-1]?.id||null;
      target.versions.push({id,name,prompt:target.prompt,notes:target.notes,createdAt:now(),parentId,takes:[]});target.baseVersionId=id;target.updatedAt=now();
    });
    renderVersions();renderLibrary();toast(t('versionSaved'));
  }});
}
function restoreVersion(id,asBranch=false) {
  const draft=currentDraft();const v=draft?.versions.find(x=>x.id===id);if(!v)return;
  if(draft.versions.length>=200){toast(t('versionLimit'));return;}
  openForm({title:t(asBranch?'branchVersion':'restoreTitle'),description:t('restoreHint'),input:false,onConfirm:async()=>{
    await changeState(next=>{
      const target=next.drafts.find(d=>d.id===draft.id);
      const parentId=target.baseVersionId||target.versions[target.versions.length-1]?.id||null;
      target.versions.push({id:uid(),name:t('beforeRestore'),prompt:target.prompt,notes:target.notes,createdAt:now(),parentId,takes:[]});target.prompt=v.prompt;target.notes=v.notes;target.baseVersionId=v.id;target.updatedAt=now();
    });
    ui.editorTab='edit';renderEditor();renderLibrary();toast(t(asBranch?'branched':'restored'));
  }});
}
function diffSegments(text) {
  if (text.includes('\n')) return {segs:text.split('\n'),lineMode:true};
  const sentences=text.match(/[^。！？.!?；;]+[。！？.!?；;]?/g);
  if (sentences&&sentences.length>1) return {segs:sentences,lineMode:false};
  return {segs:[...text],lineMode:false};
}
function computeDiff(oldText,newText) {
  const {segs:a,lineMode}=diffSegments(oldText),{segs:b}=diffSegments(newText);
  const n=a.length,m=b.length;
  let rows,added=0,removed=0;
  if (n*m>4000000) {
    rows=[{type:'del',text:oldText},{type:'add',text:newText}];removed=n;added=m;
  } else {
    const dp=new Uint32Array((n+1)*(m+1));
    for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)dp[i*(m+1)+j]=a[i]===b[j]?dp[(i+1)*(m+1)+j+1]+1:Math.max(dp[(i+1)*(m+1)+j],dp[i*(m+1)+j+1]);
    rows=[];let i=0,j=0;
    while(i<n&&j<m){
      if(a[i]===b[j]){rows.push({type:'same',text:a[i]});i++;j++;}
      else if(dp[(i+1)*(m+1)+j]>=dp[i*(m+1)+j+1]){rows.push({type:'del',text:a[i]});removed++;i++;}
      else {rows.push({type:'add',text:b[j]});added++;j++;}
    }
    while(i<n){rows.push({type:'del',text:a[i]});removed++;i++;}
    while(j<m){rows.push({type:'add',text:b[j]});added++;j++;}
  }
  const merged=[];
  for(const r of rows){const last=merged[merged.length-1];if(last&&last.type===r.type)last.text+=(lineMode?'\n':'')+r.text;else merged.push({...r});}
  return {rows:merged,added,removed};
}
function openVersionDiff(id) {
  const draft=currentDraft();const v=draft?.versions.find(x=>x.id===id);if(!v)return;
  const {rows,added,removed}=computeDiff(v.prompt,draft.prompt);
  $('#diffSummary').textContent=t('diffSummary',{name:v.name,added,removed});
  $('#diffBody').innerHTML=added||removed?rows.map(r=>`<div class="diff-line diff-${r.type}"><span class="diff-sign">${r.type==='add'?'+':r.type==='del'?'−':''}</span><span class="diff-text">${escapeHTML(r.text)||'&nbsp;'}</span></div>`).join(''):`<p class="diff-identical">${t('diffIdentical')}</p>`;
  $('#diffDialog').showModal();
}
function folderForm(id=null) {
  const folder=state.folders.find(f=>f.id===id);
  openForm({title:t(folder?'renameFolder':'newFolder'),label:t('folderName'),value:folder?.name||'',description:folder?'':t('folderPlaceholder'),onConfirm:async name=>{
    await changeState(next=>{
      if(next.folders.some(f=>f.id!==id&&f.name.toLowerCase()===name.toLowerCase()))throw new Error(t('folderExists'));
      if(folder)next.folders.find(f=>f.id===id).name=name;else {if(next.folders.length>=200)throw new Error(t('saveFailed'));next.folders.push({id:uid(),name,createdAt:now()});}
    });
    renderNav();renderLibrary();renderOrganization();toast(t(folder?'folderRenamed':'folderCreated'));
  }});
}
function deleteFolder(id) {
  openForm({title:t('deleteFolder'),description:t('deleteFolderHint'),input:false,onConfirm:async()=>{
    const removed=clone(state.folders.find(f=>f.id===id));
    const affected=Object.entries(state.favorites).filter(([,f])=>f.folderId===id).map(([fid])=>fid);
    await changeState(next=>{next.folders=next.folders.filter(f=>f.id!==id);Object.values(next.favorites).forEach(f=>{if(f.folderId===id)f.folderId=null;});});
    if(ui.view==='folder'&&ui.folderId===id)setView('favorites');else{renderNav();renderLibrary();}renderOrganization();
    toast(t('deleted'),{label:t('undo'),run:async()=>{
      await changeState(next=>{next.folders.push(removed);affected.forEach(fid=>{if(next.favorites[fid])next.favorites[fid].folderId=removed.id;});});
      renderNav();renderLibrary();renderOrganization();toast(t('undone'));
    }});
  }});
}
function deleteDraft(id) {
  openForm({title:t('deleteDraftTitle'),description:t('deleteDraftHint'),input:false,onConfirm:async()=>{
    const index=state.drafts.findIndex(d=>d.id===id);
    const removed=clone(state.drafts[index]);
    const wasActive=state.activeDraftId===id;
    await changeState(next=>{next.drafts=next.drafts.filter(d=>d.id!==id);if(next.activeDraftId===id)next.activeDraftId=null;});
    renderNav();renderLibrary();renderEditor();
    toast(t('deleted'),{label:t('undo'),run:async()=>{
      await changeState(next=>{next.drafts.splice(Math.min(index,next.drafts.length),0,removed);if(wasActive)next.activeDraftId=removed.id;});
      renderNav();renderLibrary();renderEditor();toast(t('undone'));
    }});
  }});
}
function addTag() {
  const draft=currentDraft();if(!draft?.sourceId)return;
  const value=$('#tagInput').value.trim();if(!value)return;
  const favorite=ensureFavorite(draft.sourceId);
  if(!favorite.tags.includes(value)){if(favorite.tags.length>=30){toast(t('tagLimit'));return;}favorite.tags.push(value);}
  $('#tagInput').value='';saveState();renderOrganization();renderNav();renderFilters();renderLibrary();toast(t('savedTag'));$('#tagInput').focus();
}
function currentAsset() { return state.assets.find(a => a.id === ui.assetId); }
function openAsset(id) {
  if (!state.assets.some(a => a.id === id)) return;
  ui.assetId=id;renderAssetDialog();$('#assetDialog').showModal();
}
function renderAssetDialog() {
  const a=currentAsset();
  if (!a) { $('#assetDialog').close();return; }
  $('#assetName').value=a.name;
  $('#assetMeta').textContent=[dateLabel(a.createdAt),a.sourceTitle||t('assetFromAgent'),skillName(a.skill),a.images.length?t('assetCountLabel',{n:a.images.length}):t('assetPromptOnly')].filter(Boolean).join(' · ');
  $('#assetGallery').innerHTML=a.images.length?a.images.map((im,i)=>`<figure class="asset-figure"><img src="${escapeHTML(im.src)}" alt="${escapeHTML(im.caption)}" loading="lazy" decoding="async"><figcaption><span>${escapeHTML(im.caption)}</span><button class="text-button" data-asset-download="${escapeHTML(a.id)}:${i}">${icon('download')}${t('assetDownloadImage')}</button></figcaption>${im.prompt?`<details class="asset-spec"><summary>${t('assetSpecPrompt')}</summary><p>${escapeHTML(im.prompt)}</p><button class="text-button" data-asset-img-copy="${escapeHTML(a.id)}:${i}">${icon('copy')}${t('assetCopyPrompt')}</button></details>`:''}</figure>`).join(''):`<div class="asset-no-images">${icon('image')}<span>${t('assetEmptyGallery')}</span></div>`;
  $('#assetPrompt').value=a.prompt;
  $('#assetPromptLength').textContent=t('chars',{n:a.prompt.length});
}
function updateAsset(field,value) {
  const a=currentAsset();if (!a) return;
  a[field]=value;a.updatedAt=now();queueSave();
}
function deleteAsset(id) {
  if (!state.assets.some(a => a.id === id)) return;
  openForm({title:t('assetDeleteTitle'),description:t('assetDeleteHint'),input:false,onConfirm:async()=>{
    const index=state.assets.findIndex(a=>a.id===id);
    const removed=clone(state.assets[index]);
    await changeState(next=>{next.assets=next.assets.filter(a=>a.id!==id);});
    if (ui.assetId===id) { $('#assetDialog').close();ui.assetId=null; }
    if (agent.context?.kind==='asset'&&agent.context.id===id) { agent.context=null;renderAgentContext(); }
    renderNav();renderLibrary();
    toast(t('deleted'),{label:t('undo'),run:async()=>{
      await changeState(next=>{next.assets.splice(Math.min(index,next.assets.length),0,removed);});
      renderNav();renderLibrary();toast(t('undone'));
    }});
  }});
}
function applyAssetPrompt(id) {
  const a=state.assets.find(x=>x.id===id);if (!a) return;
  if (!a.prompt.trim()) { toast(t('emptyPrompt'));return; }
  let draft=currentDraft();
  if (!draft) { startDraft(a.sourceId);draft=currentDraft(); }
  if (!draft) return;
  draft.prompt=a.prompt;draft.updatedAt=now();
  saveState();renderEditor();renderLibrary();openEditor();
  $('#assetDialog').close();toast(t('assetApplied'));
}
function insertAssetToAgent(id) {
  if (!state.assets.some(a => a.id === id)) return;
  agent.context={kind:'asset',id};openAgent();
  pushMessage({id:uid(),role:'note',text:t('assetInserted'),spin:false});renderAgentContext();
}
async function downloadAssetImage(ref) {
  const [id,idx]=ref.split(':');
  const im=state.assets.find(a=>a.id===id)?.images[Number(idx)];
  if (!im?.src) return;
  const link=document.createElement('a');
  if (im.src.startsWith('data:')) link.href=im.src;
  else {
    try { const blob=await (await relayFetch(im.src)).blob();link.href=URL.createObjectURL(blob);setTimeout(()=>URL.revokeObjectURL(link.href),5000); }
    catch { window.open(im.src,'_blank','noopener');return; }
  }
  link.download=`frame-asset-${Number(idx)+1}.jpg`;document.body.append(link);link.click();link.remove();
}
async function compressImage(src) {
  let blobUrl='';
  try {
    let url=src;
    if (RELAY&&/^https?:/i.test(src)) {
      try { blobUrl=URL.createObjectURL(await (await relayFetch(src)).blob());url=blobUrl; } catch {}
    }
    const img=new Image();
    if (/^https?:/i.test(url)) img.crossOrigin='anonymous';
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;});
    const scale=Math.min(1,1280/Math.max(img.naturalWidth,img.naturalHeight));
    const w=Math.max(1,Math.round(img.naturalWidth*scale)),h=Math.max(1,Math.round(img.naturalHeight*scale));
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    canvas.getContext('2d').drawImage(img,0,0,w,h);
    return canvas.toDataURL('image/jpeg',0.85);
  } catch { return src; }
  finally { if (blobUrl) URL.revokeObjectURL(blobUrl); }
}
async function createAssetGroup({name,prompt,sourceId,sourceTitle,images,skill=activeSkill()?.id||''}) {
  const id=uid(),timestamp=now();
  await changeState(next=>{
    if (next.assets.length>=100) throw new Error(t('assetLimit'));
    next.assets.unshift({id,name:name.slice(0,160),prompt,sourceId:sourceId??null,sourceTitle:sourceTitle||'',skill:cleanSkill(skill),createdAt:timestamp,updatedAt:timestamp,images});
  });
  renderNav();if (ui.view==='assets') renderLibrary();
  return id;
}
function saveImagesToAsset(mid) {
  const m=agent.messages.find(x=>x.id===mid);if (!m||m.role!=='images') return;
  const done=m.items.filter(it=>it.state==='done'&&it.src);
  if (!done.length) return;
  openForm({title:t('assetSaveTitle'),label:t('assetName'),value:(m.sourceTitle||contextTitle()||t('agentKeyImages')).slice(0,120),onConfirm:async name=>{
    const images=[];
    for (const it of done) images.push({id:uid(),src:await compressImage(it.src),caption:it.caption||t('agentKeyImages'),prompt:it.prompt||''});
    const id=await createAssetGroup({name,prompt:m.sourcePrompt||'',sourceId:m.sourceId??null,sourceTitle:m.sourceTitle||'',images});
    m.savedAssetId=id;updateMessage(m);toast(t('assetSaved'));
  }});
}
function saveBlockToAsset(blockId) {
  const block=findBlock(blockId);if (!block) return;
  openForm({title:t('assetSaveTitle'),label:t('assetName'),value:(contextTitle()||t('agentImproved')).slice(0,120),onConfirm:async name=>{
    const ctx=agent.context;
    const id=await createAssetGroup({name,prompt:block.text,sourceId:ctx?.kind==='catalog'?ctx.id:null,sourceTitle:ctx?contextTitle():'',images:[]});
    block.savedAssetId=id;
    const msg=agent.messages.find(m=>(m.blocks||[]).some(b=>b.id===blockId));
    if (msg) updateMessage(msg);
    toast(t('assetSaved'));
  }});
}
function renderPreviewFavorite() {
  const favorite=!!state.favorites[ui.previewId];$('#previewFavorite').innerHTML=icon('heart');$('#previewFavorite').classList.toggle('is-favorite',favorite);$('#previewFavorite').setAttribute('aria-label',t(favorite?'removeFavorite':'favorite'));$('#previewFavorite').setAttribute('aria-pressed',String(favorite));
}
function openPreview(id) {
  const d=ITEMS.get(id);if(!d)return;ui.previewId=id;touchRecent(id);
  const oldVideo=$('#previewMedia video');if(oldVideo){oldVideo.pause();oldVideo.removeAttribute('src');oldVideo.load();}
  $('#previewTitle').textContent=titleFor(d);$('#previewAlt').textContent=altTitle(d);$('#previewAlt').hidden=!altTitle(d);
  $('#previewMeta').innerHTML=[categoryName(d.category),d.model,d.duration,d.aspect,d.author].map(v=>`<span class="tag">${escapeHTML(v)}</span>`).join('');
  $('#previewPrompt').textContent=d.prompt;
  const related=relatedShots(id);
  $('#previewRelated').innerHTML=related.length?`<span class="related-label">${icon('layers')}<span>${t('relatedShots')}</span></span><div class="related-row">`+related.map(r=>`<button class="related-shot" data-preview="${escapeHTML(r.id)}" title="${escapeHTML(titleFor(r))}"><img src="${escapeHTML(r.thumb)}" alt="" loading="lazy"><span>${escapeHTML(titleFor(r))}</span></button>`).join('')+`</div>`:'';
  $('#previewMedia').innerHTML=`<img src="${escapeHTML(d.thumb)}" alt="${escapeHTML(titleFor(d))}">`+(safeLink(d.video)?`<button class="video-play-button" id="playPreview">${icon('play')}<span>${t('playVideo')}<small>${t('videoOnline')}</small></span></button>`:'');
  for(const [selector,url] of [['#previewSource',d.source_link],['#previewPage',d.url]]){const el=$(selector);const safe=safeLink(url);el.hidden=!safe;if(safe)el.href=safe;else el.removeAttribute('href');}
  renderPreviewFavorite();if(!$('#previewDialog').open)$('#previewDialog').showModal();
}
function playPreview() {
  const d=ITEMS.get(ui.previewId);const url=safeLink(d?.video);if(!url)return;
  const video=document.createElement('video');video.controls=true;video.playsInline=true;video.poster=d.thumb;video.src=url;
  video.addEventListener('error',()=>{const note=document.createElement('p');note.className='video-error';note.textContent=t('videoFailed');$('#previewMedia').replaceChildren(note);});
  $('#previewMedia').replaceChildren(video);video.play().catch(()=>{});
}
async function copyText(text,editor=null) {
  if(!text.trim()){toast(t('emptyPrompt'));return;}
  try {await navigator.clipboard.writeText(text);toast(t('copied'));}
  catch {
    const area=document.createElement('textarea');area.value=text;area.style.cssText='position:fixed;left:0;top:0;opacity:0;width:1px;height:1px';
    const host=$('dialog[open]')||document.body;host.append(area);area.select();let copied=false;
    try{copied=document.execCommand('copy');}catch{}area.remove();
    if(!copied&&editor){editor.focus();editor.select();}toast(t(copied?'copied':'copyFailed'));
  }
}
function exportBackup() {
  saveState();const payload={format:'frame-studio',version:1,exportedAt:now(),data:state};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='frame-studio-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);toast(t('backupExported'));
}
function legacyState(records) {
  requireArray(records,CATALOG.length);
  const incoming={schema:1,settings:{...state.settings},folders:[],favorites:{},drafts:[],activeDraftId:null};
  for(const r of records){const id=r.id||r.slug;if(!ITEMS.has(id))throw new Error('Unknown legacy item');incoming.favorites[id]={folderId:null,tags:r.tags?cleanTags(r.tags):[],createdAt:now()};}
  return incoming;
}
function parseBackup(content) {
  const input=JSON.parse(content);
  if(Array.isArray(input))return legacyState(input);
  if(input?.format!=='frame-studio'||input.version!==1)throw new Error('Unknown backup');
  return validateState(input.data);
}
function showImportPreview(incoming) {
  pendingImport=incoming;
  $('#importPreview').hidden=false;
  $('#importPreview').innerHTML=`<p>${t('backupReady',{f:Object.keys(incoming.favorites).length,c:incoming.folders.length,d:incoming.drafts.length,a:incoming.assets?.length||0})}</p><div><button class="button primary" id="confirmImport">${t('mergeBackup')}</button><button class="button" id="cancelImport">${t('cancel')}</button></div>`;
}
function mergeIncoming(incoming) {
  const merged=clone(state);const folderMap=new Map();
  for(const f of incoming.folders){let target=merged.folders.find(x=>x.name.toLowerCase()===f.name.toLowerCase());if(!target){target={...f,id:merged.folders.some(x=>x.id===f.id)?uid():f.id};merged.folders.push(target);}folderMap.set(f.id,target.id);}
  for(const [id,f] of Object.entries(incoming.favorites)){
    const local=merged.favorites[id];
    if(local){const tags=[...new Set([...local.tags,...f.tags])];if(tags.length>30)throw new Error('Tag limit');local.tags=tags;if(!local.folderId&&f.folderId)local.folderId=folderMap.get(f.folderId);}
    else merged.favorites[id]={...f,folderId:f.folderId?folderMap.get(f.folderId):null};
  }
  for(const draft of incoming.drafts){const local=merged.drafts.find(x=>x.id===draft.id);if(!local)merged.drafts.push(clone(draft));else if(JSON.stringify(local)!==JSON.stringify(draft))merged.drafts.push({...clone(draft),id:uid(),name:(draft.name+' · '+t('conflictCopy')).slice(0,160)});}
  if(!merged.assets)merged.assets=[];
  for(const a of incoming.assets||[]){const local=merged.assets.find(x=>x.id===a.id);if(!local)merged.assets.push(clone(a));else if(JSON.stringify(local)!==JSON.stringify(a))merged.assets.push({...clone(a),id:uid(),name:(a.name+' · '+t('conflictCopy')).slice(0,160)});}
  if(!merged.board)merged.board=[];
  for(const b of incoming.board||[]){const local=merged.board.find(x=>x.id===b.id);if(!local)merged.board.push(clone(b));else if(JSON.stringify(local)!==JSON.stringify(b))merged.board.push({...clone(b),id:uid()});}
  if(!merged.activeDraftId&&incoming.activeDraftId&&merged.drafts.some(d=>d.id===incoming.activeDraftId))merged.activeDraftId=incoming.activeDraftId;
  const recentMap=new Map((merged.recent||[]).map(r=>[r.id,r.at]));
  for(const r of incoming.recent||[])if(!recentMap.has(r.id)||Date.parse(r.at)>Date.parse(recentMap.get(r.id)))recentMap.set(r.id,r.at);
  merged.recent=[...recentMap.entries()].map(([id,at])=>({id,at})).sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)).slice(0,12);
  return validateState(merged);
}
function discardImport() { importSelection++;pendingImport=null;$('#importPreview').hidden=true; }
async function confirmImport() {
  const button=$('#confirmImport');
  if(!pendingImport||button?.disabled)return;
  const incoming=pendingImport, selection=importSelection;
  if(button)button.disabled=true;
  try {
    const imported=await withStoreLock(()=>{
      if(selection!==importSelection||pendingImport!==incoming)return false;
      let merged;
      try{merged=mergeIncoming(incoming);}catch{throw new Error(t('invalidBackup'));}
      if(!commitState(merged))throw new Error(t(storageProblem));
      clearTimeout(autosaveTimer);state=merged;return true;
    });
    if(imported){discardImport();renderAll();renderBackupStats();toast(t('imported'));}
  } catch(error) {toast(error.message);}
  finally {if(button)button.disabled=false;}
}
function renderBackupStats() {
  $('#backupStats').innerHTML=[[Object.keys(state.favorites).length,'favorites'],[state.folders.length,'collections'],[state.drafts.length,'drafts'],[state.drafts.reduce((n,d)=>n+d.versions.length,0),'versionsTab'],[state.board.length,'sequence'],[state.assets.length,'assets']].map(([n,label])=>`<div><b>${n}</b><span>${t(label)}</span></div>`).join('');
}
function openBackup() {saveState();renderBackupStats();discardImport();$('#backupDialog').showModal();}
function readLegacy() {
  discardImport();
  try {
    const ids=JSON.parse(localStorage.getItem('mmh3_favs_v1')||'[]');const tags=JSON.parse(localStorage.getItem('mmh3_tags_v1')||'{}');
    if(!Array.isArray(ids)||!ids.length){toast(t('noLegacy'));return;}
    showImportPreview(legacyState(ids.map(id=>({id,tags:tags[id]||[]}))));
  }catch{toast(t('invalidBackup'));}
}
function resetFilters() {ui.q='';ui.category='';ui.model='';ui.duration='';ui.aspect='';ui.tag='';ui.sort='source';ui.limit=PAGE_SIZE;$('#searchInput').value='';closeFilterPopover();renderFilters();renderLibrary();}
function closeFilterPopover() {const pop=$('#filterPopover');if(pop.hidden)return;pop.hidden=true;$('#filterToggle').setAttribute('aria-expanded','false');}
function toggleFilterPopover() {const pop=$('#filterPopover');const open=pop.hidden;pop.hidden=!open;$('#filterToggle').setAttribute('aria-expanded',String(open));}
function renderAll() {setStaticText();renderNav();renderFilters();renderLibrary();renderEditor();renderAgentStatus();renderSkillPicker();renderAgentContext();renderThread();if(ui.assetId&&$('#assetDialog').open)renderAssetDialog();syncDrawers();if(guide.open)renderGuideStep();}

function contextTitle() {
  if (!agent.context) return '';
  if (agent.context.kind === 'catalog') return titleFor(ITEMS.get(agent.context.id));
  if (agent.context.kind === 'asset') return state.assets.find(a => a.id === agent.context.id)?.name || t('untitled');
  if (agent.context.kind === 'board') return t('sequence')+' · '+t('boardResults',{n:boardContextEntries().length});
  return state.drafts.find(d => d.id === agent.context.id)?.name || t('untitled');
}
function contextPromptOnly() {
  const c=agent.context;if (!c) return '';
  if (c.kind === 'catalog') return ITEMS.get(c.id)?.prompt || '';
  if (c.kind === 'asset') return state.assets.find(a => a.id === c.id)?.prompt || '';
  if (c.kind === 'board') return boardContextEntries().map(x=>x.src.prompt).join('\n\n');
  return state.drafts.find(d => d.id === c.id)?.prompt || '';
}
function contextPayload() {
  if (!agent.context) return '';
  if (agent.context.kind === 'catalog') {
    const d = ITEMS.get(agent.context.id);
    return `[${t('agentContextCatalog')}] ${titleFor(d)}\n${d.duration} · ${d.aspect} · ${categoryName(d.category)}\n${t('originalPrompt')}:\n${d.prompt}`;
  }
  if (agent.context.kind === 'asset') {
    const a = state.assets.find(x => x.id === agent.context.id);
    if (!a) return '';
    return `[${t('agentContextAsset')}] ${a.name}\n${t('promptLabel')}:\n${a.prompt}`;
  }
  if (agent.context.kind === 'board') {
    const shots=boardContextEntries();
    if (!shots.length) return '';
    return `[${t('agentContextBoard')}] ${t('boardResults',{n:shots.length})}\n\n`+shots.map(x=>{
      const meta=[x.src.model,x.src.duration,x.src.aspect,categoryName(x.src.category)].filter(Boolean).join(' · ');
      return `${shotNo(x.i)} · ${x.src.title}\n${meta}\n${t('promptLabel')}:\n${x.src.prompt}\n${t('boardNote')}: ${x.entry.note||'—'}`;
    }).join('\n\n');
  }
  const d = state.drafts.find(x => x.id === agent.context.id);
  if (!d) return '';
  return `[${t('agentContextDraft')}] ${d.name}\n${t('promptLabel')}:\n${d.prompt}${d.notes ? '\n' + t('notes') + ':\n' + d.notes : ''}`;
}
function openAgent() {
  ui.agentOpen=true;ui.editorOpen=false;document.body.classList.remove('sidebar-visible');
  if (!agent.messages.length) pushMessage({id:uid(),role:'assistant',text:t('agentWelcome'),done:true,blocks:[]});
  syncDrawers();renderThread();renderAgentStatus();renderSkillPicker();
  if (window.innerWidth>1180) $('#agentInput').focus();
}
function closeAgent() { ui.agentOpen=false;syncDrawers(); }
function insertToAgent(id) {
  if (!ITEMS.has(id)) return;
  agent.context={kind:'catalog',id};openAgent();
  pushMessage({id:uid(),role:'note',text:t('agentInserted'),spin:false});renderAgentContext();
}
function insertDraftToAgent() {
  const draft=currentDraft();if (!draft) return;
  agent.context={kind:'draft',id:draft.id};openAgent();
  pushMessage({id:uid(),role:'note',text:t('agentDraftInserted'),spin:false});renderAgentContext();
}
function renderAgentContext() {
  const el=$('#agentContext'),c=agent.context;
  if (!c) { el.hidden=true;el.innerHTML='';renderIntents();return; }
  let thumb='',label=t('agentContextDraft');
  if (c.kind==='catalog') { const item=ITEMS.get(c.id);thumb=item?.thumb||'';label=t('agentContextCatalog'); }
  else if (c.kind==='asset') { const a=state.assets.find(x=>x.id===c.id);thumb=a?.images[0]?.src||'';label=t('agentContextAsset'); }
  else if (c.kind==='board') { label=t('agentContextBoard'); }
  else { const item=ITEMS.get(state.drafts.find(d=>d.id===c.id)?.sourceId);thumb=item?.thumb||''; }
  el.hidden=false;
  el.innerHTML=`${thumb?`<img src="${escapeHTML(thumb)}" alt="">`:`<span class="agent-context-glyph">${icon(c.kind==='board'?'film':'layers')}</span>`}<div class="agent-context-info"><span>${label}</span><strong>${escapeHTML(contextTitle())}</strong></div><button class="icon-button" id="agentContextRemove" title="${escapeHTML(t('agentContextRemove'))}" aria-label="${escapeHTML(t('agentContextRemove'))}">${icon('close')}</button>`;
  renderIntents();
}
function renderAgentStatus() {
  const {llm,image}=state.settings.agent;
  const hasL=!!llm.baseUrl.trim(),hasI=!!image.baseUrl.trim();
  const el=$('#agentStatus');
  el.textContent=hasL&&hasI?t('agentStatusReady',{llm:llm.model.trim()||'LLM',img:image.model.trim()||'IMG'}):hasL?t('agentStatusLLM',{llm:llm.model.trim()||'LLM'}):hasI?t('agentStatusImage',{img:image.model.trim()||'IMG'}):t('agentStatusNone');
  el.classList.toggle('ready',hasL||hasI);
}
function renderSkillPicker() {
  selectOptions($('#skillSelect'),[['',t('skillNone')],...SKILLS.map(s=>[s.id,state.settings.lang==='zh'?s.zh:s.en])],state.settings.skill);
  const skill=activeSkill();
  $('#skillApply').hidden=!skill;
  const src=$('#skillSource');
  if (skill) { src.hidden=false;src.href=skill.source_link;src.textContent=skill.source; }
  else { src.hidden=true;src.removeAttribute('href');src.textContent=''; }
}
function scrollThread(force) {
  const el=$('#agentThread');
  if (force||el.scrollHeight-el.scrollTop-el.clientHeight<140) el.scrollTop=el.scrollHeight;
}
function renderThread() { $('#agentThread').innerHTML=agent.messages.map(messageHTML).join('');scrollThread(true); }
function pushMessage(m) { agent.messages.push(m);if (agent.messages.length>200) agent.messages.splice(0,agent.messages.length-200);renderThread();return m; }
function updateMessage(m) { const el=document.querySelector(`[data-msg="${m.id}"] .agent-msg-body`);if (el) el.innerHTML=bodyFor(m);scrollThread(false); }
function removeMessage(id) { agent.messages=agent.messages.filter(m=>m.id!==id);renderThread(); }
function extractBlocks(text) {
  const blocks=[];const re=/```[a-zA-Z0-9_-]*\n?([\s\S]*?)```/g;let m;
  while ((m=re.exec(text))) blocks.push(m[1].replace(/\n$/,''));
  return blocks;
}
function assistantBody(text,blocks) {
  const prose=s=>`<div class="agent-prose">${escapeHTML(s).replace(/\n/g,'<br>')}</div>`;
  const re=/```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
  let html='',last=0,i=0,m;
  while ((m=re.exec(text))) {
    if (m.index>last) html+=prose(text.slice(last,m.index));
    const code=m[2].replace(/\n$/,''),block=blocks?blocks[i]:null;
    const saveAction=block?(block.savedAssetId?`<button class="text-button" data-asset-open="${block.savedAssetId}">${icon('check')}${t('assetSavedView')}</button>`:`<button class="text-button" data-agent-save-block="${block.id}">${icon('bookmark')}${t('agentSaveAsset')}</button>`):'';
    html+=block?`<div class="agent-code"><div class="agent-code-head"><span>${escapeHTML(block.label||(!m[1]||m[1]==='prompt'?t('agentImproved'):m[1]))}</span><span class="agent-code-actions"><button class="text-button" data-agent-copy="${block.id}">${icon('copy')}${t('agentCopyBlock')}</button><button class="text-button" data-agent-apply="${block.id}">${icon('edit')}${t('agentApply')}</button>${saveAction}</span></div><pre>${escapeHTML(code)}</pre></div>`:`<pre class="agent-code-plain">${escapeHTML(code)}</pre>`;
    i++;last=re.lastIndex;
  }
  if (last<text.length) html+=prose(text.slice(last));
  return html||prose(text);
}
function imageFigure(m,it,i) {
  const caption=`<figcaption><span>${escapeHTML(it.caption)}</span>${it.state==='done'?(it.src.startsWith('data:')?`<a class="text-button" href="${escapeHTML(it.src)}" download="frame-key-${i+1}.png">${t('agentDownload')}</a>`:`<button class="text-button" data-agent-download="${m.id}:${i}">${t('agentDownload')}</button>`):''}</figcaption>`;
  if (it.state==='done') return `<figure class="agent-image"><img src="${escapeHTML(it.src)}" alt="${escapeHTML(it.caption)}" loading="lazy">${caption}</figure>`;
  if (it.state==='error') return `<figure class="agent-image failed"><div class="agent-image-ph"><span>${escapeHTML(t('agentImageFailed',{msg:it.error}))}</span></div>${caption}</figure>`;
  return `<figure class="agent-image pending"><div class="agent-image-ph"><span class="agent-spinner" aria-hidden="true"></span><span>${t('agentImagePending')}</span></div>${caption}</figure>`;
}
function bodyFor(m) {
  if (m.role==='user') return escapeHTML(m.text).replace(/\n/g,'<br>')+(m.contextLabel?`<span class="agent-msg-context">${icon('film')}${escapeHTML(m.contextLabel)}</span>`:'');
  if (m.role==='assistant') return assistantBody(m.text,m.done?m.blocks:null);
  if (m.role==='note') return (m.spin?'<span class="agent-spinner" aria-hidden="true"></span>':'')+`<span>${escapeHTML(m.text)}</span>`;
  if (m.role==='error') return escapeHTML(m.text)+(m.settings?`<button class="text-button" data-agent-settings>${icon('sliders')}${t('agentOpenSettings')}</button>`:'');
  if (m.role==='images') {
    const done=m.items.some(it=>it.state==='done'&&it.src);
    const footer=m.savedAssetId?`<div class="agent-images-actions"><button class="button" data-asset-open="${m.savedAssetId}">${icon('check')}${t('assetSavedView')}</button></div>`:done?`<div class="agent-images-actions"><button class="button primary" data-agent-save-images="${m.id}">${icon('bookmark')}${t('assetSaveImages')}</button></div>`:'';
    return `<div class="agent-images-title">${icon('image')}${escapeHTML(t('agentKeyImages'))}</div><div class="agent-image-grid">${m.items.map((it,i)=>imageFigure(m,it,i)).join('')}</div>${footer}`;
  }
  return '';
}
function messageHTML(m) { return `<div class="agent-msg ${m.role}" data-msg="${m.id}"><div class="agent-msg-body">${bodyFor(m)}</div></div>`; }
function syncAgentBusy() {
  const send=$('#agentSend');if (!send) return;
  send.innerHTML=icon(agent.busy?'stop':'send');
  send.classList.toggle('is-stop',agent.busy);
  send.title=t(agent.busy?'agentStop':'agentSend');send.setAttribute('aria-label',send.title);
  for (const id of ['agentImprove','agentImages','agentClear']) $('#'+id).disabled=agent.busy;
}
function setBusy(busy) { agent.busy=busy;syncAgentBusy(); }
function relayFetch(url,options={}) {
  if (!RELAY) return fetch(url,options);
  return fetch(RELAY+'?target='+encodeURIComponent(url),{...options,headers:{...(options.headers||{}),'X-Studio-Relay':'1'}});
}
function resolveEndpoint(base,suffix) {
  const url=safeLink((base||'').trim());
  if (!url) throw new Error(t('agentInvalidUrl'));
  const clean=url.replace(/\/+$/,'');
  return clean.endsWith('/'+suffix)?clean:clean+'/'+suffix;
}
async function apiErrorText(res) {
  let detail='';
  try { const data=await res.json();detail=String(data?.error?.message||data?.message||''); } catch {}
  const key=res.status===401||res.status===403?'agentAuthError':res.status===404?'agentEndpointError':res.status===429?'agentRateError':'agentHttpError';
  return t(key,{status:res.status})+(detail?' '+detail.slice(0,200):'');
}
async function diagnoseNetworkError(url) {
  if (RELAY) return t('agentNetRelayDown');
  if (location.protocol==='https:'&&url.startsWith('http:')) return t('agentNetMixed');
  const probe=new AbortController(),timer=setTimeout(()=>probe.abort(),6000);
  let reachable=false;
  try { await fetch(url,{mode:'no-cors',cache:'no-store',signal:probe.signal});reachable=true; } catch {}
  clearTimeout(timer);
  return reachable?t(location.protocol==='file:'?'agentNetCorsFile':'agentNetCors'):t('agentNetUnreachable');
}
async function callLLM(messages,{stream=false,onDelta,signal}={}) {
  const cfg=state.settings.agent.llm;
  const url=resolveEndpoint(cfg.baseUrl,'chat/completions');
  let res;
  try { res=await relayFetch(url,{method:'POST',headers:{'Content-Type':'application/json',...(cfg.apiKey.trim()?{Authorization:'Bearer '+cfg.apiKey.trim()}:{})},body:JSON.stringify({model:cfg.model.trim()||'gpt-4o-mini',messages,stream,temperature:0.7}),signal}); }
  catch (error) { if (error instanceof TypeError) throw new Error(await diagnoseNetworkError(url));throw error; }
  if (!res.ok) throw new Error(await apiErrorText(res));
  if (stream&&res.body&&(res.headers.get('content-type')||'').includes('event-stream')) {
    const reader=res.body.getReader(),decoder=new TextDecoder();
    let buffer='',full='';
    while (true) {
      const {done,value}=await reader.read();
      if (done) break;
      buffer+=decoder.decode(value,{stream:true});
      let idx;
      while ((idx=buffer.indexOf('\n'))>=0) {
        const line=buffer.slice(0,idx).trim();buffer=buffer.slice(idx+1);
        if (!line.startsWith('data:')) continue;
        const payload=line.slice(5).trim();
        if (payload==='[DONE]') continue;
        try { const delta=JSON.parse(payload).choices?.[0]?.delta?.content;if (delta) { full+=delta;onDelta?.(full); } } catch {}
      }
    }
    return full;
  }
  const data=await res.json(),content=data?.choices?.[0]?.message?.content;
  if (typeof content!=='string') throw new Error(t('agentBadOutput'));
  return content;
}
function contextModel() {
  const c=agent.context;if(!c)return '';
  if(c.kind==='catalog')return ITEMS.get(c.id)?.model||'';
  if(c.kind==='draft')return ITEMS.get(state.drafts.find(d=>d.id===c.id)?.sourceId)?.model||'';
  if(c.kind==='board')return [...new Set(boardContextEntries().map(x=>x.src.model).filter(Boolean))].join(' / ');
  return '';
}
function sysPrompt(mode) {
  const lang=state.settings.lang==='zh'?'Simplified Chinese':'English';
  const skill=activeSkill();
  const model=skill?skill.model:(contextModel()||'MiniMax/Hailuo, Seedance and Veo video generation');
  const base=`You are FRAME Copilot, an expert cinematic prompt engineer for ${model}. Respond in ${lang}. Be concise and practical.`;
  const head=base+(skill?` Apply this director skill "${skill.en}" (source: ${skill.source}):\n${skill.body}`:'');
  const shots=agent.context?.kind==='board'?boardContextEntries().length:0;
  const scene=shots?` The context is a sequence board of ${shots} shots played in order as one continuous scene. Keep wardrobe, props, lighting, location, time of day and screen direction consistent across shots, and honour every shot's continuity note.`:'';
  if (mode==='improve') return head+scene+(shots
    ?` Rewrite every shot to satisfy the request. Output exactly ${shots} \`\`\`prompt fenced code blocks in sequence order, one per shot, each immediately preceded by a plain line "SC nnn · title" using that shot's number and title. Each block stays a single continuous video-generation prompt covering subject, camera, lighting, motion and mood. After the blocks, add 2-4 short bullets explaining the changes.`
    :' The user provides a source shot prompt and a request. Rewrite the full prompt to satisfy the request while keeping it a single continuous video-generation prompt covering subject, camera, lighting, motion and mood. Output the improved prompt inside a ```prompt fenced code block, then 2-4 short bullets explaining the changes.');
  if (mode==='specs') return head+scene+` Extract at most {n} key still-image assets from ${shots?'the sequence, one per shot in order where possible, keeping wardrobe, props, lighting and location consistent across frames':'the shot'}. Return ONLY a JSON array of objects {"title": short label in ${lang}, "prompt": detailed English still-image description, no motion, no text or watermarks}. No prose, no fences.`;
  return head+scene+(shots
    ?' Help the user develop the sequence. When you propose rewritten video prompts, give each shot its own ```prompt fenced code block in sequence order, preceded by a plain line "SC nnn · title".'
    :' Help the user develop the shot. When you propose a rewritten video prompt, put it inside a ```prompt fenced code block.');
}
function parseSpecs(raw) {
  const text=String(raw).trim().replace(/^```(?:json)?\s*/,'').replace(/```\s*$/,'');
  const start=text.indexOf('['),end=text.lastIndexOf(']');
  if (start<0||end<=start) return [];
  try {
    const arr=JSON.parse(text.slice(start,end+1));
    if (!Array.isArray(arr)) return [];
    return arr.filter(x=>x&&typeof x.prompt==='string'&&x.prompt.trim()).map(x=>({title:typeof x.title==='string'?x.title:'',prompt:x.prompt})).slice(0,4);
  } catch { return []; }
}
function linkBoardBlocks(blocks) {
  if (agent.context?.kind!=='board') return blocks;
  const shots=boardContextEntries();
  if (!shots.length||blocks.length!==shots.length) return blocks;
  return blocks.map((b,i)=>({...b,boardRef:{kind:shots[i].entry.kind,refId:shots[i].entry.refId},label:shotNo(shots[i].i)+' · '+shots[i].src.title}));
}
async function runChatFlow(mode,label,history,signal) {
  const m={id:uid(),role:'assistant',text:'',done:false,blocks:[]};
  agent.current=m.id;pushMessage(m);
  const ctx=contextPayload();
  const messages=[{role:'system',content:sysPrompt(mode)},...history,{role:'user',content:(ctx?ctx+'\n\n':'')+label}];
  const text=await callLLM(messages,{stream:true,signal,onDelta:full=>{m.text=full;updateMessage(m);}});
  m.text=text.trim()?text:t('agentBadOutput');m.done=true;
  m.blocks=linkBoardBlocks(extractBlocks(m.text).map(code=>({id:uid(),text:code})));
  updateMessage(m);
}
async function runImageFlow(instruction,signal) {
  const cfg=state.settings.agent,count=cfg.image.count;
  const note={id:uid(),role:'note',text:t('agentThinking'),spin:true};
  let specs;
  if (cfg.llm.baseUrl.trim()) {
    pushMessage(note);
    const raw=await callLLM([{role:'system',content:sysPrompt('specs').replace('{n}',String(count))},{role:'user',content:(contextPayload()?contextPayload()+'\n\n':'')+(instruction||t('agentImagesDefault'))}],{signal});
    specs=parseSpecs(raw);
  } else {
    specs=[{title:t('agentKeyImages'),prompt:(contextPayload()||instruction).slice(0,1800)}];
    note.spin=false;note.text=t('agentSpecFallback');pushMessage(note);
  }
  if (!specs.length) throw new Error(t('agentBadOutput'));
  specs=specs.slice(0,count);
  const m={id:uid(),role:'images',sourcePrompt:contextPromptOnly(),sourceId:agent.context?.kind==='catalog'?agent.context.id:null,sourceTitle:contextTitle(),items:specs.map(s=>({caption:String(s.title||t('agentKeyImages')).slice(0,80),prompt:String(s.prompt||'').slice(0,4000),state:'pending',src:'',error:''}))};
  pushMessage(m);
  note.spin=true;note.text=t('agentGenerating',{done:0,total:specs.length});updateMessage(note);
  for (let i=0;i<specs.length;i++) {
    if (signal.aborted) throw new DOMException('Aborted','AbortError');
    try {
      const body={model:cfg.image.model.trim()||'gpt-image-1',prompt:String(specs[i].prompt).slice(0,4000),n:1};
      if (cfg.image.size!=='auto') body.size=cfg.image.size;
      const url=resolveEndpoint(cfg.image.baseUrl,'images/generations');
      let res;
      try { res=await relayFetch(url,{method:'POST',headers:{'Content-Type':'application/json',...(cfg.image.apiKey.trim()?{Authorization:'Bearer '+cfg.image.apiKey.trim()}:{})},body:JSON.stringify(body),signal}); }
      catch (error) { if (error instanceof TypeError) throw new Error(await diagnoseNetworkError(url));throw error; }
      if (!res.ok) throw new Error(await apiErrorText(res));
      const entry=(await res.json())?.data?.[0];
      const src=entry?.b64_json?'data:image/png;base64,'+entry.b64_json:safeLink(entry?.url||'');
      if (!src) throw new Error(t('agentBadOutput'));
      Object.assign(m.items[i],{state:'done',src});
    } catch (error) {
      if (signal.aborted) throw error;
      Object.assign(m.items[i],{state:'error',error:error.message||t('agentNetworkError')});
    }
    note.text=t('agentGenerating',{done:i+1,total:specs.length});updateMessage(note);updateMessage(m);
  }
  removeMessage(note.id);
}
async function runAgent(mode) {
  if (agent.busy) { agent.controller?.abort();return; }
  const input=$('#agentInput'),instruction=input.value.trim();
  if (mode==='chat'&&!instruction) return;
  const {llm,image}=state.settings.agent;
  if ((mode==='chat'||mode==='improve')&&!llm.baseUrl.trim()) { pushMessage({id:uid(),role:'error',text:t('agentNeedLLM'),settings:true});return; }
  if (mode==='images'&&!image.baseUrl.trim()) { pushMessage({id:uid(),role:'error',text:t('agentNeedImage'),settings:true});return; }
  if ((mode==='improve'||mode==='images')&&!agent.context) { pushMessage({id:uid(),role:'error',text:t('agentNeedContext')});return; }
  const history=agent.messages.filter(m=>(m.role==='user'||m.role==='assistant')&&!(m.role==='assistant'&&!m.done)).slice(-6).map(m=>({role:m.role,content:m.text}));
  const label=mode==='improve'?(instruction||t('agentImproveDefault')):mode==='images'?(instruction||t('agentImagesDefault')):instruction;
  input.value='';
  pushMessage({id:uid(),role:'user',text:label,contextLabel:agent.context?contextTitle():''});
  setBusy(true);
  const controller=new AbortController();agent.controller=controller;
  try {
    if (mode==='images') await runImageFlow(instruction,controller.signal);
    else await runChatFlow(mode,label,history,controller.signal);
  } catch (error) {
    if (controller.signal.aborted) {
      const m=agent.messages.find(x=>x.id===agent.current);
      if (m&&m.role==='assistant'&&!m.done) { m.text=(m.text?m.text+'\n\n':'')+t('agentStopped');m.done=true;m.blocks=linkBoardBlocks(extractBlocks(m.text).map(code=>({id:uid(),text:code})));updateMessage(m); }
      const im=[...agent.messages].reverse().find(x=>x.role==='images');
      if (im) { im.items.forEach(it=>{if (it.state==='pending') Object.assign(it,{state:'error',error:t('agentStopped')});});updateMessage(im); }
      agent.messages=agent.messages.filter(x=>x.role!=='note');renderThread();
    } else pushMessage({id:uid(),role:'error',text:error instanceof TypeError?t('agentNetworkError'):(error.message||t('agentNetworkError'))});
  } finally { setBusy(false);agent.controller=null; }
}
function findBlock(id) { return agent.messages.flatMap(m=>m.blocks||[]).find(b=>b.id===id); }
function applyAgentBlock(id) {
  const block=findBlock(id);if (!block) return;
  let draft;
  if (block.boardRef) {
    if (block.boardRef.kind==='draft') draft=state.drafts.find(d=>d.id===block.boardRef.refId);
    else { startDraft(block.boardRef.refId);draft=currentDraft();if (draft?.sourceId!==block.boardRef.refId) draft=null; }
    if (!draft) {toast(t('boardMissing'));return;}
    state.activeDraftId=draft.id;
  } else {
    draft=currentDraft();
    if (!draft) { startDraft(agent.context?.kind==='catalog'?agent.context.id:null);draft=currentDraft(); }
    if (!draft) return;
  }
  draft.prompt=block.text;draft.updatedAt=now();
  saveState();renderEditor();renderLibrary();openEditor();toast(t('agentApplied'));
}
async function downloadAgentImage(ref) {
  const [mid,idx]=ref.split(':');
  const it=agent.messages.find(x=>x.id===mid)?.items[Number(idx)];
  if (!it?.src) return;
  const link=document.createElement('a');
  if (it.src.startsWith('data:')) { link.href=it.src; }
  else {
    try { const blob=await (await relayFetch(it.src)).blob();link.href=URL.createObjectURL(blob);setTimeout(()=>URL.revokeObjectURL(link.href),5000); }
    catch { window.open(it.src,'_blank','noopener');return; }
  }
  link.download=`frame-key-${Number(idx)+1}.png`;document.body.append(link);link.click();link.remove();
}
function clearAgent() { agent.messages=[];pushMessage({id:uid(),role:'assistant',text:t('agentWelcome'),done:true,blocks:[]});toast(t('agentCleared')); }
function openAgentSettings() {
  const a=state.settings.agent;
  $('#llmBase').value=a.llm.baseUrl;$('#llmKey').value=a.llm.apiKey;$('#llmModel').value=a.llm.model;
  $('#imgBase').value=a.image.baseUrl;$('#imgKey').value=a.image.apiKey;$('#imgModel').value=a.image.model;
  $('#imgSize').value=a.image.size;$('#imgCount').value=String(a.image.count);
  $('#llmTestResult').textContent='';$('#llmTestResult').className='';
  $('#probeStatus').textContent='';$('#probeStatus').className='';
  renderProbeCard();
  $('#agentDialog').showModal();
}
async function saveAgentSettings() {
  const llmBase=$('#llmBase').value.trim(),imgBase=$('#imgBase').value.trim();
  if ((llmBase&&!safeLink(llmBase))||(imgBase&&!safeLink(imgBase))) { toast(t('agentInvalidUrl'));return; }
  try {
    await changeState(next=>{next.settings.agent={llm:{baseUrl:llmBase,apiKey:$('#llmKey').value.trim(),model:$('#llmModel').value.trim()},image:{baseUrl:imgBase,apiKey:$('#imgKey').value.trim(),model:$('#imgModel').value.trim(),size:$('#imgSize').value,count:Number($('#imgCount').value)},probe:next.settings.agent.probe};});
    $('#agentDialog').close();renderAgentStatus();toast(t('agentSaved'));
  } catch (error) { toast(error.message); }
}
async function testLLM() {
  const button=$('#llmTest'),result=$('#llmTestResult'),base=$('#llmBase').value.trim();
  if (!base||!safeLink(base)) { result.textContent=t('agentInvalidUrl');result.className='fail';return; }
  button.disabled=true;result.textContent=t('testing');result.className='';
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  try {
    const key=$('#llmKey').value.trim();
    const url=resolveEndpoint(base,'chat/completions');
    let res;
    try { res=await relayFetch(url,{method:'POST',headers:{'Content-Type':'application/json',...(key?{Authorization:'Bearer '+key}:{})},body:JSON.stringify({model:$('#llmModel').value.trim()||'gpt-4o-mini',messages:[{role:'user',content:'ping'}],stream:false}),signal:controller.signal}); }
    catch (error) { if (error instanceof TypeError) throw new Error(await diagnoseNetworkError(url));throw error; }
    if (!res.ok) throw new Error(await apiErrorText(res));
    await res.json();
    result.textContent=t('testOk');result.className='ok';
  } catch (error) { result.textContent=t('testFailed',{msg:controller.signal.aborted?t('agentNetTimeout'):error.message});result.className='fail'; }
  finally { clearTimeout(timer);button.disabled=false; }
}
function renderProbeCard() {
  const p=state.settings.agent.probe||cleanProbe(null);
  const chip=(label,s)=>`<div class="probe-row"><span>${escapeHTML(label)}</span><b class="probe-chip ${s}">${t(s==='ok'?'probeOk':s==='fail'?'probeFail':'probeUnknown')}</b></div>`;
  $('#probeCard').innerHTML=
    chip(t('probeReach'),p.at?p.reach:'unknown')+
    chip(t('probeCors'),p.at?p.cors:'unknown')+
    `<div class="probe-row"><span>${t('probeRelay')}</span><b class="probe-chip ${RELAY?'ok':'fail'}">${t(RELAY?'probeRelayOn':'probeRelayOff')}</b></div>`+
    chip(t('probeModels'),p.at?p.models:'unknown')+
    `<div class="probe-row"><span>${t('probeUsage')}</span><b class="probe-chip unknown">${t('probeNeedsCall')}</b></div>`+
    (p.modelCount?`<p class="probe-count">${t('probeModelCount',{n:p.modelCount})}</p>`:'')+
    (p.modelSample.length?`<div class="probe-sample">${p.modelSample.map(m=>`<span class="tag">${escapeHTML(m)}</span>`).join('')}</div>`:'')+
    (p.at?`<p class="probe-at">${t('probeLast',{time:dateLabel(p.at)})}</p>`:'');
}
async function probeGateway() {
  const base=$('#llmBase').value.trim(),status=$('#probeStatus'),button=$('#probeRun');
  if(!base||!safeLink(base)){status.textContent=t('probeNoBase');status.className='fail';return;}
  button.disabled=true;status.textContent=t('probeRunning');status.className='';
  const key=$('#llmKey').value.trim();
  const result={at:now(),base,reach:'fail',cors:RELAY?'ok':'fail',relay:RELAY?'ok':'fail',models:'fail',modelCount:0,modelSample:[]};
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
  try {
    const url=resolveEndpoint(base,'models');
    let res=null;
    try { res=await relayFetch(url,{headers:{...(key?{Authorization:'Bearer '+key}:{})},signal:controller.signal}); }
    catch { res=null; }
    if(res){
      result.cors='ok';
      result.reach=[200,401,403].includes(res.status)?'ok':'fail';
      if(res.ok){
        try {
          const data=await res.json();
          const list=Array.isArray(data?.data)?data.data:Array.isArray(data)?data:[];
          result.models='ok';result.modelCount=list.length;
          result.modelSample=list.slice(0,8).map(m=>String(m?.id||m?.name||m).slice(0,120));
        } catch { result.models='fail'; }
      }
    }
  } catch {}
  finally { clearTimeout(timer); }
  state.settings.agent.probe=cleanProbe(result);saveState();renderProbeCard();
  button.disabled=false;status.textContent=t('probeDone');status.className=result.reach==='ok'?'ok':'fail';
}

let labTimer;
function renderLab() {
  const draft=currentDraft();if (!draft) return;
  const a=analyzePrompt(draft.prompt);
  $('#labMeterFill').style.width=a.score+'%';
  $('#labScore').textContent=t('labScore')+' '+a.score+'%';
  $('#labDims').innerHTML=DIMS.map(d=>`<span class="lab-dim ${a.present.has(d.key)?'on':''}" style="--hue:${d.hue}">${escapeHTML(dimLabel(d.key))}</span>`).join('');
  const shown=a.hits.slice(0,14);
  $('#labElements').innerHTML=shown.length?`<span class="lab-label">${t('labElements')}</span>`+shown.map(h=>`<span class="lab-chip" style="--hue:${DIMS.find(d=>d.key===h.dim).hue}" title="${escapeHTML(h.zh)}">${escapeHTML(h.term)}</span>`).join('')+(a.hits.length>shown.length?`<span class="lab-more">+${a.hits.length-shown.length}</span>`:''):`<span class="lab-none">${t('labNone')}</span>`;
  $('#labFix').innerHTML=a.missing.length?`<span class="lab-label">${t('labMissing')}</span>`+a.missing.map(k=>`<button class="lab-fix-btn" data-lab-fix="${k}" style="--hue:${DIMS.find(d=>d.key===k).hue}">${icon('plus')}<span>${escapeHTML(dimLabel(k))}</span><small>${t('labFix')}</small></button>`).join(''):`<span class="lab-complete">${icon('check')}${t('labComplete')}</span>`;
  $('#labEnhance').innerHTML=`<span class="lab-label">${t('labEnhance')}</span>`+ENHANCERS.map(e=>{
    const active=draft.prompt.toLowerCase().includes(e.phrase.split(',')[0].toLowerCase());
    return `<button class="lab-enhance-btn ${active?'on':''}" data-lab-enhance="${e.id}">${escapeHTML(state.settings.lang==='zh'?e.zh:e.en)}</button>`;
  }).join('');
}
function labAppend(text) {
  const draft=currentDraft();if (!draft) return;
  draft.prompt=(draft.prompt.trim()?draft.prompt.trim()+' ':'')+text;
  draft.updatedAt=now();
  $('#promptEditor').value=draft.prompt;
  updateEditorCounters();renderLab();renderLint();queueSave();
}
const LINT_CACHE=new Map();
function lintMeta() {
  const src=ITEMS.get(currentDraft()?.sourceId);
  const model=ui.lintModel==='auto'?(src?.model||''):ui.lintModel;
  return {model,duration_seconds:src?.duration_seconds||0,aspect:src?.aspect||''};
}
function lintForItem(item) {
  let v=LINT_CACHE.get(item.id);
  if (!v) { v=lintPrompt(item.prompt,item,state.settings.lint); LINT_CACHE.set(item.id,v); }
  return v;
}
function lintBadge(item) {
  const issues=lintForItem(item).filter(i=>lintVisible(i,state.settings.lint.level));
  if (!issues.length) return '';
  const worst=issues.reduce((w,i)=>SEV_RANK[i.sev]>SEV_RANK[w]?i.sev:w,'info');
  return `<span class="lint-badge sev-${worst}" title="${escapeHTML(t('lintBadgeTitle',{n:issues.length}))}">${issues.length}</span>`;
}
function lintMsgKey(issue) {
  if (issue.rule==='stamps') return 'lintStamps'+issue.vars.kind[0].toUpperCase()+issue.vars.kind.slice(1);
  if (issue.rule==='duration') return issue.vars.kind==='missing'?'lintDurationMissing':'lintDurationRange';
  if (issue.rule==='pacing') return issue.vars.kind==='dense'?'lintPacingDense':'lintPacingSlow';
  if (issue.rule==='assets') return issue.sev==='warn'?'lintAssetsNone':'lintAssetsCheck';
  return 'lint'+issue.rule[0].toUpperCase()+issue.rule.slice(1);
}
function lintReport() {
  const draft=currentDraft();const meta=lintMeta();
  const issues=lintPrompt(draft?.prompt||'',meta,state.settings.lint);
  return {schema:1,generatedAt:now(),draft:draft?.name||'',model:meta.model||null,duration_seconds:meta.duration_seconds||parseSpokenDuration(draft?.prompt||'')||null,aspect:meta.aspect||null,level:state.settings.lint.level,rules:state.settings.lint.rules,issues:issues.map(i=>({rule:i.rule,severity:i.sev,message:t(lintMsgKey(i),i.vars)}))};
}
function renderLint() {
  const draft=currentDraft();if (!draft) return;
  const meta=lintMeta();
  const all=lintPrompt(draft.prompt,meta,state.settings.lint);
  const shown=all.filter(i=>lintVisible(i,state.settings.lint.level));
  const count=sev=>shown.filter(i=>i.sev===sev).length;
  $('#lintCount').textContent=shown.length||'';
  $('#lintSummary').innerHTML=shown.length?['error','warn','info'].filter(s=>count(s)).map(s=>`<span class="lint-chip sev-${s}">${t('lintSummary_'+s,{n:count(s)})}</span>`).join(''):`<span class="lint-pass">${icon('check')}${t('lintPass')}</span>`;
  $('#lintModel').innerHTML=`<option value="auto">${escapeHTML(t('lintModelAuto'))}</option>`+models.map(m=>`<option value="${escapeHTML(m)}">${escapeHTML(m)}</option>`).join('');
  $('#lintModel').value=ui.lintModel;
  $('#lintLevel').value=state.settings.lint.level;
  $('#lintRules').innerHTML=LINT_RULES.map(r=>`<label class="lint-switch sev-${r.sev}"><input type="checkbox" data-lint-rule="${r.id}" ${state.settings.lint.rules[r.id]!==false?'checked':''}><span class="lint-switch-track" aria-hidden="true"></span><span class="lint-switch-label">${escapeHTML(t('lintRule_'+r.id))}</span></label>`).join('');
  $('#lintIssues').innerHTML=shown.length?shown.map(i=>`<article class="lint-issue sev-${i.sev}"><span class="lint-dot" aria-hidden="true"></span><div class="lint-issue-body"><strong>${escapeHTML(t('lintRule_'+i.rule))}</strong><p>${escapeHTML(t(lintMsgKey(i),i.vars))}</p></div>${i.fix?`<button class="text-button lint-fix" data-lint-fix="${i.fix}">${icon('spark')}${t('lintFix')}</button>`:''}</article>`).join(''):`<div class="lint-empty">${icon('check')}<p>${t('lintPass')}</p></div>`;
  $('#lintCopyFixed').disabled=!all.some(i=>i.fix);
}
function applyLintFix(fix) {
  const draft=currentDraft();if (!draft) return;
  draft.prompt=lintFixText(draft.prompt,fix,lintMeta());
  draft.updatedAt=now();
  $('#promptEditor').value=draft.prompt;
  updateEditorCounters();renderLab();renderLint();queueSave();toast(t('lintFixed'));
}
function copyLintFixed() {
  const draft=currentDraft();if (!draft) return;
  const meta=lintMeta();
  let text=draft.prompt;
  for (const i of lintPrompt(text,meta,state.settings.lint)) if (i.fix) text=lintFixText(text,i.fix,meta);
  copyText(text,$('#promptEditor'));
}
function exportLintReport() {
  const blob=new Blob([JSON.stringify(lintReport(),null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='frame-lint-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);toast(t('lintExported'));
}
function downloadBlob(blob,name) {
  const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
}
function cardWrapText(ctx,text,maxWidth) {
  const lines=[];
  for(const raw of String(text).split('\n')){
    let line='';
    for(const word of raw.split(/\s+/).filter(Boolean)){
      const test=line?line+' '+word:word;
      if(ctx.measureText(test).width<=maxWidth){line=test;continue;}
      if(line){lines.push(line);line='';}
      if(ctx.measureText(word).width<=maxWidth){line=word;continue;}
      for(const ch of word){
        if(ctx.measureText(line+ch).width>maxWidth&&line){lines.push(line);line=ch;}
        else line+=ch;
      }
    }
    lines.push(line);
  }
  return lines;
}
function cardRoundRect(ctx,x,y,w,h,r) {
  ctx.beginPath();
  if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);
  else ctx.rect(x,y,w,h);
}
async function recipeCardCanvas(item,withImage=true) {
  const W=1200,H=1600,M=70;
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');
  const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#10141a');bg.addColorStop(.55,'#12151c');bg.addColorStop(1,'#1a1510');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  const glow=ctx.createRadialGradient(W-140,120,20,W-140,120,560);glow.addColorStop(0,'rgba(255,180,84,.16)');glow.addColorStop(1,'rgba(255,180,84,0)');
  ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
  const glow2=ctx.createRadialGradient(120,H-160,20,120,H-160,520);glow2.addColorStop(0,'rgba(90,215,240,.1)');glow2.addColorStop(1,'rgba(90,215,240,0)');
  ctx.fillStyle=glow2;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(255,180,84,.5)';ctx.lineWidth=2;ctx.strokeRect(26,26,W-52,H-52);
  ctx.fillStyle='#ffb454';ctx.font='700 26px "Courier New",monospace';
  ctx.fillText('FRAME · RECIPE CARD',M,86);
  ctx.fillStyle='#9aa3ad';ctx.font='24px "Courier New",monospace';ctx.textAlign='right';
  ctx.fillText(new Date().toISOString().slice(0,10),W-M,86);ctx.textAlign='left';
  let img=null;
  if(withImage){
    img=await new Promise(resolve=>{const im=new Image();const timer=setTimeout(()=>resolve(null),4000);im.onload=()=>{clearTimeout(timer);resolve(im);};im.onerror=()=>{clearTimeout(timer);resolve(null);};im.src=item.thumb;});
  }
  const iy=120,ih=520;
  if(img){
    ctx.save();cardRoundRect(ctx,M,iy,W-M*2,ih,18);ctx.clip();
    const scale=Math.max((W-M*2)/img.width,ih/img.height);
    const dw=img.width*scale,dh=img.height*scale;
    try{ctx.drawImage(img,M+(W-M*2-dw)/2,iy+(ih-dh)/2,dw,dh);}catch{img=null;}
    ctx.restore();
  }
  if(!img){
    ctx.fillStyle='#161b22';cardRoundRect(ctx,M,iy,W-M*2,ih,18);ctx.fill();
    ctx.fillStyle='#3a4250';ctx.font='700 120px Georgia,serif';ctx.textAlign='center';ctx.fillText('FRAME',W/2,iy+ih/2+40);ctx.textAlign='left';
  }
  ctx.strokeStyle='rgba(255,255,255,.14)';ctx.lineWidth=1.5;cardRoundRect(ctx,M,iy,W-M*2,ih,18);ctx.stroke();
  let y=iy+ih+72;
  ctx.fillStyle='#e8e6e1';ctx.font='700 52px Georgia,"Noto Serif SC",serif';
  const titleLines=cardWrapText(ctx,titleFor(item),W-M*2).slice(0,2);
  for(const line of titleLines){ctx.fillText(line,M,y);y+=64;}
  ctx.fillStyle='#9aa3ad';ctx.font='26px "Courier New",monospace';
  ctx.fillText([categoryName(item.category),item.model,item.duration,item.aspect].filter(Boolean).join('  ·  '),M,y);
  y+=44;
  ctx.strokeStyle='rgba(255,180,84,.35)';ctx.beginPath();ctx.moveTo(M,y);ctx.lineTo(W-M,y);ctx.stroke();
  y+=44;
  ctx.fillStyle='#ffb454';ctx.font='700 24px "Courier New",monospace';ctx.fillText('PROMPT',M,y);
  y+=38;
  ctx.fillStyle='#c8cdd4';ctx.font='23px "Courier New",monospace';
  const promptLines=cardWrapText(ctx,item.prompt,W-M*2);
  const maxLines=10;
  for(const line of promptLines.slice(0,maxLines)){ctx.fillText(line,M,y);y+=33;}
  if(promptLines.length>maxLines){ctx.fillStyle='#6b7480';ctx.fillText('… +'+(promptLines.length-maxLines)+' lines',M,y);y+=33;}
  y=Math.max(y+16,1330);
  const issues=lintPrompt(item.prompt,item,state.settings.lint);
  const errors=issues.filter(i=>i.sev==='error').length,warns=issues.filter(i=>i.sev==='warn').length;
  ctx.font='700 26px "Courier New",monospace';
  ctx.fillStyle=errors?'#ff6257':warns?'#ffc857':'#7ce0a3';
  ctx.fillText(errors?`LINT · ${errors} ERROR / ${warns} WARN`:warns?`LINT · ${warns} WARN`:'LINT · PASS',M,y);
  const best=bestTakeFor(item.id);
  if(best){
    ctx.fillStyle='#ffb454';ctx.textAlign='right';
    ctx.fillText(`BEST TAKE ★ ${takeAvg(best).toFixed(1)}`,W-M,y);ctx.textAlign='left';
    y+=38;
    ctx.fillStyle='#9aa3ad';ctx.font='22px "Courier New",monospace';
    ctx.fillText(TAKE_SCORE_KEYS.map(k=>`${k} ${best.scores[k].toFixed(1)}`).join('   '),M,y);
  }
  ctx.strokeStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.moveTo(M,H-130);ctx.lineTo(W-M,H-130);ctx.stroke();
  ctx.fillStyle='#9aa3ad';ctx.font='22px "Courier New",monospace';
  const sourceHost=safeLink(item.source_link||item.url)?new URL(safeLink(item.source_link||item.url)).hostname:'';
  ctx.fillText(cardWrapText(ctx,[item.author,sourceHost].filter(Boolean).join(' · '),W-M*2-320)[0]||'',M,H-84);
  ctx.fillStyle='#ffb454';ctx.font='700 24px Georgia,serif';ctx.textAlign='right';
  ctx.fillText('FRAME · 放映室',W-M,H-84);ctx.textAlign='left';
  return canvas;
}
async function exportRecipeCard(item) {
  if(!item)return;
  try{
    let canvas=await recipeCardCanvas(item,true),blob=null;
    try{blob=await new Promise(res=>canvas.toBlob(res,'image/png'));}catch{blob=null;}
    if(!blob){canvas=await recipeCardCanvas(item,false);blob=await new Promise(res=>canvas.toBlob(res,'image/png'));}
    if(!blob)throw new Error('canvas export failed');
    downloadBlob(blob,'frame-card-'+item.id+'.png');toast(t('cardExported'));
  }catch{toast(t('saveFailed'));}
}
function recipeCardMarkdown(item) {
  const issues=lintPrompt(item.prompt,item,state.settings.lint);
  const best=bestTakeFor(item.id);
  const lines=[`# ${titleFor(item)}`,altTitle(item)?`> ${altTitle(item)}`:'', '',`| ${t('model')} | ${t('duration')} | ${t('aspect')} | ${t('tags')} |`,`| --- | --- | --- | --- |`,`| ${item.model} | ${item.duration} | ${item.aspect} | ${categoryName(item.category)} |`,'',`## ${t('originalPrompt')}`,'','```',item.prompt,'```','',`## ${t('lintTab')}`,''];
  if(!issues.length)lines.push('- ✅ '+t('lintPass'));
  for(const i of issues)lines.push(`- ${i.sev==='error'?'🔴':i.sev==='warn'?'🟡':'🔵'} **${t('lintRule_'+i.rule)}** — ${t(lintMsgKey(i),i.vars)}`);
  if(best){
    lines.push('',`## ${t('takeBest')} · ${t('takeAvg')} ${takeAvg(best).toFixed(1)}`,'',`| ${TAKE_SCORE_KEYS.map(k=>t('takeScore_'+k)).join(' | ')} |`,`| ${TAKE_SCORE_KEYS.map(()=>'---').join(' | ')} |`,`| ${TAKE_SCORE_KEYS.map(k=>best.scores[k].toFixed(1)).join(' | ')} |`);
    if(best.label)lines.push('',`> ${best.label}`);
    if(best.notes)lines.push('',best.notes);
  }
  lines.push('',`---`,'',`${item.author}${safeLink(item.source_link)?' · ['+t('originalSource')+']('+safeLink(item.source_link)+')':''}${safeLink(item.url)?' · [BeatAPI]('+safeLink(item.url)+')':''}`,`FRAME · ${new Date().toISOString().slice(0,10)}`);
  return lines.join('\n').replace(/\n{3,}/g,'\n\n').trim()+'\n';
}
function exportRecipeCardMd(item) {
  if(!item)return;
  downloadBlob(new Blob([recipeCardMarkdown(item)],{type:'text/markdown;charset=utf-8'}),'frame-card-'+item.id+'.md');
  toast(t('cardMdExported'));
}
const INTENTS=[
  {key:'intentCinematic',zh:'让画面更电影感：补充镜头、光线与色彩描述。',en:'Make it more cinematic: add camera, light and color detail.'},
  {key:'intentRain',zh:'改成雨夜霓虹氛围。',en:'Rewrite it as a rainy neon night.'},
  {key:'intentSlow',zh:'加入慢镜头与特写节奏。',en:'Add slow motion and close-up pacing.'},
  {key:'intentVertical',zh:'改成 9:16 竖屏、5 秒的版本。',en:'Make a 9:16 vertical, 5-second version.'}
];
function renderIntents() {
  const chips=INTENTS.map((it,i)=>`<button class="intent-chip" data-intent="${i}">${escapeHTML(t(it.key))}</button>`);
  if (agent.context) {
    const missing=analyzePrompt(contextPromptOnly()).missing;
    if (missing.length) chips.push(`<button class="intent-chip fix" data-intent="fix">${icon('spark')}<span>${escapeHTML(t('intentFix'))} · ${escapeHTML(missing.map(dimLabel).join(' / '))}</span></button>`);
  }
  $('#agentIntents').innerHTML=chips.join('');
}
function runIntent(which) {
  let text;
  if (which==='fix') {
    const missing=analyzePrompt(contextPromptOnly()).missing;
    if (!missing.length) return;
    text=state.settings.lang==='zh'?'补全提示词中缺失的维度：'+missing.map(dimLabel).join('、')+'。':'Fill the missing dimensions: '+missing.map(dimLabel).join(', ')+'.';
  } else {
    const it=INTENTS[Number(which)];if (!it) return;
    text=state.settings.lang==='zh'?it.zh:it.en;
  }
  $('#agentInput').value=text;
  runAgent('improve');
}
let paletteItems=[],paletteIndex=0;
function paletteCommands() {
  return [
    {label:t('library'),icon:'library',run:()=>setView('library')},
    {label:t('moodboard'),icon:'grid',run:()=>setView('moodboard')},
    {label:t('recipeOpen'),icon:'film',run:()=>openRecipe()},
    {label:t('boardLint'),icon:'check',run:()=>{setView('sequence');ui.boardLintOpen=true;renderBoardLint();}},
    {label:t('favorites'),icon:'heart',run:()=>setView('favorites')},
    {label:t('drafts'),icon:'edit',run:()=>setView('drafts')},
    {label:t('sequence'),icon:'film',run:()=>setView('sequence')},
    {label:t('boardToAgent'),icon:'spark',run:()=>insertBoardToAgent()},
    {label:t('boardPrint'),icon:'printer',run:()=>printBoard()},
    {label:t('assets'),icon:'layers',run:()=>setView('assets')},
    {label:t('recentView'),icon:'history',run:()=>setView('recent')},
    {label:t('newDraft'),icon:'plus',run:()=>startDraft()},
    {label:t('newFolder'),icon:'folder',run:()=>folderForm()},
    {label:t('openAgentAction'),icon:'spark',run:()=>openAgent()},
    ...SKILLS.map(s=>({label:t('skillLabel')+' · '+(state.settings.lang==='zh'?s.zh:s.en),icon:'spark',run:()=>{state.settings.skill=s.id;saveState();renderSkillPicker();openAgent();toast(t('skillSet',{name:state.settings.lang==='zh'?s.zh:s.en}));}})),
    {label:t('skillLabel')+' · '+t('skillNone'),icon:'close',run:()=>{state.settings.skill='';saveState();renderSkillPicker();openAgent();}},
    {label:t('agentSettings'),icon:'sliders',run:()=>openAgentSettings()},
    {label:t('backupManage'),icon:'archive',run:()=>openBackup()},
    {label:t('guideTitle'),icon:'compass',run:()=>startGuide()},
    {label:t('theme'),icon:'moon',run:()=>$('#themeToggle').click()},
    {label:t('cmdLang'),icon:'panel',run:()=>$('#langToggle').click()},
    {label:t('reset'),icon:'close',run:()=>resetFilters()},
    {label:t('cmdCopy'),icon:'copy',run:()=>copyText(currentDraft()?.prompt||'',$('#promptEditor'))},
    {label:t('cmdLint'),icon:'check',run:()=>{if(!currentDraft()){toast(t('lintNoDraft'));return;}openEditor();selectEditorTab('lint');}}
  ];
}
function renderPalette() {
  const q=$('#paletteInput').value.trim().toLowerCase();
  const cmds=paletteCommands().filter(c=>!q||c.label.toLowerCase().includes(q));
  const shots=q?CATALOG.filter(d=>(d.title+' '+d.title_zh).toLowerCase().includes(q)).slice(0,8):[];
  paletteItems=[...cmds.map(c=>({kind:'cmd',...c})),...shots.map(d=>({kind:'shot',label:titleFor(d),sub:altTitle(d),icon:'film',run:()=>openPreview(d.id)}))];
  if (paletteIndex>=paletteItems.length) paletteIndex=0;
  $('#paletteList').innerHTML=paletteItems.length?paletteItems.map((it,i)=>`<button class="palette-item ${i===paletteIndex?'active':''}" data-palette="${i}" role="option" aria-selected="${i===paletteIndex}">${icon(it.icon)}<span class="palette-label">${escapeHTML(it.label)}</span>${it.sub?`<span class="palette-sub">${escapeHTML(it.sub)}</span>`:''}<span class="palette-kind">${t(it.kind==='cmd'?'paletteActions':'paletteShots')}</span></button>`).join(''):`<div class="palette-empty">${t('paletteEmpty')}</div>`;
  $('#paletteList .palette-item.active')?.scrollIntoView({block:'nearest'});
}
function openPalette() { paletteIndex=0;$('#paletteInput').value='';renderPalette();$('#paletteDialog').showModal();$('#paletteInput').focus(); }
function runPalette(i) { const it=paletteItems[i];if (!it) return;$('#paletteDialog').close();it.run(); }

const GUIDE_STEPS=[
  {sel:null,chapter:'guideChFind',title:'guideWelcomeT',body:'guideWelcomeB',points:['guideWelcomeP1','guideWelcomeP2','guideWelcomeP3'],tip:'guideWelcomeTip'},
  {sel:'.search-wrap',chapter:'guideChFind',title:'guideSearchT',body:'guideSearchB',points:['guideSearchP1','guideSearchP2','guideSearchP3'],tip:'guideSearchTip'},
  {sel:'#filterRow',chapter:'guideChFind',title:'guideFiltersT',body:'guideFiltersB',points:['guideFiltersP1','guideFiltersP2','guideFiltersP3'],tip:'guideFiltersTip'},
  {sel:'.prompt-card',chapter:'guideChFind',title:'guideCardT',body:'guideCardB',points:['guideCardP1','guideCardP2','guideCardP3'],tip:'guideCardTip'},
  {sel:'#categoryTabs',chapter:'guideChFind',title:'guideTabsT',body:'guideTabsB',points:['guideTabsP1','guideTabsP2','guideTabsP3'],tip:'guideTabsTip'},
  {sel:'#editorToggle',chapter:'guideChMake',title:'guideWorkspaceT',body:'guideWorkspaceB',points:['guideWorkspaceP1','guideWorkspaceP2','guideWorkspaceP3'],tip:'guideWorkspaceTip'},
  {sel:'#editorPanel',chapter:'guideChMake',editor:true,title:'guideLabT',body:'guideLabB',points:['guideLabP1','guideLabP2','guideLabP3'],tip:'guideLabTip'},
  {sel:'#editorPanel',chapter:'guideChMake',editor:true,title:'guideVersionsT',body:'guideVersionsB',points:['guideVersionsP1','guideVersionsP2','guideVersionsP3'],tip:'guideVersionsTip'},
  {sel:'#headingTools',chapter:'guideChScene',view:'sequence',title:'guideBoardT',body:'guideBoardB',points:['guideBoardP1','guideBoardP2','guideBoardP3'],tip:'guideBoardTip'},
  {sel:'#boardLintToggle',chapter:'guideChScene',view:'sequence',title:'guideBoardLintT',body:'guideBoardLintB',points:['guideBoardLintP1','guideBoardLintP2','guideBoardLintP3'],tip:'guideBoardLintTip'},
  {sel:'#moodControls',chapter:'guideChScene',view:'moodboard',title:'guideMoodT',body:'guideMoodB',points:['guideMoodP1','guideMoodP2','guideMoodP3'],tip:'guideMoodTip'},
  {sel:'#recipeOpen',chapter:'guideChScene',view:'library',title:'guideRecipeT',body:'guideRecipeB',points:['guideRecipeP1','guideRecipeP2','guideRecipeP3'],tip:'guideRecipeTip'},
  {sel:'#agentLauncher',chapter:'guideChFlow',view:'library',title:'guideAgentT',body:'guideAgentB',points:['guideAgentP1','guideAgentP2','guideAgentP3','guideAgentP4'],tip:'guideAgentTip'},
  {sel:'#paletteOpen',chapter:'guideChFlow',title:'guidePaletteT',body:'guidePaletteB',points:['guidePaletteP1','guidePaletteP2','guidePaletteP3'],tip:'guidePaletteTip'},
  {sel:'#backupOpen',chapter:'guideChFlow',title:'guideBackupT',body:'guideBackupB',points:['guideBackupP1','guideBackupP2','guideBackupP3'],tip:'guideBackupTip'}
];
function guideTarget(sel){const el=$(sel);if(!el)return null;const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden')return null;const r=el.getBoundingClientRect();if(!r.width||!r.height)return null;return el;}
function placeGuide(){
  const spot=$('#guideSpot'),card=$('#guideCard'),step=GUIDE_STEPS[guide.index];
  const vw=window.innerWidth,vh=window.innerHeight,el=guideTarget(step.sel);
  const r=el?el.getBoundingClientRect():null;
  const usable=r&&r.bottom>=0&&r.top<=vh&&r.right>=0&&r.left<=vw;
  const sheet=vw<=760;
  if(usable){
    const pad=6;
    const top=Math.max(4,r.top-pad),left=Math.max(4,r.left-pad);
    const width=Math.max(8,Math.min(r.width+pad*2,vw-left-4)),height=Math.max(8,Math.min(r.height+pad*2,vh-top-4));
    spot.classList.remove('no-target');
    spot.style.top=top+'px';spot.style.left=left+'px';spot.style.width=width+'px';spot.style.height=height+'px';
    if(!sheet){
      const cw=card.offsetWidth,ch=card.offsetHeight,gap=14;
      const cl=Math.min(Math.max(12,left+width/2-cw/2),Math.max(12,vw-cw-12));
      let ct;
      if(top+height+gap+ch<=vh-12)ct=top+height+gap;
      else if(top-gap-ch>=12)ct=top-gap-ch;
      else ct=Math.min(Math.max(12,(vh-ch)/2),Math.max(12,vh-ch-12));
      card.style.top=ct+'px';card.style.left=cl+'px';card.style.right='auto';card.style.bottom='auto';
    }else{card.style.top='auto';card.style.left='';card.style.right='';card.style.bottom='';}
  }else{
    spot.classList.add('no-target');spot.style.top='50%';spot.style.left='50%';spot.style.width='0px';spot.style.height='0px';
    if(!sheet){const cw=card.offsetWidth,ch=card.offsetHeight;card.style.top=Math.max(12,(vh-ch)/2)+'px';card.style.left=Math.max(12,(vw-cw)/2)+'px';card.style.right='auto';card.style.bottom='auto';}
    else{card.style.top='auto';card.style.left='';card.style.right='';card.style.bottom='';}
  }
}
function renderGuideStep(){
  const step=GUIDE_STEPS[guide.index],total=GUIDE_STEPS.length;
  const wantView=step.view||'library';
  if(ui.view!==wantView)setView(wantView);
  if(ui.editorOpen!==!!step.editor){ui.editorOpen=!!step.editor;syncDrawers();}
  if(ui.agentOpen){ui.agentOpen=false;syncDrawers();}
  $('#guideChapter').textContent=t('guideEyebrow')+' · '+t(step.chapter);
  $('#guideTitle').textContent=t(step.title);
  $('#guideBody').textContent=t(step.body);
  const points=step.points||[];
  $('#guidePoints').hidden=!points.length;
  $('#guidePoints').innerHTML=points.map(k=>`<li>${escapeHTML(t(k))}</li>`).join('');
  $('#guideTip').hidden=!step.tip;
  $('#guideTip').textContent=step.tip?t(step.tip):'';
  $('#guideCount').textContent=t('guideStep',{n:guide.index+1,total});
  $('#guideProgress').innerHTML=GUIDE_STEPS.map((_,i)=>`<span class="guide-dot ${i===guide.index?'active':i<guide.index?'done':''}"></span>`).join('');
  $('#guidePrev').disabled=guide.index===0;
  $('#guideNext').textContent=t(guide.index===total-1?'guideFinish':'guideNext');
  const el=guideTarget(step.sel);if(el)el.scrollIntoView({block:'center',inline:'center'});
  placeGuide();
}
function startGuide(){
  if(guide.open)return;
  guide.startView=ui.view;
  ui.editorOpen=false;ui.agentOpen=false;document.body.classList.remove('sidebar-visible');
  if(ui.view!=='library')setView('library');
  syncDrawers();
  guide.open=true;guide.index=0;guide.lastFocus=document.activeElement;
  if(!state.settings.guideSeen){state.settings.guideSeen=true;saveState();}
  $('#guideOverlay').hidden=false;document.body.classList.add('guide-active');
  $('.app-shell').inert=true;$('#agentLauncher').inert=true;$('#drawerScrim').inert=true;
  renderGuideStep();$('#guideNext').focus();
}
function endGuide(finished){
  if(!guide.open)return;
  guide.open=false;$('#guideOverlay').hidden=true;document.body.classList.remove('guide-active');
  $('.app-shell').inert=false;$('#agentLauncher').inert=false;$('#drawerScrim').inert=false;
  ui.editorOpen=false;ui.agentOpen=false;
  if(guide.startView&&ui.view!==guide.startView)setView(guide.startView);
  syncDrawers();
  if(finished)toast(t('guideFinished'));
  const back=guide.lastFocus&&document.contains(guide.lastFocus)?guide.lastFocus:$('#guideLauncher');
  if(back&&back.focus)back.focus();
}
function guideNext(){if(!guide.open)return;if(guide.index<GUIDE_STEPS.length-1){guide.index++;renderGuideStep();}else endGuide(true);}
function guidePrev(){if(!guide.open)return;if(guide.index>0){guide.index--;renderGuideStep();}}

document.addEventListener('click',event=>{
  const button=event.target.closest('button,a');if(!button)return;
  const d=button.dataset;
  if(button.id==='toastAction'){const action=undoAction;clearTimeout(toastTimer);$('#toast').hidden=true;undoAction=null;action?.run();return;}
  if(d.copyShot){touchRecent(d.copyShot);copyText(ITEMS.get(d.copyShot)?.prompt||'');return;}
  if(d.labFix){const phrase=DIM_FIX[d.labFix];if(phrase){labAppend(phrase);toast(t('labAdded',{dim:dimLabel(d.labFix)}));}return;}
  if(d.lintFix){applyLintFix(d.lintFix);return;}
  if(d.labEnhance){const e=ENHANCERS.find(x=>x.id===d.labEnhance);if(e){labAppend(e.phrase);toast(t('labEnhanced',{name:state.settings.lang==='zh'?e.zh:e.en}));}return;}
  if(d.intent!==undefined){runIntent(d.intent);return;}
  if(d.palette!==undefined){runPalette(Number(d.palette));return;}
  if(d.close){$('#'+d.close).close();return;}
  if(d.view){setView(d.view);return;}
  if(d.folder){setView('folder',d.folder);return;}
  if(d.unsorted){setView('folder');return;}
  if(d.favorite){toggleFavorite(d.favorite);return;}
  if(d.preview){openPreview(d.preview);return;}
  if(d.use){startDraft(d.use);return;}
  if(d.editDraft){openDraft(d.editDraft);return;}
  if(d.deleteDraft){deleteDraft(d.deleteDraft);return;}
  if(d.renameFolder){folderForm(d.renameFolder);return;}
  if(d.deleteFolder){deleteFolder(d.deleteFolder);return;}
  if(d.category!==undefined){ui.category=d.category;ui.limit=PAGE_SIZE;renderFilters();renderLibrary();return;}
  if(d.moodTerm!==undefined){const term=d.moodTerm;ui.mood.terms=ui.mood.terms.includes(term)?ui.mood.terms.filter(x=>x!==term):[...ui.mood.terms,term];ui.limit=PAGE_SIZE;renderNav();renderLibrary();return;}
  if(d.action==='mood-reset'){resetMood();return;}
  if(button.id==='moodShuffle'){ui.mood.seed=(Date.now()%1000000)+1;ui.mood.sort='random';ui.limit=PAGE_SIZE;renderLibrary();return;}
  if(button.id==='moodReset'){resetMood();return;}
  if(button.id==='moodBulkAdd'){addManyToBoard([...ui.moodSel]);return;}
  if(button.id==='recipeOpen'){openRecipe();return;}
  if(button.id==='recipeRandom'){randomRecipe();return;}
  if(button.id==='recipeReset'){ui.recipe=defaultRecipe();renderRecipe();return;}
  if(button.id==='recipeCreate'){createRecipeDraft();return;}
  if(button.id==='recipeShotsDown'){ui.recipe.shots--;renderRecipe();return;}
  if(button.id==='recipeShotsUp'){ui.recipe.shots++;renderRecipe();return;}
  if(d.filterTag!==undefined){ui.tag=d.filterTag;ui.limit=PAGE_SIZE;renderFilters();renderLibrary();return;}
  if(d.removeTag!==undefined){const id=currentDraft()?.sourceId;if(id&&state.favorites[id]){state.favorites[id].tags=state.favorites[id].tags.filter(x=>x!==d.removeTag);saveState();renderOrganization();renderFilters();renderLibrary();}return;}
  if(d.agentInsert){insertToAgent(d.agentInsert);return;}
  if(d.agentCopy){const block=findBlock(d.agentCopy);if(block)copyText(block.text);return;}
  if(d.agentApply){applyAgentBlock(d.agentApply);return;}
  if(d.agentDownload){downloadAgentImage(d.agentDownload);return;}
  if(d.agentSettings!==undefined){openAgentSettings();return;}
  if(d.agentSaveImages){saveImagesToAsset(d.agentSaveImages);return;}
  if(d.agentSaveBlock){saveBlockToAsset(d.agentSaveBlock);return;}
  if(d.boardAddShot){addToBoard('shot',d.boardAddShot);return;}
  if(d.boardAddDraft){addToBoard('draft',d.boardAddDraft);return;}
  if(d.boardUp){moveBoard(d.boardUp,-1);return;}
  if(d.boardDown){moveBoard(d.boardDown,1);return;}
  if(d.boardRemove){removeBoard(d.boardRemove);return;}
  if(d.boardOpen){const entry=state.board.find(b=>b.id===d.boardOpen);if(entry){if(entry.kind==='draft')openDraft(entry.refId);else openPreview(entry.refId);}return;}
  if(d.boardExport){exportBoard(d.boardExport);return;}
  if(button.id==='boardAddCurrent'){if(state.activeDraftId&&state.drafts.some(d=>d.id===state.activeDraftId))addToBoard('draft',state.activeDraftId);else toast(t('boardCurrentNone'));return;}
  if(button.id==='boardToAgent'){insertBoardToAgent();return;}
  if(button.id==='boardPrint'){printBoard();return;}
  if(button.id==='boardLintToggle'){ui.boardLintOpen=!ui.boardLintOpen;renderBoardLint();return;}
  if(d.boardJump){const row=$(`[data-board-id="${d.boardJump}"]`);if(row){row.scrollIntoView({block:'center',behavior:'smooth'});row.classList.add('flash');setTimeout(()=>row.classList.remove('flash'),1600);}return;}
  if(d.assetOpen){openAsset(d.assetOpen);return;}
  if(d.assetCopy){const a=state.assets.find(x=>x.id===d.assetCopy);if(a)copyText(a.prompt);return;}
  if(d.assetAgent){insertAssetToAgent(d.assetAgent);return;}
  if(d.assetDelete){deleteAsset(d.assetDelete);return;}
  if(d.assetDownload){downloadAssetImage(d.assetDownload);return;}
  if(d.assetImgCopy){const [id,idx]=d.assetImgCopy.split(':');const im=state.assets.find(x=>x.id===id)?.images[Number(idx)];if(im?.prompt)copyText(im.prompt);return;}
  if(d.restoreVersion){restoreVersion(d.restoreVersion);return;}
  if(d.diffVersion){openVersionDiff(d.diffVersion);return;}
  if(d.branchVersion){restoreVersion(d.branchVersion,true);return;}
  if(d.takeAdd){openTakeDialog(d.takeAdd);return;}
  if(d.takeEdit){const [vid,kid]=d.takeEdit.split(':');openTakeDialog(vid,kid);return;}
  if(d.takeBest){const [vid,kid]=d.takeBest.split(':');toggleTakeBest(vid,kid);return;}
  if(d.takeDel){const [vid,kid]=d.takeDel.split(':');deleteTake(vid,kid);return;}
  if(button.id==='takeCompareOpen'){openTakeCompare();return;}
  if(button.id==='takeSave'){saveTakeFromDialog();return;}
  if(d.tab){selectEditorTab(d.tab);return;}
  if(d.action==='new-draft'){startDraft();return;}
  if(d.action==='new-folder'){folderForm();return;}
  if(d.action==='open-agent'){openAgent();return;}
  if(d.action==='reset'){resetFilters();return;}
  if(button.id==='playPreview'){playPreview();return;}
  if(button.id==='featuredUse'){startDraft(FEATURED_ID);return;}
  if(button.id==='featuredPreview'){openPreview(FEATURED_ID);return;}
  if(button.id==='confirmImport'){confirmImport();return;}
  if(button.id==='cancelImport')discardImport();
  if(button.id==='previewAgent'){const id=ui.previewId;$('#previewDialog').close();insertToAgent(id);return;}
  if(button.id==='agentFromEditor'){insertDraftToAgent();return;}
  if(button.id==='agentContextRemove'){agent.context=null;renderAgentContext();return;}
  if(button.id==='lintRerun'){LINT_CACHE.clear();renderLint();toast(t('lintRerunDone'));return;}
  if(button.id==='lintExport'){exportLintReport();return;}
  if(button.id==='lintCopyFixed'){copyLintFixed();return;}
  if(button.id==='lintReset'){state.settings.lint=defaultLint();LINT_CACHE.clear();saveState();renderLint();renderLibrary();return;}
});
document.addEventListener('change',e=>{
  if(e.target.dataset?.moodSelect){const id=e.target.dataset.moodSelect;if(e.target.checked)ui.moodSel.add(id);else ui.moodSel.delete(id);e.target.closest('.mood-card')?.classList.toggle('is-checked',e.target.checked);renderMoodControls();return;}
  if(e.target.id==='boardBudget'){const n=Math.round(Number(e.target.value));state.settings.boardBudget=Number.isFinite(n)&&n>0?Math.min(600,n):60;e.target.value=state.settings.boardBudget;queueSave();renderBoardLint();return;}
  if(e.target.dataset?.takeSelect){toggleTakeSelect(e.target.dataset.takeSelect,e.target.checked);return;}
  const rule=e.target.dataset?.lintRule;
  if(rule){state.settings.lint.rules[rule]=e.target.checked;LINT_CACHE.clear();queueSave();renderLint();renderLibrary();return;}
  if(e.target.id==='lintModel'){ui.lintModel=e.target.value;renderLint();return;}
  if(e.target.id==='lintLevel'){state.settings.lint.level=e.target.value;LINT_CACHE.clear();queueSave();renderLint();renderLibrary();return;}
});
$('#homeLink').onclick=e=>{e.preventDefault();setView('library');};
$('#newFolder').onclick=()=>folderForm();
$('#themeToggle').onclick=()=>{state.settings.theme=state.settings.theme==='light'?'dark':'light';saveState();setStaticText();};
$('#langToggle').onclick=()=>{state.settings.lang=state.settings.lang==='zh'?'en':'zh';saveState();renderAll();};
$('#menuToggle').onclick=()=>{if(window.innerWidth<=1180){ui.editorOpen=false;ui.agentOpen=false;}document.body.classList.toggle('sidebar-visible');syncDrawers();};
$('#editorToggle').onclick=()=>{ui.editorOpen=!ui.editorOpen;if(ui.editorOpen)ui.agentOpen=false;document.body.classList.remove('sidebar-visible');syncDrawers();};
$('#editorClose').onclick=()=>{ui.editorOpen=false;syncDrawers();$('#editorToggle').focus();};
$('#drawerScrim').onclick=()=>{ui.editorOpen=false;ui.agentOpen=false;document.body.classList.remove('sidebar-visible');syncDrawers();};
$('#searchInput').addEventListener('input',()=>{ui.q=$('#searchInput').value;ui.limit=PAGE_SIZE;clearTimeout(searchTimer);searchTimer=setTimeout(renderLibrary,140);});
document.addEventListener('input',e=>{const note=e.target.closest('[data-board-note]');if(!note)return;const entry=state.board.find(b=>b.id===note.dataset.boardNote);if(entry){entry.note=note.value;queueSave();if(ui.boardLintOpen)renderBoardLint();}});
document.addEventListener('input',e=>{if(e.target.id&&e.target.id.startsWith('takeScore-')){const out=e.target.closest('.take-slider')?.querySelector('output');if(out)out.textContent=Number(e.target.value).toFixed(1);}});
$('#takeDialog').addEventListener('close',()=>{ui.takeEdit=null;});
$('#takeCompare').addEventListener('close',()=>{$$('#takeCompare video').forEach(v=>{v.pause();v.removeAttribute('src');v.load();});});
for(const [id,key]of[['modelFilter','model'],['durationFilter','duration'],['aspectFilter','aspect'],['tagFilter','tag']])$('#'+id).onchange=e=>{ui[key]=e.target.value;ui.limit=PAGE_SIZE;renderLibrary();};
$('#sortFilter').onchange=e=>{if(ui.view==='assets')ui.assetSort=e.target.value;else ui.sort=e.target.value;ui.limit=PAGE_SIZE;renderLibrary();};
$('#moodSearch').addEventListener('input',()=>{ui.mood.q=$('#moodSearch').value;ui.limit=PAGE_SIZE;clearTimeout(searchTimer);searchTimer=setTimeout(renderLibrary,140);});
$('#moodDim').onchange=e=>{ui.mood.dim=e.target.value;ui.limit=PAGE_SIZE;renderLibrary();};
$('#moodMode').onchange=e=>{ui.mood.mode=e.target.value;ui.limit=PAGE_SIZE;renderLibrary();};
$('#moodSort').onchange=e=>{ui.mood.sort=e.target.value;ui.limit=PAGE_SIZE;renderLibrary();};
$('#moodSize').addEventListener('input',e=>{ui.mood.size=Number(e.target.value);$('#moodSizeOut').textContent=ui.mood.size;$('#cardGrid').dataset.size=ui.mood.size;});
$('#recipeSkeleton').onchange=e=>{ui.recipe.skeleton=e.target.value;renderRecipe();};
$('#recipeModel').onchange=e=>{ui.recipe.model=e.target.value;renderRecipe();};
$('#recipeTone').onchange=e=>{ui.recipe.tone=e.target.value;renderRecipe();};
$('#recipeAspect').onchange=e=>{ui.recipe.aspect=e.target.value;renderRecipe();};
$('#recipeDuration').addEventListener('input',e=>{ui.recipe.duration=Number(e.target.value);renderRecipe();});
document.addEventListener('dragstart',e=>{const card=e.target.closest?.('[data-mood-drag]');if(!card)return;e.dataTransfer.setData('text/frame-id',card.dataset.moodDrag);e.dataTransfer.setData('text/plain',card.dataset.moodDrag);e.dataTransfer.effectAllowed='copy';card.classList.add('dragging');document.body.classList.add('mood-dragging');});
document.addEventListener('dragend',e=>{e.target.closest?.('[data-mood-drag]')?.classList.remove('dragging');document.body.classList.remove('mood-dragging');$$('.drop-ready').forEach(el=>el.classList.remove('drop-ready'));});
document.addEventListener('dragover',e=>{if(!e.dataTransfer.types.includes('text/frame-id'))return;const zone=e.target.closest?.('#cardGrid,[data-view="sequence"]');if(!zone||(zone.id==='cardGrid'&&ui.view!=='sequence'))return;e.preventDefault();e.dataTransfer.dropEffect='copy';zone.classList.add('drop-ready');});
document.addEventListener('dragleave',e=>{const zone=e.target.closest?.('#cardGrid,[data-view="sequence"]');if(zone&&!zone.contains(e.relatedTarget))zone.classList.remove('drop-ready');});
document.addEventListener('drop',e=>{const zone=e.target.closest?.('#cardGrid,[data-view="sequence"]');if(!zone||(zone.id==='cardGrid'&&ui.view!=='sequence'))return;const id=e.dataTransfer.getData('text/frame-id');if(!id)return;e.preventDefault();zone.classList.remove('drop-ready');document.body.classList.remove('mood-dragging');addToBoard('shot',id);});
$('#resetFilters').onclick=resetFilters;
$('#filterToggle').onclick=toggleFilterPopover;
$('#curatedToggle').onclick=()=>{ui.sort=ui.sort==='source'?'all':'source';ui.limit=PAGE_SIZE;renderFilters();renderLibrary();};
document.addEventListener('click',e=>{if(!$('#filterPopover').hidden&&!e.target.closest('#filterRow'))closeFilterPopover();});
$('#loadMore').onclick=()=>{ui.limit+=PAGE_SIZE;renderLibrary();};
for(const [id,key]of[['draftName','name'],['promptEditor','prompt'],['draftNotes','notes']]){$('#'+id).addEventListener('input',e=>updateDraft(key,e.target.value));$('#'+id).addEventListener('blur',()=>{saveState();if(ui.view==='drafts')renderLibrary();});}
$('#editorFavorite').onclick=()=>{const id=currentDraft()?.sourceId;if(id)toggleFavorite(id);};
$('#editorFolder').onchange=e=>{const id=currentDraft()?.sourceId;if(!id)return;ensureFavorite(id).folderId=e.target.value||null;saveState();renderNav();renderLibrary();renderOrganization();toast(t('savedToFolder'));};
$('#tagInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();addTag();}});
$('#addTag').onclick=addTag;
$('#saveVersion').onclick=saveVersion;
$('#copyDraft').onclick=()=>copyText(currentDraft()?.prompt||'',$('#promptEditor'));
$('#copyOriginal').onclick=()=>copyText(ITEMS.get(currentDraft()?.sourceId)?.prompt||'');
$('#previewCopy').onclick=()=>copyText(ITEMS.get(ui.previewId)?.prompt||'');
$('#previewCard').onclick=()=>exportRecipeCard(ITEMS.get(ui.previewId));
$('#previewCardMd').onclick=()=>exportRecipeCardMd(ITEMS.get(ui.previewId));
$('#previewUse').onclick=()=>{const id=ui.previewId;$('#previewDialog').close();startDraft(id);};
$('#previewFavorite').onclick=()=>toggleFavorite(ui.previewId);
$('#assetName').addEventListener('input',e=>updateAsset('name',e.target.value));
$('#assetPrompt').addEventListener('input',e=>{updateAsset('prompt',e.target.value);$('#assetPromptLength').textContent=t('chars',{n:e.target.value.length});});
for(const id of ['assetName','assetPrompt'])$('#'+id).addEventListener('blur',()=>{saveState();if(ui.view==='assets')renderLibrary();});
$('#assetCopy').onclick=()=>copyText(currentAsset()?.prompt||'',$('#assetPrompt'));
$('#assetApply').onclick=()=>applyAssetPrompt(ui.assetId);
$('#assetToAgent').onclick=()=>{const id=ui.assetId;$('#assetDialog').close();insertAssetToAgent(id);};
$('#assetDelete').onclick=()=>deleteAsset(ui.assetId);
$('#assetDialog').addEventListener('close',()=>{if(!$('#assetDialog').open)ui.assetId=null;});
$('#agentLauncher').onclick=()=>ui.agentOpen?closeAgent():openAgent();
$('#agentClose').onclick=()=>{closeAgent();$('#agentLauncher').focus();};
$('#agentSettingsOpen').onclick=openAgentSettings;
$('#agentStatus').onclick=openAgentSettings;
$('#agentSave').onclick=saveAgentSettings;
$('#llmTest').onclick=testLLM;
$('#probeRun').onclick=probeGateway;
$('#agentSend').onclick=()=>runAgent('chat');
$('#agentImprove').onclick=()=>runAgent('improve');
$('#agentImages').onclick=()=>runAgent('images');
$('#agentClear').onclick=clearAgent;
$('#skillSelect').onchange=e=>{state.settings.skill=e.target.value;saveState();renderSkillPicker();const s=activeSkill();if(s)toast(t('skillSet',{name:state.settings.lang==='zh'?s.zh:s.en}));};
$('#skillApply').onclick=()=>{if(!activeSkill())return;if(!agent.context&&currentDraft())insertDraftToAgent();runAgent('improve');};
$('#agentInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();runAgent('chat');}});
$('#previewDialog').addEventListener('close',()=>{const video=$('#previewMedia video');if(video){video.pause();video.removeAttribute('src');video.load();}$('#previewMedia').replaceChildren();ui.previewId=null;});
$('#dialogForm').onsubmit=async e=>{
  e.preventDefault();
  if($('#formSubmit').disabled)return;
  const value=$('#formInput').value.trim();
  if(!$('#formInput').hidden&&!value){$('#formError').textContent=t('nameRequired');return;}
  $('#formSubmit').disabled=true;
  try{await formCallback?.(value);$('#formDialog').close();}
  catch(error){$('#formError').textContent=error.message;}
  finally{$('#formSubmit').disabled=false;}
};
$('#formDialog').addEventListener('close',()=>{if(!$('#formDialog').open)formCallback=null;});
$('#backupOpen').onclick=openBackup;
$('#exportBackup').onclick=exportBackup;
$('#chooseBackup').onclick=()=>{$('#backupFile').value='';$('#backupFile').click();};
$('#importLegacy').onclick=readLegacy;
$('#backupDialog').addEventListener('close',()=>{if(!$('#backupDialog').open)discardImport();});
$('#backupFile').addEventListener('change',async event=>{
  discardImport();
  const file=event.target.files[0], selection=importSelection;
  if(!file)return;
  if(file.size>50*1024*1024){toast(t('fileTooLarge'));return;}
  try{
    const content=await file.text();
    if(selection!==importSelection)return;
    showImportPreview(parseBackup(content));
  }catch{if(selection===importSelection)toast(t('invalidBackup'));}
});
$$('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}}));
$$('[role="tab"]').forEach(tab=>tab.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const keys=['edit','reference','versions','lint'];const index=keys.indexOf(ui.editorTab);const next=keys[(index+(e.key==='ArrowRight'?1:keys.length-1))%keys.length];selectEditorTab(next);$(`[data-tab="${next}"]`).focus();}));
document.addEventListener('keydown',e=>{
  if(guide.open){
    if(e.key==='Escape'){e.preventDefault();endGuide(false);return;}
    if(e.key==='ArrowRight'){e.preventDefault();guideNext();return;}
    if(e.key==='ArrowLeft'){e.preventDefault();guidePrev();return;}
    if(e.key==='Tab'){const f=$$('#guideCard button:not([disabled])');if(f.length){const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}return;}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();saveState();return;}
    e.preventDefault();return;
  }
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if($('#paletteDialog').open)$('#paletteDialog').close();else if(!$('dialog[open]'))openPalette();return;}
  if(e.key==='Escape'&&!$('#filterPopover').hidden){e.preventDefault();closeFilterPopover();return;}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();saveState();}
  if(e.key==='Escape'&&!$('dialog[open]')&&window.innerWidth<=1180){ui.editorOpen=false;ui.agentOpen=false;document.body.classList.remove('sidebar-visible');syncDrawers();}
  if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.target.matches('input,textarea,[contenteditable]')&&!$('dialog[open]')){e.preventDefault();$('#searchInput').focus();}
  if(e.key.toLowerCase()==='n'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.target.matches('input,textarea,[contenteditable]')&&!$('dialog[open]'))startDraft();
  if(!e.ctrlKey&&!e.metaKey&&!e.altKey&&!guide.open&&!$('dialog[open]')&&!e.target.matches('input,textarea,select,[contenteditable]')&&['library','favorites','folder','recent'].includes(ui.view)){
    const key=e.key.toLowerCase();
    const cards=$$('#cardGrid .prompt-card');
    if(key==='j'&&cards.length){e.preventDefault();ui.focusIndex=Math.min(ui.focusIndex+1,cards.length-1);applyKbdFocus(true);}
    else if(key==='k'&&cards.length){e.preventDefault();ui.focusIndex=Math.max(ui.focusIndex-1,0);applyKbdFocus(true);}
    else if(key==='escape'&&ui.focusIndex>=0){e.preventDefault();ui.focusIndex=-1;applyKbdFocus();}
    else if(['enter','c','b'].includes(key)&&ui.focusIndex>=0&&cards[ui.focusIndex]&&!(key==='enter'&&e.target.closest('button,a'))){
      e.preventDefault();
      const id=cards[ui.focusIndex].dataset.itemId,item=ITEMS.get(id);
      if(item){if(key==='enter')startDraft(id);else if(key==='c'){touchRecent(id);copyText(item.prompt);}else addToBoard('shot',id);}
    }
  }
});
$('#paletteOpen').onclick=openPalette;
$('#guideLauncher').onclick=()=>startGuide();
$('#guideNext').onclick=guideNext;
$('#guidePrev').onclick=guidePrev;
$('#guideSkip').onclick=()=>endGuide(false);
$('#guideClose').onclick=()=>endGuide(false);
$('#paletteInput').addEventListener('input',()=>{paletteIndex=0;renderPalette();});
$('#paletteInput').addEventListener('keydown',e=>{
  if(e.isComposing)return;
  if(e.key==='ArrowDown'){e.preventDefault();paletteIndex=Math.min(paletteIndex+1,Math.max(paletteItems.length-1,0));renderPalette();}
  else if(e.key==='ArrowUp'){e.preventDefault();paletteIndex=Math.max(paletteIndex-1,0);renderPalette();}
  else if(e.key==='Enter'){e.preventDefault();runPalette(paletteIndex);}
});
$('#paletteList').addEventListener('mousemove',e=>{const item=e.target.closest('[data-palette]');if(item&&Number(item.dataset.palette)!==paletteIndex){paletteIndex=Number(item.dataset.palette);renderPalette();}});
window.addEventListener('resize',syncDrawers);
window.addEventListener('resize',()=>{if(guide.open)placeGuide();});
window.addEventListener('scroll',()=>{if(guide.open)placeGuide();},true);
window.addEventListener('beforeprint',()=>{if(ui.view==='sequence'&&boardRows().length){renderPrintSheet();document.body.classList.add('printing-board');}});
window.addEventListener('afterprint',()=>document.body.classList.remove('printing-board'));
window.addEventListener('beforeunload',e=>{
  if(JSON.stringify(state)===savedStateSnapshot)return;
  saveState();e.preventDefault();e.returnValue='';
});
window.addEventListener('pagehide',()=>{if(JSON.stringify(state)!==savedStateSnapshot)saveState();});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&JSON.stringify(state)!==savedStateSnapshot)saveState();});
window.addEventListener('storage',e=>{if((e.key===STORE_KEY&&e.newValue!==lastWrite)||e.key===null){clearTimeout(autosaveTimer);storageBlocked=true;storageProblem='unsavedElsewhere';showStorageWarning();}});
const tcStart=performance.now();
setInterval(()=>{
  const el=$('#sessionTimecode');if(!el)return;
  const ms=performance.now()-tcStart,total=Math.floor(ms/1000);
  const text=String(Math.floor(total/3600)).padStart(2,'0')+':'+String(Math.floor(total/60)%60).padStart(2,'0')+':'+String(total%60).padStart(2,'0')+':'+String(Math.floor(ms%1000/1000*24)).padStart(2,'0');
  el.textContent=text;
  const hero=$('#heroTimecode');if(hero)hero.textContent='TC '+text;
},125);
renderAll();
if(!state.settings.guideSeen&&!storageBlocked){setTimeout(()=>{if(!state.settings.guideSeen&&!guide.open&&!$('dialog[open]'))startGuide();},700);}

