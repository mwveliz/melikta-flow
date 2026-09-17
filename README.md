# Melikta 

> **Asynchronous Transaction Relay, Sequence Queue & Infrastructure Beacon on Flow**

**Explore the live landing page:** https://mwveliz.github.io/melikta-flow/

Melikta decouples high-frequency telemetry and user intents from blockchain settlement. It eliminates sequence number (nonce) collisions on signing accounts using a serialized in-memory queue (BullMQ + Redis) while providing a gasless, client-side dashboard powered by FCL and Cadence scripts.

---

## Architecture Overview

```text
[ Client Requests / Telemetry Ping ]
                 │
                 ▼
     [ Redis (BullMQ Queue) ]
                 │
         (Concurrency: 1)
                 ▼
       [ Node.js Worker ] ──(CLI / KMS Signer)──► [ Flow Blockchain ]
                                                        │
[ Vite / React Dashboard (GitHub Pages) ] ◄──(FCL Script)─┘
```

---

## Prerequisites

Ensure you have the following installed locally:
* **Flow CLI:** `sh -ci "$(curl -fsSL https://raw.githubusercontent.com/onflow/flow-cli/master/install.sh)"`
* **Docker & Docker Compose:** For running the Redis container.
* **Node.js (v18+):** For the worker daemon and React frontend.

---

## Quickstart Guide

### 1. Clone & Setup Configuration
```bash
git clone https://github.com/<your-username>/melikta.git
cd melikta-flow
flow init
```

When prompted, leave the project name blank and choose **Basic Cadence project**.
The command creates `flow.json` in the repository root. Run Flow CLI commands
from this directory, or pass `--config-path ../flow.json` when running them from
`worker/`.

### 2. Start the Local Infrastructure
Open two terminal tabs:

**Tab 1 (Flow Emulator):**
```bash
flow emulator start
```
The emulator uses the address configured in `flow.json` (`127.0.0.1:3569`).
If it is already running, leave it running and use another terminal.

**Tab 2 (Redis Queue):**
```bash
docker compose up -d
```

### 3. Deploy Cadence Contract
Deploy the `Melikta` contract to the local emulator account:
```bash
flow project deploy --network emulator
```

You can verify the account and emulator connection with:
```bash
flow accounts list --config-path ./flow.json --network emulator
```

### 4. Run the Worker (Queue Consumer & Producer)
Install dependencies and run the transaction dispatcher:
```bash
cd worker
npm install
npm start
```
The worker uses `../flow.json` explicitly, pushes 5 mock telemetry jobs to Redis,
and serializes execution to the emulator without nonce collisions.

### 5. Start the Web Dashboard
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` to view real-time on-chain dispatches queried directly via FCL scripts.

---

## Production Deployment (GitHub Pages)

To publish the read-only dashboard to GitHub Pages:

1. Update `frontend/src/App.tsx` with your target network (e.g., `access.testnet.nodes.onflow.org:9000`).
2. Run:
```bash
cd frontend
npm run deploy
```

---

## Common Commands Reference

| Action | Command |
| :--- | :--- |
| **Inspect Redis Queue** | `docker exec -it melikta-redis redis-cli monitor` |
| **Query Dispatches via CLI** | `flow scripts execute cadence/scripts/get_all_dispatches.cdc --network emulator` |
| **Check emulator account** | `flow accounts list --config-path ./flow.json --network emulator` |
| **Kill Lingering Flow Process** | `pkill -f flow` or `fuser -k 3569/tcp` |
| **Re-deploy Contract** | `flow project deploy --network emulator --update` |

### Troubleshooting

If Flow reports `missing configuration`, check that `flow.json` exists in the
repository root. From the root use `--config-path ./flow.json`; from `worker/`
use `--config-path ../flow.json`.

If Docker reports that AppArmor cannot load `docker-default`, install the parser
and restart Docker:
```bash
sudo apt update
sudo apt install -y apparmor apparmor-utils
sudo systemctl enable --now apparmor
sudo systemctl restart docker
```
