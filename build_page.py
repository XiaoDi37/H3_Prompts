#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build a single-file local prompt assistant from prompts.json.
Features: zh/en bilingual UI, dark/light theme, thumbnails, favorite tags + grouping."""
import json, html, re, os

with open("prompts.json", encoding="utf-8") as f:
    data = json.load(f)

try:
    ext_map = json.load(open("thumbs_ext.json", encoding="utf-8"))
except Exception:
    ext_map = {}

# Build title -> Chinese map. The unique-title order is regenerated
# deterministically from prompts.json (first-occurrence dedupe), matching the
# order used to author titles_zh.json.
try:
    zh_list = json.load(open("titles_zh.json", encoding="utf-8"))
    _seen, _s = [], set()
    for _r in data:
        if not _r.get("prompt"):
            continue
        _t = (_r.get("title") or _r.get("name") or "").strip()
        if _t and _t not in _s:
            _s.add(_t)
            _seen.append(_t)
    title_zh_map = dict(zip(_seen, zh_list)) if len(_seen) == len(zh_list) else {}
except Exception:
    title_zh_map = {}


def norm_cat(c):
    if not c:
        return "other"
    c = re.sub(r"\s+", " ", c.strip().lower().replace("-", " "))
    return c or "other"


# Standard aspect ratios (label, value), ordered wide -> portrait.
STD_ASPECTS = [
    ("2.35:1", 2.35), ("1.85:1", 1.85), ("16:9", 16 / 9), ("3:2", 3 / 2),
    ("4:3", 4 / 3), ("5:4", 5 / 4), ("1:1", 1.0), ("4:5", 4 / 5),
    ("3:4", 3 / 4), ("2:3", 2 / 3), ("9:16", 9 / 16),
]
ASPECT_ORDER = [a[0] for a in STD_ASPECTS]


def norm_aspect(a):
    """Snap an unreduced pixel ratio (e.g. 1024:585) to the nearest standard ratio."""
    if not a or ":" not in a:
        return a or ""
    try:
        w, h = a.split(":")
        r = float(w) / float(h)
    except Exception:
        return a
    return min(STD_ASPECTS, key=lambda kv: abs(kv[1] - r))[0]


recs = []
for i, r in enumerate(data):
    if not r.get("prompt"):
        continue
    slug = r.get("slug") or str(i)
    ext = ext_map.get(slug)
    thumb = ("thumbs/" + slug + ext) if ext else ""
    title_en = r.get("title") or r.get("name") or "(untitled)"
    recs.append({
        "id": slug,
        "title": title_en,
        "title_zh": title_zh_map.get(title_en.strip(), ""),
        "prompt": r.get("prompt"),
        "category": norm_cat(r.get("category")),
        "model": r.get("model") or "MiniMax H3",
        "duration": r.get("duration") or "",
        "aspect": norm_aspect(r.get("aspect")),
        "aspect_raw": r.get("aspect") or "",
        "author": r.get("author") or "",
        "source": r.get("source") or "",
        "source_link": r.get("source_link") or "",
        "url": r.get("url") or "",
        "video": r.get("video") or "",
        "poster": r.get("poster") or "",
        "thumb": thumb,
    })

payload = json.dumps(recs, ensure_ascii=False)
count = len(recs)
with_thumb = sum(1 for r in recs if r["thumb"])

HTML = r"""<!DOCTYPE html>
<html lang="zh-CN" data-theme="dark">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>MiniMax H3 提示词助手</title>
<style>
:root[data-theme="dark"]{
  --bg:#0f1115; --panel:#161a22; --panel2:#1c2230; --line:#262d3b;
  --txt:#e6e9ef; --muted:#93a0b4; --accent:#3158e8; --accent2:#6ea8fe;
  --star:#f5b301; --chip:#222a38; --header:rgba(15,17,21,.92);
  --code-bg:#0b0d12; --code-txt:#cdd5e0; --mark-bg:#3a2f00; --mark-txt:#ffe08a;
}
:root[data-theme="light"]{
  --bg:#f5f6f8; --panel:#ffffff; --panel2:#eef1f6; --line:#dfe3ea;
  --txt:#1a1d24; --muted:#5b6675; --accent:#3158e8; --accent2:#2b4fc4;
  --star:#e0a100; --chip:#eef1f6; --header:rgba(245,246,248,.92);
  --code-bg:#f7f8fa; --code-txt:#333a45; --mark-bg:#ffe9a8; --mark-txt:#5a4300;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--txt);
  font-family:-apple-system,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif;
  font-size:15px;line-height:1.5;transition:background .2s,color .2s}
