import { useEffect, useState, useRef } from "react";

// ✅ Change this to your username
const USERNAME = "shruthy2_1";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function levelClass(n) {
  if (!n) return "#161b22";
  if (n <= 1) return "#0a3d2e";
  if (n <= 3) return "#0d6b52";
  if (n <= 6) return "#12936e";
  if (n <= 10) return "#00c896";
  return "#00f5c4";
}

export default function LeetCodeActivity() {
  const [stats, setStats]   = useState(null);
  const [heatmap, setHeatmap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 });

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        // Primary API
        const res = await fetch(
          `https://leetcode-stats-api.herokuapp.com/${USERNAME}`
        );
        const data = await res.json();

        if (data && data.totalSolved !== undefined) {
          setStats(data);
        } else {
          throw new Error("bad data");
        }
      } catch {
        // Fallback: alfa-leetcode-api (more reliable)
        try {
          const res2 = await fetch(
            `https://alfa-leetcode-api.onrender.com/${USERNAME}`
          );
          const d2 = await res2.json();
          if (d2 && d2.totalSolved !== undefined) {
            setStats({
              totalSolved:  d2.totalSolved,
              easySolved:   d2.easySolved,
              mediumSolved: d2.mediumSolved,
              hardSolved:   d2.hardSolved,
              totalEasy:    d2.totalEasy   || 950,
              totalMedium:  d2.totalMedium || 2069,
              totalHard:    d2.totalHard   || 943,
              ranking:      d2.ranking,
            });
          } else throw new Error();
        } catch {
          setError(true);
          // Show real numbers from your profile screenshot as fallback
          setStats({
            totalSolved: 698, easySolved: 273, mediumSolved: 330, hardSolved: 95,
            totalEasy: 950, totalMedium: 2069, totalHard: 943, ranking: 90063,
          });
        }
      }

      // Heatmap via alfa API
      try {
        const res = await fetch(
          `https://alfa-leetcode-api.onrender.com/${USERNAME}/calendar`
        );
        const d = await res.json();
        // Returns { submissionCalendar: "{timestamp: count, ...}" }
        const raw = d.submissionCalendar
          ? JSON.parse(d.submissionCalendar)
          : {};
        const mapped = {};
        Object.entries(raw).forEach(([ts, count]) => {
          const date = new Date(parseInt(ts) * 1000).toISOString().slice(0, 10);
          mapped[date] = count;
        });
        setHeatmap(mapped);
      } catch {
        setHeatmap({});
      }

      setLoading(false);
    }
    fetchAll();
  }, []);

  // ── Build grid ──────────────────────────────────────────
  const today = new Date();
  const start = new Date(today); start.setDate(start.getDate() - 364);
  const pad   = new Date(start);
  const dow   = pad.getDay();
  pad.setDate(pad.getDate() - (dow === 0 ? 6 : dow - 1));

  const weeks = [];
  const monthSeen = {};
  const cur = new Date(pad);
  let week = [];

  while (cur <= today) {
    const curDow = (cur.getDay() + 6) % 7;
    if (curDow === 0 && week.length) { weeks.push(week); week = []; }
    const mn = cur.getMonth();
    if (!monthSeen[mn]) monthSeen[mn] = weeks.length;
    const k = cur.toISOString().slice(0, 10);
    week.push({
      date:  new Date(cur),
      key:   k,
      value: cur >= start ? (heatmap[k] ?? 0) : null,
    });
    cur.setDate(cur.getDate() + 1);
  }
  if (week.length) weeks.push(week);

  // ── Streak & totals from heatmap ────────────────────────
  let totalSubs = 0, activeDays = 0, tempStr = 0, maxStr = 0, curStr = 0;
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const v = heatmap[d.toISOString().slice(0, 10)] || 0;
    totalSubs += v;
    if (v > 0) { activeDays++; tempStr++; if (tempStr > maxStr) maxStr = tempStr; }
    else { if (i <= 1 && curStr === 0) curStr = tempStr; tempStr = 0; }
  }
  if (curStr === 0 && tempStr > 0) curStr = tempStr;

  const ep = stats ? Math.round((stats.easySolved   / (stats.totalEasy   || 1)) * 100) : 0;
  const mp = stats ? Math.round((stats.mediumSolved / (stats.totalMedium || 1)) * 100) : 0;
  const hp = stats ? Math.round((stats.hardSolved   / (stats.totalHard   || 1)) * 100) : 0;

  return (
    <div style={s.widget}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.titleRow}>
            <span style={{ color: "#f5a623", fontSize: 18 }}>⌨</span>
            <span style={s.title}>LeetCode Activity</span>
            {error && <span style={{ fontSize: 10, color: "#f5a623", background: "rgba(245,166,35,0.1)", padding: "2px 8px", borderRadius: 10, border: "1px solid rgba(245,166,35,0.3)" }}>cached data</span>}
          </div>
          <div style={s.username}>@{USERNAME}</div>
        </div>
        <div style={s.pill}>
          {loading ? "Loading…" : `${totalSubs.toLocaleString()} submissions · last year`}
        </div>
      </div>

      {/* Stats */}
      <div style={s.statsGrid}>
        {[
          { label: "Solved", val: stats?.totalSolved  ?? "—", color: "#e6edf3" },
          { label: "Easy",   val: stats?.easySolved   ?? "—", color: "#00c896" },
          { label: "Medium", val: stats?.mediumSolved ?? "—", color: "#f5a623" },
          { label: "Hard",   val: stats?.hardSolved   ?? "—", color: "#e94560" },
          { label: "Rank",   val: stats?.ranking ? "#" + Number(stats.ranking).toLocaleString() : "—", color: "#3b82f6" },
        ].map(({ label, val, color }) => (
          <div key={label} style={s.statCard}>
            <div style={{ ...s.statNum, color }}>{loading ? "…" : val}</div>
            <div style={s.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      {/* Progress bars */}
      {[
        { label: "Easy",   pct: ep, color: "#00c896", solved: stats?.easySolved,   total: stats?.totalEasy },
        { label: "Medium", pct: mp, color: "#f5a623", solved: stats?.mediumSolved, total: stats?.totalMedium },
        { label: "Hard",   pct: hp, color: "#e94560", solved: stats?.hardSolved,   total: stats?.totalHard },
      ].map(({ label, pct, color, solved, total }) => (
        <div key={label} style={{ marginBottom: 8 }}>
          <div style={s.progMeta}>
            <span>{label}</span>
            <span style={{ color, fontWeight: 500 }}>
              {loading ? "…" : `${solved ?? "—"} / ${total ?? "—"}`}
            </span>
          </div>
          <div style={s.progTrack}>
            <div style={{ ...s.progFill, width: loading ? "0%" : `${pct}%`, background: color }} />
          </div>
        </div>
      ))}

      {/* Heatmap */}
      <div style={{ overflowX: "auto", marginTop: 20 }}>
        <div style={{ minWidth: 620 }}>
          {/* Month labels */}
          <div style={{ display: "flex", marginLeft: 32, marginBottom: 5 }}>
            {Object.entries(monthSeen).sort((a, b) => a[1] - b[1]).map(([month, pos], i, arr) => {
              const nextPos = arr[i + 1]?.[1] ?? weeks.length;
              return (
                <span key={month} style={{ fontSize: 10, color: "#7d8590", width: (nextPos - pos) * 13, display: "inline-block" }}>
                  {MONTHS[+month]}
                </span>
              );
            })}
          </div>

          {/* Grid */}
          <div style={{ display: "flex", gap: 3 }}>
            {/* Day labels */}
            <div style={{ display: "flex", flexDirection: "column", gap: 3, marginRight: 5, paddingTop: 13 }}>
              {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                <div key={i} style={{ fontSize: 9, color: "#7d8590", height: 10, lineHeight: "10px", width: 26, textAlign: "right" }}>{d}</div>
              ))}
            </div>

            {/* Cells */}
            <div style={{ display: "flex", gap: 3 }}>
              {weeks.map((wk, wi) => (
                <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {wk.map((cell, di) => (
                    <div
                      key={di}
                      style={{
                        width: 10, height: 10, borderRadius: 2, flexShrink: 0,
                        cursor: cell.value !== null ? "pointer" : "default",
                        background: cell.value === null ? "transparent" : levelClass(cell.value),
                        border: cell.value === 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                        transition: "transform 0.1s",
                      }}
                      onMouseEnter={(e) => cell.value !== null && setTooltip({
                        visible: true,
                        text: `${cell.value} submission${cell.value !== 1 ? "s" : ""} · ${cell.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
                        x: e.clientX + 14, y: e.clientY - 34,
                      })}
                      onMouseMove={(e) => setTooltip(t => ({ ...t, x: e.clientX + 14, y: e.clientY - 34 }))}
                      onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 10, justifyContent: "flex-end", fontSize: 10, color: "#7d8590" }}>
            <span>Less</span>
            {["#161b22","#0a3d2e","#0d6b52","#12936e","#00c896","#00f5c4"].map(c => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Streaks */}
      <div style={s.streakRow}>
        {[
          { icon: "🔥", label: "Current streak", val: loading ? "…" : curStr + "d" },
          { icon: "🏆", label: "Max streak",     val: loading ? "…" : maxStr + "d" },
          { icon: "📅", label: "Active days",    val: loading ? "…" : activeDays },
        ].map(({ icon, label, val }) => (
          <div key={label} style={s.streakItem}>
            <span>{icon}</span>
            <span style={{ color: "#7d8590", fontSize: 12 }}>
              {label}: <strong style={{ color: "#e6edf3" }}>{val}</strong>
            </span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div style={{ ...s.tooltip, left: tooltip.x, top: tooltip.y }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

const s = {
  widget:    { background: "#161b22", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "1.5rem 1.75rem", fontFamily: "Inter, system-ui, sans-serif", color: "#e6edf3", position: "relative" },
  header:    { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap", gap: 10 },
  titleRow:  { display: "flex", alignItems: "center", gap: 8 },
  title:     { fontSize: 14, fontWeight: 600, letterSpacing: "0.02em" },
  username:  { fontSize: 12, color: "#00c896", marginTop: 3 },
  pill:      { background: "rgba(0,200,150,0.1)", color: "#00c896", fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(0,200,150,0.25)", whiteSpace: "nowrap" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10, marginBottom: "1.25rem" },
  statCard:  { background: "#1c2230", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", textAlign: "center" },
  statNum:   { fontSize: 22, fontWeight: 600, lineHeight: 1.1 },
  statLabel: { fontSize: 10, color: "#7d8590", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.05em" },
  progMeta:  { display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11, color: "#7d8590" },
  progTrack: { height: 5, borderRadius: 10, background: "#1c2230", overflow: "hidden" },
  progFill:  { height: "100%", borderRadius: 10, transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)" },
  streakRow: { display: "flex", gap: 20, flexWrap: "wrap", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.08)" },
  streakItem:{ display: "flex", alignItems: "center", gap: 6 },
  tooltip:   { position: "fixed", background: "#0d1117", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 6, padding: "6px 10px", fontSize: 12, color: "#e6edf3", pointerEvents: "none", zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,0.4)" },
};