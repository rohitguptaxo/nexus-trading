import { useState, useCallback } from 'react'

function generateEquityCurve() {
  const months = ["Jan'21","Apr","Jul","Oct","Jan'22","Apr","Jul","Oct",
                  "Jan'23","Apr","Jul","Oct","Jan'24","Apr","Jul","Oct","Dec"]
  let sv = 1_000_000, bv = 1_000_000
  return months.map(month => {
    sv *= (1 + (Math.random() * 0.09 - 0.02))
    bv *= (1 + (Math.random() * 0.055 - 0.018))
    return { month, strategy: Math.round(sv / 1000), spy: Math.round(bv / 1000) }
  })
}

const LOAD_MESSAGES = [
  'Initializing backtest engine...',
  'Loading 4yr OHLCV data...',
  'Computing RSI / EMA / MACD signals...',
  'Running sentiment model inference...',
  'Simulating 1,847 trades...',
  'Calculating performance metrics...',
]

export const SAMPLE_TRADES = [
  { time:'09:32', side:'BUY',  desc:'NVDA 150sh @$487.20', reason:'Momentum+Sent 78' },
  { time:'11:15', side:'SELL', desc:'NVDA 150sh @$521.40', reason:'+$5,130 target hit' },
  { time:'10:02', side:'BUY',  desc:'MSFT 200sh @$411.30', reason:'EMA cross · Score 71' },
  { time:'14:22', side:'SELL', desc:'GS   100sh @$471.80', reason:'-$280 · sentiment drop' },
  { time:'09:45', side:'BUY',  desc:'GOOGL 75sh @$168.40', reason:'Breakout · Score 82' },
  { time:'13:50', side:'SELL', desc:'MSFT 200sh @$428.90', reason:'+$3,520 · P&L target' },
  { time:'10:30', side:'BUY',  desc:'META 120sh @$492.10', reason:'News spike · RSI 55' },
  { time:'15:45', side:'SELL', desc:'META 120sh @$521.30', reason:'+$3,504 · sent drop' },
]

export function useBacktester() {
  const [phase, setPhase]       = useState('idle')   // idle | running | done
  const [loadMsg, setLoadMsg]   = useState('')
  const [progress, setProgress] = useState({ p1:0, p2:0, p3:0 })
  const [equityData, setEquityData] = useState([])

  const run = useCallback(() => {
    setPhase('running')
    let mi = 0
    const ti = setInterval(() => {
      if (mi < LOAD_MESSAGES.length) setLoadMsg(LOAD_MESSAGES[mi++])
    }, 650)

    let p1 = 0, p2 = 0, p3 = 0
    const pi = setInterval(() => {
      p1 = Math.min(100, p1 + Math.random() * 14 + 5)
      if (p1 > 55) p2 = Math.min(100, p2 + Math.random() * 11 + 4)
      if (p2 > 45) p3 = Math.min(100, p3 + Math.random() * 9 + 3)
      setProgress({ p1: Math.round(p1), p2: Math.round(p2), p3: Math.round(p3) })
      if (p1 >= 100 && p2 >= 100 && p3 >= 100) clearInterval(pi)
    }, 170)

    setTimeout(() => {
      clearInterval(ti)
      clearInterval(pi)
      setProgress({ p1:100, p2:100, p3:100 })
      setEquityData(generateEquityCurve())
      setPhase('done')
    }, 4200)
  }, [])

  return { phase, loadMsg, progress, equityData, run }
}
