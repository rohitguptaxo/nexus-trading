# NEXUS · Multi-Agent LLM Trading Framework

A full-stack financial research and execution framework combining AI analyst agents, sentiment models, portfolio reasoning, and provider integrations into a single trading stack.

Live Demo: https://nexus-tradin.netlify.app

## Quick start

git clone https://github.com/rohitguptaxo/nexus-trading.git
cd nexus-trading
npm install
npm run dev

## Environment variables

| Variable | Required | Description |
|---|---|---|
| VITE_ANTHROPIC_API_KEY | Yes | Claude API key — powers all 6 agents, debate, and research |
| VITE_POLYGON_API_KEY | Coming soon | Real-time market data integration |
| VITE_NEWS_API_KEY | Coming soon | News sentiment feed integration |

## Tech stack

- React 18 + Vite
- Recharts
- Anthropic Claude Sonnet
- Deployed on Netlify