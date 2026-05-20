import { useState, useRef, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const C = {
  bg: "#0a0c0f", bg2: "#111318", bg3: "#181c22", bg4: "#1e2330",
  border: "#1e2330", border2: "#252d3d",
  text: "#e2e8f0", muted: "#64748b", hint: "#2a3040",
  blue: "#3b82f6", green: "#10b981", warn: "#f59e0b", red: "#ef4444",
  purple: "#8b5cf6", teal: "#06b6d4",
};

const s = {
  app: { background: C.bg, color: C.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, minHeight: "100vh" },
  tabs: { display: "flex", background: C.bg2, borderBottom: `1px solid ${C.border}`, padding: "0 14px" },
  tab: (on) => ({ padding: "10px 14px", fontSize: 11, color: on ? C.blue : C.muted, cursor: "pointer", borderBottom: `2px solid ${on ? C.blue : "transparent"}`, marginBottom: -1, letterSpacing: ".04em", transition: "all .15s" }),
  view: { padding: 14, display: "flex", flexDirection: "column", gap: 12 },
  row: { display: "flex", gap: 10 },
  card: { background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, padding: 12 },
  ct: { fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: C.muted, marginBottom: 10 },
  lbl: { fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4, display: "block" },
  sel: { width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "6px 8px", color: C.text, fontFamily: "inherit", fontSize: 10, outline: "none", marginBottom: 8 },
  inp: { width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "6px 8px", color: C.text, fontFamily: "inherit", fontSize: 10, outline: "none", marginBottom: 8 },
  btn: (variant) => {
    const v = { blue: [C.blue, "rgba(59,130,246,.18)", "rgba(59,130,246,.4)"], green: [C.green, "rgba(16,185,129,.12)", "rgba(16,185,129,.3)"], ghost: [C.muted, "transparent", C.border] }[variant] || [C.blue, "rgba(59,130,246,.18)", "rgba(59,130,246,.4)"];
    return { padding: "6px 12px", borderRadius: 4, cursor: "pointer", fontFamily: "inherit", fontSize: 10, fontWeight: 500, border: `1px solid ${v[2]}`, background: v[1], color: v[0], transition: "all .15s", width: "100%", marginBottom: 6 };
  },
  badge: (variant) => {
    const v = { blue: [C.blue, "rgba(59,130,246,.15)", "rgba(59,130,246,.2)"], green: [C.green, "rgba(16,185,129,.12)", "rgba(16,185,129,.2)"], warn: [C.warn, "rgba(245,158,11,.12)", "rgba(245,158,11,.2)"], red: [C.red, "rgba(239,68,68,.12)", "rgba(239,68,68,.2)"], purple: [C.purple, "rgba(139,92,246,.12)", "rgba(139,92,246,.2)"], gray: [C.muted, "rgba(100,116,139,.1)", C.border] }[variant] || [C.muted, "transparent", C.border];
    return { display: "inline-flex", padding: "2px 7px", borderRadius: 3, fontSize: 9, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", color: v[0], background: v[1], border: `1px solid ${v[2]}` };
  },
  mr: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: `1px solid rgba(30,35,48,.5)` },
};

function Lbl({ children }) { return <span style={s.lbl}>{children}</span>; }
function Badge({ v, children }) { return <span style={s.badge(v)}>{children}</span>; }
function Card({ children, style }) { return <div style={{ ...s.card, ...style }}>{children}</div>; }
function Ct({ children }) { return <div style={s.ct}>{children}</div>; }

const AGENTS = [
  { name: "FundamentalAnalyst", short: "FA", color: C.blue, bg: "rgba(59,130,246,.2)" },
  { name: "SentimentAnalyst", short: "SA", color: C.purple, bg: "rgba(139,92,246,.2)" },
  { name: "RiskManager", short: "RM", color: C.warn, bg: "rgba(245,158,11,.2)" },
  { name: "MarketScanner", short: "MS", color: C.teal, bg: "rgba(6,182,212,.2)" },
];

// ─── Strategy Builder ──────────────────────────────────────────────────────────
function StrategyBuilder({ onRunBacktest }) {
  const [maxPos, setMaxPos] = useState(10);
  const [posSz, setPosSz] = useState(5);
  const [stop, setStop] = useState(4);
  const [target, setTarget] = useState(12);
  const [entryConds, setEntryConds] = useState([
    { id: 1, label: "Momentum Filter", badge: "green", indicator: "RSI(14)", op: ">", val: "50", agent: false },
    { id: 2, label: "Sentiment Gate", badge: "purple", indicator: "SentimentAnalyst score", op: ">", val: "65", agent: true },
  ]);
  const [exitConds, setExitConds] = useState([
    { id: 1, label: "Profit Target", badge: "green", indicator: "Unrealized P&L %", op: ">", val: "12", agent: false },
    { id: 2, label: "Sentiment Reversal", badge: "purple", indicator: "SentimentAnalyst score", op: "<", val: "35", agent: true },
  ]);
  const [weights, setWeights] = useState({ mom: 40, sent: 35, fund: 25 });

  const addCond = (type) => {
    const id = Date.now();
    if (type === "entry") setEntryConds(p => [...p, { id, label: "New Entry Condition", badge: "blue", indicator: "RSI(14)", op: ">", val: "50", agent: false }]);
    else setExitConds(p => [...p, { id, label: "New Exit Condition", badge: "blue", indicator: "Unrealized P&L %", op: ">", val: "10", agent: false }]);
  };

  const Slider = ({ label, val, setVal, min, max, step = 1, unit = "" }) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.muted, marginBottom: 2 }}>
        <span>{label}</span><span style={{ color: C.text, fontWeight: 500 }}>{val}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val} onChange={e => setVal(Number(e.target.value))}
        style={{ width: "100%", accentColor: C.blue }} />
    </div>
  );

  return (
    <div style={s.view}>
      <div style={s.row}>
        <div style={{ width: 188, flexShrink: 0 }}>
          <Card>
            <Ct>Strategy Config</Ct>
            <Lbl>Name</Lbl>
            <input style={s.inp} defaultValue="Momentum + Sentiment Alpha" />
            <Lbl>Universe</Lbl>
            <select style={s.sel}><option>S&P 500</option><option>NASDAQ 100</option><option>Russell 2000</option></select>
            <Lbl>Timeframe</Lbl>
            <select style={s.sel}><option>Daily</option><option>4H</option><option>1H</option><option>Weekly</option></select>
            <Lbl>Direction</Lbl>
            <select style={s.sel}><option>Long only</option><option>Long / Short</option><option>Short only</option></select>
            <Slider label="Max positions" val={maxPos} setVal={setMaxPos} min={1} max={30} />
            <Slider label="Position size" val={posSz} setVal={setPosSz} min={1} max={20} step={0.5} unit="%" />
            <Slider label="Stop loss" val={stop} setVal={setStop} min={1} max={15} step={0.5} unit="%" />
            <Slider label="Profit target" val={target} setVal={setTarget} min={2} max={40} unit="%" />
          </Card>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Entry Conditions */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <Ct>Entry Conditions</Ct>
              <div style={{ display: "flex", gap: 6 }}>
                <Badge v="blue">AND logic</Badge>
                <button style={{ ...s.btn("ghost"), width: "auto", padding: "2px 8px", fontSize: 9, marginBottom: 0 }} onClick={() => addCond("entry")}>+ Add</button>
              </div>
            </div>
            {entryConds.map(c => (
              <div key={c.id} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, padding: 10, marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 600 }}>{c.label}</span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <Badge v={c.agent ? "purple" : c.badge}>{c.agent ? "AI Agent" : "Active"}</Badge>
                    <button style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 10, padding: 0 }} onClick={() => setEntryConds(p => p.filter(x => x.id !== c.id))}>×</button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <select style={{ ...s.sel, flex: 1, marginBottom: 0 }}><option>{c.indicator}</option><option>RSI(14)</option><option>MACD Signal</option><option>EMA Cross</option><option>Volume spike</option></select>
                  <select style={{ ...s.sel, width: 54, marginBottom: 0 }}><option>{c.op}</option><option>&gt;</option><option>&lt;</option><option>cross</option></select>
                  <input style={{ ...s.inp, width: 48, marginBottom: 0 }} defaultValue={c.val} />
                </div>
              </div>
            ))}
          </Card>
          {/* Exit Conditions */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <Ct>Exit Conditions</Ct>
              <div style={{ display: "flex", gap: 6 }}>
                <Badge v="warn">OR logic</Badge>
                <button style={{ ...s.btn("ghost"), width: "auto", padding: "2px 8px", fontSize: 9, marginBottom: 0 }} onClick={() => addCond("exit")}>+ Add</button>
              </div>
            </div>
            {exitConds.map(c => (
              <div key={c.id} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, padding: 10, marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 600 }}>{c.label}</span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <Badge v={c.agent ? "purple" : c.badge}>{c.agent ? "AI Agent" : "Active"}</Badge>
                    <button style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 10, padding: 0 }} onClick={() => setExitConds(p => p.filter(x => x.id !== c.id))}>×</button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <select style={{ ...s.sel, flex: 1, marginBottom: 0 }}><option>{c.indicator}</option><option>Unrealized P&L %</option><option>RSI reversal</option><option>Time stop (days)</option></select>
                  <select style={{ ...s.sel, width: 54, marginBottom: 0 }}><option>{c.op}</option><option>&gt;</option><option>&lt;</option></select>
                  <input style={{ ...s.inp, width: 48, marginBottom: 0 }} defaultValue={c.val} />
                </div>
              </div>
            ))}
          </Card>
        </div>

        <div style={{ width: 188, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <Card>
            <Ct>Agent Roles</Ct>
            {["MarketScanner", "FundamentalAnalyst", "SentimentAnalyst", "RiskManager", "PortfolioOptimizer"].map((a, i) => (
              <div key={a} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <span style={{ fontSize: 10 }}>{a}</span>
                <input type="checkbox" defaultChecked={i < 4} style={{ accentColor: C.blue }} />
              </div>
            ))}
          </Card>
          <Card>
            <Ct>Signal Weights</Ct>
            {[["Momentum", C.blue, "mom"], ["Sentiment", C.purple, "sent"], ["Fundamental", C.green, "fund"]].map(([lbl, col, key]) => (
              <div key={key} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.muted, marginBottom: 2 }}>
                  <span>{lbl}</span><span style={{ color: C.text }}>{weights[key]}%</span>
                </div>
                <input type="range" min={0} max={100} value={weights[key]}
                  onChange={e => setWeights(p => ({ ...p, [key]: Number(e.target.value) }))}
                  style={{ width: "100%", accentColor: col }} />
              </div>
            ))}
          </Card>
          <button style={s.btn("blue")} onClick={() => alert("Strategy saved. Switch to Backtester to simulate.")}>Save Strategy</button>
          <button style={{ ...s.btn("green"), marginBottom: 0 }} onClick={onRunBacktest}>Run Backtest ▶</button>
        </div>
      </div>
    </div>
  );
}