header{position:sticky;top:0;z-index:20;background:var(--header);
  backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
.wrap{max-width:1180px;margin:0 auto;padding:14px 16px}
.top{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
h1{font-size:18px;margin:0;font-weight:700}
.sub{color:var(--muted);font-size:13px}
.top-actions{margin-left:auto;display:flex;gap:8px}
.iconbtn{padding:8px 12px;border-radius:10px;border:1px solid var(--line);
  background:var(--panel);color:var(--txt);font-size:13px;cursor:pointer}
.iconbtn:hover{border-color:var(--accent)}
.controls{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
.search{flex:1 1 260px;min-width:0}
.search input{width:100%;padding:11px 14px;border-radius:10px;border:1px solid var(--line);
  background:var(--panel);color:var(--txt);font-size:15px;outline:none}
.search input:focus{border-color:var(--accent)}
select,.toggle{padding:10px 12px;border-radius:10px;border:1px solid var(--line);
  background:var(--panel);color:var(--txt);font-size:14px;cursor:pointer;outline:none;max-width:180px}
.toggle.active{background:var(--star);color:#1a1a1a;border-color:var(--star);font-weight:600}
.toggle.on{background:var(--accent);color:#fff;border-color:var(--accent);font-weight:600}
.meta-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;color:var(--muted);font-size:13px;align-items:center}
.pill{background:var(--chip);border:1px solid var(--line);border-radius:999px;padding:3px 10px;font-size:12px}
main{max-width:1180px;margin:0 auto;padding:16px}
.group-h{font-size:14px;font-weight:700;color:var(--accent2);margin:18px 0 10px;
  display:flex;align-items:center;gap:8px}
.group-h .cnt{color:var(--muted);font-weight:400;font-size:12px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:14px;
  overflow:hidden;display:flex;flex-direction:column;min-width:0}
.thumb{position:relative;width:100%;aspect-ratio:16/9;background:var(--panel2);overflow:hidden;flex:0 0 auto}
.thumb img{width:100%;height:100%;object-fit:cover;display:block;cursor:pointer}
.thumb .dur{position:absolute;right:8px;bottom:8px;background:rgba(0,0,0,.72);color:#fff;
  font-size:11px;padding:2px 7px;border-radius:6px}
.thumb .play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  color:#fff;font-size:34px;text-shadow:0 2px 8px rgba(0,0,0,.6);opacity:.85;pointer-events:none}
.card-in{padding:13px 14px 14px;display:flex;flex-direction:column;gap:9px;flex:1;min-width:0}
.card-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
.card h2{font-size:15px;margin:0;font-weight:650;line-height:1.35;word-break:break-word}
.star{background:none;border:none;cursor:pointer;font-size:20px;line-height:1;color:var(--muted);flex:0 0 auto;padding:2px 4px}
.star.on{color:var(--star)}
.tags{display:flex;gap:6px;flex-wrap:wrap}
.tag{font-size:11px;padding:2px 8px;border-radius:999px;background:var(--panel2);
  border:1px solid var(--line);color:var(--muted);white-space:nowrap}
.tag.cat{color:var(--accent2);border-color:var(--line)}
.tag.utag{background:var(--accent);color:#fff;border-color:var(--accent);cursor:pointer}
.tag.utag:hover{filter:brightness(1.1)}
.excerpt{color:var(--muted);font-size:13px;line-height:1.55;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word}
.card-foot{display:flex;gap:8px;align-items:center;margin-top:auto;flex-wrap:wrap}
.btn{padding:7px 12px;border-radius:9px;border:1px solid var(--line);background:var(--panel2);
  color:var(--txt);font-size:13px;cursor:pointer;text-decoration:none;display:inline-block}
.btn:hover{border-color:var(--accent)}
.btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}
.author{color:var(--muted);font-size:12px;margin-left:auto}
mark{background:var(--mark-bg);color:var(--mark-txt);border-radius:3px;padding:0 2px}
.empty{color:var(--muted);text-align:center;padding:60px 20px}
.modal{position:fixed;inset:0;background:rgba(0,0,0,.6);display:none;z-index:50;
  align-items:flex-start;justify-content:center;padding:24px 16px;overflow-y:auto}
.modal.open{display:flex}
.sheet{background:var(--panel);border:1px solid var(--line);border-radius:16px;
  max-width:860px;width:100%;padding:20px;position:relative}
.sheet h2{margin:0 40px 8px 0;font-size:19px;line-height:1.35;word-break:break-word}
.close{position:absolute;top:12px;right:14px;background:none;border:none;color:var(--muted);font-size:26px;cursor:pointer;line-height:1;z-index:2}
.mmedia{width:100%;border-radius:10px;overflow:hidden;background:#000;margin:10px 0;display:none}
.mmedia video{width:100%;display:block;max-height:46vh}
.body{white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  font-size:13px;line-height:1.7;color:var(--code-txt);background:var(--code-bg);border:1px solid var(--line);
  border-radius:10px;padding:14px;margin:12px 0;word-break:break-word;max-height:44vh;overflow-y:auto}
.tagbar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:10px 0}
.tagbar input{padding:6px 10px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--txt);font-size:13px;outline:none;min-width:140px}
.utag-x{margin-left:5px;opacity:.8}
.sheet-foot{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--accent);
  color:#fff;padding:10px 18px;border-radius:10px;font-size:14px;opacity:0;transition:.25s;z-index:99;pointer-events:none}
.toast.show{opacity:1}
@media(max-width:560px){
  .grid{grid-template-columns:1fr}
  .wrap,main{padding-left:12px;padding-right:12px}
  select{max-width:none;flex:1 1 auto}
  .top-actions{margin-left:0;width:100%}
}
</style>
</head>
<body>
<header>
  <div class="wrap">
    <div class="top">
      <h1 data-i18n="app_title"></h1>
      <div class="top-actions">
        <button class="iconbtn" id="langBtn"></button>
        <button class="iconbtn" id="themeBtn"></button>
      </div>
    </div>
    <div class="sub" id="subtitle"></div>
    <div class="controls">
      <div class="search"><input id="q" type="search" data-i18n-ph="search_ph" autocomplete="off"/></div>
      <select id="fCat"></select>
      <select id="fDur"></select>
      <select id="fAsp"></select>
      <select id="fTag"></select>
      <button class="toggle" id="fFav" data-i18n="fav_only"></button>
      <button class="toggle" id="groupBtn" data-i18n="group_by_tag"></button>
    </div>
    <div class="meta-row">
      <span id="shown"></span>
      <span class="pill" id="favCount"></span>
      <button class="btn" id="clearBtn" data-i18n="clear_filters"></button>
      <button class="btn" id="exportFav" style="margin-left:auto" data-i18n="export_fav"></button>
    </div>
  </div>
</header>
<main>
  <div id="list"></div>
  <div class="empty" id="empty" style="display:none" data-i18n="empty"></div>
</main>

<div class="modal" id="modal">
  <div class="sheet">
    <button class="close" id="mClose">&times;</button>
    <h2 id="mTitle"></h2>
    <div id="mTitleAlt" style="color:var(--muted);font-size:13px;margin:-4px 0 6px;word-break:break-word"></div>
    <div class="tags" id="mTags"></div>
    <div class="mmedia" id="mMedia"><video id="mVideo" controls playsinline preload="none"></video></div>
    <div class="tagbar" id="mTagbar"></div>
    <div class="body" id="mBody"></div>
    <div class="sheet-foot">
      <button class="btn primary" id="mCopy" data-i18n="copy_prompt"></button>
      <button class="btn" id="mFav"></button>
      <a class="btn" id="mSource" target="_blank" rel="noopener" data-i18n="view_source"></a>
      <a class="btn" id="mPage" target="_blank" rel="noopener" data-i18n="beatapi_page"></a>
      <span class="author" id="mAuthor"></span>
    </div>
  </div>
</div>
<div class="toast" id="toast"></div>

<script id="data" type="application/json">__PAYLOAD__</script>
<script>
const DATA = JSON.parse(document.getElementById('data').textContent);
const BY_ID = {}; DATA.forEach(d=>BY_ID[d.id]=d);
const ASPECT_ORDER = ['2.35:1','1.85:1','16:9','3:2','4:3','5:4','1:1','4:5','3:4','2:3','9:16'];
const FAV_KEY='mmh3_favs_v1', TAG_KEY='mmh3_tags_v1', LANG_KEY='mmh3_lang_v1', THEME_KEY='mmh3_theme_v1';

let favs=new Set(JSON.parse(localStorage.getItem(FAV_KEY)||'[]'));
let tags=JSON.parse(localStorage.getItem(TAG_KEY)||'{}'); // id -> [tag,...]
let lang=localStorage.getItem(LANG_KEY)||'zh';
let theme=localStorage.getItem(THEME_KEY)||'dark';
let onlyFav=false, groupByTag=false, cur=null;

const I18N={
 zh:{app_title:'MiniMax H3 提示词助手',
   subtitle:'共 {n} 条 · 数据来自 beatapi.io · 仅供本地个人使用',
   search_ph:'搜索标题或提示词正文…（空格分隔多关键词）',
   all_cat:'全部分类',all_dur:'全部时长',all_asp:'全部画幅',all_tag:'全部标签',
   fav_only:'★ 只看收藏',group_by_tag:'按标签分组',clear_filters:'清除筛选',
   export_fav:'导出收藏(JSON)',shown:'显示 {a} / {b} 条',fav_count:'★ 收藏 {n} 条',
   view_copy:'查看/复制',source:'来源',empty:'没有匹配的提示词',
   copy_prompt:'复制提示词',view_source:'查看来源',beatapi_page:'BeatAPI 页面',
   copied:'已复制到剪贴板',exported:'已导出 {n} 条收藏',
   lang_btn:'EN',theme_btn:'☀ 浅色',tags_label:'标签',add_tag_ph:'输入标签后回车',
   untagged:'未分组',add_fav:'☆ 收藏',del_fav:'★ 已收藏',play:'▶',filters_cleared:'已清除筛选'},
 en:{app_title:'MiniMax H3 Prompt Assistant',
   subtitle:'{n} prompts · data from beatapi.io · for local personal use only',
   search_ph:'Search title or prompt text… (space = multiple keywords)',
   all_cat:'All categories',all_dur:'All durations',all_asp:'All aspects',all_tag:'All tags',
   fav_only:'★ Favorites only',group_by_tag:'Group by tag',clear_filters:'Clear filters',
   export_fav:'Export favorites (JSON)',shown:'Showing {a} / {b}',fav_count:'★ {n} favorited',
   view_copy:'View / Copy',source:'Source',empty:'No matching prompts',
   copy_prompt:'Copy prompt',view_source:'View source',beatapi_page:'BeatAPI page',
   copied:'Copied to clipboard',exported:'Exported {n} favorites',
   lang_btn:'中文',theme_btn:'☀ Light',tags_label:'Tags',add_tag_ph:'Type a tag, press Enter',
   untagged:'Untagged',add_fav:'☆ Favorite',del_fav:'★ Favorited',play:'▶',filters_cleared:'Filters cleared'}
};
function t(key,vars){let s=(I18N[lang]&&I18N[lang][key])||I18N.zh[key]||key;
  if(vars)for(const k in vars)s=s.replace('{'+k+'}',vars[k]);return s;}

const $=s=>document.querySelector(s);
function save(k,v){localStorage.setItem(k,JSON.stringify(v));}
function esc(s){return (s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function thumbSrc(d){return d.thumb||d.poster||'';}
function titleFor(d){return (lang==='zh' && d.title_zh) ? d.title_zh : d.title;}
function titleAlt(d){return (lang==='zh' && d.title_zh) ? d.title : (d.title_zh||'');}

function applyTheme(){document.documentElement.setAttribute('data-theme',theme);
  $('#themeBtn').textContent = theme==='dark'? t('theme_btn') : (lang==='zh'?'☾ 深色':'☾ Dark');}
function applyLang(){
  document.documentElement.lang = lang==='zh'?'zh-CN':'en';
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.getAttribute('data-i18n')));
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>el.placeholder=t(el.getAttribute('data-i18n-ph')));
  $('#subtitle').textContent=t('subtitle',{n:DATA.length});
  $('#langBtn').textContent=t('lang_btn');
  applyTheme(); rebuildSelects(); render();
}

function allUserTags(){const s=new Set();for(const id in tags)(tags[id]||[]).forEach(x=>s.add(x));return [...s].sort();}
function fillSelect(el,vals,labelAll,keep){
  const prev = keep!==undefined?keep:el.value; el.innerHTML='';
  const o0=document.createElement('option');o0.value='';o0.textContent=labelAll;el.appendChild(o0);
  vals.forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;el.appendChild(o);});
  if(prev && [...el.options].some(o=>o.value===prev)) el.value=prev;
}
function rebuildSelects(){
  fillSelect($('#fCat'),[...new Set(DATA.map(d=>d.category).filter(Boolean))].sort(),t('all_cat'));
  const durs=[...new Set(DATA.map(d=>d.duration).filter(Boolean))].sort((a,b)=>parseFloat(a)-parseFloat(b));
  fillSelect($('#fDur'),durs,t('all_dur'));
  const asps=[...new Set(DATA.map(d=>d.aspect).filter(Boolean))];
  asps.sort((a,b)=>{const ia=ASPECT_ORDER.indexOf(a),ib=ASPECT_ORDER.indexOf(b);
    return (ia<0?99:ia)-(ib<0?99:ib);});
  fillSelect($('#fAsp'),asps,t('all_asp'));
  fillSelect($('#fTag'),allUserTags(),t('all_tag'));
}

