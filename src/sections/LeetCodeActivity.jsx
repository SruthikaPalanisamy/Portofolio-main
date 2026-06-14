import { useEffect, useState, useRef } from "react";

const USERNAME = "M-Dharani18"; // ← change this
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function levelClass(n) {
  if (!n) return "hc0";
  if (n <= 1) return "hc1";
  if (n <= 3) return "hc2";
  if (n <= 6) return "hc3";
  if (n <= 10) return "hc4";
  return "hc5";
}

function generateMockHeatmap() {
  const today = new Date();
  const out = {};
  const hot = new Set([7, 8, 11, 12, 1, 2, 3, 4]);
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    const m = d.getMonth() + 1;
    const burst = m === 8 || m === 3 ? 0.72 : hot.has(m) ? 0.45 : 0.08;
    out[k] = Math.random() < burst ? Math.floor(Math.random() * 13) + 1 : 0;
  }
  return out;
}

export default function LeetCodeActivity() {
  const [stats, setStats] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 });
  const heatmapData = useRef(generateMockHeatmap());

  useEffect(() => {
    fetch(`https://leetcode-stats-api.herokuapp.com/${USERNAME}`)
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null));
  }, []);

  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  const pad = new Date(start);
  const dow = pad.getDay();
  pad.setDate(pad.getDate() - (dow === 0 ? 6 : dow - 1));

  // Build weeks array
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
    week.push({ date: new Date(cur), key: k, value: cur >= start ? (heatmapData.current[k] ?? 0) : null });
    cur.setDate(cur.getDate() + 1);
  }
  if (week.length) weeks.push(week);

  // Streak calc
  let totalSubs = 0, activeDays = 0, tempStr = 0, maxStr = 0, curStr = 0;
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const v = heatmapData.current[d.toISOString().slice(0, 10)] || 0;
    totalSubs += v;
    if (v > 0) { activeDays++; tempStr++; if (tempStr > maxStr) maxStr = tempStr; }
    else { if (i <= 1 && curStr === 0) curStr = tempStr; tempStr = 0; }
  }
  if (curStr === 0 && tempStr > 0) curStr = tempStr;

  const ep = stats ? Math.round((stats.easySolved / (stats.totalEasy || 1)) * 100) : 42;
  const mp = stats ? Math.round((stats.mediumSolved / (stats.totalMedium || 1)) * 100) : 28;
  const hp = stats ? Math.round((stats.hardSolved / (stats.totalHard || 1)) * 100) : 11;

  return (
    <div style={s.widget}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.titleRow}>
            <span style={{ color: "#f5a623", fontSize: 18 }}>⌨</span>
            <span style={s.title}>LeetCode Activity</span>
          </div>
          <div style={s.username}>@{USERNAME}</div>
        </div>
        <div style={s.pill}>{totalSubs.toLocaleString()} submissions · last year</div>
      </div>

      {/* Stats */}
      <div style={s.statsGrid}>
        {[
          { label: "Solved", val: stats?.totalSolved ?? "—", color: "#e6edf3" },
          { label: "Easy",   val: stats?.easySolved  ?? "—", color: "#00c896" },
          { label: "Medium", val: stats?.mediumSolved ?? "—", color: "#f5a623" },
          { label: "Hard",   val: stats?.hardSolved  ?? "—", color: "#e94560" },
          { label: "Rank",   val: stats?.ranking ? "#" + stats.ranking.toLocaleString() : "—", color: "#3b82f6" },
        ].map(({ label, val, color }) => (
          <div key={label} style={s.statCard}>
            <div style={{ ...s.statNum, color }}>{val}</div>
            <div style={s.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      {/* Progress bars */}
      {[
        { label: "Easy",   pct: ep, color: "#00c896" },
        { label: "Medium", pct: mp, color: "#f5a623" },
        { label: "Hard",   pct: hp, color: "#e94560" },
      ].map(({ label, pct, color }) => (
        <div key={label} style={{ marginBottom: 8 }}>
          <div style={s.progMeta}>
            <span>{label}</span>
            <span style={{ color }}>{pct}%</span>
          </div>
          <div style={s.progTrack}>
            <div style={{ ...s.progFill, width: `${pct}%`, background: color }} />
          </div>
        </div>
      ))}

      {/* Heatmap */}
      <div style={{ overflowX: "auto", marginTop: 20 }}>
        <div style={{ minWidth: 620 }}>
          {/* Month labels */}
          <div style={{ display: "flex", marginLeft: 32, marginBottom: 5 }}>
            {Object.entries(monthSeen).sort((a,b)=>a[1]-b[1]).map(([month, pos], i, arr) => {
              const nextPos = arr[i+1]?.[1] ?? weeks.length;
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
              {["","Mon","","Wed","","Fri",""].map((d, i) => (
                <div key={i} style={{ fontSize: 9, color: "#7d8590", height: 10, lineHeight: "10px", width: 26, textAlign: "right" }}>{d}</div>
              ))}
            </div>
            {/* Cells */}
            <div style={{ display: "flex", gap: 3 }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {week.map((cell, di) => (
                    <div
                      key={di}
                      style={{
                        width: 10, height: 10, borderRadius: 2, flexShrink: 0,
                        cursor: cell.value !== null ? "pointer" : "default",
                        background: cell.value === null ? "transparent"
                          : cell.value === 0 ? "#161b22"
                          : cell.value <= 1  ? "#0a3d2e"
                          : cell.value <= 3  ? "#0d6b52"
                          : cell.value <= 6  ? "#12936e"
                          : cell.value <= 10 ? "#00c896"
                          : "#00f5c4",
                        border: cell.value === 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                        transition: "transform 0.1s",
                      }}
                      onMouseEnter={(e) => cell.value !== null && setTooltip({
                        visible: true,
                        text: `${cell.value} submission${cell.value !== 1 ? "s" : ""} · ${cell.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
                        x: e.clientX + 14,
                        y: e.clientY - 34,
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
          { icon: "🔥", label: "Current streak", val: curStr + "d" },
          { icon: "🏆", label: "Max streak",     val: maxStr + "d" },
          { icon: "📅", label: "Active days",    val: activeDays },
        ].map(({ icon, label, val }) => (
          <div key={label} style={s.streakItem}>
            <span>{icon}</span>
            <span style={{ color: "#7d8590", fontSize: 12 }}>{label}: <strong style={{ color: "#e6edf3" }}>{val}</strong></span>
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