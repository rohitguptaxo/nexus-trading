const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL   = 'claude-sonnet-4-20250514'

/**
 * Core fetch wrapper for the Anthropic Messages API.
 * The API key is injected via the Anthropic proxy when running on claude.ai;
 * in your own environment set VITE_ANTHROPIC_API_KEY in .env
 */
async function callClaude({ system, userMessage, maxTokens = 1000, tools }) {
  const headers = { 'Content-Type': 'application/json' }
  if (import.meta.env.VITE_ANTHROPIC_API_KEY) {
    headers['x-api-key'] = import.meta.env.VITE_ANTHROPIC_API_KEY
    headers['anthropic-version'] = '2023-06-01'
  }

  const body = {
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: userMessage }],
  }
  if (system) body.system = system
  if (tools)  body.tools  = tools

  const res  = await fetch(API_URL, { method: 'POST', headers, body: JSON.stringify(body) })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.content.map(b => b.text ?? '').join('')
}

/* ── Research Agent ─────────────────────────────────────────── */
export async function runResearchAgent(query) {
  const system = `You are a professional quantitative research analyst inside the NEXUS multi-agent trading framework.
You have access to: fundamental analyst models covering 184 stocks, sentiment models processing 6,400 news articles/day,
real-time market data, SEC filings, and social media signals.
Respond concisely in 3–5 paragraphs. Use specific financial metrics. End with a recommendation: LONG / SHORT / NEUTRAL and a conviction score 0–100.`
  return callClaude({ system, userMessage: query })
}

/* ── Agent Debate ───────────────────────────────────────────── */
export async function runAgentDebate({ ticker, action, context }) {
  const system = `You are simulating a multi-agent trading framework debate.
Agents must decide: "${action}" for ${ticker}.${context ? ' Context: ' + context : ''}

Return ONLY a valid JSON array of exactly 4 objects — no markdown, no explanation:
[
  {"agent":"FundamentalAnalyst","vote":"PROCEED","confidence":78,"message":"2-3 sentences with specific financial metrics."},
  {"agent":"SentimentAnalyst","vote":"PROCEED","confidence":84,"message":"2-3 sentences on news/social/options sentiment."},
  {"agent":"RiskManager","vote":"HOLD","confidence":66,"message":"2-3 sentences on portfolio risk and sizing."},
  {"agent":"MarketScanner","vote":"PROCEED","confidence":71,"message":"2-3 sentences on technicals and key price levels."}
]
Votes may differ. Use real-sounding specific numbers. Be a professional quant analyst.`

  const raw  = await callClaude({ system, userMessage: `Debate: ${action} on ${ticker}`, maxTokens: 900 })
  const json = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(json)
}

/* ── Backtest Summary (AI narrative) ───────────────────────── */
export async function runBacktestNarrative({ strategyName, metrics }) {
  const system = `You are a quantitative analyst reviewing backtest results. Write a 2–3 sentence professional summary of the results, highlighting strengths and any concerns. Be specific and concise.`
  const msg = `Strategy: ${strategyName}\nMetrics: ${JSON.stringify(metrics)}`
  return callClaude({ system, userMessage: msg, maxTokens: 300 })
}
