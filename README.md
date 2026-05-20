# NEXUS · Multi-Agent LLM Trading Framework to create a new line Live Demo: https://nexus-tradin.netlify.app

A full-stack financial research and execution framework that combines AI analyst agents, sentiment models, portfolio reasoning, and provider integrations into a single trading stack.

![NEXUS Dashboard](https://img.shields.io/badge/status-alpha-blue) ![React](https://img.shields.io/badge/React-18-blue) ![Claude](https://img.shields.io/badge/Powered%20by-Claude%20Sonnet-purple)

---

## What's inside

| Module | Description |
|---|---|
| **Dashboard** | Live portfolio overview, agent status, signal feed, execution log |
| **Strategy Builder** | Visual no-code editor for entry/exit conditions with AI agent gates |
| **Backtester** | 4-year simulation with equity curve, Sharpe, Calmar, trade log |
| **Agent Debate** | 4 agents (Fundamental, Sentiment, Risk, Market) debate any trade via Claude API |
| **Param Optimizer** | Bayesian / Grid search across strategy parameters with live Sharpe chart |
| **Research Agent** | Natural language research queries answered by Claude with quant context |

## Agent Pipeline

```
MarketScanner
     │
     ├── FundamentalAnalyst ──┐
     │                        ├── RiskManager ── PortfolioOptimizer ── ExecutionAgent
     └── SentimentAnalyst ───┘
```

Orchestration: parallel fan-out → weighted consensus voting → sequential risk check → execution.  
Minimum **3/4 agents** must vote PROCEED for a trade to execute.

## Quick start

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/nexus-trading.git
cd nexus-trading

# 2. Install
npm install

# 3. Set your API key
cp .env.example .env
# Edit .env and add your VITE_ANTHROPIC_API_KEY

# 4. Run
npm run dev
# → http://localhost:3000
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | Yes | Claude API key from [console.anthropic.com](https://console.anthropic.com) |
| `VITE_POLYGON_API_KEY` | Optional | Real-time market data |
| `VITE_NEWS_API_KEY` | Optional | News sentiment feed |

## Tech stack

- **Frontend** — React 18 + Vite
- **Charts** — Recharts
- **AI** — Anthropic Claude Sonnet (`claude-sonnet-4-20250514`)
- **Styling** — Pure CSS-in-JS (no Tailwind dependency)
- **Data** — Polygon.io (market), NewsAPI (sentiment), SEC EDGAR (fundamentals)

## Roadmap

- [ ] Live IBKR execution via TWS API
- [ ] Real Polygon.io market data integration
- [ ] Persistent strategy storage (Supabase)
- [ ] Multi-user team workspace
- [ ] Webhook alerts (Slack, email)
- [ ] Next.js migration for server-side agent orchestration

## License

MIT
