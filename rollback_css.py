from pathlib import Path

OVERRIDE = """body .app-shell, body.editor-collapsed .app-shell { grid-template-columns: 184px minmax(0,1fr); }
.button.primary, [data-theme="dark"] .button.primary { color: #1c250e; }
.sidebar { padding: 0 16px 20px; background: var(--canvas); color: var(--ink); border-right: 1px solid var(--line); }
.sidebar :focus-visible { outline-color: var(--focus); }
.brand { height: 83px; align-items: center; margin: 0; padding: 0 8px; gap: 10px; font-size: 23px; letter-spacing: 2px; }
.brand-caption, .new-draft kbd, .sidebar > .section-label, .sidebar-bottom > p, .sidebar-footnote { display: none; }
.brand-mark { width: 24px; height: 24px; flex-basis: 24px; color: var(--accent-ink); transform: rotate(-8deg); }
.brand-mark i { width: 9px; height: 9px; border-width: 2px; }
.new-draft { justify-content: center; min-height: 42px; margin: 14px 0 25px; font-size: 12px; }
.nav-list { margin-top: 0; }
.nav-item { min-height: 43px; padding: 10px; gap: 10px; color: var(--ink-secondary); }
.nav-item .label { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.nav-item .count, .nav-item.active .count { color: var(--ink-muted); background: transparent; font-size: 10px; min-width: 0; padding: 0; }
.nav-item.active, .nav-item.active:hover { color: var(--ink); background: var(--surface-hover); }
.nav-item.active svg { color: var(--accent-ink); }
.nav-item:not(.active):hover, .sidebar .icon-button:hover, .folder-menu:hover { color: var(--ink); background: var(--surface); }
.sidebar .icon-button, .section-label { color: var(--ink-muted); }
.section-heading { margin: 28px 0 7px; }
.section-label { font-size: 10px; letter-spacing: .7px; }
.folder-list { flex-shrink: 1; overflow-y: auto; min-height: 44px; }
.folder-row { position: relative; }
.folder-row .nav-item { padding-right: 28px; }
.folder-row .count { display: none; }
.folder-menu { position: absolute; right: 0; width: 24px; opacity: 0; }
.folder-row:hover .folder-menu, .folder-menu:focus-visible { opacity: 1; }
.empty-folder { font-size: 11px; }
.sidebar-bottom { padding: 22px 8px 0; }
.local-status { color: var(--ink-muted); font-size: 9px; }
.status-dot { background: var(--success); }
.sidebar-backup { color: var(--ink-secondary); margin-top: 12px; border: 0; padding: 8px 0; }
.sidebar-backup:hover { color: var(--ink); }
.sidebar-backup svg { width: 16px; height: 16px; }
.topbar { min-height: 73px; padding: 0 36px; }
.top-actions { gap: 9px; }
.local-badge { display: none; }
.workspace-toggle { min-height: 34px; padding: 6px 12px; font-size: 11px; }
.workspace-toggle svg { color: var(--accent-ink); }
.content-scroll { padding: 30px 36px 20px; }
.library-heading { display: flex; align-items: baseline; gap: 18px; margin-bottom: 23px; }
.library-heading > .eyebrow, .library-stats { display: none; }
.heading-row { margin: 0; gap: 14px; }
.library-heading h1 { font-size: 24px; font-weight: 650; line-height: 1.5; letter-spacing: -.7px; }
.library-heading > p { margin: 0; font-size: 11px; color: var(--ink-muted); }
.featured-scene { isolation: isolate; position: relative; height: clamp(260px,23vw,345px); overflow: hidden; border-radius: 13px; margin-bottom: 30px; background: #1c2525; color: #fff; }
.featured-image { position: absolute; inset: 0; height: 100%; width: 100%; object-fit: cover; object-position: center 47%; z-index: -3; }
.featured-shade { position: absolute; inset: 0; z-index: -2; background: linear-gradient(90deg,#070f16dc 0%,#0a131b70 40%,#090e1310 72%),linear-gradient(0deg,#040d1488,transparent 50%); }
.featured-copy { padding: 29px 36px; }
.featured-eyebrow { display: flex; align-items: center; gap: 13px; color: #e0e8e2; font-size: 9px; font-weight: 550; letter-spacing: 2px; }
.featured-eyebrow span { color: #bbc9c1; letter-spacing: 1px; }
.featured-copy h2 { white-space: pre-line; font-size: clamp(32px,3vw,46px); font-weight: 600; line-height: 1.28; letter-spacing: 1px; margin: 15px 0 11px; text-shadow: 0 2px 18px #0002; }
.featured-copy p { font-size: 11px; color: #d7dfe0; }
.hero-button { background: #fff; color: #1a211b; border-color: #fff; margin-top: 22px; min-height: 37px; font-size: 11px; padding: 9px 14px; }
.button.hero-button:not(:disabled):hover { background: var(--accent); border-color: var(--accent); }
.hero-button svg { margin-left: 10px; }
.featured-caption { position: absolute; bottom: 25px; right: 29px; max-width: 42%; display: flex; align-items: center; gap: 12px; padding: 10px 13px; border: 1px solid #ffffff25; border-radius: 9px; background: #111a2044; backdrop-filter: blur(18px); }
.featured-caption:hover { background: #111a2088; }
.featured-caption small { display: block; font-size: 9px; color: #d2dbdf; margin-bottom: 2px; }
.featured-caption strong { display: block; font-size: 11px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.featured-caption > [data-icon="arrow"] { margin-left: 15px; }
.featured-play { width: 29px; height: 29px; border: 1px solid #ffffff5c; border-radius: 50%; }
.featured-play svg { width: 12px; height: 12px; margin-left: 2px; }
.search-section { display: flex; align-items: center; gap: 12px; margin: 0 0 21px; }
.search-wrap { height: 42px; min-height: 42px; gap: 10px; padding: 0 13px; border-color: var(--line); border-radius: 9px; flex: 1; }
.search-wrap input { min-height: 38px; padding: 0; font-size: 11px; }
.search-wrap kbd { font-size: 9px; }
.filter-row { flex-wrap: nowrap; gap: 8px; margin: 0; flex-shrink: 0; }
.filter-row select, .filter-row .sort-select { flex: 0 0 auto; width: 102px; min-height: 40px; padding: 8px 9px; font-size: 10px; margin: 0; }
.filter-row #tagFilter { width: 95px; }
.filter-row .sort-select { width: 108px; }
#resetFilters { font-size: 10px; padding: 7px; color: var(--ink-muted); }
.category-tabs { gap: 5px; margin: 0; border: 0; padding: 0 0 10px; scrollbar-width: none; }
.category-tabs::-webkit-scrollbar { display: none; }
.category-tab { min-height: 32px; padding: 7px 13px; border-radius: 7px; font-size: 11px; }
.category-tab.active { color: var(--ink); background: var(--surface-hover); font-weight: 500; }
.category-tab.active::after { display: none; }
.category-tab:hover { background: var(--surface); color: var(--ink); }
.results-toolbar { padding: 0; margin: 8px 0 17px; min-height: 18px; font-size: 10px; color: var(--ink-muted); }
.result-note { font-size: 9px; }
.card-grid { grid-template-columns: repeat(3,minmax(0,1fr)); gap: 28px 20px; }
.prompt-card, .prompt-card:hover, .prompt-card.is-selected, .prompt-card.is-selected:hover { border: 0; border-radius: 0; background: transparent; box-shadow: none; overflow: visible; }
.card-media { aspect-ratio: 16/10; border-radius: 11px; border: 1px solid var(--line); background: var(--surface); }
.media-open img { height: 100%; aspect-ratio: auto; transition: transform .35s ease, filter .25s; }
.media-open::after { content: ''; position: absolute; inset: 35% 0 0; background: linear-gradient(transparent,#0007); pointer-events: none; }
.prompt-card:hover .media-open img { transform: scale(1.035); filter: brightness(1.07); }
.card-heart { top: 11px; right: 11px; width: 29px; height: 29px; padding: 7px; border: 0; background: #11151b55; backdrop-filter: blur(8px); }
.card-heart:hover { color: #fff; background: #11151bbb; }
.card-heart.is-favorite, .card-heart.is-favorite:hover { color: #1c250e; background: var(--accent); }
.card-heart svg { width: 16px; height: 16px; }
.duration-badge { left: 13px; bottom: 12px; border: 0; padding: 0; background: none; font-size: 10px; letter-spacing: .4px; }
.play-indicator { width: 25px; height: 25px; right: 12px; bottom: 11px; background: none; }
.play-indicator svg { width: 10px; height: 10px; margin-left: 2px; }
.is-selected .card-media { border-color: var(--accent-ink); }
.card-body { padding: 11px 2px 0; }
.card-category { color: var(--ink-muted); font-size: 9px; font-weight: 400; letter-spacing: 0; margin-bottom: 5px; }
.card-title { display: block; font-size: 13px; font-weight: 550; white-space: nowrap; text-overflow: ellipsis; line-height: 1.65; letter-spacing: 0; }
.card-alt { font-size: 10px; margin-top: 3px; }
.card-excerpt { display: none; }
.card-footer { flex-wrap: nowrap; border: 0; padding-top: 0; margin-top: 9px; min-height: 26px; }
.card-author { display: block; font-size: 9px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.card-footer .use-template { min-height: 26px; padding: 4px 0 4px 8px; border: 0; background: transparent; color: var(--ink-secondary); font-size: 10px; gap: 6px; white-space: nowrap; }
.card-footer .use-template:hover { background: transparent; color: var(--accent-ink); }
.card-footer .use-template svg { width: 13px; height: 13px; order: 2; }
.card-tags { margin: 8px 0 0; gap: 4px; }
.tag, .user-tag { background: var(--surface-hover); border-color: transparent; }
.draft-card { min-height: 245px; border-radius: 12px; }
.pagination { padding: 40px 0 30px; margin: 0; gap: 12px; }
.empty-state { border: 0; padding: 70px 20px; }
.drawer-scrim { display: block; z-index: 60; background: #0008; backdrop-filter: blur(5px); }
.editor-panel, body.editor-collapsed .editor-panel { display: flex; position: fixed; z-index: 70; top: 12px; right: 12px; bottom: 12px; width: min(510px,calc(100vw - 24px)); height: auto; border: 1px solid var(--line-strong); border-radius: 16px; background: var(--surface); box-shadow: var(--shadow-dialog); transform: translateX(calc(100% + 24px)); visibility: hidden; transition: transform .25s ease,visibility .25s; }
body.editor-visible .editor-panel { transform: none; visibility: visible; }
.editor-header { min-height: 66px; padding: 13px 24px; }
.editor-header strong { font-weight: 550; }
.beta-label { border: 0; font-size: 8px; letter-spacing: 1px; }
.editor-content { padding: 24px; }
#draftName { min-height: 44px; font-size: 14px; }
.source-card { margin: 18px 0; padding: 12px; }
.source-card > img { width: 90px; height: 58px; flex-basis: 90px; }
.source-info > span { color: var(--ink-muted); font-size: 9px; }
.source-info strong { font-weight: 500; }
.source-info button { color: var(--ink-secondary); }
.organize-section { margin: 18px 0 22px; }
.organize-row { flex-wrap: nowrap; gap: 14px; }
.organize-row > select { min-height: 35px; }
.tag-entry input { background: transparent; min-height: 34px; }
.editor-tabbar { gap: 15px; margin: 0 0 22px; }
.editor-tabbar > button { flex: 0 1 auto; padding: 10px 5px; min-height: 44px; }
.editor-tabbar > button.active::after { background: var(--accent-ink); }
.prompt-editor { min-height: 320px; padding: 16px; border-color: var(--line); font-size: 13px; line-height: 1.9; }
.notes-editor { min-height: 108px; }
.editor-footer { padding: 14px 24px 12px; }
.editor-footer-actions .button { min-height: 41px; }
.save-status { font-size: 9px; }
.toast { z-index: 150; bottom: 142px; }
dialog { border-color: var(--line-strong); border-radius: 17px; }
dialog::backdrop { background: #040608b8; backdrop-filter: blur(8px); }
.preview-dialog { width: min(880px,calc(100vw - 48px)); }
.preview-media img { object-fit: contain; }
.preview-prompt { max-height: 270px; overflow-y: auto; }
.preview-title-row h2, .dialog-heading h2 { font-weight: 550; }
.backup-dialog { width: min(650px,calc(100vw - 40px)); }
.backup-stats { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); }
.backup-stats b { display: block; font-size: 23px; font-weight: 500; }
.backup-stats span { color: var(--ink-muted); font-size: 10px; }
@container library (min-width: 1430px) { .card-grid { grid-template-columns: repeat(4,minmax(0,1fr)); } }
@container library (max-width: 1020px) {
  .search-section { flex-wrap: wrap; gap: 10px; }
  .search-wrap { flex-basis: 100%; }
  .filter-row { width: 100%; }
  .filter-row .sort-select { margin-left: auto; }
  .card-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .featured-copy { padding: 25px 29px; }
  .featured-copy h2 { font-size: 34px; }
  .featured-copy p { font-size: 10px; }
  .featured-caption { max-width: 39%; right: 20px; bottom: 20px; }
  .featured-caption > [data-icon="arrow"] { display: none; }
}
@media (max-width: 1100px) {
  body .app-shell, body.editor-collapsed .app-shell { grid-template-columns: 170px minmax(0,1fr); }
  .sidebar { padding-left: 12px; padding-right: 12px; }
  .topbar { padding: 0 26px; }
  .content-scroll { padding: 26px; }
  .library-heading > p { display: none; }
}
@media (max-width: 760px) {
  body .app-shell, body.editor-collapsed .app-shell { grid-template-columns: minmax(0,1fr); }
  .sidebar { width: 228px; z-index: 70; padding: 0 19px 25px; }
  .brand { height: 75px; }
  .folder-menu { opacity: 1; }
  .topbar { min-height: 64px; padding: 0 20px; }
  .top-actions { gap: 4px; }
  .content-scroll { padding: 23px; }
  .library-heading { margin-bottom: 18px; }
  .library-heading h1 { font-size: 23px; }
  .featured-scene { height: 276px; margin-bottom: 23px; }
  .featured-copy { padding: 24px; }
  .featured-copy h2 { font-size: 33px; }
  .featured-caption { max-width: 40%; right: 17px; bottom: 20px; }
  .card-grid { gap: 24px 14px; }
  .card-heart { width: 31px; height: 31px; }
  .editor-panel, body.editor-collapsed .editor-panel { top: 0; right: 0; bottom: 0; width: min(510px,100vw); border-radius: 14px 0 0 14px; }
  .editor-header, .editor-content { padding-left: 22px; padding-right: 22px; }
  .editor-footer { padding: 13px 22px max(13px,env(safe-area-inset-bottom)); }
}
@media (max-width: 500px) {
  .topbar { padding: 0 16px; min-height: 60px; }
  .content-scroll { padding: 21px 17px 16px; }
  .library-heading { margin-bottom: 16px; }
  .library-heading h1 { font-size: 22px; }
  .featured-scene { height: 280px; border-radius: 11px; }
  .featured-image { object-position: 61% center; }
  .featured-shade { background: linear-gradient(90deg,#0b1522b8,#0b162252),linear-gradient(0deg,#07101bd9,transparent 48%); }
  .featured-copy { padding: 22px; }
  .featured-eyebrow { font-size: 8px; }
  .featured-copy h2 { font-size: 32px; margin: 15px 0 8px; }
  .featured-copy p { font-size: 9px; }
  .hero-button { margin-top: 17px; font-size: 10px; min-height: 34px; }
  .featured-caption { bottom: 14px; left: 21px; right: 19px; max-width: none; padding: 0; background: transparent; border: 0; backdrop-filter: none; gap: 8px; }
  .featured-caption:hover { background: transparent; }
  .featured-caption small { display: none; }
  .featured-caption strong { font-size: 9px; color: #d7dde2; }
  .featured-play { height: 20px; width: 20px; }
  .featured-play svg { width: 8px; height: 8px; }
  .search-section { margin-bottom: 16px; }
  .search-wrap { height: 41px; }
  .search-wrap kbd { display: none; }
  .filter-row { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 8px; }
  .filter-row select, .filter-row #tagFilter, .filter-row .sort-select { width: 100%; font-size: 11px; min-height: 37px; margin: 0; }
  #sortFilter { grid-column: 2; grid-row: 2; }
  #resetFilters { grid-column: 2; justify-self: end; padding: 2px 5px; }
  .category-tabs { gap: 3px; padding-bottom: 8px; }
  .category-tab { padding: 7px 11px; }
  .results-toolbar { margin: 6px 0 15px; }
  .card-grid { grid-template-columns: minmax(0,1fr); row-gap: 27px; }
  .card-title { font-size: 14px; }
  .card-category, .card-alt, .card-author { font-size: 10px; }
  .card-footer .use-template { font-size: 11px; min-height: 30px; }
  .editor-panel, body.editor-collapsed .editor-panel { border-radius: 0; border: 0; width: 100%; }
  .editor-header { min-height: 60px; padding: 13px 20px; }
  .editor-content { padding: 20px; }
  .editor-footer { padding-left: 20px; padding-right: 20px; }
  .prompt-editor { min-height: 300px; }
  .editor-footer-actions .button { font-size: 11px; }
}
@media (prefers-reduced-motion: reduce) { .editor-panel, .sidebar, .media-open img { transition: none; } }
"""

css = Path('studio.css.base').read_text(encoding='utf-8')
assert css.rstrip().endswith('}')
Path('studio.css').write_text(css + '\n' + OVERRIDE, encoding='utf-8')
Path('studio.js').write_text(Path('studio.js.base').read_text(encoding='utf-8'), encoding='utf-8')
Path('studio.template.html').write_text(Path('template.base.html').read_text(encoding='utf-8'), encoding='utf-8')
Path('test_studio_browser.cjs').write_text(Path('test.base.cjs').read_text(encoding='utf-8'), encoding='utf-8')
for name in ['studio.css.base', 'studio.js.base', 'template.base.html', 'test.base.cjs', 'rollback_replay.py']:
    Path(name).unlink()
print('rollback files restored')
