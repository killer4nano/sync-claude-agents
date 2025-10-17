# Setup Instructions - Computer 1 (Your Computer)

Since you already have the code locally, here's what you need to do to get started.

## Step 1: Create Your Agent Configuration

In the project directory, create a `.env` file:

```bash
cd F:\CodeProjects\sync-work-claude
echo AGENT_ID=agent-1 > .env
```

**IMPORTANT:** You MUST use `agent-1`. Your friend uses `agent-2`.

## Step 2: Start Your Agent

```bash
npm start
```

That's it! Your agent is now running.

---

## How to Use the System

### Check Status
```bash
node src/index.js status
```

This shows:
- Your agent status
- Other agent status (your friend)
- Number of tasks (pending/in-progress/completed)
- Git sync status

### Add Tasks

```bash
node src/index.js add-task "Implement user authentication"
node src/index.js add-task "Write unit tests"
node src/index.js add-task "Update documentation"
```

Tasks are immediately synced to your friend's computer.

### List All Tasks

```bash
node src/index.js list-tasks
```

Shows all tasks and their status.

### Stop the Agent

Press `Ctrl+C`

---

## Using with Claude Code

In your Claude Code session, tell Claude:

```
You are agent-1. Use the sync-work-claude system to collaborate with agent-2.

Import from: F:\CodeProjects\sync-work-claude
Agent ID: agent-1
Project root: F:\CodeProjects\[your-actual-project]

Initialize the system and start working on tasks from the queue.
```

Then Claude will:
1. Import the sync system
2. Initialize as agent-1
3. Automatically pull tasks from the queue
4. Work on them
5. Sync changes with agent-2

---

## Example Workflow

### Scenario: Building a Web App Together

**You (agent-1) focus on:** Backend
**Friend (agent-2) focus on:** Frontend

1. Add tasks for both:
```bash
node src/index.js add-task "Create Express.js API server"
node src/index.js add-task "Build React login component"
node src/index.js add-task "Create user database schema"
node src/index.js add-task "Build React dashboard"
```

2. Start your Claude session:
```
You are agent-1 working on the backend.

Use sync-work-claude to coordinate with agent-2.
Pick up backend-related tasks and work on them.
```

3. Your friend starts their Claude session:
```
You are agent-2 working on the frontend.

Use sync-work-claude to coordinate with agent-1.
Pick up frontend-related tasks and work on them.
```

4. Both agents work in parallel, syncing every 30 seconds

---

## What Happens Automatically

### Every 30 seconds:
- ✅ Pull latest changes from GitHub
- ✅ Push your changes to GitHub
- ✅ Update agent heartbeat
- ✅ Check for new tasks

### When a task is assigned:
- ✅ Lock the task so the other agent can't grab it
- ✅ Update state file
- ✅ Sync to GitHub
- ✅ Verify no race condition occurred

### When a file is edited:
- ✅ Acquire file lock (synced via GitHub)
- ✅ Edit the file
- ✅ Release lock
- ✅ Other agent can now edit it

---

## Monitoring the System

### Watch the logs

Your terminal will show:
```
Initializing Sync-Work-Claude for agent-1...
Initialization complete
agent-1 is now running
Sync interval: 30000ms
Heartbeat interval: 10000ms

Pulling latest changes...
Already up to date
Status: idle, Other agent: working
```

### Check what your friend is doing

```bash
node src/index.js status
```

Output shows:
```json
{
  "agent": {
    "id": "agent-1",
    "status": "idle",
    "currentTask": null
  },
  "otherAgent": {
    "id": "agent-2",
    "status": "working",
    "currentTask": "task-123"
  },
  "tasks": {
    "total": 5,
    "pending": 2,
    "inProgress": 1,
    "completed": 2
  }
}
```

---

## Advanced Usage

### Programmatic Usage in Claude Code

```javascript
import SyncWorkClaude from './sync-work-claude/src/index.js';

const sync = new SyncWorkClaude({
  projectRoot: process.cwd(),
  agentId: 'agent-1'
});

await sync.initialize();

// Add tasks
await sync.addTask('Create API endpoint for login');

// Get next task
const task = await sync.processNextTask();
console.log(`Working on: ${task.description}`);

// ... do the work ...

// Mark complete
await sync.completeTask({
  filesModified: ['src/api/auth.js'],
  linesAdded: 50
});

// Use file locks
await sync.withFileLock('src/config.js', async () => {
  // Edit src/config.js here
  // Lock automatically released when done
});
```

---

## Tips for Best Results

### 1. Clear Task Descriptions
❌ Bad: "Fix stuff"
✅ Good: "Fix null pointer exception in login.js line 42"

### 2. Divide Work Clearly
- Agent 1: Backend, database, API
- Agent 2: Frontend, UI, styling

### 3. Use File Locks for Shared Files
```javascript
await sync.withFileLock('shared-config.js', async () => {
  // Edit here
});
```

### 4. Check Status Regularly
```bash
node src/index.js status
```

### 5. Communicate via Task Descriptions
Since agents can't directly message each other, use tasks:
```bash
node src/index.js add-task "AGENT-2: Please review the auth implementation in src/auth.js"
```

---

## Stopping and Restarting

### To Stop
Press `Ctrl+C` in the terminal running `npm start`

### To Restart
Just run `npm start` again - it picks up where it left off

### To Reset Everything
```bash
# Remove state and start fresh
rm .sync-state.json
rm -rf .sync-locks
git add .
git commit -m "Reset state"
git push
```

---

## Share This Link with Your Friend

Send them: **https://github.com/killer4nano/sync-claude-agents**

And tell them to read: **INSTRUCTIONS_FOR_FRIEND.md**

---

## You're All Set!

1. ✅ Create `.env` with `AGENT_ID=agent-1`
2. ✅ Run `npm start`
3. ✅ Wait for your friend to set up
4. ✅ Add tasks and start working!

The system handles all the syncing, conflict resolution, and coordination automatically.
