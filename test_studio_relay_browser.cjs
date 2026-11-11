const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { spawn, spawnSync } = require('node:child_process');

const ROOT = __dirname;
const ARTIFACTS = path.join(ROOT, 'studio-test-artifacts');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const UPSTREAM_PORT = 8792, STUDIO_PORT = 8793, CDP_PORT = 9336;
const PAGE = `http://127.0.0.1:${STUDIO_PORT}/`;
const TINY_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const received = [];
let socket, seq = 0, chrome, studio;
const pending = new Map();
const browserErrors = [];
const results = [];

function send(method, params = {}) { const id = ++seq; return new Promise((resolve, reject) => { pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); }); }
async function connect() {
  const pages = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
  const page = pages.find(p => p.type === 'page');
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) { const p = pending.get(message.id); pending.delete(message.id); if (message.error) p?.reject(new Error(JSON.stringify(message.error))); else p?.resolve(message.result); }
    if (message.method === 'Runtime.exceptionThrown') browserErrors.push(message.params.exceptionDetails);
  });
  await send('Page.enable'); await send('Runtime.enable');
}
async function evaluate(expression) { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; }
async function waitUntil(expression) { const start = Date.now(); while (Date.now() - start < 20000) { try { if (await evaluate(expression)) return true; } catch {} await new Promise(r => setTimeout(r, 80)); } throw new Error('Condition timed out: ' + expression); }
async function click(selector) {
  const point = await evaluate(`new Promise((resolve,reject)=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)return reject(new Error('Missing control: '+${JSON.stringify(selector)}));el.scrollIntoView({block:'center'});const start=Date.now();let previous='';const check=()=>{const r=el.getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;const hit=document.elementFromPoint(x,y);const position=[x,y].join(',');if(r.width&&r.height&&hit&&el.contains(hit)&&position===previous)return resolve({x,y});if(Date.now()-start>5000)return reject(new Error('Control not clickable: '+${JSON.stringify(selector)}));previous=position;requestAnimationFrame(check)};check()})`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
  if (selector === '#formSubmit') await waitUntil(`!document.querySelector('#formSubmit')?.disabled`);
}
async function fill(selector, value) { await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});el.focus();el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('input',{bubbles:true}));})()`); }
async function select(selector, value) { await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('change',{bubbles:true}));})()`); }
async function screenshot(name) { await evaluate("document.querySelector('#toast').hidden=true;Promise.all(document.getAnimations().filter(a=>a.effect&&a.effect.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})))"); const data = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }); await fs.writeFile(path.join(ARTIFACTS, name + '.png'), Buffer.from(data.data, 'base64')); }
async function dimensions(width, height = 960) { await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false }); await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))'); }
async function test(name, action) { await action(); results.push(name); console.log('PASS', name); }
async function waitForHttp(url, ms = 20000) { const start = Date.now(); while (Date.now() - start < ms) { try { const r = await fetch(url); if (r.ok) return; } catch {} await new Promise(r => setTimeout(r, 150)); } throw new Error('Service not ready: ' + url); }

const upstream = http.createServer((req, res) => {
  let body = '';
  req.on('data', c => body += c);
  req.on('end', () => {
    received.push({ method: req.method, url: req.url, auth: req.headers.authorization || '', ctype: req.headers['content-type'] || '' });
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname.endsWith('/chat/completions')) {
      const parsed = JSON.parse(body || '{}');
      const sys = parsed.messages?.[0]?.content || '';
      if (sys.includes('Extract at most')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify([{ title: '霓虹街景', prompt: 'neon city keyframe' }, { title: '旅人特写', prompt: 'traveler close-up' }]) } }] }));
      } else if (parsed.stream) {
        res.writeHead(200, { 'Content-Type': 'text/event-stream' });
        const content = 'Changes:\n\n```prompt\nA rainy neon city, slow dolly-in, volumetric reflections.\n```\n\n- Added neon mood';
        const chunks = content.match(/[\s\S]{1,16}/g) || [];
        let i = 0;
        const tick = () => { if (i < chunks.length) { res.write('data: ' + JSON.stringify({ choices: [{ delta: { content: chunks[i++] } }] }) + '\n\n'); setTimeout(tick, 20); } else { res.write('data: [DONE]\n\n'); res.end(); } };
        tick();
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ choices: [{ message: { content: 'pong' } }] }));
      }
    } else if (pathname.endsWith('/images/generations')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: [{ b64_json: TINY_PNG }] }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: { message: 'not found' } }));
    }
  });
});

