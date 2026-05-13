/* ─────────────────────────────────────────
   OT Calculator  ·  by Mainul Islam
   app.js
───────────────────────────────────────── */

"use strict";

/* ── state ── */
let employees  = [];
let curFilter  = "All";

/* ── init ── */
document.addEventListener("DOMContentLoaded", () => {
  const d = new Date();
  document.getElementById("reportDate").value = d.toISOString().split("T")[0];
  document.getElementById("todayChip").textContent =
    d.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
  syncDuty();
  syncMinOT();
  renderAll();
});

/* ─────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────── */
const TITLES = {
  dashboard: "Dashboard",
  import:    "Data Import",
  report:    "OT Report",
  settings:  "Settings",
};

function goSection(name) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.getElementById("section-" + name).classList.add("active");
  document.querySelector(`.nav-item[data-section="${name}"]`).classList.add("active");
  document.getElementById("topbarTitle").textContent = TITLES[name] || name;
  closeSidebar();
  window.scrollTo({ top: 0 });
}

document.querySelectorAll(".nav-item").forEach(el => {
  el.addEventListener("click", e => {
    e.preventDefault();
    goSection(el.dataset.section);
  });
});

function toggleSidebar() {
  document.querySelector(".sidebar").classList.toggle("open");
  document.getElementById("overlay").classList.toggle("open");
}
function closeSidebar() {
  document.querySelector(".sidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("open");
}

/* ─────────────────────────────────────────
   IMPORT TABS
───────────────────────────────────────── */
function switchImport(name, btn) {
  document.querySelectorAll(".ipanel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".itab").forEach(b => b.classList.remove("active"));
  document.getElementById("ipanel-" + name).classList.add("active");
  btn.classList.add("active");
}

/* ─────────────────────────────────────────
   TIME HELPERS
───────────────────────────────────────── */
function timeToMinutes(t) {
  if (!t || !t.trim()) return null;
  t = t.trim();
  const ampm  = t.match(/(AM|PM)/i);
  const clean = t.replace(/(AM|PM)/i, "").trim();
  const parts = clean.split(":");
  let h = parseInt(parts[0]), m = parseInt(parts[1] || 0);
  if (isNaN(h)) return null;
  if (ampm) {
    const ap = ampm[0].toUpperCase();
    if (ap === "PM" && h !== 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
  }
  return h * 60 + m;
}

function minsToDecimal(mins) {
  if (!mins || mins <= 0) return "0";
  const h = Math.floor(mins / 60), m = mins % 60;
  if (m === 0) return String(h);
  return (h + Math.round((m / 60) * 10) / 10).toFixed(1);
}

function minsToLabel(mins) {
  if (!mins || mins <= 0) return "—";
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

function calcOT(inTime, outTime) {
  const dutyMins = parseFloat(document.getElementById("dutyHours").value) * 60 || 480;
  const minOT    = parseInt(document.getElementById("minOT").value) || 60;
  const inM  = timeToMinutes(inTime);
  const outM = timeToMinutes(outTime);
  if (inM === null || outM === null) return 0;
  let worked = outM - inM;
  if (worked < 0) worked += 24 * 60;
  const ot = worked - dutyMins;
  return ot >= minOT ? Math.max(0, ot) : 0;
}

/* ─────────────────────────────────────────
   SETTINGS SYNC
───────────────────────────────────────── */
function syncDuty() {
  const v = document.getElementById("dutyRange").value;
  document.getElementById("dutyHours").value = v;
  document.getElementById("dutyVal").textContent = v + "h";
}
function syncDutyFromInput() {
  const v = document.getElementById("dutyHours").value;
  document.getElementById("dutyRange").value = v;
  document.getElementById("dutyVal").textContent = v + "h";
}
function syncMinOT() {
  const v = document.getElementById("minOTRange").value;
  document.getElementById("minOT").value = v;
  const h = Math.floor(v / 60), m = v % 60;
  document.getElementById("minOTVal").textContent = h > 0 ? (m ? `${h}h${m}m` : `${h}h`) : `${m}m`;
}
function syncMinOTFromInput() {
  const v = document.getElementById("minOT").value;
  document.getElementById("minOTRange").value = v;
  const h = Math.floor(v / 60), m = v % 60;
  document.getElementById("minOTVal").textContent = h > 0 ? (m ? `${h}h${m}m` : `${h}h`) : `${m}m`;
}

function recalcAll() {
  employees = employees.map(e => ({
    ...e,
    otMins: (e.status === "Present" && e.inTime && e.outTime)
      ? calcOT(e.inTime, e.outTime) : 0,
  }));
  renderAll();
  showStatus("✓ Recalculated!", "green");
}

/* ─────────────────────────────────────────
   PASTE IMPORT
───────────────────────────────────────── */
function processPaste() {
  const raw = document.getElementById("pasteBox").value.trim();
  if (!raw) { showStatus("⚠ কিছু paste করুন আগে।", "red"); return; }

  const lines = raw.split("\n").filter(l => l.trim());
  let added = 0, currentShift = "Morning";

  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    if (lower === "morning") { currentShift = "Morning"; continue; }
    if (lower === "evening") { currentShift = "Evening"; continue; }

    let cols = line.split("\t").map(c => c.trim());
    if (cols.length < 2) {
      cols = line.split(/\s{2,}/).map(c => c.trim()).filter(Boolean);
      if (cols.length < 2) continue;
    }

    const name = cols[0];
    if (!name || name.length < 2) continue;
    if (/^(name|employee|sl|#|no\.)/i.test(name)) continue;

    const id          = cols[1] || "—";
    const designation = cols[2] || "—";
    let status = "Day Off", inTime = "", outTime = "";

    for (let i = 3; i < cols.length; i++) {
      const c = cols[i];
      if (/present/i.test(c))    status = "Present";
      else if (/day.?off/i.test(c)) status = "Day Off";
      else if (/\d{1,2}:\d{2}.*[AP]M/i.test(c)) {
        const cl = c.replace(/(\d{1,2}:\d{2}):\d{2}(\s*[AP]M)/i, "$1$2");
        if (!inTime) inTime = cl; else if (!outTime) outTime = cl;
      }
    }

    const otMins = (status === "Present" && inTime && outTime)
      ? calcOT(inTime, outTime) : 0;
    employees.push({ name, id, designation, shift: currentShift, status, inTime, outTime, otMins });
    added++;
  }

  document.getElementById("pasteBox").value = "";
  showStatus(added > 0 ? `✓ ${added} জন import হয়েছে` : "⚠ valid data পাওয়া যায়নি।",
    added > 0 ? "green" : "red");
  renderAll();
}

/* ─────────────────────────────────────────
   SCREENSHOT / AI IMPORT
───────────────────────────────────────── */
async function handleFileUpload(event) {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  const prog = document.getElementById("aiProgress");
  prog.style.display = "flex";

  for (const file of files) {
    const b64 = await new Promise(res => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(",")[1]);
      r.readAsDataURL(file);
    });

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: file.type || "image/png", data: b64 } },
              { type: "text", text: `Extract all employee attendance rows from this Excel screenshot.
Return ONLY a JSON array. Each object must have:
- name (string)
- id (string)
- designation (string)
- shift: "Morning" or "Evening" (detect from section header)
- status: "Present" or "Day Off"
- inTime (string e.g. "06:52 AM", or "" if absent)
- outTime (string e.g. "03:01 PM", or "" if absent)
No markdown, no explanation. Only the JSON array.` }
            ],
          }],
        }),
      });

      const data  = await resp.json();
      const text  = data.content.map(i => i.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const rows  = JSON.parse(clean);

      let added = 0;
      for (const row of rows) {
        const otMins = (row.status === "Present" && row.inTime && row.outTime)
          ? calcOT(row.inTime, row.outTime) : 0;
        employees.push({ ...row, otMins });
        added++;
      }

      showStatus(`✓ ${added} জন import হয়েছে (AI)`, "green");
      renderAll();

    } catch (err) {
      console.error(err);
      showStatus("⚠ AI পড়তে ব্যর্থ। Paste বা Manual ব্যবহার করুন।", "red");
    }
  }

  prog.style.display = "none";
  event.target.value = "";
}

