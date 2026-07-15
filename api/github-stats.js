// ============================================================
// githubStats — Vercel Serverless Function
// Returns live public-repo count, last push time, and top
// language for github.com/maharshi878. Pairs with the existing
// how-old-is-maharshi function — same "provably true right now"
// idea, applied to dev activity instead of age.
// ============================================================

const PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>github-stats · live repo activity</title>
<meta name="theme-color" content="#0B0D10">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;1,400&family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root{
    --indigo:#1E2F6E; --blue:#2E6FBE; --amber:#E8912F; --rust:#C4501B;
    --paper:#F1F3F6; --ink:#16181D; --ink-soft:#4A4E5A; --hairline:rgba(22,24,29,0.12);
    --spectrum:linear-gradient(100deg,var(--indigo) 0%,var(--blue) 38%,var(--amber) 72%,var(--rust) 100%);
    --term-bg:#0B0D10; --term-bar:#111319; --term-line:rgba(255,255,255,0.08);
    --term-text:#C7CAD3; --term-dim:#6D7180; --term-blue:#7FB2FF; --term-green:#3ED97E; --term-amber:#E8912F; --term-pink:#FF9BD2;
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:var(--paper);color:var(--ink);font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;}
  .wrap{max-width:760px;margin:0 auto;padding:7vh 6vw 10vh;}
  .top-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:6vh;gap:16px;}
  .name-mark{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:16px;text-decoration:none;color:var(--ink);}
  .eyebrow{font-family:'JetBrains Mono',monospace;font-size:12.5px;color:var(--ink-soft);text-transform:uppercase;margin-bottom:18px;}
  .eyebrow b{color:var(--amber);font-weight:500;}
  .headline{font-family:'Fraunces',serif;font-weight:500;font-style:italic;font-size:clamp(24px,3.4vw,34px);line-height:1.4;color:var(--ink);max-width:600px;}
  .headline .hl{color:var(--blue);font-style:normal;font-weight:600;font-family:'Inter',sans-serif;}
  .proof-strip{margin-top:6vh;display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--hairline);border-bottom:1px solid var(--hairline);}
  .proof-item{padding:16px 10px;text-align:center;border-left:1px solid var(--hairline);}
  .proof-item:first-child{border-left:none;}
  .proof-label{font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--ink-soft);text-transform:uppercase;margin-bottom:6px;}
  .proof-value{font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:16px;word-break:break-word;}
  .term-section{margin-top:9vh;}
  .term-label-row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px;gap:12px;flex-wrap:wrap;}
  .term-label{font-family:'JetBrains Mono',monospace;font-size:12px;text-transform:uppercase;color:var(--ink-soft);}
  .btn-row{display:flex;gap:8px;}
  .refresh-btn{font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--ink-soft);background:none;border:1px solid var(--hairline);
    border-radius:999px;padding:6px 14px;cursor:pointer;text-decoration:none;display:inline-block;transition:color .25s,border-color .25s;}
  .refresh-btn:hover{color:var(--blue);border-color:var(--blue);}
  .api-term{background:var(--term-bg);border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);box-shadow:0 40px 100px rgba(16,20,30,0.16);}
  .api-term-bar{display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--term-bar);border-bottom:1px solid var(--term-line);}
  .api-term-traffic{display:flex;gap:7px;}
  .api-term-traffic i{width:11px;height:11px;border-radius:50%;background:rgba(255,255,255,0.14);display:block;}
  .api-term-url{flex:1;font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--term-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .api-term-url b{color:var(--term-amber);}
  .api-term-body{padding:22px 20px;}
  .api-json{font-family:'JetBrains Mono',monospace;font-size:12.5px;line-height:1.68;color:var(--term-text);background:rgba(255,255,255,0.02);
    border:1px solid var(--term-line);border-radius:10px;padding:16px 17px;overflow-x:auto;white-space:pre;}
  .api-json .jk{color:var(--term-blue);} .api-json .js{color:var(--term-green);} .api-json .jn{color:var(--term-amber);}
  .api-json .jb{color:var(--term-pink);} .api-json .jz{color:var(--term-dim);}
  .api-term-footer{padding:12px 20px;background:var(--term-bar);border-top:1px solid var(--term-line);
    font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--term-dim);display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;}
  .api-term-footer a{color:var(--term-blue);text-decoration:none;}
  .repo-list{margin-top:18px;display:flex;flex-direction:column;gap:8px;}
  .repo-row{display:flex;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid var(--term-line);border-radius:8px;font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--term-text);}
  .repo-row a{color:var(--term-blue);text-decoration:none;}
  .repo-lang{color:var(--term-dim);}
  .foot{margin-top:8vh;font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--ink-soft);opacity:0.75;}
  .foot a{color:var(--ink-soft);}
