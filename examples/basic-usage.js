import SyncWorkClaude from '../src/index.js';

/**
 * Basic usage example for Sync-Work-Claude
 */

async function main() {
  // Create instance with configuration
  const sync = new SyncWorkClaude({
    projectRoot: process.cwd(),
    agentId: process.env.AGENT_ID || 'agent-1',
    syncInterval: 30000,
    heartbeatInterval: 10000
  });

  // Initialize the system
  console.log('Initializing...');
  await sync.initialize();

  // Add some tasks
  console.log('\nAdding tasks...');
  await sync.addTask('Implement user registration form', {
    priority: 'high',
    estimatedTime: '2 hours'
  });

  await sync.addTask('Write unit tests for authentication', {
    priority: 'medium',
    estimatedTime: '1 hour'
  });

  await sync.addTask('Update API documentation', {
    priority: 'low',
    estimatedTime: '30 minutes'
  });

  // Check status
  console.log('\nCurrent status:');
  const status = await sync.getStatus();
  console.log(JSON.stringify(status, null, 2));

  // List all tasks
  console.log('\nAll tasks:');
  const tasks = await sync.listTasks();
  tasks.forEach(task => {
    console.log(`  [${task.status}] ${task.description}`);
  });

  // Process a task
  console.log('\nProcessing next task...');
  const task = await sync.processNextTask();

  if (task) {
    console.log(`Working on: ${task.description}`);

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Complete the task
    await sync.completeTask({
      success: true,
      filesModified: ['src/auth/register.js', 'src/auth/register.test.js'],
      linesAdded: 150,
      linesRemoved: 20
    });

    console.log('Task completed!');
  }

  // Example: Using file locks
  console.log('\nDemonstrating file lock...');
  await sync.withFileLock('workspace/shared-file.js', async () => {
    console.log('  Lock acquired for shared-file.js');
    // Simulate file editing
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('  File edited, lock will be released');
  });

  console.log('\nExample complete!');
}

// Run the example
main().catch(console.error);
