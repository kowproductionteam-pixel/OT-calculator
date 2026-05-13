"""
OT Calculator — Portable Launcher
Developed by Mainul Islam

Run this to start the app in your browser.
Or build .exe:
  pyinstaller --onefile --noconsole --add-data "index.html;." --add-data "assets;assets" --add-data "src;src" --name "OT_Calculator" launcher.py
"""

import os
import sys
import threading
import webbrowser
import http.server
import socketserver
import time

PORT = 8765

# When packaged by PyInstaller, files are in sys._MEIPASS
if getattr(sys, "frozen", False):
    BASE_DIR = sys._MEIPASS
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class SilentHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def log_message(self, format, *args):
        pass  # suppress console output


def start_server():
    with socketserver.TCPServer(("127.0.0.1", PORT), SilentHandler) as httpd:
        httpd.serve_forever()


def main():
    # Start local server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Small delay to let server start
    time.sleep(0.8)

    # Open browser
    url = f"http://127.0.0.1:{PORT}/index.html"
    print(f"Opening OT Calculator at {url}")
    webbrowser.open(url)

    print("OT Calculator is running.")
    print("Close this window to exit.")
    try:
        input()
    except (EOFError, KeyboardInterrupt):
        pass


if __name__ == "__main__":
    main()
