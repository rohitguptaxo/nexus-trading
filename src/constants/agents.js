import { C } from './theme'

export const AGENT_PERSONAS = [
  {
    name: 'FundamentalAnalyst',
    short: 'FA',
    color: C.blue,
    bg: 'rgba(59,130,246,.2)',
    role: 'Equity Research',
    focus: 'earnings, valuation, competitive moats, analyst estimates, SEC filings',
  },
  {
    name: 'SentimentAnalyst',
    short: 'SA',
    color: C.purple,
    bg: 'rgba(139,92,246,.2)',
    role: 'NLP / News',
    focus: 'news flow, social media volume, options sentiment, insider activity',
  },
  {
    name: 'RiskManager',
    short: 'RM',
    color: C.warn,
    bg: 'rgba(245,158,11,.2)',
    role: 'Risk Engine',
    focus: 'portfolio beta, position sizing, drawdown limits, sector concentration',
  },
  {
    name: 'MarketScanner',
    short: 'MS',
    color: C.teal,
    bg: 'rgba(6,182,212,.2)',
    role: 'Surveillance',
    focus: 'technicals, price action, volume, chart patterns, key levels',
  },
]

export const AGENT_STATUSES = {
  IDLE: 'idle',
  RUNNING: 'running',
  WARN: 'warn',
  ERROR: 'error',
}