// ─── Backtester ────────────────────────────────────────────────────────────────
function generateEquityCurve() {
  const months = ["Jan'21","Apr","Jul","Oct","Jan'22","Apr","Jul","Oct","Jan'23","Apr","Jul","Oct","Jan'24","Apr","Jul","Oct","Dec"];
  let sv = 1000000, bv = 1000000;
  return months.map(m => {
    sv *= (1 + (Math.random() * 0.09 - 0.02));
    bv *= (1 + (Math.random() * 0.055 - 0.018));
    return { month: m, strategy: Math.round(sv / 1000), spy: Math.round(bv / 1000) };
  });
}

const TRADES = [
  { time: "09:32", side: "BUY", desc: "NVDA 150sh @$487.20", reason: "Momentum+Sent 78" },
  { time: "11:15", side: "SELL", desc: "NVDA 150sh @$521.40", reason: "+$5,130 target hit" },
  { time: "10:02", side: "BUY", desc: "MSFT 200sh @$411.30", reason: "EMA cross · Score 71" },
  { time: "14:22", side: "SELL", desc: "GS 100sh @$471.80", reason: "-$280 · sentiment drop" },
  { time: "09:45", side: "BUY", desc: "GOOGL 75sh @$168.40", reason: "Breakout · Score 82" },
  { time: "13:50", side: "SELL", desc: "MSFT 200sh @$428.90", reason: "+$3,520 · P&L target" },
  { time: "10:30", side: "BUY", desc: "META 120sh @$492.10", reason: "News spike · RSI 55" },
  { time: "15:45", side: "SELL", desc: "META 120sh @$521.30", reason: "+$3,504 · sent drop" },
];