</style>
</head>
<body>
<div class="wrap">
  <div class="top-row">
    <a class="name-mark" href="https://maharshis.tech" target="_blank" rel="noopener">Maharshi Patel</a>
  </div>
  <div class="eyebrow">GET <b>apis.with.maharshis.tech/github-stats</b></div>
  <div class="headline" id="headline">Loading live GitHub activity for <span class="hl">github.com/maharshi878</span>…</div>

  <div class="proof-strip">
    <div class="proof-item"><div class="proof-label">Public repos</div><div class="proof-value" id="proofRepos">—</div></div>
    <div class="proof-item"><div class="proof-label">Top language</div><div class="proof-value" id="proofLang">—</div></div>
    <div class="proof-item"><div class="proof-label">Last push</div><div class="proof-value" id="proofPush">—</div></div>
  </div>

  <div class="term-section">
    <div class="term-label-row">
      <span class="term-label">Raw response</span>
      <div class="btn-row">
        <a href="?json=true" class="refresh-btn">fancy json? click here.</a>
        <button type="button" class="refresh-btn" id="refreshBtn">Refetch</button>
      </div>
    </div>
    <div class="api-term">
      <div class="api-term-bar">
        <div class="api-term-traffic"><i></i><i></i><i></i></div>
        <div class="api-term-url"><b>GET</b> /github-stats</div>
      </div>
      <div class="api-term-body">
        <div class="api-json" id="jsonOut">// fetching /github-stats?json=true …</div>
        <div class="repo-list" id="repoList"></div>
      </div>
      <div class="api-term-footer">
        <span>cached 5 min server-side</span>
        <a href="https://apis.with.maharshis.tech/github-stats" target="_blank" rel="noopener">open raw endpoint &#8599;</a>
      </div>
    </div>
  </div>

  <div class="foot">
    <span>Built by <a href="https://maharshis.tech" target="_blank" rel="noopener">Maharshi Patel</a> · Bharuch, India</span>
  </div>
</div>

