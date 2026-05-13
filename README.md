# OT Calculator

**Attendance Overtime Calculator** — Excel attendance sheet থেকে overtime calculate করে Excel-ready report তৈরি করে।

Developed by **Mainul Islam**

---

## Features

- **Excel Paste** — Excel থেকে সরাসরি copy-paste করুন, data auto-parse হবে
- **AI Screenshot** — Attendance screenshot দিলে AI নিজেই সব data পড়বে
- **Manual Entry** — হাতে একজন একজন করে যোগ করুন
- **Smart OT Calculation** — 8 ঘন্টা duty বাদে বাকি সময় = OT
- **Minimum OT Filter** — Default 60 মিনিট, এর কম হলে count হবে না
- **Excel-Ready Report** — Name, ID, Team, Join, Leave, OT Hours সহ একক Click এ copy
- **CSV Download** — CSV ফাইল হিসেবে save করুন
- **Print Support** — সরাসরি print করুন
- **Morning / Evening Shift** আলাদা করে দেখুন
- **Modern Dark UI** — Responsive sidebar layout

---

## Project Structure

```
ot-calculator/
├── index.html          # Main app
├── assets/
│   └── style.css       # All styles
├── src/
│   └── app.js          # All logic
└── README.md
```

---

## How to Use (Web / GitHub Pages)

1. এই repository টি fork বা clone করুন
2. `index.html` browser এ open করুন
3. অথবা GitHub Pages enable করুন — Settings → Pages → Branch: main

---

## How to Build Portable .exe

Python + PyInstaller দিয়ে `.exe` বানাতে:

### Step 1 — Python install করুন
[https://python.org/downloads](https://python.org/downloads) থেকে Python 3.10+ download করুন।

### Step 2 — Dependencies install করুন
```bash
pip install pyinstaller
```

### Step 3 — Python wrapper তৈরি করুন
```python
# launcher.py
import os, sys, threading, webbrowser, http.server

PORT = 8765
BASE = os.path.dirname(os.path.abspath(sys.argv[0]))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE, **kwargs)
    def log_message(self, *a): pass

def start():
    with http.server.HTTPServer(("127.0.0.1", PORT), Handler) as httpd:
        httpd.serve_forever()

threading.Thread(target=start, daemon=True).start()
webbrowser.open(f"http://127.0.0.1:{PORT}/index.html")
input("Press Enter to exit...")
```

### Step 4 — .exe বানান
```bash
pyinstaller --onefile --noconsole --add-data "index.html;." --add-data "assets;assets" --add-data "src;src" --name "OT_Calculator" launcher.py
```

`.exe` ফাইল `dist/` folder এ পাওয়া যাবে।

---

## Report Columns (Excel Output)

| SL | Name | ID | Team | Join | Leave | OT Hours Per Person |
|----|------|----|------|------|-------|---------------------|
| 1  | MD. ATAUR RAHMAN | P0299 | Morning | 06:52 AM | 03:01 PM | 1 |

---

## Developer

**Mainul Islam**

---

## License

MIT License — Free to use and modify.
