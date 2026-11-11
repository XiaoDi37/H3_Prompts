"""Run with: python -B -m unittest test_studio_server -q"""

import http.client
import json
import threading
import time
import unittest
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import start_studio


class UpstreamHandler(BaseHTTPRequestHandler):
    seen = []

    def _handle(self):
        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length) if length else b""
        UpstreamHandler.seen.append({
            "method": self.command, "path": self.path,
            "headers": {k.lower(): v for k, v in self.headers.items()}, "body": body,
        })
        path = urllib.parse.urlsplit(self.path).path
        if path == "/error401":
            payload = json.dumps({"error": {"message": "bad key"}}).encode()
            self.send_response(401)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        elif path == "/sse":
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.end_headers()
            for i in range(3):
                self.wfile.write(f"data: {{\"choices\":[{{\"delta\":{{\"content\":\"chunk{i}\"}}}}]}}\n\n".encode())
                self.wfile.flush()
                time.sleep(0.15)
            self.wfile.write(b"data: [DONE]\n\n")
            self.wfile.flush()
        elif path == "/image.png":
            payload = b"\x89PNG\r\n\x1a\n fake image bytes"
            self.send_response(200)
            self.send_header("Content-Type", "image/png")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        else:
            payload = json.dumps({
                "echoPath": self.path, "echoBody": body.decode("utf-8", "replace"),
                "auth": self.headers.get("Authorization", ""),
                "contentType": self.headers.get("Content-Type", ""),
                "choices": [{"message": {"content": "ok"}}],
            }).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

    do_GET = _handle
    do_POST = _handle

    def log_message(self, fmt, *args):
        pass


class QuietStudioHandler(start_studio.StudioHandler):
    def log_message(self, fmt, *args):
        pass


class StudioServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.upstream = ThreadingHTTPServer(("127.0.0.1", 0), UpstreamHandler)
        cls.upstream.daemon_threads = True
        cls.upstream_port = cls.upstream.server_address[1]
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), QuietStudioHandler)
        cls.server.daemon_threads = True
        cls.port = cls.server.server_address[1]
        for srv in (cls.upstream, cls.server):
            threading.Thread(target=srv.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.upstream.shutdown()
        cls.upstream.server_close()

    def setUp(self):
        UpstreamHandler.seen.clear()

    def request(self, method, path, body=None, headers=None, host=None):
        conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=15)
        hdrs = dict(headers or {})
        if host:
            hdrs["Host"] = host
        conn.request(method, path, body=body, headers=hdrs)
        response = conn.getresponse()
        return conn, response

    def relay_url(self, target):
        return "/relay?target=" + urllib.parse.quote(target, safe="")

    def test_page_served_with_relay_flag(self):
        for path in ("/", "/index.html", "/video-prompt-studio.html"):
            with self.subTest(path=path):
                conn, response = self.request("GET", path)
                data = response.read()
                conn.close()
                self.assertEqual(response.status, 200)
                self.assertIn(b'window.__STUDIO_RELAY__="/relay"', data)
                self.assertIn(b"catalog-data", data)
                self.assertEqual(response.getheader("Cache-Control"), "no-store")

    def test_thumbnail_served(self):
        import build_studio
        thumb = build_studio.load_catalog()[0]["thumb"]
        conn, response = self.request("GET", "/" + thumb)
        data = response.read()
        conn.close()
        self.assertEqual(response.status, 200)
        self.assertGreater(len(data), 100)

    def test_relay_rejects_missing_header(self):
        conn, response = self.request("POST", self.relay_url(f"http://127.0.0.1:{self.upstream_port}/echo"), body=b"{}")
        data = response.read()
        conn.close()
        self.assertEqual(response.status, 403)
        self.assertFalse(UpstreamHandler.seen)

    def test_relay_rejects_foreign_host(self):
        conn, response = self.request(
            "POST", self.relay_url(f"http://127.0.0.1:{self.upstream_port}/echo"),
            body=b"{}", headers={"X-Studio-Relay": "1"}, host="evil.example.com")
        response.read()
        conn.close()
        self.assertEqual(response.status, 403)
        self.assertFalse(UpstreamHandler.seen)

    def test_relay_rejects_non_http_target(self):
        for target in ("file:///etc/passwd", "ftp://x/y", "", "not a url"):
            with self.subTest(target=target):
                conn, response = self.request("POST", self.relay_url(target), body=b"{}", headers={"X-Studio-Relay": "1"})
                data = json.loads(response.read())
                conn.close()
                self.assertEqual(response.status, 400)
                self.assertIn("http", data["error"]["message"])
        self.assertFalse(UpstreamHandler.seen)

    def test_relay_forwards_post_headers_and_body(self):
        target = f"http://127.0.0.1:{self.upstream_port}/v1/chat/completions"
        payload = json.dumps({"model": "test", "messages": [{"role": "user", "content": "你好"}]})
        conn, response = self.request(
            "POST", self.relay_url(target), body=payload.encode(),
            headers={"X-Studio-Relay": "1", "Authorization": "Bearer sk-local", "Content-Type": "application/json"})
        data = json.loads(response.read())
        conn.close()
        self.assertEqual(response.status, 200)
        self.assertEqual(data["auth"], "Bearer sk-local")
        self.assertEqual(data["contentType"], "application/json")
        self.assertEqual(json.loads(data["echoBody"]), json.loads(payload))
        self.assertEqual(data["echoPath"], "/v1/chat/completions")
        self.assertEqual(UpstreamHandler.seen[0]["method"], "POST")

    def test_relay_passes_upstream_error_status(self):
        target = f"http://127.0.0.1:{self.upstream_port}/error401"
        conn, response = self.request("POST", self.relay_url(target), body=b"{}", headers={"X-Studio-Relay": "1", "Content-Type": "application/json"})
        data = json.loads(response.read())
        conn.close()
        self.assertEqual(response.status, 401)
        self.assertEqual(data["error"]["message"], "bad key")

    def test_relay_unreachable_upstream_returns_502_json(self):
        target = "http://127.0.0.1:1/v1/chat/completions"
        conn, response = self.request("POST", self.relay_url(target), body=b"{}", headers={"X-Studio-Relay": "1", "Content-Type": "application/json"})
        data = json.loads(response.read())
        conn.close()
        self.assertEqual(response.status, 502)
        self.assertIn("无法连接上游接口", data["error"]["message"])

    def test_relay_streams_sse_incrementally(self):
        target = f"http://127.0.0.1:{self.upstream_port}/sse"
        conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=15)
        conn.request("POST", self.relay_url(target), body=b"{}", headers={"X-Studio-Relay": "1", "Content-Type": "application/json"})
        response = conn.getresponse()
        self.assertEqual(response.status, 200)
        self.assertIn("text/event-stream", response.getheader("Content-Type"))
        start = time.monotonic()
        first = response.read1(4096)
        ttfb = time.monotonic() - start
        rest = response.read()
        total = time.monotonic() - start
        conn.close()
        self.assertIn(b"chunk0", first)
        self.assertIn(b"chunk2", rest)
        self.assertIn(b"[DONE]", rest)
        self.assertLess(ttfb, total - 0.2, f"not streaming: ttfb={ttfb:.3f} total={total:.3f}")

    def test_relay_forwards_get_for_images(self):
        target = f"http://127.0.0.1:{self.upstream_port}/image.png"
        conn, response = self.request("GET", self.relay_url(target), headers={"X-Studio-Relay": "1"})
        data = response.read()
        conn.close()
        self.assertEqual(response.status, 200)
        self.assertEqual(response.getheader("Content-Type"), "image/png")
        self.assertTrue(data.startswith(b"\x89PNG"))
        self.assertEqual(UpstreamHandler.seen[0]["method"], "GET")

    def test_options_preflight_has_no_cors_allow(self):
        conn, response = self.request("OPTIONS", "/relay", headers={"Origin": "https://evil.example.com", "Access-Control-Request-Method": "POST"})
        response.read()
        conn.close()
        self.assertEqual(response.status, 204)
        self.assertIsNone(response.getheader("Access-Control-Allow-Origin"))


if __name__ == "__main__":
    unittest.main()