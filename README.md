# NEXUS · Multi-Agent LLM Trading Framework

> A production-ready AI trading framework that combines multiple specialized LLM agents, sentiment analysis, portfolio reasoning, and financial research into a single unified trading stack.

🚀 **Live Demo** → [nexus-tradin.netlify.app](https://nexus-tradin.netlify.app)

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite) ![Claude](https://img.shields.io/badge/Claude-Sonnet-8B5CF6) ![Netlify](https://img.shields.io/badge/Deployed-Netlify-00C7B7?logo=netlify) ![License](https://img.shields.io/badge/license-MIT-green)

---

## What is NEXUS?

NEXUS is a multi-agent AI framework designed for financial research and trading decision-making. Instead of relying on a single AI model, it orchestrates **6 specialized agents** — each with a distinct role — that collaborate, debate, and reach consensus before any trade is executed.

Think of it as a virtual trading desk where AI analysts, risk managers, and execution specialists work together in real time, powered by Anthropic's Claude.

---

## How it works

```
MarketScanner (surveillance)
        │
        ├── FundamentalAnalyst ──┐
        │                        ├──▶ RiskManager ──▶ PortfolioOptimizer ──▶ ExecutionAgent
        └── SentimentAnalyst ───┘
```

1. **MarketScanner** continuously watches 2,847+ assets for momentum, gaps, and breakouts
2. **FundamentalAnalyst** evaluates earnings, valuation, SEC filings, and analyst estimates
3. **SentimentAnalyst** processes 6,400+ news articles/day plus social media signals
4. **RiskManager** checks portfolio beta, sector limits, drawdown rules, and VIX conditions
5. **PortfolioOptimizer** runs Sharpe/Sortino optimization and rebalancing logic
6. **ExecutionAgent** routes orders with 99%+ fill rate via broker integrations

> A minimum of **3 out of 4 analyst agents** must vote PROCEED before any trade executes.

---

## Modules

### Strategy Builder
Visual no-code editor to build trading strategies without writing code.
- Define entry and exit conditions using technical indicators (RSI, EMA, MACD, volume)
- Add AI agent gates — e.g. only enter if SentimentAnalyst scores > 65
- Configure position sizing, stop loss, profit targets, and max positions
- Assign which agents participate in each strategy
- Weight signals: momentum (40%), sentiment (35%), fundamental (25%)

### Backtester
Simulate your strategy against 4 years of historical data (2021–2024).
- Animated progress with real-time status updates
- Equity curve chart vs SPY benchmark
- Full performance metrics: Sharpe, Sortino, Calmar, Alpha, Beta, CAGR
- Scrollable trade log showing every simulated execution with reasoning
- Commission and slippage models included

### Agent Debate
The most powerful feature — watch AI agents reason through a trade in real time.
- Enter any ticker and action (Long, Short, Exit, Increase)
- 4 agents each post their analysis sequentially via Claude API
- Each agent votes PROCEED or HOLD with a confidence score
- A consensus panel shows the final verdict (3/4 required to proceed)
- Fully powered by live Claude Sonnet API calls

### Param Optimizer
Find the best parameters for your strategy automatically.
- Methods: Bayesian Optimization, Grid Search, Genetic Algorithm, Random Search
- Optimize for: Sharpe Ratio, Returns, Drawdown, Calmar
- Live chart shows Sharpe score improving across iterations
- Ranked results table with one-click Apply to Strategy Builder
- Walk-forward validation to prevent overfitting

### Research Agent
Ask anything about markets in plain English.
- Powered by Claude with full quant analyst context
- Covers fundamentals, sentiment, macro, competitive analysis
- Returns structured analysis with a specific LONG/SHORT/NEUTRAL recommendation and conviction score

---

## Screenshots

| Dashboard | Agent Debate | Backtester |
|---|---|---|
| Live portfolio overview | 4 agents debate a trade | 4yr equity curve vs SPY |

---

## Quick start

```bash
# 1. Clone the repo
git clone https://github.com/rohitguptaxo/nexus-trading.git
cd nexus-trading

# 2. Install dependencies
npm install

# 3. Add your API key
cp .env.example .env
# Edit .env and set VITE_ANTHROPIC_API_KEY

# 4. Run locally
npm run dev
# → http://localhost:3000

# 5. Build for production
npm run build
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | ✅ Yes | Claude API key — powers all 6 agents, debate, and research. Get one at [console.anthropic.com](https://console.anthropic.com) |
| `VITE_POLYGON_API_KEY` | 🔜 Coming soon | Real-time market data (OHLCV, options chain) |
| `VITE_NEWS_API_KEY` | 🔜 Coming soon | Live news sentiment feed |

---

## Project structure

```
nexus-trading/
├── index.html
├── vite.config.js
├── package.json
├── .env.example
└── src/
    ├── main.jsx                  # React entry point
    ├── App.jsx                   # All UI modules (Strategy, Backtest, Debate, Optimizer)
    ├── api/
    │   └── anthropic.js          # Claude API client (research, debate, narrative)
    ├── constants/
    │   ├── theme.js              # Design tokens and style helpers
    │   └── agents.js             # Agent personas, roles, and focus areas
    └── hooks/
        ├── useAgentDebate.js     # Agent debate state and Claude API orchestration
        └── useBacktester.js      # Backtest simulation logic and progress tracking
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 |
| Charts | Recharts |
| AI / LLM | Anthropic Claude Sonnet (`claude-sonnet-4-20250514`) |
| Styling | CSS-in-JS (no Tailwind dependency) |
| Deployment | Netlify |
| Version control | GitHub |

---

## Roadmap

- [ ] Live IBKR execution via TWS API
- [ ] Real Polygon.io market data integration
- [ ] Persistent strategy storage (Supabase)
- [ ] News sentiment pipeline (NewsAPI + GDELT)
- [ ] Multi-user team workspace
- [ ] Webhook alerts (Slack, email)
- [ ] Mobile responsive layout
- [ ] Next.js migration for server-side agent orchestration
- [ ] Paper trading mode with live P&L tracking

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

---

## License

MIT © [rohitguptaxo](https://github.com/rohitguptaxo)
