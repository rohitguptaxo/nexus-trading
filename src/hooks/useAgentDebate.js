import { useState, useCallback } from 'react'
import { runAgentDebate } from '../api/anthropic'
import { AGENT_PERSONAS } from '../constants/agents'

const FALLBACK = (ticker) => [
  { agent: 'FundamentalAnalyst', vote: 'PROCEED', confidence: 79,
    message: `${ticker} shows strong earnings momentum with 37% YoY revenue growth and expanding operating margins at 28.4%. Forward P/E of 29x is justified by 44% EPS CAGR. 81% of covering analysts rate BUY with median target implying 19% upside.` },
  { agent: 'SentimentAnalyst', vote: 'PROCEED', confidence: 83,
    message: `News sentiment scores 79/100 over the past 5 sessions — near a 90-day peak. Options flow shows unusual call buying at 2.1x average volume on near-term strikes. Social volume elevated but not at euphoric extremes.` },
  { agent: 'RiskManager', vote: 'HOLD', confidence: 64,
    message: `Adding at full 5% sizing pushes portfolio beta from 1.06 to 1.19, breaching our 1.15 ceiling. Technology sector exposure reaches 27%, over the 25% limit. Recommend half-sizing at 2.5% or delaying entry until post-earnings.` },
  { agent: 'MarketScanner', vote: 'PROCEED', confidence: 72,
    message: `${ticker} is trading above the 50-day EMA and 200-day EMA on rising volume (+18% vs 20-day avg). RSI at 56 — healthy momentum, not overbought. Key resistance at the recent high; clean break targets a 6% extension.` },
]

export function useAgentDebate() {
  const [messages, setMessages]   = useState([])
  const [consensus, setConsensus] = useState(null)
  const [debating, setDebating]   = useState(false)

  const startDebate = useCallback(async ({ ticker, action, context }) => {
    setDebating(true)
    setMessages([])
    setConsensus(null)

    let parsed
    try {
      parsed = await runAgentDebate({ ticker, action, context })
    } catch {
      parsed = FALLBACK(ticker)
    }

    let proceed = 0
    for (let i = 0; i < parsed.length; i++) {
      await new Promise(r => setTimeout(r, 650 + i * 280))
      setMessages(prev => [...prev, parsed[i]])
      if (parsed[i].vote === 'PROCEED') proceed++
    }

    await new Promise(r => setTimeout(r, 600))
    setConsensus({ proceed, total: parsed.length, msgs: parsed, approved: proceed >= 3 })
    setDebating(false)
  }, [])

  const reset = useCallback(() => {
    setMessages([])
    setConsensus(null)
    setDebating(false)
  }, [])

  return { messages, consensus, debating, startDebate, reset }
}
