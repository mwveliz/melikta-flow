const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const { execSync } = require('child_process');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const QUEUE_NAME = 'flow-melikta-queue';

const connection = new IORedis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null,
});

const relayQueue = new Queue(QUEUE_NAME, { connection });

// Concurrency strictly locked to 1 to prevent sequenceNumber collisions on key
const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const { dispatchId, service, latencyMs } = job.data;
    console.log(`[Worker] Consuming job ${dispatchId} for service ${service}...`);

    try {
      const cmd = `flow transactions send ../cadence/transactions/record_dispatch.cdc "${dispatchId}" "${service}" ${latencyMs} --signer emulator-account --network emulator --config-path ../flow.json`;
      execSync(cmd, { stdio: 'pipe' });
      console.log(`[Worker] Transaction sealed on Flow for ${dispatchId}`);
    } catch (err) {
      console.error(`[Worker] Execution failed: ${err.message}`);
      throw err;
    }
  },
  {
    connection,
    concurrency: 1,
  }
);

// Inject mock traffic for demonstration
async function bootstrapSimulation() {
  console.log('[Producer] Injecting 5 concurrent telemetry payloads...');
  for (let i = 1; i <= 5; i++) {
    const latency = Math.floor(Math.random() * 80) + 20;
    await relayQueue.add('dispatchTx', {
      dispatchId: `DISPATCH-${Date.now()}-${i}`,
      service: `Access-Node-RPC-0${i}`,
      latencyMs: latency,
    });
  }
}

bootstrapSimulation();