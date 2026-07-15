// ============================================================
// howOldIsMaharshi — Vercel Serverless Function
// Returns Maharshi's exact age, down to the millisecond.
// Special effects if called on his birthday (Nov 2).
// Supports one-time birthday test mode.
//
// Content negotiation:
//   - Browsers (Accept: text/html...) get the interactive UI.
//   - Code (curl/fetch/axios/anything sending Accept: application/json
//     or */*, or nothing) gets the raw JSON — unchanged from before.
//   - ?ui=true forces the HTML page regardless of Accept header.
//   - ?json=true forces the JSON payload regardless of Accept header.
// ============================================================

const PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>how-old-is-maharshi · live age endpoint</title>
<meta name="description" content="A GET request to apis.with.maharshis.tech/how-old-is-maharshi, rendered as a page. Maharshi Patel's exact age, live.">
<meta name="theme-color" content="#0B0D10">
<link rel="icon" href="https://maharshis.tech/assets/favicon.svg" type="image/svg+xml">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

<style>
  :root{
    --indigo:#1E2F6E; --blue:#2E6FBE; --amber:#E8912F; --rust:#C4501B;
    --paper:#F1F3F6; --surface:#E7EAF0; --ink:#16181D; --ink-soft:#4A4E5A; --hairline:rgba(22,24,29,0.12);
    --spectrum:linear-gradient(100deg,var(--indigo) 0%,var(--blue) 38%,var(--amber) 72%,var(--rust) 100%);
    --ease-graceful:cubic-bezier(0.22,1,0.36,1);
    --term-bg:#0B0D10; --term-bar:#111319; --term-line:rgba(255,255,255,0.08);
    --term-text:#C7CAD3; --term-dim:#6D7180; --term-blue:#7FB2FF; --term-green:#3ED97E; --term-amber:#E8912F; --term-pink:#FF9BD2;
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  html{overflow-x:hidden;}
  body{
    background:var(--paper);
    background-image:radial-gradient(1200px 600px at 15% -10%, rgba(46,111,190,0.08), transparent),
                      radial-gradient(1000px 600px at 110% 10%, rgba(196,80,27,0.07), transparent);
    color:var(--ink);font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;
    min-height:100vh;min-height:100svh;overflow-x:hidden;
  }

  /* ---------- shell ---------- */
  .wrap{max-width:760px;margin:0 auto;padding:7vh 6vw 10vh;}
  .top-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:7vh;gap:16px;}
  .name-mark{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:16px;letter-spacing:-0.01em;text-decoration:none;color:var(--ink);}
  .status-pill{font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--ink-soft);border:1px solid var(--hairline);border-radius:999px;padding:6px 13px;display:flex;align-items:center;gap:7px;white-space:nowrap;}
  .status-dot{width:6px;height:6px;border-radius:50%;background:var(--term-green);box-shadow:0 0 0 3px rgba(62,217,126,0.18);flex-shrink:0;}
  .status-dot.is-down{background:var(--rust);box-shadow:0 0 0 3px rgba(196,80,27,0.18);}
  .status-dot.is-pending{background:var(--amber);box-shadow:0 0 0 3px rgba(232,145,47,0.18);animation:pulse 1.4s ease-in-out infinite;}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.35;}}

  /* ---------- hero readout ---------- */
  .eyebrow{font-family:'JetBrains Mono',monospace;font-size:12.5px;letter-spacing:0.06em;color:var(--ink-soft);text-transform:uppercase;margin-bottom:20px;}
  .eyebrow b{color:var(--amber);font-weight:500;}

  @property --drift{syntax:'<percentage>';inherits:true;initial-value:0%;}
  .age-number{--drift:0%;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(40px,11vw,92px);line-height:0.95;
    display:inline-flex;align-items:baseline;flex-wrap:wrap;column-gap:0.02em;
    background-image:var(--spectrum);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;
    animation:driftGradient 7s ease-in-out infinite;}
  @keyframes driftGradient{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
  .age-unit{font-family:'JetBrains Mono',monospace;font-size:15px;color:var(--ink-soft);margin-top:10px;}
  .age-human{font-family:'Fraunces',serif;font-weight:500;font-style:italic;font-size:clamp(20px,2.6vw,26px);line-height:1.5;margin-top:26px;color:var(--ink);max-width:560px;}
  .age-human .hl{color:var(--blue);font-style:normal;font-weight:600;font-family:'Inter',sans-serif;}
  .sync-line{font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--ink-soft);opacity:0.65;margin-top:16px;}

  /* ---------- proof strip ---------- */
  .proof-strip{margin-top:6vh;width:100%;display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--hairline);border-bottom:1px solid var(--hairline);}
  .proof-item{padding:16px 10px;text-align:center;border-left:1px solid var(--hairline);}
  .proof-item:first-child{border-left:none;}
  .proof-label{font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--ink-soft);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;}
  .proof-value{font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:16px;word-break:break-word;}

  /* ---------- terminal panel ---------- */
  .term-section{margin-top:9vh;}
  .term-label-row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px;gap:12px;flex-wrap:wrap;}
  .term-label{font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:var(--ink-soft);}
  .refresh-btn{font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--ink-soft);background:none;border:1px solid var(--hairline);
    border-radius:999px;padding:6px 14px;cursor:pointer;transition:color .25s,border-color .25s,transform .2s;}
  .refresh-btn:hover:not(:disabled){color:var(--blue);border-color:var(--blue);}
  .refresh-btn:active:not(:disabled){transform:scale(0.96);}
  .refresh-btn:disabled{opacity:0.5;cursor:default;}

  .api-term{width:100%;background:var(--term-bg);border-radius:14px;overflow:hidden;
    box-shadow:0 40px 100px rgba(16,20,30,0.16);border:1px solid rgba(255,255,255,0.08);}
  .api-term-bar{display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--term-bar);border-bottom:1px solid var(--term-line);}
  .api-term-traffic{display:flex;gap:7px;flex-shrink:0;}
  .api-term-traffic i{width:11px;height:11px;border-radius:50%;background:rgba(255,255,255,0.14);display:block;}
  .api-term-url{flex:1;font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--term-dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .api-term-url b{color:var(--term-amber);font-weight:500;}
  .api-term-status{font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--term-green);flex-shrink:0;}
  .api-term-status.is-err{color:var(--rust);}
  .api-term-body{padding:22px 20px;}
  .api-stats{display:flex;gap:14px;margin-bottom:18px;flex-wrap:wrap;}
  .api-stat{flex:1;min-width:150px;border:1px solid var(--term-line);border-radius:10px;padding:14px 16px;background:rgba(255,255,255,0.02);}
  .api-stat-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.06em;color:var(--term-dim);text-transform:uppercase;margin-bottom:6px;}
  .api-stat-value{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:21px;background:var(--spectrum);background-size:200% 100%;
    -webkit-background-clip:text;background-clip:text;color:transparent;animation:driftGradient 4s ease-in-out infinite;word-break:break-all;}
  .api-json{font-family:'JetBrains Mono',monospace;font-size:12.5px;line-height:1.68;color:var(--term-text);background:rgba(255,255,255,0.02);
    border:1px solid var(--term-line);border-radius:10px;padding:16px 17px;overflow-x:auto;white-space:pre;margin-bottom:0;}
  .api-json .jk{color:var(--term-blue);}
  .api-json .js{color:var(--term-green);}
  .api-json .jn{color:var(--term-amber);}
  .api-json .jb{color:var(--term-pink);}
  .api-json .jz{color:var(--term-dim);}
  .api-term-footer{padding:12px 20px;background:var(--term-bar);border-top:1px solid var(--term-line);
    font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--term-dim);display:flex;justify-content:space-between;
    align-items:center;gap:12px;flex-wrap:wrap;}
  .api-term-footer a{color:var(--term-blue);text-decoration:none;}
  .api-term-footer a:hover{text-decoration:underline;}

  /* ---------- birthday state ---------- */
  .cake-banner{display:none;margin-bottom:18px;padding:14px 16px;border-radius:10px;border:1px solid rgba(232,145,47,0.35);
    background:linear-gradient(100deg,rgba(30,47,110,0.12),rgba(232,145,47,0.14),rgba(196,80,27,0.12));
    font-family:'JetBrains Mono',monospace;font-size:12.5px;color:var(--ink);line-height:1.6;}
  .cake-banner.is-visible{display:block;}

  /* ---------- footer ---------- */
  .foot{margin-top:8vh;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;
    font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--ink-soft);opacity:0.75;}
  .foot a{color:var(--ink-soft);}

  @media (max-width:560px){
    .wrap{padding:6vh 6vw 8vh;}
    .proof-strip{grid-template-columns:1fr;}
    .proof-item{border-left:none;border-top:1px solid var(--hairline);}
    .proof-item:first-child{border-top:none;}
    .api-stats{flex-direction:column;}
  }
  @media (prefers-reduced-motion: reduce){
    .age-number{animation:none;}
    .api-stat-value{animation:none;}
    .status-dot.is-pending{animation:none;}
  }
