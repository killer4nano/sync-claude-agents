# Quick Start Guide

Get two Claude agents working together in 5 minutes!

## 1. Install Dependencies

```bash
cd F:\CodeProjects\sync-work-claude
npm install
```

## 2. Setup Computer 1

```bash
# Create .env file
echo AGENT_ID=agent-1 > .env

# Initialize git
git init
git add .
git commit -m "Initial setup"

# Add your remote (optional for testing locally)
# git remote add origin https://github.com/yourusername/your-repo.git
# git push -u origin main
```

## 3. Setup Computer 2 (or another directory for testing)

```bash
# If testing locally, copy to another directory
# cp -r sync-work-claude sync-work-claude-agent2
# cd sync-work-claude-agent2

# Create .env file
echo AGENT_ID=agent-2 > .env
```

## 4. Add Some Tasks

On either computer:

```bash
node src/index.js add-task "Create user model"
node src/index.js add-task "Create authentication service"
node src/index.js add-task "Add login endpoint"
```

## 5. Start Both Agents

On Computer 1:
```bash
npm start
```

On Computer 2:
```bash
npm start
```

## 6. Watch Them Collaborate!

Both agents will:
- Automatically sync every 30 seconds
- Pick up tasks from the queue
- Push changes to shared repository
- Stay coordinated via state file

## Testing Locally (Single Computer)

For quick testing without two computers:

### Terminal 1 (Agent 1)
```bash
cd F:\CodeProjects\sync-work-claude
AGENT_ID=agent-1 node src/index.js start
```

### Terminal 2 (Agent 2)
```bash
cd F:\CodeProjects\sync-work-claude
AGENT_ID=agent-2 node src/index.js start
```

### Terminal 3 (Control)
```bash
# Add tasks
node src/index.js add-task "Task 1"
node src/index.js add-task "Task 2"

# Check status
node src/index.js status

# List tasks
node src/index.js list-tasks
```

## Using with Claude Code

### Prompt for Agent 1

```
Use the sync-work-claude system to collaborate with another agent.

Setup:
- Import from: F:\CodeProjects\sync-work-claude
- Agent ID: agent-1
- Project: F:\CodeProjects\my-app

Initialize the system and start working on available tasks.
```

### Prompt for Agent 2

```
Use the sync-work-claude system to collaborate with another agent.

Setup:
- Import from: F:\CodeProjects\sync-work-claude
- Agent ID: agent-2
- Project: F:\CodeProjects\my-app

Initialize the system and start working on available tasks.
```

## Common Commands

```bash
# Start the agent
npm start

# Check status
node src/index.js status

# Add a task
node src/index.js add-task "Your task description"

# List all tasks
node src/index.js list-tasks
```

## Next Steps

- Read [SETUP.md](SETUP.md) for detailed configuration
- Check [examples/claude-integration.md](examples/claude-integration.md) for Claude Code examples
- See [examples/basic-usage.js](examples/basic-usage.js) for programmatic usage

## Troubleshooting

**Agents not syncing?**
- Check git remote is configured: `git remote -v`
- Make sure both agents can access the repository

**Tasks not being picked up?**
- Verify `.sync-state.json` exists
- Check agent status: `node src/index.js status`

**Merge conflicts?**
- Resolve manually and commit
- The system will continue automatically

**Need help?**
- Check the logs in each terminal
- Review `.sync-state.json` for current state
- See full documentation in SETUP.md