function highlight(text,terms){let out=esc(text);
  terms.filter(Boolean).forEach(tt=>{const re=new RegExp('('+tt.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');out=out.replace(re,'<mark>$1</mark>');});
  return out;}
function match(d,terms){const hay=(d.title+' '+d.title_zh+' '+d.prompt+' '+d.category+' '+d.author+' '+(tags[d.id]||[]).join(' ')).toLowerCase();
  return terms.every(x=>hay.includes(x));}

function currentFilters(){
  const q=$('#q').value.trim().toLowerCase();
  return {terms:q.split(/\s+/).filter(Boolean),fc:$('#fCat').value,fd:$('#fDur').value,fa:$('#fAsp').value,ft:$('#fTag').value};
}
function filtered(){
  const {terms,fc,fd,fa,ft}=currentFilters();
  return DATA.filter(d=>{
    if(onlyFav&&!favs.has(d.id))return false;
    if(fc&&d.category!==fc)return false;
    if(fd&&d.duration!==fd)return false;
    if(fa&&d.aspect!==fa)return false;
    if(ft&&!(tags[d.id]||[]).includes(ft))return false;
    if(terms.length&&!match(d,terms))return false;
    return true;});
}

function cardHTML(d,terms){
  const isFav=favs.has(d.id);
  const src=thumbSrc(d);
  const utags=(tags[d.id]||[]).map(x=>`<span class="tag utag" data-untag="${esc(d.id)}" data-tag="${esc(x)}">${esc(x)} ✕</span>`).join('');
  return `<div class="card">
    ${src?`<div class="thumb"><img loading="lazy" src="${esc(src)}" data-cdn="${esc(d.poster||'')}" data-open="${esc(d.id)}" alt=""/><span class="play">${t('play')}</span>${d.duration?`<span class="dur">${esc(d.duration)}</span>`:''}</div>`:''}
    <div class="card-in">
      <div class="card-top"><h2>${highlight(titleFor(d),terms)}</h2>
        <button class="star ${isFav?'on':''}" data-fav="${esc(d.id)}" title="fav">${isFav?'★':'☆'}</button></div>
      <div class="tags"><span class="tag cat">${esc(d.category)}</span>${d.aspect?`<span class="tag">${esc(d.aspect)}</span>`:''}${utags}</div>
      <div class="excerpt">${highlight(d.prompt.slice(0,200),terms)}</div>
      <div class="card-foot"><button class="btn primary" data-open="${esc(d.id)}">${t('view_copy')}</button>
        ${d.source_link?`<a class="btn" href="${esc(d.source_link)}" target="_blank" rel="noopener">${t('source')}</a>`:''}
        <span class="author">${esc(d.author||d.source||'')}</span></div>
    </div></div>`;
}

function render(){
  const list=filtered();
  const {terms}=currentFilters();
  $('#shown').textContent=t('shown',{a:list.length,b:DATA.length});
  $('#favCount').textContent=t('fav_count',{n:favs.size});
  $('#empty').style.display=list.length?'none':'block';
  const root=$('#list'); root.innerHTML='';
  if(!list.length)return;
  if(groupByTag){
    const groups={};
    list.forEach(d=>{const ts=(tags[d.id]||[]);const keys=ts.length?ts:[t('untagged')];
      keys.forEach(k=>{(groups[k]=groups[k]||[]).push(d);});});
    Object.keys(groups).sort((a,b)=>a===t('untagged')?1:b===t('untagged')?-1:a.localeCompare(b)).forEach(k=>{
      const h=document.createElement('div');h.className='group-h';h.innerHTML=`${esc(k)} <span class="cnt">${groups[k].length}</span>`;root.appendChild(h);
      const g=document.createElement('div');g.className='grid';g.innerHTML=groups[k].map(d=>cardHTML(d,terms)).join('');root.appendChild(g);
    });
  }else{
    const g=document.createElement('div');g.className='grid';
    g.innerHTML=list.slice(0,600).map(d=>cardHTML(d,terms)).join('');root.appendChild(g);
  }
  bindImgFallback();
}
function bindImgFallback(){
  document.querySelectorAll('.thumb img').forEach(img=>{
    img.onerror=()=>{const cdn=img.getAttribute('data-cdn');
      if(cdn&&img.src!==cdn){img.src=cdn;}else{img.style.display='none';img.parentElement.querySelector('.play')&&(img.parentElement.style.display='none');}
      img.onerror=null;};
  });
}

$('#list').addEventListener('click',e=>{
  const un=e.target.closest('[data-untag]');
  if(un){const id=un.getAttribute('data-untag'),tg=un.getAttribute('data-tag');
    tags[id]=(tags[id]||[]).filter(x=>x!==tg);if(!tags[id].length)delete tags[id];
    save(TAG_KEY,tags);rebuildSelects();render();if(cur&&cur.id===id)renderTagbar();e.stopPropagation();return;}
  const favBtn=e.target.closest('[data-fav]');
  if(favBtn){const id=favBtn.getAttribute('data-fav');favs.has(id)?favs.delete(id):favs.add(id);
    save(FAV_KEY,[...favs]);render();if(cur&&cur.id===id)$('#mFav').textContent=favs.has(id)?t('del_fav'):t('add_fav');return;}
  const openBtn=e.target.closest('[data-open]');
  if(openBtn)openModal(openBtn.getAttribute('data-open'));
});

function renderTagbar(){
  const bar=$('#mTagbar'); const ts=tags[cur.id]||[];
  bar.innerHTML=`<span class="tag" style="background:none;border:none;color:var(--muted);padding-left:0">${t('tags_label')}:</span>`+
    ts.map(x=>`<span class="tag utag" data-mtag="${esc(x)}">${esc(x)}<span class="utag-x">✕</span></span>`).join('')+
    `<input id="tagInput" placeholder="${esc(t('add_tag_ph'))}"/>`;
  bar.querySelectorAll('[data-mtag]').forEach(el=>el.onclick=()=>{
    const tg=el.getAttribute('data-mtag');tags[cur.id]=(tags[cur.id]||[]).filter(x=>x!==tg);
    if(!tags[cur.id].length)delete tags[cur.id];save(TAG_KEY,tags);renderTagbar();rebuildSelects();render();});
  const inp=$('#tagInput');
  inp.onkeydown=ev=>{if(ev.key==='Enter'){const v=inp.value.trim();if(v){
    tags[cur.id]=[...new Set([...(tags[cur.id]||[]),v])];save(TAG_KEY,tags);renderTagbar();rebuildSelects();render();}}};
}
function openModal(id){
  const d=BY_ID[id];if(!d)return;cur=d;
  $('#mTitle').textContent=titleFor(d);
  const alt=titleAlt(d); const sub=$('#mTitleAlt');
  if(alt){sub.textContent=alt;sub.style.display='';}else sub.style.display='none';
  $('#mBody').textContent=d.prompt;
  $('#mTags').innerHTML=`<span class="tag cat">${esc(d.category)}</span><span class="tag">${esc(d.model)}</span>${d.duration?`<span class="tag">${esc(d.duration)}</span>`:''}${d.aspect?`<span class="tag">${esc(d.aspect)}${d.aspect_raw&&d.aspect_raw!==d.aspect?' ('+esc(d.aspect_raw)+')':''}</span>`:''}`;
  $('#mAuthor').textContent=d.author||d.source||'';
  $('#mFav').textContent=favs.has(id)?t('del_fav'):t('add_fav');
  const src=$('#mSource');if(d.source_link){src.href=d.source_link;src.style.display='';}else src.style.display='none';
  const pg=$('#mPage');if(d.url){pg.href=d.url;pg.style.display='';}else pg.style.display='none';
  const mm=$('#mMedia'),vid=$('#mVideo');
  if(d.video){vid.src=d.video;vid.poster=d.poster||thumbSrc(d);mm.style.display='block';}else{vid.removeAttribute('src');mm.style.display='none';}
  renderTagbar();
  $('#modal').classList.add('open');document.body.style.overflow='hidden';
}
function closeModal(){$('#modal').classList.remove('open');document.body.style.overflow='';
  const vid=$('#mVideo');vid.pause();vid.removeAttribute('src');vid.load();cur=null;}
$('#mClose').onclick=closeModal;
$('#modal').onclick=e=>{if(e.target.id==='modal')closeModal();};
$('#mFav').onclick=()=>{if(!cur)return;favs.has(cur.id)?favs.delete(cur.id):favs.add(cur.id);
  save(FAV_KEY,[...favs]);$('#mFav').textContent=favs.has(cur.id)?t('del_fav'):t('add_fav');render();};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();
  if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();$('#q').focus();}});