async function run() {
  await fs.mkdir(ARTIFACTS, { recursive: true });
  await fs.rm(path.join(ARTIFACTS, 'chrome-relay-profile'), { recursive: true, force: true });
  await new Promise(resolve => upstream.listen(UPSTREAM_PORT, '127.0.0.1', resolve));
  studio = spawn('python', ['start_studio.py', '--port', String(STUDIO_PORT), '--no-browser'], { cwd: ROOT, stdio: 'ignore' });
  await waitForHttp(PAGE);
  chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', `--remote-debugging-port=${CDP_PORT}`, '--remote-debugging-address=127.0.0.1', `--user-data-dir=${path.join(ARTIFACTS, 'chrome-relay-profile')}`, 'about:blank'], { stdio: 'ignore' });
  await waitForHttp(`http://127.0.0.1:${CDP_PORT}/json/list`);
  await connect(); await dimensions(1440);
  await send('Page.navigate', { url: PAGE });
  await waitUntil("location.href.startsWith('http://127.0.0.1:8793')&&document.querySelectorAll('.prompt-card').length===24");
  const FIRST_ID = await evaluate('CATALOG[0].id');
  await evaluate("state.assets=[];saveState();renderNav()");

  await test('Local service hosts the page and enables the same-origin relay', async () => {
    assert.equal(await evaluate('RELAY'), '/relay');
    assert.equal(await evaluate('CATALOG.length'), 550);
    await waitUntil("document.querySelector('.card-media img').naturalWidth>0");
    await click('#agentLauncher'); await click('#agentSettingsOpen');
    assert.match(await evaluate("document.querySelector('#agentConfigHint').textContent"), /本机服务托管/);
  });

  await test('Direct CORS call fails in the browser while the relay test connection succeeds', async () => {
    const direct = await evaluate(`fetch('http://127.0.0.1:${UPSTREAM_PORT}/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}).then(()=> 'ok').catch(e=>e.name)`);
    assert.equal(direct, 'TypeError');
    await fill('#llmBase', `http://127.0.0.1:${UPSTREAM_PORT}/v1`);
    await fill('#llmKey', 'sk-relay'); await fill('#llmModel', 'relay-chat');
    await click('#llmTest');
    await waitUntil("document.querySelector('#llmTestResult').textContent==='连接成功'");
    assert.equal(await evaluate("document.querySelector('#llmTestResult').className"), 'ok');
    assert.ok(received.some(r => r.url === '/v1/chat/completions' && r.auth === 'Bearer sk-relay'));
    await screenshot('desktop-settings-relay');
  });

  await test('Relay hint follows the interface language', async () => {
    await click('#agentDialog [data-close]'); await click('#agentClose');
    await click('#langToggle'); await click('#agentLauncher'); await click('#agentSettingsOpen');
    assert.match(await evaluate("document.querySelector('#agentConfigHint').textContent"), /hosted by the local service/);
    await click('#agentDialog [data-close]'); await click('#agentClose');
    await click('#langToggle'); await click('#agentLauncher'); await click('#agentSettingsOpen');
    assert.match(await evaluate("document.querySelector('#agentConfigHint').textContent"), /本机服务托管/);
  });

  await test('Streaming rewrite runs end to end through the relay', async () => {
    await fill('#llmBase', `http://127.0.0.1:${UPSTREAM_PORT}/v1`);
    await fill('#llmKey', 'sk-relay'); await fill('#llmModel', 'relay-chat');
    await fill('#imgBase', `http://127.0.0.1:${UPSTREAM_PORT}/v1`);
    await fill('#imgKey', 'sk-img'); await fill('#imgModel', 'relay-image');
    await select('#imgCount', '2');
    await click('#agentSave'); await waitUntil("!document.querySelector('#agentDialog').open");
    await click('#agentClose');
    await click(`.prompt-card[data-item-id="${FIRST_ID}"] .card-agent`);
    await click('#agentImprove');
    await waitUntil("!agent.busy&&agent.messages.some(m=>m.role==='assistant'&&m.done&&m.blocks.length===1)");
    assert.match(await evaluate("document.querySelector('#agentThread').textContent"), /rainy neon city/);
    assert.ok(received.some(r => r.url === '/v1/chat/completions' && r.auth === 'Bearer sk-relay' && r.ctype === 'application/json'));
    await screenshot('desktop-agent-relay');
  });

  await test('Key images generate through the relay and save as an asset group', async () => {
    await click('#agentImages');
    await waitUntil("!agent.busy&&agent.messages.some(m=>m.role==='images'&&m.items.length===2&&m.items.every(i=>i.state==='done'))");
    await waitUntil("[...document.querySelectorAll('.agent-image img')].length===2&&[...document.querySelectorAll('.agent-image img')].every(i=>i.complete&&i.naturalWidth>0)");
    assert.equal(received.filter(r => r.url === '/v1/images/generations').length, 2);
    await click('[data-agent-save-images]');
    await fill('#formInput', '中转实测 · 关键帧'); await click('#formSubmit');
    await waitUntil("state.assets.length===1&&state.assets[0].images.length===2");
    assert.ok(await evaluate("state.assets[0].images.every(im=>im.src.startsWith('data:image/jpeg'))"));
  });

  await test('Mobile settings dialog fits and shows the relay guidance', async () => {
    await dimensions(390, 844);
    await click('#agentSettingsOpen');
    assert.ok(await evaluate("document.querySelector('#agentDialog').scrollWidth<=document.querySelector('#agentDialog').clientWidth+1"));
    assert.match(await evaluate("document.querySelector('#agentConfigHint').textContent"), /本机服务托管/);
    await screenshot('mobile-settings-relay');
    await click('#agentDialog [data-close]');
  });

  assert.equal(browserErrors.length, 0, JSON.stringify(browserErrors));
  await fs.writeFile(path.join(ARTIFACTS, 'relay-results.json'), JSON.stringify({ passed: results.length, tests: results, consoleErrors: browserErrors, upstreamRequests: received.length }, null, 2));
  console.log('ALL PASSED', results.length);
}

function cleanup() {
  try { socket?.close(); } catch {}
  if (chrome?.pid) spawnSync('taskkill', ['/F', '/T', '/PID', String(chrome.pid)]);
  try { studio?.kill(); } catch {}
  try { upstream.close(); } catch {}
}
run().then(cleanup, error => { console.error(error); cleanup(); process.exitCode = 1; });