</style>
</head>
<body>

<div class="wrap">

  <div class="top-row">
    <a class="name-mark" href="https://maharshis.tech" target="_blank" rel="noopener">Maharshi Patel</a>
    <div class="status-pill"><span class="status-dot is-pending" id="statusDot"></span><span id="statusText">connecting…</span></div>
  </div>

  <div class="eyebrow">GET <b>apis.with.maharshis.tech/how-old-is-maharshi</b></div>

  <div class="age-number" id="ageNumber">—</div>
  <div class="age-unit">years old, updating in real time</div>

  <p class="age-human" id="ageHuman">Loading the exact figure — this is a live endpoint, not a hardcoded number.</p>

  <div class="sync-line" id="syncLine">syncing…</div>

  <div class="proof-strip">
    <div class="proof-item"><div class="proof-label">Days alive</div><div class="proof-value" id="proofDays">—</div></div>
    <div class="proof-item"><div class="proof-label">Next birthday</div><div class="proof-value" id="proofNext">—</div></div>
    <div class="proof-item"><div class="proof-label">Currently building</div><div class="proof-value" id="proofBuilding">—</div></div>
  </div>

  <div class="term-section">
    <div class="term-label-row">
      <span class="term-label">Raw response</span>
      <div style="display:flex;gap:8px;">
        <a href="?json=true" class="refresh-btn" style="text-decoration:none;display:inline-block;">fancy json? click here.</a>
        <button type="button" class="refresh-btn" id="refreshBtn">Refetch</button>
      </div>
    </div>

    <div class="api-term">
      <div class="api-term-bar">
        <div class="api-term-traffic"><i></i><i></i><i></i></div>
        <div class="api-term-url"><b>GET</b> /how-old-is-maharshi</div>
        <div class="api-term-status" id="termStatus">—</div>
      </div>
      <div class="api-term-body">
        <div class="cake-banner" id="cakeBanner"></div>
        <div class="api-stats">
          <div class="api-stat"><div class="api-stat-label">Age (decimal years)</div><div class="api-stat-value" id="statAge">—</div></div>
          <div class="api-stat"><div class="api-stat-label">Total seconds alive</div><div class="api-stat-value" id="statSeconds">—</div></div>
        </div>
        <div class="api-json" id="jsonOut">// fetching /how-old-is-maharshi?json=true …</div>
      </div>
      <div class="api-term-footer">
        <span id="footerNote">auto-refreshes every 30s</span>
        <a href="https://apis.with.maharshis.tech/how-old-is-maharshi" target="_blank" rel="noopener">open raw endpoint &#8599;</a>
      </div>
    </div>
  </div>

  <div class="foot">
    <span>Built by <a href="https://maharshis.tech" target="_blank" rel="noopener">Maharshi Patel</a> · Bharuch, India</span>
    <a href="https://github.com/maharshi878/how-old-is-maharshi" target="_blank" rel="noopener">source &#8599;</a>
  </div>

