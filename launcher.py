"""
OT Calculator — Portable Launcher
Developed by Mainul Islam
"""

import os
import sys
import threading
import webbrowser
import http.server
import socketserver
import time
import subprocess

PORT = 8765

if getattr(sys, "frozen", False):
    BASE_DIR = sys._MEIPASS
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class SilentHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def log_message(self, format, *args):
        pass


def start_server():
    with socketserver.TCPServer(("127.0.0.1", PORT), SilentHandler) as httpd:
        httpd.serve_forever()


def open_browser(url):
    """Force Chrome or Edge — avoid Internet Explorer."""
    browsers = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Mozilla Firefox\firefox.exe",
        r"C:\Program Files (x86)\Mozilla Firefox\firefox.exe",
    ]
    for path in browsers:
        if os.path.exists(path):
            subprocess.Popen([path, url])
            return
    # fallback to system default
    webbrowser.open(url)


def main():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    time.sleep(1.0)

    url = f"http://127.0.0.1:{PORT}/index.html"
    open_browser(url)

    stop_event = threading.Event()
    try:
        stop_event.wait()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