function toast(m){const el=$('#toast');el.textContent=m;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1400);}
async function copyText(x){try{await navigator.clipboard.writeText(x);toast(t('copied'));}
  catch{const ta=document.createElement('textarea');ta.value=x;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toast(t('copied'));}}
$('#mCopy').onclick=()=>{if(cur)copyText(cur.prompt);};
$('#exportFav').onclick=()=>{const out=DATA.filter(d=>favs.has(d.id)).map(d=>({...d,tags:tags[d.id]||[]}));
  const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='minimax-h3-favorites.json';a.click();
  URL.revokeObjectURL(a.href);toast(t('exported',{n:out.length}));};
$('#clearBtn').onclick=()=>{$('#q').value='';['#fCat','#fDur','#fAsp','#fTag'].forEach(s=>$(s).value='');
  onlyFav=false;$('#fFav').classList.remove('active');render();toast(t('filters_cleared'));};

$('#langBtn').onclick=()=>{lang=lang==='zh'?'en':'zh';localStorage.setItem(LANG_KEY,lang);applyLang();};
$('#themeBtn').onclick=()=>{theme=theme==='dark'?'light':'dark';localStorage.setItem(THEME_KEY,theme);applyTheme();};
$('#fFav').onclick=()=>{onlyFav=!onlyFav;$('#fFav').classList.toggle('active',onlyFav);render();};
$('#groupBtn').onclick=()=>{groupByTag=!groupByTag;$('#groupBtn').classList.toggle('on',groupByTag);render();};
let tid;$('#q').addEventListener('input',()=>{clearTimeout(tid);tid=setTimeout(render,120);});
['#fCat','#fDur','#fAsp','#fTag'].forEach(s=>$(s).addEventListener('change',render));

applyLang();
</script>
</body>
</html>"""

out = HTML.replace("__PAYLOAD__", payload)
with open("minimax-h3-prompt-assistant.html", "w", encoding="utf-8") as f:
    f.write(out)
print("records:", count, "with_thumb:", with_thumb)
print("wrote minimax-h3-prompt-assistant.html")