/* ─────────────────────────────────────────
   MANUAL ENTRY
───────────────────────────────────────── */
function addManualRow() {
  const name = document.getElementById("mName").value.trim();
  if (!name) { showStatus("⚠ নাম দিন", "red"); return; }

  const id    = document.getElementById("mId").value.trim()  || "—";
  const des   = document.getElementById("mDes").value.trim() || "—";
  const shift = document.getElementById("mShift").value;
  const inRaw = document.getElementById("mIn").value;
  const ouRaw = document.getElementById("mOut").value;

  const fmt = raw => {
    if (!raw) return "";
    const [h, m] = raw.split(":");
    const ap = parseInt(h) >= 12 ? "PM" : "AM";
    const hr = parseInt(h) % 12 || 12;
    return `${hr}:${m} ${ap}`;
  };

  const inTime  = fmt(inRaw);
  const outTime = fmt(ouRaw);
  const status  = (inTime && outTime) ? "Present" : "Day Off";
  const otMins  = status === "Present" ? calcOT(inTime, outTime) : 0;

  employees.push({ name, id, designation: des, shift, status, inTime, outTime, otMins });
  ["mName","mId","mDes","mIn","mOut"].forEach(id => document.getElementById(id).value = "");
  showStatus("✓ যোগ হয়েছে", "green");
  renderAll();
}

