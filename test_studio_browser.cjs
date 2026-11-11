const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = __dirname;
const ARTIFACTS = path.join(ROOT, 'studio-test-artifacts');
const URL = 'http://127.0.0.1:8786/video-prompt-studio.html';
let socket, seq=0;
const pending = new Map();
const browserErrors=[];
const results=[];
async function connect(){
  const pages=await (await fetch('http://127.0.0.1:9335/json/list')).json();
  const page=pages.find(p=>p.type==='page');
  socket=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  socket.addEventListener('message',event=>{
    const message=JSON.parse(event.data);
    if(message.id){const p=pending.get(message.id);pending.delete(message.id);if(message.error)p?.reject(new Error(JSON.stringify(message.error)));else p?.resolve(message.result);}
    if(message.method==='Runtime.exceptionThrown')browserErrors.push(message.params.exceptionDetails);
  });
  await send('Page.enable');await send('Runtime.enable');
}
function send(method,params={}){const id=++seq;return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const response=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});if(response.exceptionDetails)throw new Error(response.exceptionDetails.exception?.description||response.exceptionDetails.text);return response.result.value;}
async function waitUntil(expression){const start=Date.now();while(Date.now()-start<12000){try{if(await evaluate(expression))return true;}catch{}await new Promise(r=>setTimeout(r,60));}throw new Error('Condition timed out: '+expression);}
async function click(selector){
  const point=await evaluate(`new Promise((resolve,reject)=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)return reject(new Error('Missing control: '+${JSON.stringify(selector)}));el.scrollIntoView({block:'center'});const start=Date.now();let previous='';const check=()=>{const r=el.getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;const hit=document.elementFromPoint(x,y);const position=[x,y].join(',');if(r.width&&r.height&&hit&&el.contains(hit)&&position===previous)return resolve({x,y});if(Date.now()-start>5000)return reject(new Error('Control not clickable: '+${JSON.stringify(selector)}));previous=position;requestAnimationFrame(check)};check()})`);
  await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});
  if(selector==='#formSubmit'||selector==='#confirmImport')await waitUntil(`!document.querySelector(${JSON.stringify(selector)})?.disabled`);
}
async function fill(selector,value){await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});el.focus();el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('input',{bubbles:true}));})()`);}
async function select(selector,value){await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('change',{bubbles:true}));})()`);}
async function screenshot(name){await evaluate("document.querySelector('#toast').hidden=true;document.querySelector('#contentScroll').scrollTop=0;document.querySelector('#editorContent').scrollTop=0;document.querySelector('.asset-dialog-scroll').scrollTop=0;Promise.all(document.getAnimations().filter(a=>a.effect&&a.effect.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})))");const data=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(path.join(ARTIFACTS,name+'.png'),Buffer.from(data.data,'base64'));}
async function upload(file){await evaluate("document.querySelector('#backupFile').value=''");const doc=await send('DOM.getDocument');const node=await send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'#backupFile'});await send('DOM.setFileInputFiles',{nodeId:node.nodeId,files:[path.join(ARTIFACTS,file)]});}
async function dimensions(width,height=960){await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');}
async function test(name,action){await action();results.push(name);console.log('PASS',name);}
async function run(){
  await connect();await dimensions(1440);await send('Page.navigate',{url:URL});await waitUntil("location.href.startsWith('http://127.0.0.1:8786')&&document.querySelectorAll('.prompt-card').length===24");
  await evaluate("state={schema:1,settings:{lang:'zh',theme:'dark'},favorites:{},folders:[],drafts:[],activeDraftId:null};storageBlocked=false;window.__preReload=true;saveState()");await send('Page.reload',{ignoreCache:true});await waitUntil("!window.__preReload&&document.querySelectorAll('.prompt-card').length===24");
  await waitUntil("[...document.querySelectorAll('.card-media img')].slice(0,2).every(i=>i.complete&&i.naturalWidth>0)");
  await waitUntil("document.querySelector('#featuredImage').complete&&document.querySelector('#featuredImage').naturalWidth>0");
  const FIRST_ID=await evaluate('CATALOG[0].id');
  await test('550 records, local thumbnails, bilingual titles and clean filters',async()=>{
    const data=await evaluate(`({total:CATALOG.length,cards:document.querySelectorAll('.prompt-card').length,categories:categories.length,firstId:document.querySelector('.prompt-card').dataset.itemId,secondId:document.querySelectorAll('.prompt-card')[1].dataset.itemId,featuredHidden:document.querySelector('#featuredScene').hidden,hero:document.querySelector('#featuredTitle').textContent,featuredName:document.querySelector('#featuredName').textContent,durations:[...document.querySelector('#durationFilter').options].slice(1).map(o=>Number(o.value)),aspect:CATALOG.find(d=>d.aspect==='7:4')?.aspect,group:CATALOG.find(d=>d.aspect==='7:4')?.aspect_group,theme:document.documentElement.dataset.theme})`);
    assert.equal(data.total,550);assert.equal(data.cards,24);assert.equal(data.categories,17);assert.equal(data.firstId,'minimax-h3-keeps-delivering-beautiful-vfx-sequences-725200-010115029');assert.equal(data.secondId,'15-second-cinematic-showdown-between-the-most-technolog-354071-010104001');assert.equal(data.featuredHidden,false);assert.match(data.hero,/下一帧/);assert.ok(data.featuredName.length>0);assert.equal(data.theme,'dark');assert.deepEqual(data.durations,[...data.durations].sort((a,b)=>a-b));assert.equal(data.aspect,'7:4');assert.equal(data.group,'16:9');
  });
  await screenshot('desktop-library');
  await test('Real search input, literal special characters and no-result reset',async()=>{
    await fill('#searchInput','香水');await waitUntil("document.querySelector('#resultCount').textContent.startsWith('7 ')");
    assert.match(await evaluate("document.querySelector('#resultNote').textContent"),/智能扩展/);
    assert.equal(await evaluate("document.querySelector('#featuredScene').hidden"),true);
    for(const query of ['[','.*','<script>','不存在的关键词-12345']){await fill('#searchInput',query);await evaluate('new Promise(r=>setTimeout(r,180))');}
    assert.equal(await evaluate("document.querySelector('#emptyState').hidden"),false);await click('#resetFilters');assert.equal(await evaluate("document.querySelector('#resultCount').textContent"),'550 条灵感');assert.equal(await evaluate("document.querySelector('#featuredScene').hidden"),false);
  });
  await test('Duration and approximate aspect intersection matches actual catalog',async()=>{
    await select('#durationFilter','15');await select('#aspectFilter','9:16');
    const counts=await evaluate("({actual:filteredItems().length,expected:CATALOG.filter(d=>d.duration_seconds===15&&d.aspect_group==='9:16').length})");assert.equal(counts.actual,counts.expected);assert.ok(counts.actual>0);await click('#resetFilters');
    await click('#loadMore');assert.equal(await evaluate("document.querySelectorAll('.prompt-card').length"),48);
  });
  await test('Create collection and reject a duplicate',async()=>{
    await click('#newFolder');await fill('#formInput','产品片 · 灵感');await click('#formSubmit');
    assert.equal(await evaluate('state.folders.length'),1);
    await click('#newFolder');await fill('#formInput','产品片 · 灵感');await click('#formSubmit');assert.equal(await evaluate("document.querySelector('#formDialog').open"),true);assert.match(await evaluate("document.querySelector('#formError').textContent"),/同名/);await click('#formDialog [data-close]');
  });
  await test('Use template, auto-save edit/notes, organize favorite and safe custom tags',async()=>{
    await click(`.prompt-card[data-item-id="${FIRST_ID}"] .use-template`);
    assert.equal(await evaluate('currentDraft().prompt===CATALOG[0].prompt'),true);
    await fill('#draftName','雨夜城市 · 第一稿');await fill('#promptEditor','A cinematic rainy city. Slow tracking shot, warm window light.');await fill('#draftNotes','把主角换成穿红色风衣的旅人；备注不参与复制。');
    await select('#editorFolder',await evaluate('state.folders[0].id'));
    await fill('#tagInput','雨夜');await click('#addTag');await fill('#tagInput','雨夜');await click('#addTag');
    await fill('#tagInput','<img src=x onerror=alert(1)>');await click('#addTag');
    assert.equal(await evaluate('state.favorites[CATALOG[0].id].tags.length'),2);
    assert.equal(await evaluate("document.querySelector('#editorTags img')===null"),true);
    await click('#editorTags [data-remove-tag]:last-child');await fill('#tagInput','镜头参考');await click('#addTag');
    await evaluate('new Promise(r=>setTimeout(r,420))');
    const saved=await evaluate("JSON.parse(localStorage.getItem('frame_studio_v1')).drafts[0]");assert.equal(saved.name,'雨夜城市 · 第一稿');assert.match(saved.notes,/红色/);assert.equal(saved.prompt,'A cinematic rainy city. Slow tracking shot, warm window light.');
    await evaluate("document.querySelector('#editorContent').scrollTop=0;document.querySelector('#contentScroll').scrollTop=0");
  });
  await screenshot('desktop-workspace');
  await test('Save and restore versions without modifying original reference',async()=>{
    await click('#saveVersion');await fill('#formInput','雨夜暖光');await click('#formSubmit');
    await fill('#promptEditor','A new daylight scene.');await fill('#draftNotes','第二版备注');
    await click('#tabVersions');await click('[data-restore-version]');await click('#formSubmit');
    assert.match(await evaluate('currentDraft().prompt'),/rainy city/);assert.equal(await evaluate('currentDraft().versions.length'),2);
    await click('#tabReference');assert.equal(await evaluate("document.querySelector('#referenceText').textContent===CATALOG[0].prompt"),true);await click('#tabEdit');
  });
  await test('Copy exports only edited prompt, never private notes',async()=>{
    await evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async(text)=>{window.__copied=text}}})");
    await click('#copyDraft');assert.match(await evaluate('window.__copied'),/rainy city/);assert.equal(await evaluate("window.__copied.includes('备注')"),false);
  });
  await test('Preview defers video networking until user plays',async()=>{
    await click(`[data-preview="${FIRST_ID}"]`);assert.equal(await evaluate("document.querySelector('#previewDialog').open"),true);assert.equal(await evaluate("document.querySelector('#previewMedia video')"),null);assert.equal(await evaluate("document.querySelector('#previewPrompt').textContent===CATALOG[0].prompt"),true);await click('#previewDialog [data-close]');
  });
  await test('Language and theme switching preserve edits and selected filters',async()=>{
    await click('#editorClose');
    await select('#durationFilter','15');await click('#langToggle');assert.equal(await evaluate('document.documentElement.lang'),'en');assert.equal(await evaluate("document.querySelector('#durationFilter').value"),'15');assert.equal(await evaluate("document.querySelector('#draftName').value"),'雨夜城市 · 第一稿');await click('#themeToggle');assert.equal(await evaluate('document.documentElement.dataset.theme'),'light');await screenshot('desktop-light');await click('#themeToggle');assert.equal(await evaluate('document.documentElement.dataset.theme'),'dark');await screenshot('desktop-dark');await click('#langToggle');await click('#resetFilters');
  });
  await test('Full backup export, validation, conflict-safe and idempotent merge',async()=>{
    await click('#backupOpen');
    await evaluate("window.__backupBlob=null;window.__originalCreateObjectURL=URL.createObjectURL;URL.createObjectURL=(blob)=>{window.__backupBlob=blob;return window.__originalCreateObjectURL(blob)}");
    await click('#exportBackup');
    const backup=await evaluate('window.__backupBlob.text().then(JSON.parse)');assert.equal(backup.format,'frame-studio');assert.equal(backup.data.drafts[0].versions.length,2);
    const check=await evaluate(`(()=>{const incoming=parseBackup(JSON.stringify({format:'frame-studio',version:1,data:state}));const same=mergeIncoming(incoming);incoming.drafts[0].prompt='Imported alternative';const changed=mergeIncoming(incoming);let invalid=false;try{parseBackup(JSON.stringify({format:'frame-studio',version:1,data:{...state,drafts:[{...state.drafts[0],prompt:42}]}}))}catch{invalid=true}return {same:same.drafts.length,changed:changed.drafts.length,preserved:changed.drafts[0].prompt===state.drafts[0].prompt,invalid}})()`);
    assert.equal(check.same,1);assert.equal(check.changed,2);assert.equal(check.preserved,true);assert.equal(check.invalid,true);
    await fs.writeFile(path.join(ARTIFACTS,'test-backup.json'),JSON.stringify(backup));
    await click('#backupDialog [data-close]');
  });
  await test('Actual JSON file import confirms before merging and rejects invalid input',async()=>{
    await click('#backupOpen');const before=await evaluate('JSON.stringify(state)');
    await upload('test-backup.json');await waitUntil("document.querySelector('#confirmImport')!==null");
    assert.equal(await evaluate('JSON.stringify(state)'),before);
    await click('#confirmImport');assert.equal(await evaluate('state.drafts.length'),1);
    await fs.writeFile(path.join(ARTIFACTS,'invalid-backup.json'),JSON.stringify({format:'frame-studio',version:1,data:{schema:1}}));
    await upload('invalid-backup.json');await waitUntil("document.querySelector('#toast').textContent.includes('无法导入')");
    assert.equal(await evaluate('state.drafts.length'),1);assert.deepEqual(await evaluate('state'),JSON.parse(before));
    const legacy=await evaluate("[{id:CATALOG[1].id,tags:['旧收藏迁移']}]" );await fs.writeFile(path.join(ARTIFACTS,'legacy-backup.json'),JSON.stringify(legacy));
    await upload('legacy-backup.json');await waitUntil("document.querySelector('#confirmImport')!==null&&!document.querySelector('#importPreview').hidden");await click('#confirmImport');
    assert.equal(await evaluate('Object.keys(state.favorites).length'),2);assert.deepEqual(await evaluate('state.favorites[CATALOG[1].id].tags'),['旧收藏迁移']);
    await click('#backupDialog [data-close]');await click('#mainNav [data-view="favorites"]');await click('.prompt-card:nth-child(2) [data-favorite]');await click('#mainNav [data-view="library"]');
  });
  await test('A slower file selection cannot replace a newer invalid file or a closed dialog',async()=>{
    await click('#backupOpen');
    await evaluate("window.__fileText=File.prototype.text;File.prototype.text=function(){if(this.name==='test-backup.json')return new Promise(resolve=>{window.__releaseFile=()=>window.__fileText.call(this).then(resolve)});return window.__fileText.call(this)}");
    await upload('test-backup.json');await waitUntil("typeof window.__releaseFile==='function'");
    await upload('invalid-backup.json');await waitUntil("document.querySelector('#toast').textContent.includes('无法导入')");
    await evaluate('window.__releaseFile()');await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
    assert.equal(await evaluate('pendingImport'),null);assert.equal(await evaluate("document.querySelector('#importPreview').hidden"),true);
    await evaluate('window.__releaseFile=null');await upload('test-backup.json');await waitUntil("typeof window.__releaseFile==='function'");await click('#backupDialog [data-close]');
    await evaluate('window.__releaseFile()');await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
    assert.equal(await evaluate('pendingImport'),null);assert.equal(await evaluate("document.querySelector('#importPreview').hidden"),true);
    await evaluate('File.prototype.text=window.__fileText');
  });
  await test('Reload retains favorites, notes and versions',async()=>{
    await evaluate("window.__preReload=true");await send('Page.reload',{ignoreCache:true});await waitUntil("!window.__preReload&&document.querySelector('#draftName')?.value==='雨夜城市 · 第一稿'");assert.equal(await evaluate('currentDraft().versions.length'),2);assert.equal(await evaluate('Object.keys(state.favorites).length'),1);
  });
  await test('Folder views, tag filtering, rename and non-destructive folder deletion',async()=>{
    await click('#folderList [data-folder]');assert.equal(await evaluate('filteredItems().length'),1);
    await select('#tagFilter','雨夜');assert.equal(await evaluate('filteredItems().length'),1);
    await click('#headingTools [data-rename-folder]');await fill('#formInput','新片参考');await click('#formSubmit');assert.equal(await evaluate('state.folders[0].name'),'新片参考');
    await click('#headingTools [data-delete-folder]');await click('#formSubmit');assert.equal(await evaluate('state.folders.length'),0);assert.equal(await evaluate('Object.keys(state.favorites).length'),1);assert.equal(await evaluate('Object.values(state.favorites)[0].folderId'),null);
  });
  await test('Draft navigation and empty draft copy protection',async()=>{
    await click('#mainNav [data-view="drafts"]');assert.equal(await evaluate("document.querySelectorAll('.draft-card').length"),1);await click('.draft-card [data-edit-draft]');
    await click('.new-draft');assert.equal(await evaluate("document.querySelector('#copyDraft').disabled"),true);assert.equal(await evaluate('state.drafts.length'),2);
    await click('#mainNav [data-view="drafts"]');await click('.draft-card [data-delete-draft]');await click('#formDialog [data-close]');assert.equal(await evaluate('state.drafts.length'),2);
    await click('.draft-card [data-delete-draft]');await click('#formSubmit');assert.equal(await evaluate('state.drafts.length'),1);
    await click('.draft-card [data-edit-draft]');await click('#mainNav [data-view="library"]');
  });
  await test('Hero actions preview the featured case and start from its template',async()=>{
    await click('#editorClose');await click('#mainNav [data-view="library"]');
    await click('#featuredPreview');assert.equal(await evaluate('ui.previewId===FEATURED_ID'),true);assert.equal(await evaluate("document.querySelector('#previewDialog').open"),true);await click('#previewDialog [data-close]');
    await click('#featuredUse');assert.equal(await evaluate('currentDraft().sourceId===FEATURED_ID'),true);assert.equal(await evaluate("document.body.classList.contains('editor-visible')"),true);
    await evaluate("state.drafts=state.drafts.filter(d=>d.sourceId!==FEATURED_ID);state.activeDraftId=state.drafts[0]?.id||null;saveState();renderNav();renderEditor();renderLibrary();openEditor()");
  });
  await test('Quota failure retains edits and failed version saves stay open without a false success',async()=>{
    const notes=await evaluate('currentDraft().notes');
    await evaluate("window.__setItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError')}");
    await fill('#draftNotes','模拟容量错误，编辑仍应留在内存。');await waitUntil("document.querySelector('#storageWarning').hidden===false");
    assert.match(await evaluate("document.querySelector('#saveStatus').textContent"),/失败/);assert.match(await evaluate('currentDraft().notes'),/容量错误/);
    const count=await evaluate('currentDraft().versions.length');
    await click('#saveVersion');await fill('#formInput','容量恢复后保存');await click('#formSubmit');
    assert.equal(await evaluate("document.querySelector('#formDialog').open"),true);assert.match(await evaluate("document.querySelector('#formError').textContent"),/失败/);assert.equal(await evaluate('currentDraft().versions.length'),count);
    assert.notEqual(await evaluate("document.querySelector('#toast').textContent"),'版本已保存');
    await evaluate('Storage.prototype.setItem=window.__setItem');await click('#formSubmit');
    assert.equal(await evaluate("document.querySelector('#formDialog').open"),false);assert.equal(await evaluate('currentDraft().versions.length'),count+1);assert.equal(await evaluate("document.querySelector('#storageWarning').hidden"),true);
    await fill('#draftNotes',notes);await evaluate('saveState()');
  });
  await test('Import quota failure leaves state and confirmation intact for retry',async()=>{
    await click('#backupOpen');await evaluate('saveState()');
    await evaluate("showImportPreview(legacyState([{id:CATALOG[2].id,tags:['导入重试']}]))");
    const before=await evaluate('JSON.stringify(state)');
    await evaluate("Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError')}");
    await click('#confirmImport');assert.equal(await evaluate('JSON.stringify(state)'),before);assert.equal(await evaluate("document.querySelector('#importPreview').hidden"),false);assert.match(await evaluate("document.querySelector('#toast').textContent"),/失败/);
    await evaluate('Storage.prototype.setItem=window.__setItem');await click('#confirmImport');assert.equal(await evaluate("state.favorites[CATALOG[2].id].tags[0]"),'导入重试');
    await click('#backupDialog [data-close]');await evaluate('toggleFavorite(CATALOG[2].id);saveState()');
  });
  await test('Stale revisions are rejected before a delayed storage event, including imports',async()=>{
    await evaluate('saveState()');
    const before=await evaluate('localStorage.getItem(STORE_KEY)');
    await evaluate("window.__externalState=JSON.stringify({...state,settings:{...state.settings,theme:state.settings.theme==='dark'?'light':'dark'}});localStorage.setItem(STORE_KEY,window.__externalState)");
    assert.equal(await evaluate('saveState()'),false);assert.equal(await evaluate('storageBlocked'),true);assert.equal(await evaluate('localStorage.getItem(STORE_KEY)===window.__externalState'),true);assert.match(await evaluate("document.querySelector('#storageWarning').textContent"),/停止写入/);
    await evaluate('storageBlocked=false;storageProblem="";showImportPreview(legacyState([{id:CATALOG[3].id}]))');await evaluate('confirmImport()');
    assert.equal(await evaluate('storageBlocked'),true);assert.equal(await evaluate('localStorage.getItem(STORE_KEY)===window.__externalState'),true);assert.equal(await evaluate('!!state.favorites[CATALOG[3].id]'),false);
    await evaluate(`localStorage.setItem(STORE_KEY,${JSON.stringify(before)});storageBlocked=false;storageProblem='';discardImport();saveState()`);
    await evaluate("window.dispatchEvent(new StorageEvent('storage',{key:STORE_KEY,newValue:'other-window'}))");assert.equal(await evaluate('storageBlocked'),true);
    await evaluate('storageBlocked=false;storageProblem="";saveState()');
  });
  await test('Queued writes use the browser lock and unsaved edits guard navigation',async()=>{
    await evaluate("window.__lockHeld=false;window.__heldLock=navigator.locks.request(STORE_KEY,()=>new Promise(resolve=>{window.__releaseLock=resolve;window.__lockHeld=true}));undefined");await waitUntil('window.__lockHeld');
    await evaluate("window.__notesBefore=currentDraft().notes;updateDraft('notes','待保存内容');window.__saveFinished=false;window.__queuedSave=saveState().then(result=>{window.__saveFinished=true;return result});undefined");
    assert.equal(await evaluate('window.__saveFinished'),false);
    assert.equal(await evaluate("(()=>{const e=new Event('beforeunload',{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented})()"),true);
    await evaluate('window.__releaseLock();window.__queuedSave');assert.equal(await evaluate('window.__saveFinished'),true);
    assert.equal(await evaluate("(()=>{const e=new Event('beforeunload',{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented})()"),false);
    await evaluate("updateDraft('notes',window.__notesBefore);saveState()");
  });
  await test('Agent launcher opens with welcome; settings validate and persist locally',async()=>{
    await click('#editorClose');
    await click('#agentLauncher');
    assert.equal(await evaluate("document.body.classList.contains('agent-visible')"),true);
    assert.equal(await evaluate("document.querySelector('#agentPanel').inert"),false);
    assert.match(await evaluate("document.querySelector('#agentThread').textContent"),/分镜助手/);
    await click('#agentSettingsOpen');
    assert.equal(await evaluate("document.querySelector('#agentDialog').open"),true);
    await fill('#llmBase','javascript:alert(1)');await click('#agentSave');
    assert.equal(await evaluate("document.querySelector('#agentDialog').open"),true);
    assert.match(await evaluate("document.querySelector('#toast').textContent"),/http/);
    await fill('#llmBase','https://mock.llm/v1');await fill('#llmKey','sk-test');await fill('#llmModel','mock-chat');
    await fill('#imgBase','https://mock.img/v1');await fill('#imgKey','sk-img');await fill('#imgModel','mock-image');
    await select('#imgCount','2');
    await screenshot('desktop-agent-settings');
    await click('#agentSave');await waitUntil("!document.querySelector('#agentDialog').open");
    assert.equal(await evaluate("state.settings.agent.llm.baseUrl"),'https://mock.llm/v1');
    assert.equal(await evaluate("JSON.parse(localStorage.getItem(STORE_KEY)).settings.agent.image.model"),'mock-image');
    assert.match(await evaluate("document.querySelector('#agentStatus').textContent"),/mock-chat/);
    await click(`.prompt-card[data-item-id="${FIRST_ID}"] .use-template`);
    assert.equal(await evaluate("document.body.classList.contains('agent-visible')"),false);
    assert.equal(await evaluate("document.body.classList.contains('editor-visible')"),true);
    await click('#editorClose');await click('#agentLauncher');
  });
  await test('Shot inserts from card, preview and editor reach the agent context',async()=>{
    await click('#mainNav [data-view="library"]');
    await click(`.prompt-card[data-item-id="${FIRST_ID}"] .card-agent`);
    assert.equal(await evaluate("agent.context.kind"),'catalog');
    assert.equal(await evaluate("document.querySelector('#agentContext').hidden"),false);
    assert.ok(await evaluate("document.querySelector('#agentContext strong').textContent.length>0"));
    await click('#agentContextRemove');assert.equal(await evaluate("document.querySelector('#agentContext').hidden"),true);
    await click(`[data-preview="${FIRST_ID}"]`);await click('#previewAgent');
    assert.equal(await evaluate("document.querySelector('#previewDialog').open"),false);
    assert.equal(await evaluate("agent.context.id===CATALOG[0].id"),true);
    await click('#agentClose');await click('#editorToggle');await click('#agentFromEditor');
    assert.equal(await evaluate("agent.context.kind"),'draft');
    assert.equal(await evaluate("document.body.classList.contains('editor-visible')"),false);
  });
  const MOCK_FETCH=`(() => {
    const F='\\u0060\\u0060\\u0060',NL=String.fromCharCode(10);
    window.__realFetch=window.fetch;window.__llmCalls=[];window.__imgCalls=[];window.__llmStatus=0;window.__llmSlow=false;window.__netMode='';
    window.__imgB64='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    window.__llmReply='Changes:'+NL+NL+F+'prompt'+NL+'A rainy neon city, slow dolly-in, volumetric reflections.'+NL+F+NL+'- Added neon mood';
    window.fetch=async(url,opts)=>{
      const u=String(url);
      if(window.__netMode==='down')throw new TypeError('Failed to fetch');
      if(window.__netMode==='cors'){if(opts&&opts.mode==='no-cors')return new Response('',{status:200});throw new TypeError('Failed to fetch');}
      if(u.includes('/chat/completions')){
        const body=JSON.parse(opts.body);window.__llmCalls.push({url:u,body});
        if(window.__llmStatus)return new Response(JSON.stringify({error:{message:'bad key'}}),{status:window.__llmStatus,headers:{'Content-Type':'application/json'}});
        const content=window.__llmReply;
        if(body.stream){
          if(window.__llmSlow){const stream=new ReadableStream({start(ctrl){window.__streamCtrl=ctrl;ctrl.enqueue(new TextEncoder().encode('data: '+JSON.stringify({choices:[{delta:{content:'Working'}}]})+'\\n\\n'));if(opts.signal)opts.signal.addEventListener('abort',()=>{try{ctrl.error(new DOMException('Aborted','AbortError'))}catch{}});}});return new Response(stream,{headers:{'Content-Type':'text/event-stream'}});}
          const chunks=(content.match(/[\\s\\S]{1,16}/g)||[]).map(c=>'data: '+JSON.stringify({choices:[{delta:{content:c}}]})+'\\n\\n').concat(['data: [DONE]\\n\\n']);
          const stream=new ReadableStream({start(ctrl){const enc=new TextEncoder();for(const ch of chunks)ctrl.enqueue(enc.encode(ch));ctrl.close();}});
          return new Response(stream,{headers:{'Content-Type':'text/event-stream'}});
        }
        return Response.json({choices:[{message:{content}}]});
      }
      if(u.includes('/images/generations')){window.__imgCalls.push({url:u,body:JSON.parse(opts.body)});return Response.json({data:[{b64_json:window.__imgB64}]});}
      return window.__realFetch(url,opts);
    };
  })()`;
  await test('Streaming rewrite improves the inserted shot and applies to the workspace',async()=>{
    await evaluate(MOCK_FETCH);
    await click('#agentClose');
    await click(`.prompt-card[data-item-id="${FIRST_ID}"] .card-agent`);
    await click('#agentImprove');
    await waitUntil("!agent.busy&&agent.messages.some(m=>m.role==='assistant'&&m.done&&m.blocks.length===1)");
    const call=await evaluate("window.__llmCalls[0]");
    assert.equal(call.url,'https://mock.llm/v1/chat/completions');
    assert.equal(call.body.model,'mock-chat');assert.equal(call.body.stream,true);
    assert.ok(await evaluate("window.__llmCalls[0].body.messages.some(m=>m.content&&m.content.includes(CATALOG[0].prompt.slice(0,80)))"));
    assert.match(await evaluate("document.querySelector('#agentThread').textContent"),/rainy neon city/);
    await click('[data-agent-apply]');
    assert.equal(await evaluate("document.body.classList.contains('editor-visible')"),true);
    assert.match(await evaluate('currentDraft().prompt'),/rainy neon city/);
    await click('#editorClose');await click('#agentLauncher');
    await evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async(text)=>{window.__copied=text}}});window.__copied=null");
    await click('[data-agent-copy]');
    assert.match(await evaluate('window.__copied'),/rainy neon city/);
    await screenshot('desktop-agent');
  });
  await test('Key-image flow derives specs via LLM and renders downloadable images',async()=>{
    await evaluate("window.__llmReply=JSON.stringify([{title:'霓虹街景',prompt:'neon city keyframe'},{title:'旅人特写',prompt:'traveler close-up'}])");
    await click('#agentImages');
    await waitUntil("!agent.busy&&agent.messages.some(m=>m.role==='images'&&m.items.length===2&&m.items.every(i=>i.state==='done'))");
    assert.equal(await evaluate("window.__imgCalls.length"),2);
    const img=await evaluate("window.__imgCalls[0]");
    assert.equal(img.url,'https://mock.img/v1/images/generations');
    assert.equal(img.body.model,'mock-image');assert.equal(img.body.size,'1024x1024');assert.equal(img.body.prompt,'neon city keyframe');
    await waitUntil("[...document.querySelectorAll('.agent-image img')].length===2&&[...document.querySelectorAll('.agent-image img')].every(i=>i.complete&&i.naturalWidth>0)");
    assert.equal(await evaluate("document.querySelector('.agent-image a[download]').href.startsWith('data:image/png')"),true);
  });
  await test('Generated images save as an asset group with the source prompt',async()=>{
    await click('[data-agent-save-images]');
    assert.equal(await evaluate("document.querySelector('#formDialog').open"),true);
    await fill('#formInput','霓虹雨夜 · 关键帧');await click('#formSubmit');
    await waitUntil("state.assets.length===1&&state.assets[0].images.length===2");
    const a=await evaluate('state.assets[0]');
    assert.equal(a.name,'霓虹雨夜 · 关键帧');assert.equal(a.sourceId,FIRST_ID);
    assert.equal(a.prompt,await evaluate('CATALOG[0].prompt'));
    assert.ok(a.images.every(im=>im.src.startsWith('data:image/jpeg')),JSON.stringify(a.images.map(im=>im.src.slice(0,30))));
    assert.deepEqual(a.images.map(im=>im.prompt),['neon city keyframe','traveler close-up']);
    assert.equal(await evaluate("agent.messages.find(m=>m.role==='images').savedAssetId===state.assets[0].id"),true);
    assert.equal(await evaluate("document.querySelector('[data-agent-save-images]')===null"),true);
    assert.equal(await evaluate("document.querySelector('.agent-images-actions [data-asset-open]')!==null"),true);
    assert.equal(await evaluate("document.querySelector('#mainNav [data-view=\"assets\"] .count').textContent"),'1');
  });
  await test('Improved prompt block saves as a prompt-only group',async()=>{
    await click('[data-agent-save-block]');
    await fill('#formInput','雨夜改写 · 纯提示词');await click('#formSubmit');
    await waitUntil("state.assets.length===2");
    const a=await evaluate('state.assets[0]');
    assert.equal(a.name,'雨夜改写 · 纯提示词');assert.equal(a.images.length,0);
    assert.match(a.prompt,/rainy neon city/);assert.equal(a.sourceId,FIRST_ID);
    assert.equal(await evaluate("document.querySelector('[data-agent-save-block]')===null"),true);
    assert.equal(await evaluate("document.querySelector('#mainNav [data-view=\"assets\"] .count').textContent"),'2');
  });
  await test('Asset shelf lists groups with collages, search and sort',async()=>{
    await click('#agentClose');
    await click('#mainNav [data-view="assets"]');
    assert.equal(await evaluate("document.querySelectorAll('.asset-card').length"),2);
    assert.equal(await evaluate("document.querySelector('#viewTitle').textContent"),'素材，成组留存。');
    assert.equal(await evaluate("document.querySelector('#resultCount').textContent"),'2 组素材');
    assert.equal(await evaluate("document.querySelectorAll('.asset-collage.n2 img').length"),2);
    assert.equal(await evaluate("document.querySelector('.asset-cover-empty')!==null"),true);
    assert.equal(await evaluate("document.querySelector('#libraryStats').hidden"),false);
    assert.equal(await evaluate("document.querySelector('#durationFilter').hidden"),true);
    await fill('#searchInput','关键帧');await evaluate('new Promise(r=>setTimeout(r,220))');
    assert.equal(await evaluate("document.querySelectorAll('.asset-card').length"),1);
    await fill('#searchInput','');await evaluate('new Promise(r=>setTimeout(r,220))');
    await select('#sortFilter','old');
    assert.equal(await evaluate("document.querySelector('.asset-card').dataset.assetId===state.assets[1].id"),true);
    await select('#sortFilter','new');
    await screenshot('desktop-assets');
    await evaluate("state.settings.theme='light';setStaticText()");
    assert.match(await evaluate("document.querySelector('#searchInput').placeholder"),/素材组名称/);
    await screenshot('desktop-assets-light');await evaluate("state.settings.theme='dark';setStaticText()");
  });
  await test('Asset detail renames, edits, copies, downloads and applies',async()=>{
    const gid=await evaluate("state.assets.find(a=>a.images.length).id");
    await click(`.asset-card[data-asset-id="${gid}"] .asset-cover`);
    assert.equal(await evaluate("document.querySelector('#assetDialog').open"),true);
    assert.equal(await evaluate("document.querySelectorAll('.asset-figure').length"),2);
    assert.equal(await evaluate("document.querySelectorAll('.asset-spec').length"),2);
    await fill('#assetName','霓虹雨夜 · 已整理');
    await fill('#assetPrompt','雨夜霓虹，缓慢推轨，体积光反射。 Edited asset prompt.');
    await evaluate('new Promise(r=>setTimeout(r,500))');
    const stored=await evaluate("JSON.parse(localStorage.getItem(STORE_KEY)).assets.find(a=>a.id===ui.assetId)");
    assert.equal(stored.name,'霓虹雨夜 · 已整理');assert.match(stored.prompt,/Edited asset prompt/);
    await click('#assetCopy');assert.match(await evaluate('window.__copied'),/Edited asset prompt/);
    await evaluate("window.__dl=null;window.__origAnchorClick=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(this.download){window.__dl={name:this.download,jpeg:this.href.startsWith('data:image/jpeg')};return}return window.__origAnchorClick.call(this)}");
    await click('[data-asset-download]');
    assert.deepEqual(await evaluate('window.__dl'),{name:'frame-asset-1.jpg',jpeg:true});
    await evaluate("HTMLAnchorElement.prototype.click=window.__origAnchorClick");
    await click('.asset-spec summary');await click('[data-asset-img-copy]');
    assert.equal(await evaluate('window.__copied'),'neon city keyframe');
    await screenshot('desktop-asset-detail');
    await click('#assetApply');
    assert.equal(await evaluate("document.querySelector('#assetDialog').open"),false);
    assert.equal(await evaluate("document.body.classList.contains('editor-visible')"),true);
    assert.match(await evaluate('currentDraft().prompt'),/Edited asset prompt/);
    await click('#editorClose');
  });
  await test('Asset feeds the agent context and deletes cleanly',async()=>{
    const gid=await evaluate("state.assets.find(a=>a.images.length).id");
    await click(`.asset-card[data-asset-id="${gid}"] [data-asset-agent]`);
    assert.equal(await evaluate("agent.context.kind==='asset'&&agent.context.id===state.assets.find(a=>a.images.length).id"),true);
    assert.equal(await evaluate("document.body.classList.contains('agent-visible')"),true);
    assert.equal(await evaluate("document.querySelector('#agentContext img')!==null"),true);
    assert.match(await evaluate("document.querySelector('#agentContext').textContent"),/素材/);
    await click('#agentClose');
    await click(`.asset-card[data-asset-id="${gid}"] [data-asset-delete]`);
    await click('#formSubmit');
    await waitUntil("state.assets.length===1");
    assert.equal(await evaluate("agent.context===null"),true);
    assert.equal(await evaluate("document.querySelectorAll('.asset-card').length"),1);
    assert.equal(await evaluate("document.querySelector('#mainNav [data-view=\"assets\"] .count').textContent"),'1');
  });
  await test('Mobile asset shelf and detail dialog fit without overflow',async()=>{
    await dimensions(390,844);
    await click('#menuToggle');await click('#mainNav [data-view="assets"]');
    assert.equal(await evaluate("document.querySelectorAll('.asset-card').length"),1);
    const fit=await evaluate("({body:document.body.scrollWidth,content:document.querySelector('#contentScroll').scrollWidth,client:document.querySelector('#contentScroll').clientWidth})");
    assert.ok(fit.body<=390,JSON.stringify(fit));assert.ok(fit.content<=fit.client+1,JSON.stringify(fit));
    await screenshot('mobile-assets');
    await click('.asset-card .asset-cover');
    assert.equal(await evaluate("document.querySelector('#assetDialog').open"),true);
    const dfit=await evaluate("({sw:document.querySelector('#assetDialog').scrollWidth,cw:document.querySelector('#assetDialog').clientWidth})");
    assert.ok(dfit.sw<=dfit.cw+1,JSON.stringify(dfit));
    await screenshot('mobile-asset-detail');
    await click('#assetDialog [data-close]');
    await dimensions(1440,960);
  });
  await test('API errors surface clearly and a running request can be stopped',async()=>{
    await click('#mainNav [data-view="library"]');
    await click(`.prompt-card[data-item-id="${FIRST_ID}"] .card-agent`);
    await evaluate("window.__llmStatus=401");
    await click('#agentImprove');
    await waitUntil("!agent.busy&&agent.messages.some(m=>m.role==='error'&&m.text.includes('401'))");
    assert.match(await evaluate("document.querySelector('#agentThread').textContent"),/密钥/);
    assert.equal(await evaluate("document.querySelector('#agentImprove').disabled"),false);
    await evaluate("window.__llmStatus=0;window.__llmSlow=true");
    await click('#agentImprove');await waitUntil("agent.busy");
    await click('#agentSend');await waitUntil("!agent.busy");
    assert.match(await evaluate("agent.messages.filter(m=>m.role==='assistant').at(-1).text"),/已停止/);
    await evaluate("try{window.__streamCtrl.close()}catch{};window.__llmSlow=false");
  });
  await test('Missing config guides to settings; connection test and image fallback work',async()=>{
    await evaluate("state.settings.agent.llm.baseUrl=''");
    await click('#agentImprove');
    await waitUntil("agent.messages.some(m=>m.role==='error'&&m.settings)");
    await click('[data-agent-settings]');
    assert.equal(await evaluate("document.querySelector('#agentDialog').open"),true);
    await click('#llmTest');
    assert.match(await evaluate("document.querySelector('#llmTestResult').textContent"),/http/);
    await fill('#llmBase','https://mock.llm/v1');await click('#llmTest');
    await waitUntil("document.querySelector('#llmTestResult').className==='ok'");
    await click('#agentSave');await waitUntil("!document.querySelector('#agentDialog').open");
    await evaluate("state.settings.agent.llm.baseUrl='';window.__imgCalls.length=0");
    await click('#agentImages');
    await waitUntil("!agent.busy&&window.__imgCalls.length===1");
    assert.ok(await evaluate("window.__imgCalls[0].body.prompt.includes(CATALOG[0].prompt.slice(0,60))"));
    await evaluate("state.settings.agent.llm.baseUrl='https://mock.llm/v1';saveState()");
  });
  await test('Connection failures are classified as CORS block or unreachable address',async()=>{
    await click('#agentSettingsOpen');
    await evaluate("window.__netMode='cors'");
    await click('#llmTest');
    await waitUntil("document.querySelector('#llmTestResult').className==='fail'");
    assert.match(await evaluate("document.querySelector('#llmTestResult').textContent"),/CORS/);
    await evaluate("window.__netMode='down'");
    await click('#llmTest');
    await waitUntil("document.querySelector('#llmTestResult').className==='fail'&&!/CORS/.test(document.querySelector('#llmTestResult').textContent)");
    assert.match(await evaluate("document.querySelector('#llmTestResult').textContent"),/无法访问/);
    await evaluate("window.__netMode=''");
    await click('#llmTest');
    await waitUntil("document.querySelector('#llmTestResult').className==='ok'");
    await click('#agentDialog [data-close]');
  });
  await test('Mobile agent panel fits and stays usable',async()=>{
    await dimensions(390,844);
    await click('#agentClose');
    await click('#agentLauncher');
    assert.equal(await evaluate("document.body.classList.contains('agent-visible')"),true);
    const fit=await evaluate("({panel:document.querySelector('#agentPanel').scrollWidth,client:document.querySelector('#agentPanel').clientWidth,body:document.body.scrollWidth})");
    assert.ok(fit.panel<=fit.client+1,JSON.stringify(fit));assert.ok(fit.body<=390,JSON.stringify(fit));
    await screenshot('mobile-agent');
    await evaluate("state.settings.theme='light';setStaticText()");
    await screenshot('mobile-agent-light');
    await evaluate("state.settings.theme='dark';setStaticText()");
    await click('#agentClose');
    await dimensions(1440,960);
  });
  await test('Agent settings and assets survive reload; backup merges asset conflicts',async()=>{
    await evaluate("window.__preReload=true");await send('Page.reload',{ignoreCache:true});
    await waitUntil("!window.__preReload&&document.querySelectorAll('.prompt-card').length===24");
    assert.equal(await evaluate("state.settings.agent.llm.model"),'mock-chat');
    assert.equal(await evaluate("state.settings.agent.image.count"),2);
    assert.equal(await evaluate("agent.messages.length"),0);
    assert.equal(await evaluate('state.assets.length'),1);
    assert.equal(await evaluate('state.assets[0].name'),'雨夜改写 · 纯提示词');
    const check=await evaluate(`(()=>{const incoming=parseBackup(JSON.stringify({format:'frame-studio',version:1,data:state}));const same=mergeIncoming(incoming);incoming.assets[0].prompt='conflicting prompt';const changed=mergeIncoming(incoming);return {same:same.assets.length,changed:changed.assets.length,copy:changed.assets.some(a=>a.name.includes('导入副本'))}})()`);
    assert.equal(check.same,1);assert.equal(check.changed,2);assert.equal(check.copy,true);
    await click('#backupOpen');
    assert.equal(await evaluate("document.querySelector('#backupStats').children.length"),5);
    await click('#backupDialog [data-close]');
  });
  await test('Empty shelf guides back to the agent',async()=>{
    await click('#mainNav [data-view="assets"]');
    await click('.asset-card [data-asset-delete]');await click('#formSubmit');
    await waitUntil("state.assets.length===0");
    assert.equal(await evaluate("document.querySelector('#emptyState').hidden"),false);
    assert.match(await evaluate("document.querySelector('#emptyState').textContent"),/还没有素材组/);
    await click('#emptyState [data-action="open-agent"]');
    assert.equal(await evaluate("document.body.classList.contains('agent-visible')"),true);
    await click('#agentClose');
    await click('#mainNav [data-view="library"]');
  });
  await test('Prompt lab scores six dimensions and fixes/enhances live',async()=>{
    await evaluate("ui.editorOpen=false;syncDrawers();startDraft()");
    await fill('#promptEditor','A woman walking in the rain');
    await evaluate('new Promise(r=>setTimeout(r,220))');
    const lab=await evaluate("({score:analyzePrompt(currentDraft().prompt).score,dims:document.querySelectorAll('#labDims .lab-dim').length,on:document.querySelectorAll('#labDims .lab-dim.on').length,fix:document.querySelectorAll('#labFix .lab-fix-btn').length,meter:document.querySelector('#labMeterFill').style.width})");
    assert.equal(lab.dims,6);assert.equal(lab.on,2);assert.equal(lab.fix,4);assert.equal(lab.score,33);assert.equal(lab.meter,'33%');
    const before=await evaluate('currentDraft().prompt');
    await click('#labFix .lab-fix-btn');
    const after=await evaluate('currentDraft().prompt');
    assert.ok(after.startsWith(before)&&after.length>before.length);
    assert.match(await evaluate("document.querySelector('#toast').textContent"),/已补全/);
    await click('#labEnhance [data-lab-enhance="rain"]');
    assert.match(await evaluate('currentDraft().prompt'),/rain-soaked night streets/);
    assert.equal(await evaluate("document.querySelector('#labEnhance [data-lab-enhance=\"rain\"]').classList.contains('on')"),true);
    assert.match(await evaluate("document.querySelector('#toast').textContent"),/雨夜霓虹/);
    await fill('#promptEditor','A woman close-up, slow dolly-in on 35mm lens, golden hour volumetric light, drifting dust slow motion, melancholic mood, cinematic film grain');
    await evaluate('new Promise(r=>setTimeout(r,220))');
    assert.equal(await evaluate("document.querySelectorAll('#labFix .lab-fix-btn').length"),0);
    assert.match(await evaluate("document.querySelector('#labFix').textContent"),/六维齐全/);
    assert.equal(await evaluate("document.querySelector('#labScore').textContent"),'完整度 100%');
    await evaluate("document.querySelector('#promptEditor').style.minHeight='110px'");
    await screenshot('desktop-prompt-lab');
    await evaluate("document.querySelector('#promptEditor').style.minHeight=''");
    await click('#editorClose');
  });
  await test('Chinese search expands to English terms and notes the expansion',async()=>{
    await fill('#searchInput','雨夜');
    await waitUntil("document.querySelector('#resultNote').textContent.includes('智能扩展')");
    assert.ok(await evaluate('filteredItems().length>0'));
    assert.match(await evaluate("document.querySelector('#resultNote').textContent"),/rain/);
    await click('#resetFilters');
  });
  await test('Card copy, recent history and undo keep the flow fast',async()=>{
    await evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copied=text}}});window.__copied=null");
    await click(`.prompt-card[data-item-id="${FIRST_ID}"] .card-copy`);
    assert.equal(await evaluate('window.__copied'),await evaluate('CATALOG[0].prompt'));
    assert.equal(await evaluate('state.recent[0].id'),FIRST_ID);
    await click('#mainNav [data-view="recent"]');
    assert.equal(await evaluate("document.querySelector('.prompt-card').dataset.itemId"),FIRST_ID);
    assert.match(await evaluate("document.querySelector('#viewTitle').textContent"),/最近/);
    assert.equal(await evaluate("document.querySelector('#mainNav [data-view=\"recent\"]').classList.contains('active')"),true);
    await screenshot('desktop-recent');
    const OTHER=await evaluate('CATALOG[5].id');
    await click('#mainNav [data-view="library"]');
    await evaluate(`state.favorites['${OTHER}']={folderId:null,tags:[],createdAt:now()};saveState();renderLibrary()`);
    await click(`.prompt-card[data-item-id="${OTHER}"] .card-heart`);
    assert.equal(await evaluate(`!!state.favorites['${OTHER}']`),false);
    assert.match(await evaluate("document.querySelector('#toast').textContent"),/撤销/);
    await click('#toastAction');
    assert.equal(await evaluate(`!!state.favorites['${OTHER}']`),true);
    assert.match(await evaluate("document.querySelector('#toast').textContent"),/已撤销/);
  });
  await test('Command palette runs commands and shots with keyboard',async()=>{
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'k',code:'KeyK',windowsVirtualKeyCode:75,modifiers:2});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'k',code:'KeyK',windowsVirtualKeyCode:75,modifiers:2});
    await waitUntil("document.querySelector('#paletteDialog').open");
    assert.ok(await evaluate("document.querySelectorAll('#paletteList .palette-item').length>=10"));
    await fill('#paletteInput','素材');
    assert.ok(await evaluate("document.querySelectorAll('#paletteList .palette-item').length>=1"));
    await screenshot('desktop-palette');
    await click('#paletteList .palette-item');
    await waitUntil("!document.querySelector('#paletteDialog').open");
    assert.equal(await evaluate('ui.view'),'assets');
    await click('#paletteOpen');
    await fill('#paletteInput','香水');
    await waitUntil("paletteItems.some(i=>i.kind==='shot')");
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
    await waitUntil("document.querySelector('#previewDialog').open");
    assert.match(await evaluate("document.querySelector('#previewTitle').textContent"),/香水/);
    await click('#previewDialog [data-close]');
    await click('#mainNav [data-view="library"]');
  });
  await test('Preview shows related shots and navigates between them',async()=>{
    await click(`.prompt-card[data-item-id="${FIRST_ID}"] [data-preview]`);
    await waitUntil("document.querySelectorAll('#previewRelated .related-shot').length>0");
    const rel=await evaluate("document.querySelector('#previewRelated .related-shot').dataset.preview");
    assert.notEqual(rel,FIRST_ID);
    await screenshot('desktop-preview-related');
    await click('#previewRelated .related-shot');
    assert.equal(await evaluate('ui.previewId'),rel);
    assert.equal(await evaluate("document.querySelector('#previewDialog').open"),true);
    assert.equal(await evaluate('state.recent[0].id'),rel);
    await click('#previewDialog [data-close]');
  });
  await test('Intent chips and missing-dimension fix reach the agent',async()=>{
    await evaluate(MOCK_FETCH);
    await click(`.prompt-card[data-item-id="${FIRST_ID}"] .card-agent`);
    assert.ok(await evaluate("document.querySelectorAll('#agentIntents .intent-chip').length>=4"));
    await evaluate("window.__llmReply='Changes:'+String.fromCharCode(10,10)+'```prompt'+String.fromCharCode(10)+'Intent rewrite result.'+String.fromCharCode(10)+'```'");
    await click('#agentIntents [data-intent="1"]');
    await waitUntil("!agent.busy&&agent.messages.some(m=>m.role==='assistant'&&m.done&&m.text.includes('Intent rewrite result'))");
    assert.match(await evaluate("document.querySelector('#agentThread').textContent"),/雨夜霓虹/);
    const fixChip=await evaluate("!!document.querySelector('#agentIntents .intent-chip.fix')");
    if(fixChip){
      await click('#agentIntents .intent-chip.fix');
      await waitUntil("!agent.busy&&agent.messages.filter(m=>m.role==='user').some(m=>m.text.includes('补全提示词中缺失的维度'))");
    }
    await click('#agentContextRemove');
    assert.equal(await evaluate("document.querySelector('#agentIntents .intent-chip.fix')===null"),true);
    await click('#agentClose');
  });
  await test('Light theme keeps the new surfaces readable',async()=>{
    await evaluate("state.settings.theme='light';setStaticText()");
    await evaluate("document.querySelector('#contentScroll').scrollTop=0");
    await screenshot('desktop-library-light');
    await evaluate("startDraft()");
    await fill('#promptEditor','A traveler, slow dolly-in, golden hour light');
    await evaluate('new Promise(r=>setTimeout(r,220))');
    await evaluate("document.querySelector('#promptEditor').style.minHeight='110px'");
    await screenshot('desktop-prompt-lab-light');
    await evaluate("document.querySelector('#promptEditor').style.minHeight=''");
    await click('#editorClose');
    await evaluate("state.settings.theme='dark';setStaticText()");
  });
  await test('Responsive mobile and narrow desktop layouts never overflow',async()=>{
    for(const width of [1440,1280,1024,768,390,320]){
      await dimensions(width,844);await evaluate("ui.editorOpen=false;document.body.classList.remove('sidebar-visible');syncDrawers()");
      const layout=await evaluate(`({width:innerWidth,body:document.body.scrollWidth,content:document.querySelector('#contentScroll').scrollWidth,client:document.querySelector('#contentScroll').clientWidth})`);
      assert.ok(layout.body<=width,JSON.stringify(layout));assert.ok(layout.content<=layout.client+1,JSON.stringify(layout));
    }
    await dimensions(390,844);await evaluate("document.querySelector('#contentScroll').scrollTop=0");await screenshot('mobile-library');
    await click('#menuToggle');assert.equal(await evaluate("document.body.classList.contains('sidebar-visible')"),true);await click('#mainNav [data-view="drafts"]');
    await click('.draft-card [data-edit-draft]');assert.equal(await evaluate("getComputedStyle(document.querySelector('#editorPanel')).display"),'flex');
    await screenshot('mobile-editor');
    assert.ok(await evaluate("document.querySelector('#editorPanel').scrollWidth<=document.querySelector('#editorPanel').clientWidth"));
    await click('#editorClose');await click('#menuToggle');await click('#mainNav [data-view="library"]');
  });
  await test('File-mode standalone works without fetch or dependencies',async()=>{
    await dimensions(1440,960);await send('Page.navigate',{url:'file:///'+ROOT.replaceAll('\\','/')+'/video-prompt-studio.html'});await waitUntil("location.protocol==='file:'&&document.querySelectorAll('.prompt-card').length===24");await waitUntil("document.querySelector('.card-media img').naturalWidth>0");assert.equal(await evaluate('CATALOG.length'),550);
  });
  assert.equal(browserErrors.length,0,JSON.stringify(browserErrors));
  await fs.writeFile(path.join(ARTIFACTS,'results.json'),JSON.stringify({passed:results.length,tests:results,consoleErrors:browserErrors},null,2));
  console.log('ALL PASSED',results.length);socket.close();
}
run().catch(async error=>{console.error(error);if(socket){try{await screenshot('failure');console.error(await evaluate("({dialogs:[...document.querySelectorAll('dialog[open]')].map(d=>d.id),formError:document.querySelector('#formError').textContent,folders:state.folders,focused:document.activeElement?.outerHTML.slice(0,300)})"));}catch{}socket.close();}process.exitCode=1;});

