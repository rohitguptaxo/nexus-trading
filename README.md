# NEXUS · Multi-Agent LLM Trading Framework

A production-ready AI trading framework that combines multiple specialized LLM agents, sentiment analysis, portfolio reasoning, and financial research into a single unified trading stack.

Live Demo: https://nexus-tradin.netlify.app

## What is NEXUS?

NEXUS orchestrates 6 specialized AI agents that collaborate, debate, and reach consensus before any trade executes. Think of it as a virtual trading desk powered by Anthropic Claude.

## Agent Pipeline

MarketScanner → FundamentalAnalyst + SentimentAnalyst → RiskManager → PortfolioOptimizer → ExecutionAgent

Minimum 3/4 agents must vote PROCEED before any trade executes.

## Modules

- Strategy Builder — visual no-code editor for entry/exit conditions with AI agent gates
- Backtester — 4yr simulation with equity curve vs SPY, Sharpe, Calmar, trade log
- Agent Debate — 4 Claude-powered agents debate any trade live with consensus voting
- Param Optimizer — Bayesian/Grid search across strategy parameters with live Sharpe chart
- Research Agent — natural language market queries answered by Claude with quant context

## Quick Start

git clone https://github.com/rohitguptaxo/nexus-trading.git
cd nexus-trading
npm install
cp .env.example .env
npm run dev

## Environment Variables

VITE_ANTHROPIC_API_KEY — Required. Get at console.anthropic.com
VITE_POLYGON_API_KEY — Coming soon
VITE_NEWS_API_KEY — Coming soon

## Tech Stack

React 18, Vite, Recharts, Anthropic Claude Sonnet, Netlify

## License

MIT