/* ─────────────────────────────────────────
   DELETE
───────────────────────────────────────── */
function deleteRow(idx) {
  employees.splice(idx, 1);
  renderAll();
}

/* ─────────────────────────────────────────
   FILTER
───────────────────────────────────────── */
function filterShift(val, btn) {
  curFilter = val;
  document.querySelectorAll(".rf-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderReport();
}

/* ─────────────────────────────────────────
   RENDER ALL
───────────────────────────────────────── */
function renderAll() {
  renderStats();
  renderPreview();
  renderReport();
}

/* stats */
function renderStats() {
  const minOT   = parseInt(document.getElementById("minOT").value) || 60;
  const present = employees.filter(e => e.status === "Present");
  const withOT  = employees.filter(e => e.otMins >= minOT);
  const totalOT = withOT.reduce((s, e) => s + e.otMins, 0);

  document.getElementById("s-total").textContent   = employees.length;
  document.getElementById("s-present").textContent = present.length;
  document.getElementById("s-ot").textContent      = withOT.length;

  const h = Math.floor(totalOT / 60), m = totalOT % 60;
  document.getElementById("s-total-ot").textContent = `${h}h ${m}m`;

  const nudge = document.getElementById("importNudge");
  if (employees.length > 0) {
    nudge.style.display = "flex";
    document.getElementById("nudgeCount").textContent = employees.length;
  } else {
    nudge.style.display = "none";
  }
}

/* preview table (import page) */
function renderPreview() {
  const wrap = document.getElementById("importPreview");
  const body = document.getElementById("previewBody");

  if (employees.length === 0) { wrap.style.display = "none"; return; }
  wrap.style.display = "block";
  document.getElementById("previewCount").textContent =
    `${employees.length} জন import হয়েছে`;

  body.innerHTML = employees.map((e, i) => {
    const minOT = parseInt(document.getElementById("minOT").value) || 60;
    const otBadge = e.otMins >= minOT
      ? `<span class="badge badge-ot">${minsToLabel(e.otMins)}</span>`
      : `<span style="color:var(--text3)">—</span>`;
    const stBadge = e.status === "Present"
      ? `<span class="badge badge-present">Present</span>`
      : `<span class="badge badge-dayoff">Day Off</span>`;
    const shBadge = e.shift === "Morning"
      ? `<span class="badge badge-morning">Morning</span>`
      : `<span class="badge badge-evening">Evening</span>`;
    return `<tr>
      <td class="sl-num">${i + 1}</td>
      <td class="name-cell">${e.name}</td>
      <td class="id-cell">${e.id}</td>
      <td>${shBadge}</td>
      <td>${stBadge}</td>
      <td class="time-cell">${e.inTime  || "—"}</td>
      <td class="time-cell">${e.outTime || "—"}</td>
      <td>${otBadge}</td>
      <td>
        <button class="btn-del-row" onclick="deleteRow(${i})" title="সরিয়ে দিন">
          <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </td>
    </tr>`;
  }).join("");
}

/* ── REPORT TABLE ── */
function renderReport() {
  const minOT    = parseInt(document.getElementById("minOT").value) || 60;
  const empty    = document.getElementById("reportEmpty");
  const tableWrap= document.getElementById("reportTableWrap");
  const body     = document.getElementById("reportBody");
  const foot     = document.getElementById("reportFoot");

  let pool = employees.filter(e => e.otMins >= minOT);
  if (curFilter !== "All") pool = pool.filter(e => e.shift === curFilter);
  const sorted = [...pool].sort((a, b) => b.otMins - a.otMins);

  if (sorted.length === 0) {
    empty.style.display     = "block";
    tableWrap.style.display = "none";
    return;
  }
  empty.style.display     = "none";
  tableWrap.style.display = "block";

  const maxOT = sorted[0].otMins;

  body.innerHTML = sorted.map((e, i) => {
    const pct  = maxOT > 0 ? Math.round((e.otMins / maxOT) * 100) : 0;
    const dec  = minsToDecimal(e.otMins);
    return `<tr>
      <td class="sl-num">${i + 1}</td>
      <td class="name-cell">${e.name}</td>
      <td class="id-cell">${e.id}</td>
      <td>
        ${e.shift === "Morning"
          ? `<span class="badge badge-morning">Morning</span>`
          : `<span class="badge badge-evening">Evening</span>`}
      </td>
      <td class="time-cell">${e.inTime  || "—"}</td>
      <td class="time-cell">${e.outTime || "—"}</td>
      <td>
        <div class="ot-bar-wrap">
          <div class="ot-bar"><div class="ot-bar-fill" style="width:${pct}%"></div></div>
          <span class="ot-cell">${dec}</span>
        </div>
      </td>
    </tr>`;
  }).join("");

  /* footer totals */
  const totalOT = sorted.reduce((s, e) => s + e.otMins, 0);
  const totalDec = minsToDecimal(totalOT);
  foot.innerHTML = `<tr>
    <td colspan="6" style="text-align:right;color:var(--text2);font-size:12px;">
      ${sorted.length} জন কর্মী · মোট OT:
    </td>
    <td class="ot-cell">${totalDec}h</td>
  </tr>`;
}

/* ─────────────────────────────────────────
   COPY FOR EXCEL
───────────────────────────────────────── */
function copyTableForExcel() {
  const minOT = parseInt(document.getElementById("minOT").value) || 60;
  let pool = employees.filter(e => e.otMins >= minOT);
  if (curFilter !== "All") pool = pool.filter(e => e.shift === curFilter);
  const sorted = [...pool].sort((a, b) => b.otMins - a.otMins);

  const header = ["SL","Name","ID","Team","Join","Leave","OT Hours Per Person"].join("\t");
  const rows   = sorted.map((e, i) => [
    i + 1,
    e.name,
    e.id,
    e.shift,
    e.inTime  || "",
    e.outTime || "",
    minsToDecimal(e.otMins),
  ].join("\t"));

  const tsv = [header, ...rows].join("\n");

  const doFeedback = () => {
    const fb = document.getElementById("copyFeedback");
    fb.style.display = "flex";
    setTimeout(() => { fb.style.display = "none"; }, 3500);
  };

  navigator.clipboard.writeText(tsv)
    .then(doFeedback)
    .catch(() => {
      const ta = Object.assign(document.createElement("textarea"),
        { value: tsv, style: "position:absolute;left:-9999px" });
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      doFeedback();
    });
}

/* ─────────────────────────────────────────
   CSV DOWNLOAD
───────────────────────────────────────── */
function exportCSV() {
  const minOT = parseInt(document.getElementById("minOT").value) || 60;
  const date  = document.getElementById("reportDate").value;
  let pool    = employees.filter(e => e.otMins >= minOT);
  if (curFilter !== "All") pool = pool.filter(e => e.shift === curFilter);
  const sorted = [...pool].sort((a, b) => b.otMins - a.otMins);

  const lines = [
    "SL,Name,ID,Team,Join,Leave,OT Hours Per Person",
    ...sorted.map((e, i) =>
      `${i+1},"${e.name}","${e.id}","${e.shift}","${e.inTime}","${e.outTime}","${minsToDecimal(e.otMins)}"`
    ),
  ];

  const a = document.createElement("a");
  a.href     = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" }));
  a.download = `OT_Report_${date}.csv`;
  a.click();
}

/* ─────────────────────────────────────────
   PRINT
───────────────────────────────────────── */
function printReport() {
  window.print();
}

/* ─────────────────────────────────────────
   CLEAR ALL
───────────────────────────────────────── */
function clearAll() {
  if (!confirm("সব data মুছে ফেলবেন?")) return;
  employees = [];
  renderAll();
  showStatus("✓ সব data মুছে গেছে", "green");
}

/* ─────────────────────────────────────────
   STATUS MESSAGE
───────────────────────────────────────── */
function showStatus(msg, type = "green") {
  const el = document.getElementById("statusMsg");
  el.textContent = msg;
  el.style.color = type === "green" ? "var(--green)" : "var(--red)";
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.textContent = ""; }, 4000);
}
