import { StateManager } from './state-manager.js';
import { LockManager } from './lock-manager.js';
import { SyncEngine } from './sync.js';
import { TaskQueue } from './task-queue.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SyncWorkClaude {
  constructor(config = {}) {
    this.projectRoot = config.projectRoot || path.join(__dirname, '..');
    this.agentId = config.agentId || process.env.AGENT_ID || 'agent-1';
    this.syncInterval = config.syncInterval || 30000; // 30 seconds
    this.heartbeatInterval = config.heartbeatInterval || 10000; // 10 seconds

    this.stateManager = new StateManager(this.projectRoot, this.agentId);
    this.lockManager = new LockManager(this.projectRoot, this.agentId);
    this.syncEngine = new SyncEngine(this.projectRoot, this.agentId);
    this.taskQueue = new TaskQueue(this.stateManager);

    this.running = false;
    this.syncTimer = null;
    this.heartbeatTimer = null;
  }

  async initialize() {
    console.log(`Initializing Sync-Work-Claude for ${this.agentId}...`);

    await this.syncEngine.initialize();
    await this.stateManager.initialize();

    console.log('Initialization complete');
  }

  async start() {
    if (this.running) {
      console.log('Already running');
      return;
    }

    this.running = true;
    console.log(`Starting ${this.agentId}...`);

    // Initial sync
    await this.syncEngine.pull();

    // Start heartbeat
    this.heartbeatTimer = setInterval(async () => {
      try {
        await this.stateManager.heartbeat();
      } catch (error) {
        console.error('Heartbeat error:', error.message);
      }
    }, this.heartbeatInterval);

    // Start sync loop
    this.syncTimer = setInterval(async () => {
      try {
        await this.syncLoop();
      } catch (error) {
        console.error('Sync loop error:', error.message);
      }
    }, this.syncInterval);

    console.log(`${this.agentId} is now running`);
    console.log(`Sync interval: ${this.syncInterval}ms`);
    console.log(`Heartbeat interval: ${this.heartbeatInterval}ms`);
  }

  async stop() {
    this.running = false;

    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    await this.stateManager.updateAgentStatus('offline');
    console.log(`${this.agentId} stopped`);
  }

  async syncLoop() {
    // Pull latest changes
    const pullResult = await this.syncEngine.pull();

    if (pullResult.commits > 0) {
      console.log(`Pulled ${pullResult.commits} new commits`);
    }

    // Check status
    const status = await this.getStatus();
    console.log(`Status: ${status.agent.status}, Other agent: ${status.otherAgent.status}`);

    // Push any local changes
    const pushResult = await this.syncEngine.push('Auto-sync state');

    if (pushResult.committed) {
      console.log('Pushed local changes');
    }
  }

  async getStatus() {
    const state = await this.stateManager.getState();
    const otherAgent = await this.stateManager.getOtherAgent();
    const gitStatus = await this.syncEngine.getStatus();

    return {
      agent: {
        id: this.agentId,
        ...state.agents[this.agentId]
      },
      otherAgent: {
        id: otherAgent.id,
        ...otherAgent
      },
      tasks: {
        total: state.tasks.length,
        pending: state.tasks.filter(t => t.status === 'pending').length,
        inProgress: state.tasks.filter(t => t.status === 'in-progress').length,
        completed: state.tasks.filter(t => t.status === 'completed').length
      },
      git: gitStatus
    };
  }

  async addTask(description, metadata = {}) {
    const task = await this.taskQueue.addTask(description, metadata);
    await this.syncEngine.push(`Added task: ${description}`);
    return task;
  }

  async processNextTask() {
    const task = await this.taskQueue.getNextTask();

    if (!task) {
      console.log('No tasks available');
      return null;
    }

    console.log(`Processing task: ${task.description}`);

    // This is where Claude agent would do the actual work
    // For now, we'll just mark it as complete
    return task;
  }

  async completeTask(result = {}) {
    const completedTask = await this.taskQueue.completeCurrentTask(result);

    if (completedTask) {
      console.log(`Completed task: ${completedTask.description}`);
      await this.syncEngine.push(`Completed task: ${completedTask.description}`);
    }

    return completedTask;
  }

  async listTasks(filter = {}) {
    return await this.taskQueue.listTasks(filter);
  }

  async withFileLock(filePath, callback) {
    return await this.lockManager.withLock(filePath, callback);
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const sync = new SyncWorkClaude();

  await sync.initialize();

  const command = process.argv[2];

  switch (command) {
    case 'start':
      await sync.start();
      // Keep running
      process.on('SIGINT', async () => {
        await sync.stop();
        process.exit(0);
      });
      break;

    case 'status':
      const status = await sync.getStatus();
      console.log(JSON.stringify(status, null, 2));
      process.exit(0);
      break;

    case 'add-task':
      const description = process.argv[3];
      if (!description) {
        console.error('Usage: node index.js add-task "task description"');
        process.exit(1);
      }
      const task = await sync.addTask(description);
      console.log('Task added:', task);
      process.exit(0);
      break;

    case 'list-tasks':
      const tasks = await sync.listTasks();
      console.log('Tasks:');
      tasks.forEach(t => {
        console.log(`  [${t.status}] ${t.id}: ${t.description}`);
      });
      process.exit(0);
      break;

    default:
      console.log('Usage:');
      console.log('  node index.js start           - Start the sync agent');
      console.log('  node index.js status          - Show current status');
      console.log('  node index.js add-task "..."  - Add a new task');
      console.log('  node index.js list-tasks      - List all tasks');
      process.exit(1);
  }
}

export default SyncWorkClaude;