<script>
(function(){
  const ENDPOINT = '/github-stats?json=true';
  const headlineEl = document.getElementById('headline');
  const proofReposEl = document.getElementById('proofRepos');
  const proofLangEl = document.getElementById('proofLang');
  const proofPushEl = document.getElementById('proofPush');
  const jsonOutEl = document.getElementById('jsonOut');
  const repoListEl = document.getElementById('repoList');
  const refreshBtn = document.getElementById('refreshBtn');

  function escapeHtml(str){ const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
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
  function timeAgo(iso){
    if (!iso) return '—';
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    return Math.floor(hrs / 24) + 'd ago';
  }

  async function fetchStats(){
    try {
      const res = await fetch(ENDPOINT, { cache: 'no-store' });
      const data = await res.json();
      jsonOutEl.innerHTML = highlightJson(data);

      if (data.error) {
        headlineEl.innerHTML = \`Couldn't reach the GitHub API for <span class="hl">github.com/\${data.user}</span> just now.\`;
        proofReposEl.textContent = '—'; proofLangEl.textContent = '—'; proofPushEl.textContent = '—';
        repoListEl.innerHTML = '';
        return;
      }

      headlineEl.innerHTML = \`<span class="hl">\${data.publicRepos}</span> public repos on <span class="hl">github.com/\${data.user}</span>, mostly \${data.topLanguage || 'various languages'}.\`;
      proofReposEl.textContent = data.publicRepos ?? '—';
      proofLangEl.textContent = data.topLanguage ?? '—';
      proofPushEl.textContent = timeAgo(data.lastCommitAt);

      repoListEl.innerHTML = '';
      (data.recentRepos || []).slice(0, 6).forEach((r) => {
        const row = document.createElement('div');
        row.className = 'repo-row';
        row.innerHTML = \`<a href="\${r.url}" target="_blank" rel="noopener">\${escapeHtml(r.name)}</a><span class="repo-lang">\${escapeHtml(r.language || '—')}</span>\`;
        repoListEl.appendChild(row);
      });
    } catch (e) {
      jsonOutEl.textContent = '// fetch failed — endpoint may be unreachable right now';
      headlineEl.textContent = 'Could not load live GitHub stats.';
    }
  }

  refreshBtn.addEventListener('click', () => {
    refreshBtn.disabled = true;
    fetchStats().finally(() => setTimeout(() => refreshBtn.disabled = false, 1000));
  });

  fetchStats();
})();
</script>
</body>
</html>
`;

const GH_USER = "maharshi878";
const CACHE_SECONDS = 300; // GitHub's unauthenticated rate limit is tight — cache 5 min

export default async function handler(req, res) {
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
    wantsHtml = acceptHeader.includes('text/html');
  }

  if (wantsHtml) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(PAGE_HTML);
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", `s-maxage=${CACHE_SECONDS}, stale-while-revalidate`);

  try {
    const headers = { "User-Agent": "maharshis.tech", Accept: "application/vnd.github+json" };
    // Add a GITHUB_TOKEN env var on Vercel to raise the rate limit from 60/hr to 5000/hr.
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    const [userRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GH_USER}`, { headers }),
      fetch(`https://api.github.com/users/${GH_USER}/repos?sort=pushed&per_page=100`, { headers }),
      fetch(`https://api.github.com/users/${GH_USER}/events/public?per_page=30`, { headers }),
    ]);

    if (!userRes.ok || !reposRes.ok) {
      throw new Error(`GitHub API responded ${userRes.status}/${reposRes.status}`);
    }

    const user = await userRes.json();
    const repos = await reposRes.json();
    const events = eventsRes.ok ? await eventsRes.json() : [];

    // Top language by repo count (non-fork repos only)
    const ownRepos = repos.filter((r) => !r.fork);
    const langCounts = {};
    for (const r of ownRepos) {
      if (!r.language) continue;
      langCounts[r.language] = (langCounts[r.language] || 0) + 1;
    }
    const topLanguage =
      Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    // Last commit time from push events, falling back to most-recently-pushed repo
    const lastPush = events.find((e) => e.type === "PushEvent");
    const lastCommitAt = lastPush ? lastPush.created_at : ownRepos[0]?.pushed_at ?? null;

    // Recent, non-fork repos for a "latest projects" feed — newest first
    const recentRepos = ownRepos.slice(0, 12).map((r) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      language: r.language,
      stars: r.stargazers_count,
      pushedAt: r.pushed_at,
    }));

    return res.status(200).json({
      user: GH_USER,
      publicRepos: user.public_repos ?? ownRepos.length,
      topLanguage,
      lastCommitAt,
      recentRepos,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    // Non-fake fallback: tell the client it failed, don't invent numbers.
    return res.status(200).json({
      user: GH_USER,
      error: true,
      message: "Could not reach the GitHub API right now.",
      fetchedAt: new Date().toISOString(),
    });
  }
}
