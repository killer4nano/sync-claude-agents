import 'dotenv/config';
import SyncWorkClaude from './src/index.js';

console.log('Starting agent...');
console.log(`Agent ID from .env: ${process.env.AGENT_ID || 'NOT SET - will default to agent-1'}`);

const sync = new SyncWorkClaude();

await sync.initialize();
await sync.start();

console.log('Agent started successfully!');
console.log('Press Ctrl+C to stop');

// Keep process alive
process.stdin.resume();
