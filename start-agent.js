import SyncWorkClaude from './src/index.js';

console.log('Starting agent...');

const sync = new SyncWorkClaude();

await sync.initialize();
await sync.start();

console.log('Agent started successfully!');
console.log('Press Ctrl+C to stop');

// Keep process alive
process.stdin.resume();