</div>

<script>
(function(){
  const ENDPOINT = '/how-old-is-maharshi?json=true';
  const REFRESH_MS = 30000;
  const FALLBACK_BIRTH = new Date('2010-11-02T09:15:00+05:30').getTime();

  const ageNumberEl = document.getElementById('ageNumber');
  const ageHumanEl = document.getElementById('ageHuman');
  const syncLineEl = document.getElementById('syncLine');
  const proofDaysEl = document.getElementById('proofDays');
  const proofNextEl = document.getElementById('proofNext');
  const proofBuildingEl = document.getElementById('proofBuilding');
  const jsonOutEl = document.getElementById('jsonOut');
  const statAgeEl = document.getElementById('statAge');
  const statSecondsEl = document.getElementById('statSeconds');
  const termStatusEl = document.getElementById('termStatus');
  const statusDotEl = document.getElementById('statusDot');
  const statusTextEl = document.getElementById('statusText');
  const cakeBannerEl = document.getElementById('cakeBanner');
  const refreshBtn = document.getElementById('refreshBtn');
  const footerNoteEl = document.getElementById('footerNote');

  let serverAnchorSeconds = null;
  let anchorPerfTime = null;
  let usingFallback = false;
  let rafId = null;

  function escapeHtml(str){
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
  function highlightJson(obj){
    const raw = escapeHtml(JSON.stringify(obj, null, 2));
    return raw.replace(/("(\\\\.|[^"\\\\])*"(\\s*:)?|\\btrue\\b|\\bfalse\\b|\\bnull\\b|-?\\d+(\\.\\d+)?([eE][+-]?\\d+)?)/g, (m) => {
      let cls = 'jn';
      if (/^"/.test(m)) cls = /:$/.test(m) ? 'jk' : 'js';
      else if (m === 'true' || m === 'false') cls = 'jb';
      else if (m === 'null') cls = 'jz';
      return \`<span class="\${cls}">\${m}</span>\`;
    });
  }

  function fmtYears(totalSeconds){
    return (totalSeconds / (365.2425 * 24 * 3600)).toFixed(8);
  }

  function renderAgeNumber(){
    if (serverAnchorSeconds === null) return;
    const elapsed = (performance.now() - anchorPerfTime) / 1000;
    const totalSeconds = serverAnchorSeconds + elapsed;
    ageNumberEl.textContent = fmtYears(totalSeconds);
    statSecondsEl.textContent = Math.floor(totalSeconds).toLocaleString('en-US');
    statAgeEl.textContent = fmtYears(totalSeconds) + ' yrs';
    rafId = requestAnimationFrame(renderAgeNumber);
  }

  function buildLocalPayload(){
    const now = new Date();
    const msAlive = now.getTime() - FALLBACK_BIRTH;
    const totalSeconds = Math.floor(msAlive / 1000);
    const totalDays = Math.floor(msAlive / (1000 * 60 * 60 * 24));
    const totalHours = Math.floor(msAlive / (1000 * 60 * 60));
    const totalMinutes = Math.floor(msAlive / (1000 * 60));

    let years = now.getFullYear() - 2010;
    let months = now.getMonth() - 10;
    let days = now.getDate() - 2;
    if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }

    let nextBday = new Date(now.getFullYear(), 10, 2);
    if (nextBday <= now) nextBday = new Date(now.getFullYear() + 1, 10, 2);
    const daysUntilBday = Math.ceil((nextBday - now) / (1000 * 60 * 60 * 24));
    const isBirthday = now.getMonth() === 10 && now.getDate() === 2;

    return {
      name: "Maharshi",
      born: "2nd November 2010",
      location: "Bharuch, Gujarat, India",
      age: { years, months, days },
      precise: { totalDays, totalHours, totalMinutes, totalSeconds, millisecondsAlive: msAlive },
      nextBirthday: { date: "2nd November", daysAway: isBirthday ? 0 : daysUntilBday },
      currentlyBuilding: ["FreelanceCFO", "TrustLens"],
      isBirthday,
      message: \`Maharshi is \${years} years, \${months} months, and \${days} days old. (local estimate — live endpoint unreachable)\`,
      timestamp: now.toISOString(),
      _source: "local-fallback"
    };
  }

  function applyPayload(data, isLive){
    jsonOutEl.innerHTML = highlightJson(data);

    if (data.precise && typeof data.precise.totalSeconds === 'number') {
      serverAnchorSeconds = data.precise.totalSeconds;
      anchorPerfTime = performance.now();
      if (rafId) cancelAnimationFrame(rafId);
      renderAgeNumber();
    }

    if (data.precise) {
      proofDaysEl.textContent = data.precise.totalDays ? data.precise.totalDays.toLocaleString('en-US') : '—';
    }
    if (data.nextBirthday) {
      proofNextEl.textContent = data.nextBirthday.daysAway === 0
        ? 'today 🎂'
        : \`\${data.nextBirthday.daysAway} days\`;
    }
    if (Array.isArray(data.currentlyBuilding)) {
      proofBuildingEl.textContent = data.currentlyBuilding.join(' · ');
    }
    if (data.age) {
      ageHumanEl.innerHTML = \`Exactly <span class="hl">\${data.age.years} years, \${data.age.months} months, \${data.age.days} days</span> old right now — recalculated on every request, never hardcoded.\`;
    }

    if (data.isBirthday) {
      cakeBannerEl.classList.add('is-visible');
      cakeBannerEl.textContent = data.message || "🎉 It's Maharshi's birthday today!";
    } else {
      cakeBannerEl.classList.remove('is-visible');
    }

    if (isLive) {
      statusDotEl.classList.remove('is-down', 'is-pending');
      statusTextEl.textContent = 'live';
      termStatusEl.textContent = '200 OK';
      termStatusEl.classList.remove('is-err');
      syncLineEl.textContent = 'synced with apis.with.maharshis.tech';
      footerNoteEl.textContent = 'auto-refreshes every 30s';
      usingFallback = false;
    } else {
      statusDotEl.classList.add('is-down');
      statusDotEl.classList.remove('is-pending');
      statusTextEl.textContent = 'endpoint unreachable';
      termStatusEl.textContent = 'local fallback';
      termStatusEl.classList.add('is-err');
      syncLineEl.textContent = 'server sync unavailable — showing local estimate';
      footerNoteEl.textContent = 'retrying every 30s';
      usingFallback = true;
    }
  }

  async function fetchAge(){
    if (!usingFallback) {
      statusDotEl.classList.add('is-pending');
    }
    try {
      const res = await fetch(ENDPOINT, { cache: 'no-store' });
      if (!res.ok) throw new Error('status ' + res.status);
      const data = await res.json();
      applyPayload(data, true);
    } catch (e) {
      applyPayload(buildLocalPayload(), false);
    } finally {
      statusDotEl.classList.remove('is-pending');
    }
  }

  refreshBtn.addEventListener('click', () => {
    refreshBtn.disabled = true;
    fetchAge().finally(() => { setTimeout(() => refreshBtn.disabled = false, 1200); });
  });

  fetchAge();
  setInterval(fetchAge, REFRESH_MS);
})();
</script>

</body>
</html>
`;

const BIRTHDAY_MONTH = 10;
const BIRTHDAY_DAY = 2;

const BIRTH = new Date("2010-11-02T09:15:00+05:30");

const COOKIE_NAME = "birthday_mode";
const COOKIE_VALUE = "enabled";

function getCookieValue(cookieHeader, name) {
  if (!cookieHeader) {
    return undefined;
  }

  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.trim().split("=");
    if (key === name) {
      const value = rest.join("=");
      try {
        return decodeURIComponent(value);
      } catch (error) {
        return value;
      }
    }
  }

  return undefined;
}

function buildCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  if (options.path) {
    parts.push(`Path=${options.path}`);
  }

  if (options.httpOnly) {
    parts.push("HttpOnly");
  }

  if (options.secure) {
    parts.push("Secure");
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  return parts.join("; ");
}

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  const now = new Date();

  // ---------- content negotiation ----------
  const queryUi = req.query?.ui;
  const queryJson = req.query?.json;
  const acceptHeader = req.headers?.accept || '';

  let wantsHtml;
  if (queryUi === 'true' || queryUi === '1') {
    wantsHtml = true;
  } else if (queryJson === 'true' || queryJson === '1') {
    wantsHtml = false;
  } else {
    // Browsers send "text/html" (usually first) in Accept.
    // curl/fetch/axios/Postman default to "*/*" or "application/json".
    wantsHtml = acceptHeader.includes('text/html');
  }

  if (wantsHtml) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(PAGE_HTML);
  }

  let years =
    now.getFullYear() - BIRTH.getFullYear();

  let months =
    now.getMonth() - BIRTH.getMonth();

  let days =
    now.getDate() - BIRTH.getDate();

  if (days < 0) {
    months--;

    const prevMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    );

    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const msAlive = now - BIRTH;

  const totalDays = Math.floor(
    msAlive / (1000 * 60 * 60 * 24)
  );

  const totalHours = Math.floor(
    msAlive / (1000 * 60 * 60)
  );

  const totalMinutes = Math.floor(
    msAlive / (1000 * 60)
  );

  const totalSeconds = Math.floor(
    msAlive / 1000
  );

  let nextBday = new Date(
    now.getFullYear(),
    BIRTHDAY_MONTH,
    BIRTHDAY_DAY
  );

  if (nextBday <= now) {
    nextBday = new Date(
      now.getFullYear() + 1,
      BIRTHDAY_MONTH,
      BIRTHDAY_DAY
    );
  }

  const daysUntilBday = Math.ceil(
    (nextBday - now) /
      (1000 * 60 * 60 * 24)
  );

  const actualBirthday =
    now.getMonth() === BIRTHDAY_MONTH &&
    now.getDate() === BIRTHDAY_DAY;

  const cookieValue = getCookieValue(
    req.headers?.cookie,
    COOKIE_NAME
  );

  const testMode = cookieValue === COOKIE_VALUE;

  if (cookieValue !== undefined) {
    res.setHeader(
      "Set-Cookie",
      buildCookie(COOKIE_NAME, "", {
        maxAge: 0,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      })
    );
  }

  const isBirthday =
    actualBirthday || testMode;

  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://www.maharshis.tech"
  );

  res.setHeader(
    "Access-Control-Allow-Credentials",
    "true"
  );

  res.setHeader(
    "Content-Type",
    "application/json"
  );

  const base = {
    name: "Maharshi",

    born: "2nd November 2010",

    location: "Bharuch, Gujarat, India",

    age: {
      years,
      months,
      days,
    },

    precise: {
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      millisecondsAlive: msAlive,
    },

    nextBirthday: {
      date: "2nd November",
      daysAway: isBirthday
        ? 0
        : daysUntilBday,
    },

    currentlyBuilding: [
      "FreelanceCFO",
      "TrustLens",
    ],

    isBirthday,

    debug: {
      actualBirthday,
      testMode,
    },

    timestamp: now.toISOString(),
  };

  if (isBirthday) {
    return res.status(200).json({
      ...base,

      cake: true,

      message: `🎉 IT'S MAHARSHI'S BIRTHDAY! He is ${years} years old today. Go wish him: hello@maharshis.tech`,

      specialEdition: {
        cakeSlices: years,

        candles: years,

        yearsOfChaos: years,

        hoursAlive: totalHours,

        funFact: `Maharshi has been shipping software for roughly ${Math.floor(
          years * 0.4
        )} of his ${years} years on this planet.`,

        wishHim:
          "https://maharshis.tech/#contact",

        confetti:
          "🎊🎂🎉🥳🎈🎁🎊🎂🎉🥳🎈🎁",
      },
    });
  }

  return res.status(200).json({
    ...base,

    message: `Maharshi is ${years} years, ${months} months, and ${days} days old. He has been alive for ${totalDays.toLocaleString()} days and has used most of them to build things.`,
  });
}
