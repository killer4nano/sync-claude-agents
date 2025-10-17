/**
 * Test script to verify sync-work-claude setup
 */

import SyncWorkClaude from './src/index.js';
import fs from 'fs/promises';
import path from 'path';

async function testSetup() {
  console.log('🧪 Testing Sync-Work-Claude Setup...\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Can create instance
  try {
    const sync = new SyncWorkClaude({
      agentId: 'test-agent',
      projectRoot: process.cwd()
    });
    console.log('✓ Can create SyncWorkClaude instance');
    passed++;

    // Test 2: Can initialize
    try {
      await sync.initialize();
      console.log('✓ Can initialize system');
      passed++;

      // Test 3: Can add task
      try {
        const task = await sync.addTask('Test task', { test: true });
        console.log('✓ Can add tasks');
        console.log(`  Task ID: ${task.id}`);
        passed++;

        // Test 4: Can list tasks
        try {
          const tasks = await sync.listTasks();
          console.log('✓ Can list tasks');
          console.log(`  Found ${tasks.length} task(s)`);
          passed++;

          // Test 5: Can get status
          try {
            const status = await sync.getStatus();
            console.log('✓ Can get status');
            console.log(`  Agent: ${status.agent.id}`);
            console.log(`  Status: ${status.agent.status}`);
            passed++;

            // Test 6: State file exists
            try {
              const stateFile = path.join(process.cwd(), '.sync-state.json');
              await fs.access(stateFile);
              console.log('✓ State file created');
              passed++;

              // Test 7: Can process task
              try {
                const nextTask = await sync.processNextTask();
                if (nextTask) {
                  console.log('✓ Can process tasks');
                  console.log(`  Processing: ${nextTask.description}`);
                  passed++;

                  // Test 8: Can complete task
                  try {
                    await sync.completeTask({ test: 'success' });
                    console.log('✓ Can complete tasks');
                    passed++;
                  } catch (error) {
                    console.log('✗ Cannot complete task:', error.message);
                    failed++;
                  }
                } else {
                  console.log('⚠ No task to process (this is okay)');
                }
              } catch (error) {
                console.log('✗ Cannot process task:', error.message);
                failed++;
              }

              // Test 9: File lock system
              try {
                await sync.withFileLock('test-file.txt', async () => {
                  // Simulate some work
                  await new Promise(resolve => setTimeout(resolve, 100));
                });
                console.log('✓ File locking works');
                passed++;
              } catch (error) {
                console.log('✗ File locking failed:', error.message);
                failed++;
              }

              // Test 10: Git integration
              try {
                const gitStatus = await sync.syncEngine.getStatus();
                if (gitStatus) {
                  console.log('✓ Git integration works');
                  console.log(`  Branch: ${gitStatus.current}`);
                  passed++;
                } else {
                  console.log('⚠ Git status unavailable');
                }
              } catch (error) {
                console.log('✗ Git integration failed:', error.message);
                failed++;
              }

            } catch (error) {
              console.log('✗ State file not created:', error.message);
              failed++;
            }
          } catch (error) {
            console.log('✗ Cannot get status:', error.message);
            failed++;
          }
        } catch (error) {
          console.log('✗ Cannot list tasks:', error.message);
          failed++;
        }
      } catch (error) {
        console.log('✗ Cannot add tasks:', error.message);
        failed++;
      }
    } catch (error) {
      console.log('✗ Cannot initialize:', error.message);
      failed++;
    }
  } catch (error) {
    console.log('✗ Cannot create instance:', error.message);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`Tests passed: ${passed}`);
  console.log(`Tests failed: ${failed}`);
  console.log('='.repeat(50));

  if (failed === 0) {
    console.log('\n✓ All tests passed! System is ready to use.');
    console.log('\nNext steps:');
    console.log('1. Create .env file with AGENT_ID');
    console.log('2. Run: npm start');
    console.log('3. See QUICKSTART.md for more info');
  } else {
    console.log('\n⚠ Some tests failed. Please check the errors above.');
  }

  return failed === 0;
}

// Run tests
testSetup()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('Test script error:', error);
    process.exit(1);
  });
