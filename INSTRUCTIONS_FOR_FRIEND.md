# Setup Instructions - Computer 2

Hey! Here's how to set up the Claude agent collaboration system on your computer.

## Step 1: Clone the Repository

```bash
git clone https://github.com/killer4nano/sync-claude-agents.git
cd sync-claude-agents
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Configure Your Agent ID

Create a `.env` file:

```bash
echo AGENT_ID=agent-2 > .env
```

**IMPORTANT:** You MUST use `agent-2`. The other computer uses `agent-1`.

## Step 4: Start Your Agent

```bash
npm start
```

That's it! Your agent is now running and will automatically sync with the other agent.

---

## How to Use the System

### Check Status
```bash
node src/index.js status
```

### Add Tasks
```bash
node src/index.js add-task "Your task description here"
```

### List All Tasks
```bash
node src/index.js list-tasks
```

### Stop the Agent
Press `Ctrl+C`

---

## What Happens Now?

1. Both agents will automatically sync every 30 seconds
2. When you add tasks, both agents can see them
3. Each agent automatically picks up available tasks
4. No duplicate work - the system prevents race conditions
5. All changes are synced via git automatically

---

## Using with Claude Code

In your Claude Code session, you can tell Claude:

```
You are agent-2. Use the sync-work-claude system to collaborate with agent-1.

Import from: ./sync-claude-agents
Agent ID: agent-2
Project root: [your project path]

Initialize the system and start working on tasks from the queue.
```

---

## Troubleshooting

**If you see merge conflicts:**
- The system auto-resolves them - just wait a moment

**If tasks aren't syncing:**
- Make sure both computers can access GitHub
- Check: `git pull` works without errors

**If you get "task already assigned" errors:**
- This is normal - the other agent grabbed it first
- The system will automatically retry with a different task

---

## Need Help?

Check these files:
- `QUICKSTART.md` - Quick start guide
- `SETUP.md` - Detailed setup instructions
- `FIXES.md` - Technical details about how the system works
- `README.md` - Overview

Or just ask!