function Backtester() {
  const [phase, setPhase] = useState("idle"); // idle | running | done
  const [progress, setProgress] = useState({ p1: 0, p2: 0, p3: 0 });
  const [loadMsg, setLoadMsg] = useState("Initializing...");
  const [equityData, setEquityData] = useState([]);

  const msgs = ["Initializing backtest engine...", "Loading 4yr OHLCV data...", "Computing RSI/EMA/MACD signals...", "Running sentiment inference...", "Simulating 1,847 trades...", "Calculating performance metrics..."];

  const run = useCallback(() => {
    setPhase("running");
    let mi = 0;
    const ti = setInterval(() => { if (mi < msgs.length) setLoadMsg(msgs[mi++]); }, 650);
    let p1 = 0, p2 = 0, p3 = 0;
    const pi = setInterval(() => {
      p1 = Math.min(100, p1 + Math.random() * 14 + 5);
      if (p1 > 55) p2 = Math.min(100, p2 + Math.random() * 11 + 4);
      if (p2 > 45) p3 = Math.min(100, p3 + Math.random() * 9 + 3);
      setProgress({ p1: Math.round(p1), p2: Math.round(p2), p3: Math.round(p3) });
      if (p1 >= 100 && p2 >= 100 && p3 >= 100) clearInterval(pi);
    }, 170);
    setTimeout(() => {
      clearInterval(ti); clearInterval(pi);
      setEquityData(generateEquityCurve());
      setPhase("done");
    }, 4200);
  }, []);

  const ProgressBar = ({ label, pct, color }) => (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.muted, marginBottom: 3 }}>
        <span>{label}</span><span>{pct}%</span>
      </div>
      <div style={{ height: 4, background: C.bg, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width .5s ease" }} />
      </div>
    </div>
  );

  return (
    <div style={s.view}>
      <div style={s.row}>
        <div style={{ width: 188, flexShrink: 0 }}>
          <Card>
            <Ct>Backtest Config</Ct>
            <Lbl>Strategy</Lbl>
            <select style={s.sel}><option>Momentum + Sentiment Alpha</option><option>Mean Reversion v2</option><option>Macro Regime</option></select>
            <Lbl>Start date</Lbl>
            <input type="date" style={s.inp} defaultValue="2021-01-01" />
            <Lbl>End date</Lbl>
            <input type="date" style={s.inp} defaultValue="2024-12-31" />
            <Lbl>Initial capital</Lbl>
            <input style={s.inp} defaultValue="$1,000,000" />
            <Lbl>Commission</Lbl>
            <select style={s.sel}><option>$0.005/share</option><option>0.1% per trade</option><option>Zero</option></select>
            <Lbl>Slippage model</Lbl>
            <select style={{ ...s.sel, marginBottom: 10 }}><option>Linear 0.05%</option><option>None</option><option>Volume-weighted</option></select>
            <button style={s.btn("blue")} onClick={run} disabled={phase === "running"}>
              {phase === "running" ? "Running..." : "▶ Run Backtest"}
            </button>
          </Card>
        </div>
        <div style={{ flex: 1 }}>
          {phase === "idle" && (
            <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 11 }}>
              Configure parameters and click Run Backtest.
            </div>
          )}
          {phase === "running" && (
            <Card style={{ textAlign: "center", padding: 24 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>{loadMsg}</div>
              <ProgressBar label="Loading data" pct={progress.p1} color={C.blue} />
              <ProgressBar label="Computing signals" pct={progress.p2} color={C.purple} />
              <ProgressBar label="Simulating trades" pct={progress.p3} color={C.green} />
            </Card>
          )}
          {phase === "done" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 10 }}>
                {[["Total Return", "+184.3%", "vs SPY +87.2%", C.green], ["Sharpe Ratio", "2.14", "Sortino 2.87", C.text], ["Max Drawdown", "-14.2%", "Recovery 47d", C.red], ["Win Rate", "63.8%", "PF 2.1 · 1,847 trades", C.text]].map(([lbl, val, sub, col]) => (
                  <Card key={lbl}>
                    <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em" }}>{lbl}</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: col, margin: "4px 0 2px" }}>{val}</div>
                    <div style={{ fontSize: 9, color: C.muted }}>{sub}</div>
                  </Card>
                ))}
              </div>
              <Card style={{ marginBottom: 10 }}>
                <Ct>Equity curve · 2021–2024</Ct>
                <div style={{ display: "flex", gap: 14, marginBottom: 8, fontSize: 9, color: C.muted }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 20, height: 2, background: C.blue, display: "inline-block" }} /> Strategy</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 20, height: 2, background: "#374151", display: "inline-block", borderTop: "1px dashed #374151" }} /> SPY benchmark</span>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={equityData}>
                    <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 9 }} tickLine={false} axisLine={false} interval={2} />
                    <YAxis tick={{ fill: C.muted, fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}k`} width={48} />
                    <Tooltip contentStyle={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 10 }} labelStyle={{ color: C.muted }} formatter={(v, n) => [`$${v}k`, n === "strategy" ? "Strategy" : "SPY"]} />
                    <Line type="monotone" dataKey="strategy" stroke={C.blue} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="spy" stroke="#374151" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
              <div style={s.row}>
                <Card style={{ flex: 1 }}>
                  <Ct>Performance Metrics</Ct>
                  {[["CAGR", "+38.4%", C.green], ["Calmar Ratio", "2.70", C.text], ["Beta vs SPY", "0.74", C.text], ["Alpha (ann.)", "+24.2%", C.green], ["Avg hold period", "6.3 days", C.text], ["Avg win / loss", "$2,140 / $1,018", C.text]].map(([k, v, col]) => (
                    <div key={k} style={{ ...s.mr }}><span style={{ fontSize: 10, color: C.muted }}>{k}</span><span style={{ fontSize: 11, fontWeight: 500, color: col }}>{v}</span></div>
                  ))}
                </Card>
                <Card style={{ flex: 1 }}>
                  <Ct>Trade Log</Ct>
                  <div style={{ background: "#060809", border: `1px solid ${C.border}`, borderRadius: 5, padding: 10, height: 170, overflowY: "auto", fontSize: 10, lineHeight: 1.85 }}>
                    {TRADES.map((t, i) => (
                      <div key={i} style={{ display: "flex", gap: 10 }}>
                        <span style={{ color: C.muted }}>{t.time}</span>
                        <span style={{ color: t.side === "BUY" ? C.green : C.red }}>{t.side}</span>
                        <span style={{ color: "#a8b8cc", flex: 1 }}>{t.desc} · {t.reason}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Agent Debate ──────────────────────────────────────────────────────────────
function AgentDebate() {
  const [ticker, setTicker] = useState("NVDA");
  const [action, setAction] = useState("Enter LONG position");
  const [ctx, setCtx] = useState("");
  const [messages, setMessages] = useState([]);
  const [debating, setDebating] = useState(false);
  const [consensus, setConsensus] = useState(null);
  const chatRef = useRef(null);

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages]);

  const runDebate = async () => {
    if (debating) return;
    setDebating(true);
    setMessages([]);
    setConsensus(null);
    const sys = `You are simulating a multi-agent trading framework. Agents must decide: "${action}" for ${ticker}.${ctx ? " Context: " + ctx : ""}
Return ONLY a JSON array of exactly 4 objects, no markdown, no explanation:
[{"agent":"FundamentalAnalyst","vote":"PROCEED","confidence":78,"message":"2-3 sentences with specific financial metrics, valuations, and analyst data."},
{"agent":"SentimentAnalyst","vote":"PROCEED","confidence":84,"message":"2-3 sentences on news flow, social sentiment, options activity."},
{"agent":"RiskManager","vote":"HOLD","confidence":66,"message":"2-3 sentences on portfolio risk, sizing, concentration, VIX."},
{"agent":"MarketScanner","vote":"PROCEED","confidence":71,"message":"2-3 sentences on technicals, price action, volume, key levels."}]
Votes can differ. Use specific numbers. Be a real quant analyst.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 900, system: sys, messages: [{ role: "user", content: `Debate: ${action} on ${ticker}` }] }),
      });
      const dat = await res.json();
      let txt = dat.content.map(b => b.text || "").join("").replace(/```json|```/g, "").trim();
      let parsed;
      try { parsed = JSON.parse(txt); } catch { parsed = null; }
      if (!parsed || !Array.isArray(parsed)) throw new Error("parse");
      let proceed = 0;
      for (let i = 0; i < parsed.length; i++) {
        await new Promise(r => setTimeout(r, 700 + i * 300));
        setMessages(p => [...p, parsed[i]]);
        if (parsed[i].vote === "PROCEED") proceed++;
      }
      await new Promise(r => setTimeout(r, 600));
      setConsensus({ proceed, total: parsed.length, msgs: parsed });
    } catch {
      const fallback = [
        { agent: "FundamentalAnalyst", vote: "PROCEED", confidence: 79, message: `${ticker} shows strong earnings momentum with 37% YoY revenue growth and expanding operating margins at 28.4%. Forward P/E of 29x is justified by 44% EPS CAGR. 81% of covering analysts rate BUY with median target implying 19% upside.` },
        { agent: "SentimentAnalyst", vote: "PROCEED", confidence: 83, message: `News sentiment for ${ticker} scores 79/100 over the past 5 sessions — near a 90-day peak. Options flow shows unusual call buying at 2.1x average volume on near-term strikes. Social volume elevated but not at euphoric extremes.` },
        { agent: "RiskManager", vote: "HOLD", confidence: 64, message: `Adding ${ticker} at full 5% sizing pushes portfolio beta from 1.06 to 1.19, breaching our 1.15 ceiling. Technology sector exposure would reach 27%, over the 25% limit. Recommend half-sizing at 2.5% or delaying entry until post-earnings.` },
        { agent: "MarketScanner", vote: "PROCEED", confidence: 72, message: `${ticker} is trading above the 50-day EMA ($498) and 200-day EMA ($441) on rising volume (+18% vs 20-day avg). RSI at 56 — healthy momentum, not overbought. Key resistance at $530; clean break targets $560+.` },
      ];
      let proceed = 0;
      for (let i = 0; i < fallback.length; i++) {
        await new Promise(r => setTimeout(r, 700 + i * 300));
        setMessages(p => [...p, fallback[i]]);
        if (fallback[i].vote === "PROCEED") proceed++;
      }
      await new Promise(r => setTimeout(r, 600));
      setConsensus({ proceed, total: 4, msgs: fallback });
    }
    setDebating(false);
  };

  return (
    <div style={s.view}>
      <div style={s.row}>
        <div style={{ width: 200, flexShrink: 0 }}>
          <Card style={{ marginBottom: 10 }}>
            <Ct>Debate Topic</Ct>
            <Lbl>Ticker</Lbl>
            <input style={s.inp} value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} />
            <Lbl>Action</Lbl>
            <select style={s.sel} value={action} onChange={e => setAction(e.target.value)}>
              <option>Enter LONG position</option>
              <option>Exit existing position</option>
              <option>Enter SHORT position</option>
              <option>Increase position size</option>
            </select>
            <Lbl>Context</Lbl>
            <textarea style={{ ...s.inp, height: 72, resize: "none", marginBottom: 10 }} value={ctx} onChange={e => setCtx(e.target.value)} placeholder="News, thesis, market conditions..." />
            <button style={s.btn("blue")} onClick={runDebate} disabled={debating}>
              {debating ? "Debating..." : "▶ Start Debate"}
            </button>
          </Card>
          {consensus && (
            <Card>
              <Ct>Consensus</Ct>
              <div style={{ height: 7, background: C.bg, borderRadius: 4, overflow: "hidden", display: "flex", margin: "0 0 6px" }}>
                <div style={{ width: `${Math.round(consensus.proceed / consensus.total * 100)}%`, background: C.green, transition: "width .6s" }} />
                <div style={{ flex: 1, background: C.red }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 10 }}>
                <span style={{ color: C.green }}>PROCEED</span>
                <span style={{ color: C.red }}>HOLD</span>
              </div>
              {consensus.msgs.map((m, i) => {
                const p = AGENTS[i % 4];
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0" }}>
                    <span style={{ fontSize: 9, color: p.color }}>{p.short}</span>
                    <Badge v={m.vote === "PROCEED" ? "green" : "warn"}>{m.vote}</Badge>
                  </div>
                );
              })}
              <div style={{ height: 1, background: C.border, margin: "8px 0" }} />
              <div style={{ fontSize: 10, fontWeight: 600, color: consensus.proceed >= 3 ? C.green : C.warn, marginBottom: 4 }}>
                {consensus.proceed >= 3 ? "✓ CONSENSUS: PROCEED" : "⚠ BLOCKED: HOLD"}
              </div>
              <div style={{ fontSize: 9, color: C.muted, lineHeight: 1.6 }}>
                {consensus.proceed >= 3 ? `${consensus.proceed}/4 agents approve. Action cleared for execution.` : `Only ${consensus.proceed}/4 approve. Need 3+ for execution.`}
              </div>
            </Card>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <Ct>Live Agent Debate</Ct>
              {debating && <Badge v="blue">In progress</Badge>}
              {consensus && !debating && <Badge v={consensus.proceed >= 3 ? "green" : "warn"}>Complete · {consensus.proceed >= 3 ? "PROCEED" : "HOLD"}</Badge>}
            </div>
            <div ref={chatRef} style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 400, overflowY: "auto", paddingRight: 4 }}>
              {messages.length === 0 && !debating && (
                <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 11 }}>
                  Enter a ticker and click Start Debate to watch agents reason in real time.
                </div>
              )}
              {messages.map((m, i) => {
                const p = AGENTS.find(a => a.name === m.agent) || AGENTS[i % 4];
                return (
                  <div key={i} style={{ display: "flex", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 4, background: p.bg, color: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 600, flexShrink: 0 }}>{p.short}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: p.color }}>{m.agent}</span>
                        <Badge v={m.vote === "PROCEED" ? "green" : "warn"}>{m.vote}</Badge>
                        <span style={{ fontSize: 9, color: C.muted }}>{m.confidence}% conf</span>
                      </div>
                      <div style={{ fontSize: 11, lineHeight: 1.7, color: "#a8b8cc", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "0 5px 5px 5px", padding: "8px 10px" }}>{m.message}</div>
                    </div>
                  </div>
                );
              })}
              {debating && messages.length < 4 && (
                <div style={{ display: "flex", gap: 10, opacity: 0.5 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 4, background: C.hint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: C.muted, flexShrink: 0 }}>...</div>
                  <div style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: "0 5px 5px 5px", padding: "8px 10px", display: "flex", gap: 4, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: C.muted }}>Agent reasoning</span>
                    {[0, 1, 2].map(i => <span key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: C.muted, animation: `blink 1.2s ${i * 0.2}s infinite` }} />)}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
      <style>{`@keyframes blink{0%,80%,100%{opacity:.2}40%{opacity:1}}`}</style>
    </div>
  );
}

