# DTP Marketplace

A browser-based simulation of the [Direct Trade Protocol](https://github.com/runquik/direct-trade-protocol) — direct B2B food commodity trading that eliminates broker fees, freight markups, and net-30 payment delays.

**Not a real exchange. Not real money.** Just the protocol in action, so you can see what it actually saves.

## What it does

- Create a mock trading org (buyer, seller, or both)
- Start with **$10,000 in play money**
- Browse a live orderbook of 200 food commodity offers (produce, frozen, dairy, meat, grains, beverages)
- Get **real freight quotes** using actual road distances (Zippopotam + OSRM APIs)
- Execute trades and see **exactly what you save** vs legacy brokered trade — broken down line by line
- Your account, inventory, and trade history persist across sessions (localStorage)

## The savings math

Every matched trade shows a side-by-side cost comparison:

| Cost component | Legacy brokered | DTP direct |
|---|---|---|
| Unit price | same | same |
| Broker commission | +8% | none |
| Freight markup | +20% | none |
| Net-30 capital cost | +1.93% (7% APR × 30d) | none |
| **Landed cost** | **~28–30% higher** | **your actual cost** |

Typical savings: **22–28% of landed cost** per trade. Cycle time: DTP settles in <24h vs. net-30 (18 days faster on average).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4
- Framer Motion
- Recharts
- Real freight APIs: [Zippopotam.us](https://api.zippopotam.us) + [OSRM](https://project-osrm.org/)
- localStorage for persistence (no backend, no auth)

## Protocol repo

The underlying smart contract (NEAR Protocol, Rust):
**[github.com/runquik/direct-trade-protocol](https://github.com/runquik/direct-trade-protocol)**

## Contributing

Issues and PRs welcome. This is an early-stage public prototype — the goal is to show what direct food trade can look like, not to build a product that extracts margin from it.
