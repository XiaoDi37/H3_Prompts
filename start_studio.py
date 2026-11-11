"""FRAME studio launcher: hosts the page and relays model API calls on loopback.

Run:  python start_studio.py
The browser opens http://127.0.0.1:8787 automatically. Enter your gateway URL
and key directly in the page's agent settings; every API call is relayed
same-origin through this process, so no CORS configuration is needed.
Keys travel browser -> this process -> your gateway only. Ctrl+C stops it.
"""

import argparse
import json
import sys
import threading
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PAGE = "video-prompt-studio.html"
RELAY_FLAG = '<script>window.__STUDIO_RELAY__="/relay";</script>'
FORWARD_HEADERS = ("Authorization", "Content-Type", "Accept")
RELAY_HEADER = "X-Studio-Relay"


class StudioHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        path = urllib.parse.urlsplit(self.path).path
        if path == "/relay":
            self._relay("GET")
        elif path in ("/", "/index.html", "/" + PAGE):
            self._serve_page()
        else:
            super().do_GET()

    def do_POST(self):
        if urllib.parse.urlsplit(self.path).path == "/relay":
            self._relay("POST")
        else:
            self.send_error(405)

    def do_OPTIONS(self):
        # The page is same-origin with the relay, so no CORS headers are sent.
        # A preflight from any other website therefore stays blocked, and the
        # custom relay header below cannot be attached by cross-origin forms.
        self.send_response(204)
        self.send_header("Allow", "GET, POST, OPTIONS")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def _host_ok(self):
        host = (self.headers.get("Host") or "").rsplit(":", 1)[0].lower().strip("[]")
        return host in ("127.0.0.1", "localhost", "::1")

    def _serve_page(self):
        file = ROOT / PAGE
        if not file.is_file():
            self.send_error(404, "video-prompt-studio.html not found next to start_studio.py")
            return
        html = file.read_text(encoding="utf-8").replace("</head>", RELAY_FLAG + "</head>", 1)
        data = html.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def _relay(self, method):
        if not self._host_ok():
            self._relay_error(403, "仅允许本机地址访问中转服务。")
            return
        if self.headers.get(RELAY_HEADER) != "1":
            self._relay_error(403, "缺少中转标识头，请求被拒绝。")
            return
        query = urllib.parse.parse_qs(urllib.parse.urlsplit(self.path).query)
        target = (query.get("target") or [""])[0]
        parts = urllib.parse.urlsplit(target)
        if parts.scheme not in ("http", "https") or not parts.netloc:
            self._relay_error(400, "中转目标必须是 http(s) 地址。")
            return
        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length) if length else None
        headers = {name: self.headers[name] for name in FORWARD_HEADERS if self.headers[name]}
        request = urllib.request.Request(target, data=body, headers=headers, method=method)
        try:
            upstream = urllib.request.urlopen(request, timeout=300)
        except urllib.error.HTTPError as error:
            upstream = error
        except Exception as error:
            self._relay_error(502, f"无法连接上游接口（{error}）。请核对网关地址、端口与服务状态，或检查本机网络。")
            return
        with upstream:
            self.send_response(upstream.status)
            self.send_header("Content-Type", upstream.headers.get("Content-Type", "application/json"))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            try:
                while True:
                    # read1 keeps SSE deltas flowing instead of buffering blocks
                    chunk = upstream.read1(4096) if hasattr(upstream, "read1") else upstream.read(4096)
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError):
                pass

    def _relay_error(self, status, message):
        data = json.dumps({"error": {"message": message}}, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, fmt, *args):
        sys.stderr.write("[studio] %s\n" % (fmt % args))


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass
    parser = argparse.ArgumentParser(description="FRAME studio local service: page hosting + same-origin API relay.")
    parser.add_argument("--port", type=int, default=8787, help="Local listen port (default 8787)")
    parser.add_argument("--no-browser", action="store_true", help="Do not open a browser automatically")
    args = parser.parse_args()
    if not (ROOT / PAGE).is_file():
        raise SystemExit("Missing video-prompt-studio.html next to start_studio.py")
    try:
        server = ThreadingHTTPServer(("127.0.0.1", args.port), StudioHandler)
    except OSError as error:
        raise SystemExit(f"Port {args.port} is unavailable ({error}). Try another port, e.g. --port 8789.")
    server.daemon_threads = True
    url = f"http://127.0.0.1:{args.port}/"
    print("FRAME 本机服务已启动：" + url)
    print("在页面「智能体设置」中直接填写网关地址与密钥即可，请求会自动经本机中转，无跨域限制。")
    print("密钥只经过 浏览器 -> 本机服务 -> 你的网关。按 Ctrl+C 停止服务。")
    if not args.no_browser:
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()