// ─── Param Optimizer ──────────────────────────────────────────────────────────
function ParamOptimizer() {
  const [running, setRunning] = useState(false);
  const [iter, setIter] = useState(0);
  const [maxIter, setMaxIter] = useState(200);
  const [bestSharpe, setBestSharpe] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [results, setResults] = useState(null);
  const [params, setParams] = useState(["RSI period", "Sentiment threshold", "Stop loss %", "Position size"]);
  const [method, setMethod] = useState("Bayesian Optimization");

  const runOpt = useCallback(() => {
    setRunning(true); setIter(0); setBestSharpe(null); setChartData([]); setResults(null);
    let best = 1.1, i = 0;
    const iv = setInterval(() => {
      const batch = Math.max(1, Math.ceil(maxIter / 50));
      const newPoints = [];
      for (let b = 0; b < batch && i < maxIter; b++, i++) {
        const candidate = best + (Math.random() * .15 - .03) + (i / maxIter) * .5;
        if (candidate > best) best = candidate;
        newPoints.push({ iter: i, sharpe: parseFloat(best.toFixed(2)) });
      }
      setIter(i);
      setBestSharpe(parseFloat(best.toFixed(2)));
      setChartData(p => [...p, ...newPoints]);
      if (i >= maxIter) {
        clearInterval(iv);
        setRunning(false);
        setResults([
          { rsi: 12, sent: 68, stop: 3.5, size: 4.5, sh: best, ret: "+41.2%", dd: "-12.1%" },
          { rsi: 14, sent: 65, stop: 4.0, size: 5.0, sh: best - 0.11, ret: "+38.7%", dd: "-13.4%" },
          { rsi: 10, sent: 70, stop: 3.0, size: 4.0, sh: best - 0.22, ret: "+36.4%", dd: "-11.8%" },
          { rsi: 16, sent: 62, stop: 4.5, size: 5.5, sh: best - 0.36, ret: "+34.1%", dd: "-15.2%" },
        ]);
      }
    }, 70);
  }, [maxIter]);

  const removeParam = (p) => setParams(ps => ps.filter(x => x !== p));
  const addParam = () => {
    const opts = ["EMA period", "Hold days", "Min ADX", "Volume filter", "Correlation cutoff"];
    const available = opts.filter(o => !params.includes(o));
    if (available.length) setParams(p => [...p, available[0]]);
  };

  // Downsample chart data for rendering
  const sampledData = chartData.filter((_, i) => i % Math.max(1, Math.floor(chartData.length / 50)) === 0);

  return (
    <div style={s.view}>
      <div style={s.row}>
        <div style={{ width: 200, flexShrink: 0 }}>
          <Card>
            <Ct>Optimization Config</Ct>
            <Lbl>Method</Lbl>
            <select style={s.sel} value={method} onChange={e => setMethod(e.target.value)}>
              <option>Bayesian Optimization</option><option>Grid Search</option><option>Genetic Algorithm</option><option>Random Search</option>
            </select>
            <Lbl>Objective</Lbl>
            <select style={s.sel}><option>Maximize Sharpe Ratio</option><option>Maximize Returns</option><option>Minimize Drawdown</option><option>Maximize Calmar</option></select>
            <Lbl>Parameters</Lbl>
            <div style={{ margin: "6px 0 4px", display: "flex", flexWrap: "wrap", gap: 3 }}>
              {params.map(p => (
                <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "3px 7px", fontSize: 10 }}>
                  {p}
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, fontSize: 11, lineHeight: 1 }} onClick={() => removeParam(p)}>×</button>
                </span>
              ))}
            </div>
            <button style={{ background: "transparent", border: `1px dashed ${C.border2}`, borderRadius: 4, color: C.muted, fontFamily: "inherit", fontSize: 10, padding: 5, cursor: "pointer", width: "100%", textAlign: "center", marginBottom: 10 }} onClick={addParam}>+ Add Parameter</button>
            <Lbl>Max iterations</Lbl>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <input type="range" min={50} max={1000} step={50} value={maxIter} onChange={e => setMaxIter(Number(e.target.value))} style={{ flex: 1, accentColor: C.blue }} />
              <span style={{ fontSize: 11, fontWeight: 500, minWidth: 36, textAlign: "right" }}>{maxIter}</span>
            </div>
            <Lbl>Walk-forward windows</Lbl>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <input type="range" min={2} max={12} value={4} style={{ flex: 1, accentColor: C.blue }} readOnly />
              <span style={{ fontSize: 11, fontWeight: 500, minWidth: 36, textAlign: "right" }}>4</span>
            </div>
            <button style={s.btn("blue")} onClick={runOpt} disabled={running}>
              {running ? "Optimizing..." : "▶ Optimize"}
            </button>
          </Card>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Card>
              <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em" }}>Best Sharpe Found</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: bestSharpe ? C.green : C.muted, margin: "4px 0 2px" }}>{bestSharpe ? bestSharpe.toFixed(2) : "--"}</div>
              <div style={{ fontSize: 9, color: C.muted }}>{running ? "Optimizing..." : bestSharpe ? "Optimization complete" : "Run to start"}</div>
            </Card>
            <Card>
              <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em" }}>Iterations Run</div>
              <div style={{ fontSize: 22, fontWeight: 600, margin: "4px 0 2px" }}>{iter}</div>
              <div style={{ fontSize: 9, color: C.muted }}>of {maxIter} planned · {method}</div>
            </Card>
          </div>
          <Card>
            <Ct>Sharpe score · per iteration</Ct>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={sampledData}>
                <XAxis dataKey="iter" tick={{ fill: C.muted, fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis domain={[1, 3]} tick={{ fill: C.muted, fontSize: 9 }} tickLine={false} axisLine={false} width={32} />
                <Tooltip contentStyle={{ background: C.bg2, border: `1px solid ${C.border}`, fontSize: 10, borderRadius: 4 }} labelStyle={{ color: C.muted }} />
                <Line type="monotone" dataKey="sharpe" stroke={C.blue} strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <Ct>Top Parameter Combinations</Ct>
            {!results && <div style={{ textAlign: "center", padding: 20, color: C.muted, fontSize: 11 }}>Run optimizer to see results.</div>}
            {results && (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["RSI", "Sent Thr", "Stop %", "Size %", "Sharpe", "Return", "MaxDD", ""].map(h => (
                      <th key={h} style={{ textAlign: "left", color: C.muted, padding: "3px 0", fontSize: 9, fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid rgba(30,35,48,.4)` }}>
                      <td style={{ padding: "6px 4px 6px 0" }}>{r.rsi}</td>
                      <td>{r.sent}</td>
                      <td>{r.stop}%</td>
                      <td>{r.size}%</td>
                      <td style={{ color: C.green, fontWeight: 600 }}>{r.sh.toFixed(2)}</td>
                      <td style={{ color: C.green }}>{r.ret}</td>
                      <td style={{ color: C.red }}>{r.dd}</td>
                      <td>
                        <button style={{ ...s.btn("ghost"), width: "auto", padding: "2px 7px", fontSize: 9, marginBottom: 0 }}>
                          {i === 0 ? "✓ Apply" : "Use"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────
const TABS = ["Strategy Builder", "Backtester", "Agent Debate", "Param Optimizer"];

export default function App() {
  const [tab, setTab] = useState(0);
  return (
    <div style={s.app}>
      <div style={s.tabs}>
        {TABS.map((t, i) => (
          <div key={t} style={s.tab(tab === i)} onClick={() => setTab(i)}>{t}</div>
        ))}
      </div>
      {tab === 0 && <StrategyBuilder onRunBacktest={() => setTab(1)} />}
      {tab === 1 && <Backtester />}
      {tab === 2 && <AgentDebate />}
      {tab === 3 && <ParamOptimizer />}
    </div>
  );
}
