'use strict';

const CATALOG = JSON.parse(document.getElementById('catalog-data').textContent);
const ITEMS = new Map(CATALOG.map(item => [item.id, item]));
const STORE_KEY = 'frame_studio_v1';
const RELAY = window.__STUDIO_RELAY__ || '';
const PAGE_SIZE = 24;
const FEATURED_ID = 'generated-with-minimax-h3-on-116099-010115027';
const CURATED_IDS = [
  'minimax-h3-keeps-delivering-beautiful-vfx-sequences-725200-010115029',
  '15-second-cinematic-showdown-between-the-most-technolog-354071-010104001',
  'an-other-great-use-for-product-showcase-096175-010117032',
  'high-fashion-avant-garde-the-architectural-organza-a-performer-steps-204066-010122021',
  'hailuo-h3-one-drop-fifteen-seconds-the-crown-takes-seven-315301-010105106',
  FEATURED_ID
];
const CURATED_RANK = new Map(CURATED_IDS.map((id,index)=>[id,index]));
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
const now = () => new Date().toISOString();
const clone = value => JSON.parse(JSON.stringify(value));
const ICONS = {
  plus:'M12 5v14M5 12h14', close:'m6 6 12 12M6 18 18 6', search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
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
  bookmark:'M6 3h12v18l-6-4-6 4z'
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[name] || ICONS.film}"/></svg>`;
const TEXT = {
  zh: {
    skip:'跳到内容',brandCaption:'我的视频创作工作台',newDraft:'新建创作',workspace:'工作空间',collections:'我的收藏夹',newFolder:'新建收藏夹',localStorage:'本地保存 · 属于你自己',backupHint:'定期备份，让灵感安心留存。',backupManage:'备份与迁移',menu:'展开导航',offlineReady:'离线灵感库',theme:'切换深浅主题',editor:'创作台',search:'搜索',searchPlaceholder:'搜索灵感、中文标题、场景或标签…',duration:'视频时长',aspect:'视频画幅',tags:'标签',reset:'重置',sort:'排序',loadMore:'加载更多灵感',attribution:'案例来自 BeatAPI，原作者及来源随条目保留。',personalUse:'仅供个人学习与创作参考',closeEditor:'收起创作台',emptyEditorTitle:'灵感的下一步，是你的创作。',emptyEditorText:'选一个喜欢的案例，使用模板开始。原始提示词始终为你保留。',blankDraft:'从空白开始',stepFind:'寻找灵感',stepEdit:'改成你的故事',stepCopy:'复制去生成',draftName:'创作名称',untitled:'未命名创作',saveToFolder:'收藏到文件夹',addTag:'添加标签',tagPlaceholder:'添加标签，按回车确认',editTab:'编辑提示词',referenceTab:'原文对照',versionsTab:'版本',promptLabel:'PROMPT / 提示词',promptPlaceholder:'描述你想生成的画面、动作、镜头和氛围…',notes:'创作备注',notesHint:'备注不会被复制',notesPlaceholder:'记录要修改的主体、参考风格、生成平台或实验结果…',referenceHint:'原文只读，不会因编辑而改变。',versionsHint:'保存关键节点，随时回到之前的想法。',copyOriginal:'复制原文',saveVersion:'保存版本',copyToGenerate:'复制去生成',noApi:'不连接生成 API，不消耗生成额度。',close:'关闭',originalPrompt:'原始提示词',useTemplate:'使用此模板',originalSource:'原作者来源',cancel:'取消',confirm:'确定',backupExplanation:'收藏、标签、收藏夹、草稿、版本和素材组都保存在当前浏览器。导出备份后，可在另一台设备或浏览器中导入。',fullBackup:'完整工作台备份',fullBackupHint:'包含全部个人数据与素材图片，不含案例视频或缩略图。',export:'导出',importBackup:'导入与合并',importBackupHint:'相同条目合并，冲突草稿另存副本，不覆盖本地编辑。',chooseFile:'选择文件',legacyImport:'旧页面收藏迁移',legacyHint:'支持旧版“导出收藏”JSON，或读取同一浏览器可访问的旧收藏。',readLegacy:'读取旧收藏',storageNote:'离线文件与本地服务的浏览器存储不互通；清理浏览器数据会删除本地记录，请先备份。',library:'灵感库',favorites:'我的收藏',drafts:'我的草稿',all:'全部',allDurations:'全部时长',allAspects:'全部画幅',allTags:'全部标签',sourceOrder:'精选顺序',shortest:'时长从短到长',longest:'时长从长到短',titleOrder:'标题排序',recent:'最近编辑',libraryTitle:'把灵感，变成下一帧。',libraryDescription:'浏览真实案例，收集喜欢的风格，为你的下一个故事找到起点。',favoritesDescription:'值得再看一次的画面，留给下一次创作。',draftsDescription:'每一个未完成的想法，都值得继续。',folderDescription:'把同一项目的灵感，放在一起。',statPrompts:'个视频案例',statCategories:'种创作类型',statFavorites:'个灵感已收藏',items:'条',results:'{n} 条灵感',draftResults:'{n} 份草稿',visibleCount:'已展示 {n} / {total}',approxRatios:'画幅筛选按近似比例分组，卡片保留真实画幅',draftSearch:'搜索草稿名称、提示词或备注…',noResults:'还没有找到匹配的灵感',noResultsHint:'试试其他关键词，或放宽筛选条件。',noFavorites:'把喜欢的画面留下来',noFavoritesHint:'点击案例上的收藏按钮，你的灵感会出现在这里。',noDrafts:'下一个故事，从这里开始',noDraftsHint:'使用一个模板，或新建一份空白创作。',browseLibrary:'去灵感库看看',favorite:'收藏模板',favorited:'已收藏',removeFavorite:'取消收藏',preview:'查看案例',removeTag:'移除标签',ungrouped:'未分组收藏',original:'原文',chars:'{n} 字符',autosaved:'已自动保存到本机',saving:'正在保存…',saveFailed:'本地保存失败；请立即导出备份，避免丢失本次编辑。',storageCorrupt:'已有本地数据无法读取，未覆盖它；请先导出或检查浏览器存储。',versionName:'版本名称',versionDefault:'版本 {n}',versionSaved:'版本已保存',versionLimit:'每份草稿最多保存 200 个版本，请先导出备份。',noVersions:'还没有保存的版本',noVersionsHint:'点击下方“保存版本”，给当前想法留一个快照。',restore:'恢复此版本',restoreTitle:'恢复历史版本？',restoreHint:'当前内容会先保存为恢复前快照，再载入选择的版本。',beforeRestore:'恢复前自动快照',restored:'已恢复，原内容已保留为快照',noReference:'这是空白创作，没有关联的原始模板。',sourceDetails:'查看来源案例',templateLoaded:'模板已载入，原文保持不变',continueDraft:'继续编辑',deleteDraft:'删除草稿',deleteDraftTitle:'删除这份草稿？',deleteDraftHint:'这会删除草稿及其版本，不影响原始模板。建议先导出备份。',deleted:'已删除',copied:'提示词已复制，可以粘贴到生成工具',copyFailed:'自动复制不可用，请选中文本后按 Ctrl/Cmd+C。',nameRequired:'请输入名称',folderName:'收藏夹名称',folderPlaceholder:'例如：产品广告 / 新片参考',folderExists:'已有同名收藏夹',renameFolder:'重命名收藏夹',deleteFolder:'删除收藏夹',deleteFolderHint:'收藏内容不会删除，将移至未分组收藏。',folderCreated:'收藏夹已创建',folderRenamed:'收藏夹已重命名',savedToFolder:'已收藏并加入收藏夹',tagLimit:'最多添加 30 个标签',savedTag:'已添加标签并收藏模板',videoOnline:'在线播放 · 需要联网',playVideo:'播放参考视频',videoFailed:'视频暂时无法加载，请查看原始页面；提示词仍可使用。',externalLink:'打开原始页面',backupExported:'已导出完整备份',backupReady:'准备合并：{f} 条收藏 · {c} 个收藏夹 · {d} 份草稿 · {a} 组素材',mergeBackup:'确认合并',imported:'已合并导入，原有创作保留',invalidBackup:'无法导入：文件格式或内容无效，未更改任何数据。',fileTooLarge:'文件超过 50 MB，请选择较小的 JSON 备份。',noLegacy:'没有找到可访问的旧收藏；请在旧页面导出 JSON 后选择文件导入。',conflictCopy:'导入副本',oldFavorites:'旧版收藏',untagged:'无标签',readOnly:'只读',savedAt:'保存于 {time}',seconds:'{n} 秒',aspectOther:'其他画幅',workingOn:'正在编辑',firstVersion:'初始版本',emptyPrompt:'先写一点提示词，再复制或保存版本。',unsavedElsewhere:'另一个窗口更新了数据。此窗口已停止写入，请先导出当前内容，再刷新合并。',formInputLabel:'名称',backupComplete:'备份',draftCreated:'新创作已建立',heroTitle:'下一帧，\n由你想象。',heroDescription:'从一个画面出发，让灵感成为你的作品。',heroAction:'从此刻开始创作',featuredCase:'精选案例',agent:'智能体助手',agentLauncher:'智能体',closeAgent:'收起助手',agentSettings:'智能体设置',agentSettingsHint:'兼容 OpenAI 接口格式；地址可填 Base URL 或完整接口路径。密钥仅保存在本机浏览器，不会发往任何第三方。',agentLLM:'语言模型 · 优化与对话',agentImage:'文生图 · 关键素材',baseUrl:'API 地址',apiKey:'API 密钥',model:'模型名称',imageSize:'输出尺寸',imageCount:'每次生成数量',testConnection:'测试连接',testing:'测试中…',testOk:'连接成功',testFailed:'连接失败：{msg}',save:'保存',agentSaved:'智能体设置已保存到本机',agentInvalidUrl:'API 地址需为 http(s) 链接',agentWelcome:'你好，我是你的分镜助手。在卡片、预览或创作台点「插入助手」，把分镜交给我；我可以按你的要求改写提示词，也拆解关键画面并生成图片素材。先在设置里连接你的语言模型与文生图 API。',agentPlaceholder:'告诉助手你的需求，例如：改成雨夜霓虹氛围…',agentSend:'发送',agentStop:'停止',agentImprove:'优化提示词',agentImages:'生成关键图',agentClear:'清空对话',agentInsert:'插入助手',agentSendDraft:'把当前创作交给助手',agentHint:'对话与图片仅留在本页；设置与密钥保存在本机。',agentContextCatalog:'分镜',agentContextDraft:'创作',agentContextRemove:'移除上下文',agentInserted:'已插入分镜，告诉助手你想怎么改。',agentDraftInserted:'已插入当前创作。',agentNeedContext:'先在页面中选择一个分镜或创作插入助手，再开始优化或生成图片。',agentNeedLLM:'尚未配置语言模型 API。',agentNeedImage:'尚未配置文生图 API。',agentOpenSettings:'打开设置',agentImproveDefault:'请优化这个分镜提示词，让画面更电影感、细节更完整。',agentImagesDefault:'请提取这个分镜的关键画面，生成可直接用于文生图的素材描述。',agentThinking:'正在思考…',agentGenerating:'正在生成关键图 {done}/{total}…',agentStopped:'（已停止）',agentImproved:'改进后的提示词',agentApply:'应用到创作台',agentApplied:'已应用到创作台',agentCopyBlock:'复制',agentDownload:'下载',agentImageFailed:'生成失败：{msg}',agentImagePending:'生成中…',agentKeyImages:'关键图片素材',agentStatusNone:'未连接 API · 点击配置',agentStatusReady:'LLM {llm} · 图像 {img}',agentStatusLLM:'LLM {llm} · 图像未配置',agentStatusImage:'图像 {img} · LLM 未配置',agentNetworkError:'网络请求失败，请检查地址、网络或接口 CORS 设置。',agentNetTimeout:'连接超时：20 秒内未收到响应，网关可能过载或地址指向了无响应的服务。',agentNetMixed:'混合内容被浏览器拦截：当前页面是 https，而接口是 http。请改用 https 接口，或以本地文件方式打开本页。',agentNetCors:'接口网络可达，但浏览器跨域（CORS）校验未通过：网关未返回允许浏览器调用的响应头，此类接口通常只支持服务端调用。',agentNetCorsFile:'接口网络可达，但拒绝了浏览器跨域（CORS）请求。双击打开（file://）时 Origin 为 null，多数网关不允许。请在本机运行 python start_studio.py，用自动打开的 http://127.0.0.1:8787 页面配置模型，请求会自动经本机中转。',agentNetUnreachable:'无法访问该地址：DNS 解析、TCP 连接或 TLS 握手失败。请核对域名与端口、确认服务已启动、检查代理或 VPN 是否覆盖浏览器。',agentCorsHint:'浏览器直连要求接口允许跨域（CORS）。若连接失败：在本机运行 python start_studio.py，浏览器会自动打开 http://127.0.0.1:8787，在该页面设置里直接填写网关地址与密钥即可，请求自动经本机中转，密钥仍只留在本机。',agentRelayHint:'当前页面由本机服务托管：直接填写网关地址与密钥即可，所有请求自动经本机中转，无跨域限制；密钥只经过本机服务发往你填写的网关。',agentNetRelayDown:'本机中转服务没有响应：请确认 start_studio.py 仍在运行，然后重试或刷新页面。',agentAuthError:'密钥无效或权限不足（{status}）。',agentEndpointError:'接口路径不存在（404），请检查 API 地址。',agentRateError:'请求被限流或额度不足（429）。',agentHttpError:'接口返回错误（{status}）。',agentBadOutput:'模型返回内容无法解析。',agentSpecFallback:'未配置语言模型，直接使用分镜提示词生成关键图。',agentCleared:'对话已清空',assets:'素材库',assetsTitle:'素材，成组留存。',assetsDescription:'智能体生成的关键图与提示词按组保存，随时取用、继续打磨。',assetSearch:'搜索素材组名称、提示词或画面描述…',assetSortNew:'最近创建',assetSortOld:'最早创建',assetResults:'{n} 组素材',assetGroups:'组素材',assetImages:'张图片',assetStorage:'本地占用',assetSample:'示例',assetSampleHint:'这是示例素材组，展示分组格式，可随时删除。',noAssets:'还没有素材组',noAssetsHint:'在智能体中生成关键图或优化提示词后，点击「存入素材库」，图片与提示词会成为一组。',assetGenCta:'生成新素材',openAgentAction:'打开智能体',assetOpen:'打开素材组',assetDetail:'素材详情',assetName:'素材组名称',assetSaveTitle:'存入素材库',assetSaveImages:'存入素材库',agentSaveAsset:'存素材',assetSaved:'已存入素材库',assetSavedView:'已入库 · 查看',assetLimit:'素材组已达上限（100 组），请先删除不用的组或导出备份。',assetDeleteTitle:'删除这组素材？',assetDeleteHint:'组内的图片与提示词会一并删除，不影响创作台草稿。建议先导出备份。',assetApplied:'素材提示词已应用到创作台',assetInsert:'送入智能体',assetInserted:'已插入素材组，可以继续优化或生成新图。',agentContextAsset:'素材',assetPromptLabel:'PROMPT / 提示词',assetCopyPrompt:'复制提示词',assetRequest:'生成要求',assetFromAgent:'智能体生成',assetCountLabel:'{n} 张图片',assetPromptOnly:'提示词素材',assetSpecPrompt:'画面提示词',assetDownloadImage:'下载图片',storageFull:'本地保存失败：存储空间不足。请在素材库删除不用的素材组，或导出备份后重试。',assetEmptyGallery:'这一组只保存了提示词，没有图片。',labTitle:'提示词实验室',labHint:'离线分析六个电影维度，无需连接 API。',labScore:'完整度',labMissing:'缺失维度',labComplete:'六维齐全',labElements:'识别到的元素',labNone:'还没有识别到电影元素，试试下面的补全建议。',labFix:'补全',labEnhance:'一键增强',dimSubject:'主体',dimCamera:'镜头',dimLight:'光线',dimMotion:'动态',dimMood:'氛围',dimStyle:'风格',labAdded:'已补全{dim}描述',labEnhanced:'已加入「{name}」增强',searchExpanded:'智能扩展：{terms}',relatedShots:'相似分镜',recentView:'最近使用',recentTitle:'最近，你在打磨这些。',recentDescription:'复制、使用或查看过的分镜会留在这里，随时回到上一次的思路。',noRecent:'还没有使用记录',noRecentHint:'复制或使用一个分镜后，它会出现在这里。',copyShot:'复制提示词',undo:'撤销',undone:'已撤销',favoriteRemoved:'已取消收藏',paletteTitle:'命令面板',palettePlaceholder:'搜索命令或分镜标题…',paletteActions:'命令',paletteShots:'分镜',paletteEmpty:'没有匹配的命令或分镜',paletteHint:'↑↓ 选择 · Enter 执行 · Esc 关闭',cmdLang:'切换语言',cmdCopy:'复制当前提示词',intentCinematic:'更电影感',intentRain:'雨夜霓虹',intentSlow:'慢镜头特写',intentVertical:'竖屏 5 秒',intentFix:'补全缺失维度'
  },
  en: {
    skip:'Skip to content',brandCaption:'Your video creation workspace',newDraft:'New creation',workspace:'Workspace',collections:'Collections',newFolder:'New collection',localStorage:'Local storage · Yours to keep',backupHint:'Back up your ideas, keep them safe.',backupManage:'Backup & migration',menu:'Open navigation',offlineReady:'Offline library',theme:'Toggle color theme',editor:'Workspace',search:'Search',searchPlaceholder:'Search ideas, titles, scenes or tags…',duration:'Video duration',aspect:'Aspect ratio',tags:'Tags',reset:'Reset',sort:'Sort',loadMore:'Load more ideas',attribution:'Examples from BeatAPI. Original authors and sources are credited.',personalUse:'For personal learning and creative reference',closeEditor:'Close workspace',emptyEditorTitle:'The next frame starts with you.',emptyEditorText:'Find an example you love and make it your own. The original prompt stays untouched.',blankDraft:'Start from scratch',stepFind:'Find inspiration',stepEdit:'Make it your story',stepCopy:'Copy to generate',draftName:'Creation name',untitled:'Untitled creation',saveToFolder:'Save to collection',addTag:'Add tag',tagPlaceholder:'Type a tag, press Enter',editTab:'Edit prompt',referenceTab:'Original',versionsTab:'Versions',promptLabel:'PROMPT',promptPlaceholder:'Describe the scene, action, camera movement and mood…',notes:'Creative notes',notesHint:'Not included when copying',notesPlaceholder:'Keep subject changes, style references, generation tools or experiment results here…',referenceHint:'The original is read-only and never changes with your edits.',versionsHint:'Save milestones and return to earlier ideas anytime.',copyOriginal:'Copy original',saveVersion:'Save version',copyToGenerate:'Copy to generate',noApi:'No generation API connected. No credits consumed.',close:'Close',originalPrompt:'ORIGINAL PROMPT',useTemplate:'Use template',originalSource:'Original source',cancel:'Cancel',confirm:'Confirm',backupExplanation:'Favorites, tags, collections, drafts, versions and asset groups stay in this browser. Export a backup to transfer them to another device or browser.',fullBackup:'Full workspace backup',fullBackupHint:'Includes all personal data and asset images, without case videos or thumbnails.',export:'Export',importBackup:'Import & merge',importBackupHint:'Matching items merge; conflicting drafts become copies. Local edits are not overwritten.',chooseFile:'Choose file',legacyImport:'Migrate old favorites',legacyHint:'Import JSON from the old page, or read old favorites accessible in this browser.',readLegacy:'Read old favorites',storageNote:'File mode and the local server use separate browser storage. Clearing browser data deletes local records; export first.',library:'Inspiration',favorites:'Favorites',drafts:'My drafts',all:'All',allDurations:'All durations',allAspects:'All aspects',allTags:'All tags',sourceOrder:'Curated order',shortest:'Shortest first',longest:'Longest first',titleOrder:'By title',recent:'Recently edited',libraryTitle:'Your idea. The next frame.',libraryDescription:'Explore real examples, collect your favorite styles, and find a starting point for your next story.',favoritesDescription:'The frames worth keeping for your next creation.',draftsDescription:'Every unfinished idea deserves another look.',folderDescription:'Keep the inspiration for one project together.',statPrompts:'video examples',statCategories:'creative categories',statFavorites:'saved inspirations',items:'items',results:'{n} ideas',draftResults:'{n} drafts',visibleCount:'Showing {n} / {total}',approxRatios:'Aspect filters group nearby ratios; cards retain actual ratios',draftSearch:'Search draft names, prompts or notes…',noResults:'No matching inspiration yet',noResultsHint:'Try another keyword or relax the filters.',noFavorites:'Keep the frames you love',noFavoritesHint:'Favorite an example and your inspiration will appear here.',noDrafts:'Your next story starts here',noDraftsHint:'Use a template or create a blank draft.',browseLibrary:'Explore the library',favorite:'Favorite template',favorited:'Favorited',removeFavorite:'Remove favorite',preview:'View example',removeTag:'Remove tag',ungrouped:'Unsorted favorites',original:'Original',chars:'{n} characters',autosaved:'Auto-saved locally',saving:'Saving…',saveFailed:'Local save failed. Export a backup now to protect your edits.',storageCorrupt:'Stored data could not be read. It has not been overwritten; check or export storage first.',versionName:'Version name',versionDefault:'Version {n}',versionSaved:'Version saved',versionLimit:'Each draft supports 200 versions. Export a backup first.',noVersions:'No saved versions yet',noVersionsHint:'Save a version below to capture this moment.',restore:'Restore version',restoreTitle:'Restore this version?',restoreHint:'Your current content will be saved as a recovery snapshot before restoring.',beforeRestore:'Automatic pre-restore snapshot',restored:'Restored. Previous content is preserved.',noReference:'This is a blank creation without an original template.',sourceDetails:'View source example',templateLoaded:'Template loaded. The original is unchanged.',continueDraft:'Continue editing',deleteDraft:'Delete draft',deleteDraftTitle:'Delete this draft?',deleteDraftHint:'This deletes the draft and its versions, not the original template. Consider exporting first.',deleted:'Deleted',copied:'Prompt copied. Paste it into your generation tool.',copyFailed:'Automatic copy unavailable. Select the text and press Ctrl/Cmd+C.',nameRequired:'Enter a name',folderName:'Collection name',folderPlaceholder:'e.g. Product films / New project',folderExists:'A collection with this name already exists',renameFolder:'Rename collection',deleteFolder:'Delete collection',deleteFolderHint:'Favorites will not be deleted. They move to Unsorted favorites.',folderCreated:'Collection created',folderRenamed:'Collection renamed',savedToFolder:'Favorited and added to collection',tagLimit:'Maximum 30 tags per item',savedTag:'Tag added and template favorited',videoOnline:'Online playback · Internet required',playVideo:'Play reference video',videoFailed:'Video could not load. Open the original page; the prompt is still available.',externalLink:'Open original page',backupExported:'Full backup exported',backupReady:'Ready to merge: {f} favorites · {c} collections · {d} drafts · {a} asset groups',mergeBackup:'Confirm merge',imported:'Import merged. Existing creations are preserved.',invalidBackup:'Import rejected: invalid file format or contents. Nothing was changed.',fileTooLarge:'File exceeds 50 MB. Choose a smaller JSON backup.',noLegacy:'No accessible old favorites found. Export JSON from the old page and choose that file.',conflictCopy:'Imported copy',oldFavorites:'Old favorites',untagged:'No tags',readOnly:'Read-only',savedAt:'Saved {time}',seconds:'{n}s',aspectOther:'Other ratios',workingOn:'Editing',firstVersion:'Initial version',emptyPrompt:'Write a prompt before copying or saving a version.',unsavedElsewhere:'Another window updated the data. Writes are paused here. Export this content, then reload and merge.',formInputLabel:'Name',backupComplete:'Backup',draftCreated:'New creation started',heroTitle:'The next frame\nis yours.',heroDescription:'Begin with a single image and let it become your story.',heroAction:'Start creating now',featuredCase:'Featured case',agent:'Agent copilot',agentLauncher:'Copilot',closeAgent:'Close copilot',agentSettings:'Copilot settings',agentSettingsHint:'OpenAI-compatible endpoints; enter a base URL or a full endpoint path. Keys stay in this browser and are never sent to third parties.',agentLLM:'Language model · rewrite & chat',agentImage:'Text-to-image · key assets',baseUrl:'API endpoint',apiKey:'API key',model:'Model',imageSize:'Output size',imageCount:'Images per run',testConnection:'Test connection',testing:'Testing…',testOk:'Connected',testFailed:'Connection failed: {msg}',save:'Save',agentSaved:'Copilot settings saved locally',agentInvalidUrl:'API endpoint must be an http(s) URL',agentWelcome:'Hi, I am your shot copilot. Insert a shot from any card, preview or the workspace, then ask me to rewrite the prompt or design key frames and generate image assets. Connect your LLM and image APIs in settings first.',agentPlaceholder:'Tell the copilot what you need, e.g. make it a rainy neon night…',agentSend:'Send',agentStop:'Stop',agentImprove:'Rewrite prompt',agentImages:'Key images',agentClear:'Clear chat',agentInsert:'Send to copilot',agentSendDraft:'Send current creation to copilot',agentHint:'Chats and images stay on this page; settings and keys stay on this device.',agentContextCatalog:'Shot',agentContextDraft:'Creation',agentContextRemove:'Remove context',agentInserted:'Shot inserted. Tell the copilot how to change it.',agentDraftInserted:'Current creation inserted.',agentNeedContext:'Insert a shot or creation first, then rewrite or generate images.',agentNeedLLM:'No language model API configured yet.',agentNeedImage:'No text-to-image API configured yet.',agentOpenSettings:'Open settings',agentImproveDefault:'Rewrite this shot prompt with a more cinematic, fully detailed result.',agentImagesDefault:'Extract the key frames of this shot as ready-to-use image prompts.',agentThinking:'Thinking…',agentGenerating:'Generating key images {done}/{total}…',agentStopped:'(stopped)',agentImproved:'Improved prompt',agentApply:'Apply to workspace',agentApplied:'Applied to the workspace',agentCopyBlock:'Copy',agentDownload:'Download',agentImageFailed:'Generation failed: {msg}',agentImagePending:'Rendering…',agentKeyImages:'Key image assets',agentStatusNone:'No API connected · click to configure',agentStatusReady:'LLM {llm} · images {img}',agentStatusLLM:'LLM {llm} · images not configured',agentStatusImage:'Images {img} · LLM not configured',agentNetworkError:'Network request failed. Check the endpoint, connection or CORS policy.',agentNetTimeout:'Connection timed out: no response within 20s. The gateway may be overloaded or the address points at an unresponsive service.',agentNetMixed:'Mixed content blocked: this page is https but the endpoint is http. Use an https endpoint or open this page as a local file.',agentNetCors:'The endpoint is reachable, but the browser CORS check failed: the gateway returns no headers permitting browser calls. Such APIs usually support server-side use only.',agentNetCorsFile:'The endpoint is reachable but rejected the browser CORS request. Opened via file:// the Origin is null, which most gateways disallow. Run python start_studio.py on this machine and configure the model in the page it opens at http://127.0.0.1:8787; requests are relayed locally.',agentNetUnreachable:'Cannot reach this address: DNS, TCP connection or TLS handshake failed. Verify host and port, make sure the service is running, and check whether your proxy/VPN covers the browser.',agentCorsHint:'Direct browser calls require the endpoint to allow CORS. If a connection fails: run python start_studio.py on this machine; the browser opens http://127.0.0.1:8787, where you can enter the gateway URL and key directly. Requests are relayed locally and keys stay on this machine.',agentRelayHint:'This page is hosted by the local service: enter your gateway URL and key directly. Every request is relayed through this machine with no CORS limits; keys only travel from the local service to the gateway you entered.',agentNetRelayDown:'The local relay service is not responding. Make sure start_studio.py is still running, then retry or reload the page.',agentAuthError:'Invalid key or insufficient permissions ({status}).',agentEndpointError:'Endpoint not found (404). Check the API URL.',agentRateError:'Rate limited or out of quota (429).',agentHttpError:'API error ({status}).',agentBadOutput:'Could not parse the model response.',agentSpecFallback:'No LLM configured; using the shot prompt directly for key images.',agentCleared:'Chat cleared',assets:'Assets',assetsTitle:'Assets, kept in groups.',assetsDescription:'Key images and prompts from the copilot are saved as groups, ready to reuse and refine.',assetSearch:'Search group names, prompts or image descriptions…',assetSortNew:'Newest first',assetSortOld:'Oldest first',assetResults:'{n} asset groups',assetGroups:'groups',assetImages:'images',assetStorage:'Local size',assetSample:'Sample',assetSampleHint:'This is a sample group showing the format. Delete it anytime.',noAssets:'No asset groups yet',noAssetsHint:'Generate key images or rewrite a prompt in the copilot, then hit "Save to assets" to group images with their prompt.',assetGenCta:'New assets',openAgentAction:'Open copilot',assetOpen:'Open asset group',assetDetail:'Asset group',assetName:'Group name',assetSaveTitle:'Save to assets',assetSaveImages:'Save to assets',agentSaveAsset:'Save',assetSaved:'Saved to assets',assetSavedView:'Saved · view',assetLimit:'Asset limit reached (100 groups). Delete unused groups or export a backup first.',assetDeleteTitle:'Delete this asset group?',assetDeleteHint:'Its images and prompt are deleted together. Workspace drafts are unaffected. Consider exporting first.',assetApplied:'Asset prompt applied to the workspace',assetInsert:'Send to copilot',assetInserted:'Asset group inserted. Keep refining or generating.',agentContextAsset:'Asset',assetPromptLabel:'PROMPT',assetCopyPrompt:'Copy prompt',assetRequest:'Request',assetFromAgent:'From copilot',assetCountLabel:'{n} images',assetPromptOnly:'Prompt only',assetSpecPrompt:'Image prompt',assetDownloadImage:'Download',storageFull:'Local save failed: storage is full. Delete unused asset groups or export a backup, then retry.',assetEmptyGallery:'This group holds a prompt only, without images.',labTitle:'Prompt lab',labHint:'Offline analysis of six cinematic dimensions. No API needed.',labScore:'Completeness',labMissing:'Missing',labComplete:'All six dimensions present',labElements:'Detected elements',labNone:'No cinematic elements detected yet. Try the suggestions below.',labFix:'Add',labEnhance:'One-tap enhancers',dimSubject:'Subject',dimCamera:'Camera',dimLight:'Light',dimMotion:'Motion',dimMood:'Mood',dimStyle:'Style',labAdded:'Added {dim} description',labEnhanced:'Applied the "{name}" enhancement',searchExpanded:'Expanded: {terms}',relatedShots:'Similar shots',recentView:'Recent',recentTitle:'Recently in your hands.',recentDescription:'Shots you copied, used or viewed stay here for a quick return.',noRecent:'No recent activity',noRecentHint:'Copy or use a shot and it will appear here.',copyShot:'Copy prompt',undo:'Undo',undone:'Undone',favoriteRemoved:'Removed from favorites',paletteTitle:'Command palette',palettePlaceholder:'Search commands or shot titles…',paletteActions:'Commands',paletteShots:'Shots',paletteEmpty:'No matching commands or shots',paletteHint:'↑↓ select · Enter run · Esc close',cmdLang:'Switch language',cmdCopy:'Copy current prompt',intentCinematic:'More cinematic',intentRain:'Rainy neon night',intentSlow:'Slow-motion close-up',intentVertical:'Vertical 5 seconds',intentFix:'Fill missing dimensions'
  }
};
const CATEGORY_ZH = {'cinematic story':'电影叙事','music video':'音乐视频','product commercial':'产品广告','fashion':'时尚大片','action':'动作场景','anime':'动漫','vlog':'生活记录','cinematic travel':'旅行风光','gameplay':'游戏画面','animation':'动画','horror':'惊悚悬疑','motion graphics':'动态图形','comedy':'喜剧','title sequence':'片头设计','brand film':'品牌短片','viral short':'创意短片','other':'其他'};
const ASPECT_ORDER = ['2.39:1','2.35:1','21:9','1.85:1','16:9','3:2','4:3','5:4','1:1','4:5','3:4','2:3','9:16','9:21','other'];
const categoryCounts = new Map();
CATALOG.forEach(item => categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1));
const categories = [...categoryCounts.keys()].sort((a,b) => categoryCounts.get(b) - categoryCounts.get(a));
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
const CATEGORY_HUE = {'cinematic story':38,'music video':320,'product commercial':199,'fashion':340,'action':4,'anime':262,'vlog':152,'cinematic travel':174,'gameplay':222,'animation':24,'horror':356,'motion graphics':210,'comedy':52,'title sequence':80,'brand film':44,'viral short':14,'other':215};
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
let state = {schema:1,settings:{lang:'zh',theme:'dark',agent:clone(DEFAULT_AGENT)},favorites:{},folders:[],drafts:[],activeDraftId:null,assets:[],recent:[]};
let storageBlocked = false;
let storageProblem = '';
let lastWrite = null;
let ui = {view:'library',folderId:null,q:'',category:'',duration:'',aspect:'',tag:'',sort:'source',limit:PAGE_SIZE,editorTab:'edit',previewId:null,editorOpen:false,agentOpen:false,assetId:null,assetSort:'new',staggerNext:true};
const agent = {messages:[],context:null,busy:false,controller:null,current:null};
let autosaveTimer, searchTimer, toastTimer;
let formCallback = null;
let pendingImport = null;
let importSelection = 0;

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
    return {id,name:requireText(a.name,160),prompt:requireText(a.prompt??'',100000),sourceId,sourceTitle:requireText(a.sourceTitle??'',200),createdAt:validDate(a.createdAt),updatedAt:validDate(a.updatedAt),images};
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
    const versions = requireArray(d.versions,200).map(v => ({id:requireText(v.id,100,false),name:requireText(v.name,80,false),prompt:requireText(v.prompt,100000),notes:requireText(v.notes,10000),createdAt:validDate(v.createdAt)}));
    if (new Set(versions.map(v => v.id)).size !== versions.length) throw new Error('Duplicate version');
    return {id:requireText(d.id,100,false),sourceId:d.sourceId,name:requireText(d.name,160),prompt:requireText(d.prompt,100000),notes:requireText(d.notes,10000),createdAt:validDate(d.createdAt),updatedAt:validDate(d.updatedAt),versions};
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
  return {schema:1,settings:{lang:input.settings.lang,theme:input.settings.theme,agent:cleanAgentSettings(input.settings.agent)},folders,favorites,drafts,activeDraftId,assets:cleanAssets(input.assets),recent};
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
  $('#mainNav').innerHTML=navButton('library','library',t('library'),CATALOG.length)+navButton('favorites','heart',t('favorites'),Object.keys(state.favorites).length)+navButton('drafts','edit',t('drafts'),state.drafts.length)+navButton('assets','layers',t('assets'),state.assets.length)+navButton('recent','history',t('recentView'),state.recent.length);
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
  $('#filterRow').hidden=isDraft;
  $('#categoryTabs').hidden=isDraft||isAsset;
  $('#durationFilter').hidden=isAsset;
  $('#aspectFilter').hidden=isAsset;
  $('#tagFilter').hidden=isAsset;
  $('#resetFilters').hidden=isAsset;
  $('#searchInput').placeholder=t(isAsset?'assetSearch':isDraft?'draftSearch':'searchPlaceholder');
  const durations=[...new Set(CATALOG.map(d=>d.duration_seconds))].sort((a,b)=>a-b);
  selectOptions($('#durationFilter'),[['',t('allDurations')],...durations.map(n=>[String(n),t('seconds',{n})])],ui.duration);
  const present = new Set(CATALOG.map(d=>d.aspect_group));
  selectOptions($('#aspectFilter'),[['',t('allAspects')],...ASPECT_ORDER.filter(a=>present.has(a)).map(a=>[a,a==='other'?t('aspectOther'):a])],ui.aspect);
  const tags = [...new Set(Object.values(state.favorites).flatMap(f=>f.tags))].sort((a,b)=>a.localeCompare(b));
  if (ui.tag && !tags.includes(ui.tag)) ui.tag='';
  selectOptions($('#tagFilter'),[['',t('allTags')],...tags.map(tag=>[tag,tag])],ui.tag);
  if (isAsset) selectOptions($('#sortFilter'),[['new',t('assetSortNew')],['old',t('assetSortOld')],['title',t('titleOrder')]],ui.assetSort);
  else selectOptions($('#sortFilter'),[['source',t('sourceOrder')],['short',t('shortest')],['long',t('longest')],['title',t('titleOrder')]],ui.sort);
  $('#categoryTabs').innerHTML=[['',t('all')],...categories.map(c=>[c,categoryName(c)])].map(([key,label])=>`<button class="category-tab ${key===ui.category?'active':''}" data-category="${escapeHTML(key)}" aria-pressed="${key===ui.category}">${escapeHTML(label)}</button>`).join('');
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
    const groups=state.assets.filter(a=>ts.every(x=>(a.name+' '+a.prompt+' '+a.sourceTitle+' '+a.images.map(im=>im.caption+' '+im.prompt).join(' ')).toLowerCase().includes(x)));
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
    if (ui.duration&&d.duration_seconds!==Number(ui.duration)) return false;
    if (ui.aspect&&d.aspect_group!==ui.aspect) return false;
    if (ui.tag&&(!fav||!fav.tags.includes(ui.tag))) return false;
    return ts.every(x=>matchTerm(SEARCH_INDEX.get(d.id)+' '+(fav?.tags.join(' ')||''),x));
  });
  if (ui.view==='recent') { const order=new Map(state.recent.map((r,i)=>[r.id,i]));result.sort((a,b)=>order.get(a.id)-order.get(b.id));return result; }
  if (ui.sort==='short') result.sort((a,b)=>a.duration_seconds-b.duration_seconds);
  if (ui.sort==='long') result.sort((a,b)=>b.duration_seconds-a.duration_seconds);
  if (ui.sort==='title') result.sort((a,b)=>titleFor(a).localeCompare(titleFor(b),state.settings.lang));
  if (ui.sort==='source'&&ui.view!=='drafts') result.sort((a,b)=>(CURATED_RANK.get(a.id)??999)-(CURATED_RANK.get(b.id)??999));
  return result;
}
function promptCard(item,index=0) {
  const fav=state.favorites[item.id];
  const selected=currentDraft()?.sourceId===item.id;
  return `<article class="prompt-card ${selected?'is-selected':''}" data-item-id="${escapeHTML(item.id)}" style="--hue:${CATEGORY_HUE[item.category]??215};--i:${index%12}"><div class="card-media"><button class="media-open" data-preview="${escapeHTML(item.id)}" aria-label="${escapeHTML(t('preview')+': '+titleFor(item))}"><img src="${escapeHTML(item.thumb)}" alt="${escapeHTML(titleFor(item))}" loading="lazy" decoding="async"><span class="play-indicator">${icon('play')}</span></button><span class="duration-badge">${escapeHTML(item.duration)}</span><button class="card-copy icon-button" data-copy-shot="${escapeHTML(item.id)}" title="${escapeHTML(t('copyShot'))}" aria-label="${escapeHTML(t('copyShot')+': '+titleFor(item))}">${icon('copy')}</button><button class="card-agent icon-button" data-agent-insert="${escapeHTML(item.id)}" title="${escapeHTML(t('agentInsert'))}" aria-label="${escapeHTML(t('agentInsert')+': '+titleFor(item))}">${icon('spark')}</button><button class="card-heart icon-button ${fav?'is-favorite':''}" data-favorite="${escapeHTML(item.id)}" aria-label="${escapeHTML(t(fav?'removeFavorite':'favorite'))}" aria-pressed="${!!fav}">${icon('heart')}</button></div><div class="card-body"><div class="card-slate"><span>SC ${String(SHOT_NO.get(item.id)).padStart(3,'0')}</span><span class="slate-tc">TC ${timecode(item.duration_seconds)}</span></div><div class="card-category"><span>${escapeHTML(categoryName(item.category))}</span><span>${escapeHTML(item.aspect)}</span></div><h2 class="card-title">${highlight(titleFor(item))}</h2>${altTitle(item)?`<p class="card-alt">${escapeHTML(altTitle(item))}</p>`:''}<p class="card-excerpt">${highlight(item.prompt.slice(0,180))}</p>${fav?.tags.length?`<div class="card-tags">${fav.tags.map(tag=>`<button class="tag" data-filter-tag="${escapeHTML(tag)}">${escapeHTML(tag)}</button>`).join('')}</div>`:''}<div class="card-footer"><span class="card-author" title="${escapeHTML(item.author)}">${escapeHTML(item.author)}</span><button class="button use-template" data-use="${escapeHTML(item.id)}">${selected?icon('check'):icon('arrow')}<span>${t(selected?'continueDraft':'useTemplate')}</span></button></div></div></article>`;
}
function draftCard(d) {
  const source=ITEMS.get(d.sourceId);
  return `<article class="draft-card" data-draft-id="${escapeHTML(d.id)}"><div class="draft-card-top"><span class="draft-symbol">${icon('edit')}</span><button class="icon-button" data-delete-draft="${escapeHTML(d.id)}" aria-label="${escapeHTML(t('deleteDraft'))}">${icon('trash')}</button></div><h3>${highlight(d.name||t('untitled'))}</h3><p class="draft-excerpt">${highlight(d.prompt.slice(0,220))}</p><div class="draft-card-tags"><span class="tag">${d.versions.length} ${t('versionsTab')}</span>${source?`<span class="tag">${escapeHTML(categoryName(source.category))}</span>`:''}</div><div class="draft-card-footer"><span>${dateLabel(d.updatedAt)}</span><button class="button use-template" data-edit-draft="${escapeHTML(d.id)}">${t('continueDraft')}${icon('arrow')}</button></div></article>`;
}
function assetCover(a) {
  const images=a.images.slice(0,4);
  if (!images.length) return `<span class="asset-cover-empty">${icon('edit')}<span>${escapeHTML(a.prompt.slice(0,90)||t('assetPromptOnly'))}</span></span>`;
  return `<span class="asset-collage n${images.length}">${images.map(im=>`<img src="${escapeHTML(im.src)}" alt="${escapeHTML(im.caption)}" loading="lazy" decoding="async">`).join('')}</span>`;
}
function assetCard(a) {
  const count=a.images.length;
  return `<article class="asset-card" data-asset-id="${escapeHTML(a.id)}"><button class="asset-cover" data-asset-open="${escapeHTML(a.id)}" aria-label="${escapeHTML(t('assetOpen')+': '+a.name)}">${assetCover(a)}<span class="asset-count">${icon(count?'image':'edit')}<span>${count?t('assetCountLabel',{n:count}):t('assetPromptOnly')}</span></span></button><div class="card-body"><div class="card-category"><span>${escapeHTML(a.sourceTitle||t('assetFromAgent'))}</span><span>${dateLabel(a.createdAt)}</span></div><h2 class="card-title">${highlight(a.name||t('untitled'))}</h2><p class="card-excerpt">${highlight(a.prompt.slice(0,180))}</p><div class="card-footer"><span class="card-author">${icon('layers')}<span>${escapeHTML(a.sourceTitle||t('assetFromAgent'))}</span></span><span class="asset-card-actions"><button class="icon-button" data-asset-copy="${escapeHTML(a.id)}" title="${escapeHTML(t('assetCopyPrompt'))}" aria-label="${escapeHTML(t('assetCopyPrompt'))}">${icon('copy')}</button><button class="icon-button" data-asset-agent="${escapeHTML(a.id)}" title="${escapeHTML(t('assetInsert'))}" aria-label="${escapeHTML(t('assetInsert'))}">${icon('spark')}</button><button class="icon-button" data-asset-delete="${escapeHTML(a.id)}" title="${escapeHTML(t('assetDeleteTitle'))}" aria-label="${escapeHTML(t('assetDeleteTitle'))}">${icon('trash')}</button><button class="button use-template" data-asset-open="${escapeHTML(a.id)}">${t('assetOpen')}${icon('arrow')}</button></span></div></div></article>`;
}
function renderFeatured() {
  const visible=ui.view==='library'&&!ui.q.trim()&&!ui.category&&!ui.duration&&!ui.aspect&&!ui.tag&&ui.sort==='source';
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
  const isAsset=ui.view==='assets';
  const folder=state.folders.find(f=>f.id===ui.folderId);
  const label=ui.view==='folder'?(folder?.name||t('ungrouped')):t(ui.view==='recent'?'recentView':ui.view);
  $('#breadcrumbCurrent').textContent=label;
  $('#viewTitle').textContent=ui.view==='library'?t('libraryTitle'):isAsset?t('assetsTitle'):ui.view==='recent'?t('recentTitle'):label;
  $('#viewEyebrow').textContent={library:'THE INSPIRATION LIBRARY',favorites:'CURATED BY YOU',drafts:'IDEAS IN PROGRESS',folder:'YOUR CREATIVE COLLECTION',assets:'YOUR ASSET SHELF',recent:'RECENTLY USED'}[ui.view];
  $('#viewDescription').textContent=t({library:'libraryDescription',favorites:'favoritesDescription',drafts:'draftsDescription',folder:'folderDescription',assets:'assetsDescription',recent:'recentDescription'}[ui.view]);
  $('#libraryStats').hidden=!(ui.view==='library'||isAsset);
  $('#libraryStats').classList.toggle('asset-stats',isAsset);
  $('#libraryStats').innerHTML=isAsset?assetStatsHTML():`<div class="stat-item"><b>${CATALOG.length}</b><span>${t('statPrompts')}</span></div><div class="stat-item"><b>${categories.length}</b><span>${t('statCategories')}</span></div><div class="stat-item"><b>${Object.keys(state.favorites).length}</b><span>${t('statFavorites')}</span></div>`;
  $('#headingTools').innerHTML=isAsset?`<button class="button primary asset-new" data-action="open-agent">${icon('spark')}<span>${t('assetGenCta')}</span></button>`:folder?`<button class="icon-button" data-rename-folder="${escapeHTML(folder.id)}" aria-label="${t('renameFolder')}">${icon('edit')}</button><button class="icon-button" data-delete-folder="${escapeHTML(folder.id)}" aria-label="${t('deleteFolder')}">${icon('trash')}</button>`:'';
  const result=filteredItems();
  $('#resultCount').textContent=t(isAsset?'assetResults':ui.view==='drafts'?'draftResults':'results',{n:result.length});
  const extra=expandTerms(terms());
  const notes=[];
  if (ui.view==='drafts') notes.push(t('recent'));
  if (ui.aspect&&!isAsset) notes.push(t('approxRatios'));
  if (extra.length&&!isAsset&&ui.view!=='drafts') notes.push(t('searchExpanded',{terms:extra.slice(0,4).join(' · ')}));
  $('#resultNote').textContent=notes.join(' · ');
  $('#cardGrid').classList.toggle('draft-grid',ui.view==='drafts');
  $('#cardGrid').classList.toggle('asset-grid',isAsset);
  $('#cardGrid').classList.toggle('stagger',!!ui.staggerNext);ui.staggerNext=false;
  $('#cardGrid').innerHTML=result.slice(0,ui.limit).map(isAsset?assetCard:ui.view==='drafts'?draftCard:promptCard).join('');
  $('#loadMore').hidden=result.length<=ui.limit;
  $('#pageCount').textContent=result.length?t('visibleCount',{n:Math.min(ui.limit,result.length),total:result.length}):'';
  $('#emptyState').hidden=!!result.length;
  if (!result.length) {
    const filtered=!!(ui.q||ui.category||ui.duration||ui.aspect||ui.tag);
    const type=filtered?'noResults':isAsset?'noAssets':ui.view==='drafts'?'noDrafts':ui.view==='recent'?'noRecent':'noFavorites';
    const action=filtered?'data-action="reset"':isAsset?'data-action="open-agent"':ui.view==='drafts'?'data-action="new-draft"':'data-view="library"';
    const actionLabel=filtered?'reset':isAsset?'openAgentAction':ui.view==='drafts'?'newDraft':'browseLibrary';
    $('#emptyState').innerHTML=`<div class="empty-icon">${icon(filtered?'search':isAsset?'layers':ui.view==='drafts'?'edit':ui.view==='recent'?'history':'heart')}</div><h2>${t(type)}</h2><p>${t(type+'Hint')}</p><button class="button" ${action}>${t(actionLabel)}</button>`;
  }
}
function setView(view,folderId=null) {
  ui.view=view;ui.folderId=folderId;ui.category='';ui.duration='';ui.aspect='';ui.tag='';ui.q='';ui.limit=PAGE_SIZE;ui.staggerNext=true;
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
  for (const [key,id] of [['edit','editPane'],['reference','referencePane'],['versions','versionsPane']]) {
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
  updateEditorCounters();renderLab();
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
  const draft={id:uid(),sourceId:source?.id||null,name:source?titleFor(source):t('untitled'),prompt:source?.prompt||'',notes:'',createdAt:timestamp,updatedAt:timestamp,versions:[]};
  state.drafts.unshift(draft);state.activeDraftId=draft.id;ui.editorTab='edit';
  saveState();renderNav();renderEditor();renderLibrary();openEditor();toast(t(source?'templateLoaded':'draftCreated'));$('#draftName').focus();
}
function openDraft(id) { saveState();state.activeDraftId=id;ui.editorTab='edit';saveState();renderEditor();renderLibrary();openEditor(); }
function updateDraft(field,value) { const draft=currentDraft();if (!draft) return;draft[field]=value;draft.updatedAt=now();updateEditorCounters();if(field==='prompt'){clearTimeout(labTimer);labTimer=setTimeout(renderLab,120);}queueSave(); }
function renderVersions() {
  const draft=currentDraft();if (!draft) return;
  $('#versionCount').textContent=draft.versions.length;
  $('#versionsList').innerHTML=draft.versions.length?[...draft.versions].reverse().map(v=>`<article class="version-item"><div class="version-heading"><strong>${escapeHTML(v.name)}</strong><span>${dateLabel(v.createdAt)}</span></div><p>${escapeHTML(v.prompt.slice(0,100))}</p><button class="text-button" data-restore-version="${escapeHTML(v.id)}">${icon('history')}${t('restore')}</button></article>`).join(''):`<div class="empty-versions">${icon('history')}<h3>${t('noVersions')}</h3><p>${t('noVersionsHint')}</p></div>`;
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
      target.versions.push({id:uid(),name,prompt:target.prompt,notes:target.notes,createdAt:now()});target.updatedAt=now();
    });
    renderVersions();renderLibrary();toast(t('versionSaved'));
  }});
}
function restoreVersion(id) {
  const draft=currentDraft();const v=draft?.versions.find(x=>x.id===id);if(!v)return;
  if(draft.versions.length>=200){toast(t('versionLimit'));return;}
  openForm({title:t('restoreTitle'),description:t('restoreHint'),input:false,onConfirm:async()=>{
    await changeState(next=>{
      const target=next.drafts.find(d=>d.id===draft.id);
      target.versions.push({id:uid(),name:t('beforeRestore'),prompt:target.prompt,notes:target.notes,createdAt:now()});target.prompt=v.prompt;target.notes=v.notes;target.updatedAt=now();
    });
    ui.editorTab='edit';renderEditor();renderLibrary();toast(t('restored'));
  }});
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
  $('#assetMeta').textContent=[dateLabel(a.createdAt),a.sourceTitle||t('assetFromAgent'),a.images.length?t('assetCountLabel',{n:a.images.length}):t('assetPromptOnly')].join(' · ');
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
async function createAssetGroup({name,prompt,sourceId,sourceTitle,images}) {
  const id=uid(),timestamp=now();
  await changeState(next=>{
    if (next.assets.length>=100) throw new Error(t('assetLimit'));
    next.assets.unshift({id,name:name.slice(0,160),prompt,sourceId:sourceId??null,sourceTitle:sourceTitle||'',createdAt:timestamp,updatedAt:timestamp,images});
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
  $('#previewMedia').innerHTML=`<img src="${escapeHTML(d.thumb)}" alt="${escapeHTML(titleFor(d))}"><button class="video-play-button" id="playPreview">${icon('play')}<span>${t('playVideo')}<small>${t('videoOnline')}</small></span></button>`;
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
  $('#backupStats').innerHTML=[[Object.keys(state.favorites).length,'favorites'],[state.folders.length,'collections'],[state.drafts.length,'drafts'],[state.drafts.reduce((n,d)=>n+d.versions.length,0),'versionsTab'],[state.assets.length,'assets']].map(([n,label])=>`<div><b>${n}</b><span>${t(label)}</span></div>`).join('');
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
function resetFilters() {ui.q='';ui.category='';ui.duration='';ui.aspect='';ui.tag='';ui.sort='source';ui.limit=PAGE_SIZE;$('#searchInput').value='';renderFilters();renderLibrary();}
function renderAll() {setStaticText();renderNav();renderFilters();renderLibrary();renderEditor();renderAgentStatus();renderAgentContext();renderThread();if(ui.assetId&&$('#assetDialog').open)renderAssetDialog();syncDrawers();}

function contextTitle() {
  if (!agent.context) return '';
  if (agent.context.kind === 'catalog') return titleFor(ITEMS.get(agent.context.id));
  if (agent.context.kind === 'asset') return state.assets.find(a => a.id === agent.context.id)?.name || t('untitled');
  return state.drafts.find(d => d.id === agent.context.id)?.name || t('untitled');
}
function contextPromptOnly() {
  const c=agent.context;if (!c) return '';
  if (c.kind === 'catalog') return ITEMS.get(c.id)?.prompt || '';
  if (c.kind === 'asset') return state.assets.find(a => a.id === c.id)?.prompt || '';
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
  const d = state.drafts.find(x => x.id === agent.context.id);
  if (!d) return '';
  return `[${t('agentContextDraft')}] ${d.name}\n${t('promptLabel')}:\n${d.prompt}${d.notes ? '\n' + t('notes') + ':\n' + d.notes : ''}`;
}
function openAgent() {
  ui.agentOpen=true;ui.editorOpen=false;document.body.classList.remove('sidebar-visible');
  if (!agent.messages.length) pushMessage({id:uid(),role:'assistant',text:t('agentWelcome'),done:true,blocks:[]});
  syncDrawers();renderThread();renderAgentStatus();
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
  else { const item=ITEMS.get(state.drafts.find(d=>d.id===c.id)?.sourceId);thumb=item?.thumb||''; }
  el.hidden=false;
  el.innerHTML=`${thumb?`<img src="${escapeHTML(thumb)}" alt="">`:`<span class="agent-context-glyph">${icon('layers')}</span>`}<div class="agent-context-info"><span>${label}</span><strong>${escapeHTML(contextTitle())}</strong></div><button class="icon-button" id="agentContextRemove" title="${escapeHTML(t('agentContextRemove'))}" aria-label="${escapeHTML(t('agentContextRemove'))}">${icon('close')}</button>`;
  renderIntents();
}
function renderAgentStatus() {
  const {llm,image}=state.settings.agent;
  const hasL=!!llm.baseUrl.trim(),hasI=!!image.baseUrl.trim();
  const el=$('#agentStatus');
  el.textContent=hasL&&hasI?t('agentStatusReady',{llm:llm.model.trim()||'LLM',img:image.model.trim()||'IMG'}):hasL?t('agentStatusLLM',{llm:llm.model.trim()||'LLM'}):hasI?t('agentStatusImage',{img:image.model.trim()||'IMG'}):t('agentStatusNone');
  el.classList.toggle('ready',hasL||hasI);
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
    html+=block?`<div class="agent-code"><div class="agent-code-head"><span>${escapeHTML(!m[1]||m[1]==='prompt'?t('agentImproved'):m[1])}</span><span class="agent-code-actions"><button class="text-button" data-agent-copy="${block.id}">${icon('copy')}${t('agentCopyBlock')}</button><button class="text-button" data-agent-apply="${block.id}">${icon('edit')}${t('agentApply')}</button>${saveAction}</span></div><pre>${escapeHTML(code)}</pre></div>`:`<pre class="agent-code-plain">${escapeHTML(code)}</pre>`;
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
function sysPrompt(mode) {
  const lang=state.settings.lang==='zh'?'Simplified Chinese':'English';
  const base=`You are FRAME Copilot, an expert cinematic prompt engineer for MiniMax/Hailuo text-to-video. Respond in ${lang}. Be concise and practical.`;
  if (mode==='improve') return base+' The user provides a source shot prompt and a request. Rewrite the full prompt to satisfy the request while keeping it a single continuous video-generation prompt covering subject, camera, lighting, motion and mood. Output the improved prompt inside a ```prompt fenced code block, then 2-4 short bullets explaining the changes.';
  if (mode==='specs') return base+` Extract at most {n} key still-image assets from the shot. Return ONLY a JSON array of objects {"title": short label in ${lang}, "prompt": detailed English still-image description, no motion, no text or watermarks}. No prose, no fences.`;
  return base+' Help the user develop the shot. When you propose a rewritten video prompt, put it inside a ```prompt fenced code block.';
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
async function runChatFlow(mode,label,history,signal) {
  const m={id:uid(),role:'assistant',text:'',done:false,blocks:[]};
  agent.current=m.id;pushMessage(m);
  const ctx=contextPayload();
  const messages=[{role:'system',content:sysPrompt(mode)},...history,{role:'user',content:(ctx?ctx+'\n\n':'')+label}];
  const text=await callLLM(messages,{stream:true,signal,onDelta:full=>{m.text=full;updateMessage(m);}});
  m.text=text.trim()?text:t('agentBadOutput');m.done=true;
  m.blocks=extractBlocks(m.text).map(code=>({id:uid(),text:code}));
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
      if (m&&m.role==='assistant'&&!m.done) { m.text=(m.text?m.text+'\n\n':'')+t('agentStopped');m.done=true;m.blocks=extractBlocks(m.text).map(code=>({id:uid(),text:code}));updateMessage(m); }
      const im=[...agent.messages].reverse().find(x=>x.role==='images');
      if (im) { im.items.forEach(it=>{if (it.state==='pending') Object.assign(it,{state:'error',error:t('agentStopped')});});updateMessage(im); }
      agent.messages=agent.messages.filter(x=>x.role!=='note');renderThread();
    } else pushMessage({id:uid(),role:'error',text:error instanceof TypeError?t('agentNetworkError'):(error.message||t('agentNetworkError'))});
  } finally { setBusy(false);agent.controller=null; }
}
function findBlock(id) { return agent.messages.flatMap(m=>m.blocks||[]).find(b=>b.id===id); }
function applyAgentBlock(id) {
  const block=findBlock(id);if (!block) return;
  let draft=currentDraft();
  if (!draft) { startDraft(agent.context?.kind==='catalog'?agent.context.id:null);draft=currentDraft(); }
  if (!draft) return;
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
  $('#agentDialog').showModal();
}
async function saveAgentSettings() {
  const llmBase=$('#llmBase').value.trim(),imgBase=$('#imgBase').value.trim();
  if ((llmBase&&!safeLink(llmBase))||(imgBase&&!safeLink(imgBase))) { toast(t('agentInvalidUrl'));return; }
  try {
    await changeState(next=>{next.settings.agent={llm:{baseUrl:llmBase,apiKey:$('#llmKey').value.trim(),model:$('#llmModel').value.trim()},image:{baseUrl:imgBase,apiKey:$('#imgKey').value.trim(),model:$('#imgModel').value.trim(),size:$('#imgSize').value,count:Number($('#imgCount').value)}};});
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
  updateEditorCounters();renderLab();queueSave();
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
    {label:t('favorites'),icon:'heart',run:()=>setView('favorites')},
    {label:t('drafts'),icon:'edit',run:()=>setView('drafts')},
    {label:t('assets'),icon:'layers',run:()=>setView('assets')},
    {label:t('recentView'),icon:'history',run:()=>setView('recent')},
    {label:t('newDraft'),icon:'plus',run:()=>startDraft()},
    {label:t('newFolder'),icon:'folder',run:()=>folderForm()},
    {label:t('openAgentAction'),icon:'spark',run:()=>openAgent()},
    {label:t('agentSettings'),icon:'sliders',run:()=>openAgentSettings()},
    {label:t('backupManage'),icon:'archive',run:()=>openBackup()},
    {label:t('theme'),icon:'moon',run:()=>$('#themeToggle').click()},
    {label:t('cmdLang'),icon:'panel',run:()=>$('#langToggle').click()},
    {label:t('reset'),icon:'close',run:()=>resetFilters()},
    {label:t('cmdCopy'),icon:'copy',run:()=>copyText(currentDraft()?.prompt||'',$('#promptEditor'))}
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

document.addEventListener('click',event=>{
  const button=event.target.closest('button,a');if(!button)return;
  const d=button.dataset;
  if(button.id==='toastAction'){const action=undoAction;clearTimeout(toastTimer);$('#toast').hidden=true;undoAction=null;action?.run();return;}
  if(d.copyShot){touchRecent(d.copyShot);copyText(ITEMS.get(d.copyShot)?.prompt||'');return;}
  if(d.labFix){const phrase=DIM_FIX[d.labFix];if(phrase){labAppend(phrase);toast(t('labAdded',{dim:dimLabel(d.labFix)}));}return;}
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
  if(d.filterTag!==undefined){ui.tag=d.filterTag;ui.limit=PAGE_SIZE;renderFilters();renderLibrary();return;}
  if(d.removeTag!==undefined){const id=currentDraft()?.sourceId;if(id&&state.favorites[id]){state.favorites[id].tags=state.favorites[id].tags.filter(x=>x!==d.removeTag);saveState();renderOrganization();renderFilters();renderLibrary();}return;}
  if(d.agentInsert){insertToAgent(d.agentInsert);return;}
  if(d.agentCopy){const block=findBlock(d.agentCopy);if(block)copyText(block.text);return;}
  if(d.agentApply){applyAgentBlock(d.agentApply);return;}
  if(d.agentDownload){downloadAgentImage(d.agentDownload);return;}
  if(d.agentSettings!==undefined){openAgentSettings();return;}
  if(d.agentSaveImages){saveImagesToAsset(d.agentSaveImages);return;}
  if(d.agentSaveBlock){saveBlockToAsset(d.agentSaveBlock);return;}
  if(d.assetOpen){openAsset(d.assetOpen);return;}
  if(d.assetCopy){const a=state.assets.find(x=>x.id===d.assetCopy);if(a)copyText(a.prompt);return;}
  if(d.assetAgent){insertAssetToAgent(d.assetAgent);return;}
  if(d.assetDelete){deleteAsset(d.assetDelete);return;}
  if(d.assetDownload){downloadAssetImage(d.assetDownload);return;}
  if(d.assetImgCopy){const [id,idx]=d.assetImgCopy.split(':');const im=state.assets.find(x=>x.id===id)?.images[Number(idx)];if(im?.prompt)copyText(im.prompt);return;}
  if(d.restoreVersion){restoreVersion(d.restoreVersion);return;}
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
for(const [id,key]of[['durationFilter','duration'],['aspectFilter','aspect'],['tagFilter','tag']])$('#'+id).onchange=e=>{ui[key]=e.target.value;ui.limit=PAGE_SIZE;renderLibrary();};
$('#sortFilter').onchange=e=>{if(ui.view==='assets')ui.assetSort=e.target.value;else ui.sort=e.target.value;ui.limit=PAGE_SIZE;renderLibrary();};
$('#resetFilters').onclick=resetFilters;
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
$('#agentSend').onclick=()=>runAgent('chat');
$('#agentImprove').onclick=()=>runAgent('improve');
$('#agentImages').onclick=()=>runAgent('images');
$('#agentClear').onclick=clearAgent;
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
$$('[role="tab"]').forEach(tab=>tab.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const keys=['edit','reference','versions'];const index=keys.indexOf(ui.editorTab);const next=keys[(index+(e.key==='ArrowRight'?1:2))%3];selectEditorTab(next);$(`[data-tab="${next}"]`).focus();}));
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if($('#paletteDialog').open)$('#paletteDialog').close();else if(!$('dialog[open]'))openPalette();return;}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();saveState();}
  if(e.key==='Escape'&&!$('dialog[open]')&&window.innerWidth<=1180){ui.editorOpen=false;ui.agentOpen=false;document.body.classList.remove('sidebar-visible');syncDrawers();}
  if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.target.matches('input,textarea,[contenteditable]')&&!$('dialog[open]')){e.preventDefault();$('#searchInput').focus();}
  if(e.key.toLowerCase()==='n'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.target.matches('input,textarea,[contenteditable]')&&!$('dialog[open]'))startDraft();
});
$('#paletteOpen').onclick=openPalette;
$('#paletteInput').addEventListener('input',()=>{paletteIndex=0;renderPalette();});
$('#paletteInput').addEventListener('keydown',e=>{
  if(e.isComposing)return;
  if(e.key==='ArrowDown'){e.preventDefault();paletteIndex=Math.min(paletteIndex+1,Math.max(paletteItems.length-1,0));renderPalette();}
  else if(e.key==='ArrowUp'){e.preventDefault();paletteIndex=Math.max(paletteIndex-1,0);renderPalette();}
  else if(e.key==='Enter'){e.preventDefault();runPalette(paletteIndex);}
});
$('#paletteList').addEventListener('mousemove',e=>{const item=e.target.closest('[data-palette]');if(item&&Number(item.dataset.palette)!==paletteIndex){paletteIndex=Number(item.dataset.palette);renderPalette();}});
window.addEventListener('resize',syncDrawers);
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

