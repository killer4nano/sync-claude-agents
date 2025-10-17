import SyncWorkClaude from './src/index.js';

const sync = new SyncWorkClaude();
await sync.initialize();

const task = await sync.addTask("CONNECTION TEST: Agent-2 please respond when you see this");
console.log('Task added:', task);

process.exit(0);
