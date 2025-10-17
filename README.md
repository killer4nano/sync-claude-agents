# Sync-Work-Claude

A collaboration system enabling two Claude agents on different computers to work together on shared projects.

## Architecture

This system uses Git as the synchronization backbone, with a state-based coordination system to manage collaboration between two Claude agents.

### Key Components

1. **State Manager** - Tracks which agent is working on what
2. **Sync Engine** - Handles git pull/push operations
3. **Lock System** - Prevents conflicting work
4. **Task Queue** - Distributes work between agents

### How It Works

1. Each agent has a unique ID (agent-1, agent-2)
2. Agents check the shared state before starting work
3. Work is coordinated through `.sync-state.json`
4. Changes are committed and pushed automatically
5. Agents pull updates regularly to stay in sync

## Setup

### Prerequisites
- Node.js installed
- Git installed and configured
- A shared git repository (GitHub, GitLab, etc.)

### Installation

1. Clone this repository on both computers
2. Run `npm install` in both locations
3. Initialize git repository: `git init`
4. Add remote: `git remote add origin <your-repo-url>`
5. Configure agent ID in `.env`:
   - Computer 1: `AGENT_ID=agent-1`
   - Computer 2: `AGENT_ID=agent-2`

### Usage

Run the sync system:
```bash
npm start
```

The agents will automatically:
- Pull latest changes
- Check for available tasks
- Execute assigned work
- Commit and push results
- Wait for the other agent

## Project Structure

```
sync-work-claude/
├── src/
│   ├── index.js           # Main entry point
│   ├── sync.js            # Sync engine
│   ├── state-manager.js   # State coordination
│   ├── lock-manager.js    # File locking
│   └── task-queue.js      # Task distribution
├── workspace/             # Shared workspace for collaboration
├── .sync-state.json       # Agent coordination state
├── package.json
└── README.md
```

## State File Format

The `.sync-state.json` file tracks collaboration:

```json
{
  "agents": {
    "agent-1": {
      "status": "working",
      "currentTask": "implement-feature-x",
      "lastSeen": "2025-10-17T10:30:00Z"
    },
    "agent-2": {
      "status": "idle",
      "currentTask": null,
      "lastSeen": "2025-10-17T10:29:00Z"
    }
  },
  "tasks": [
    {
      "id": "task-1",
      "description": "Implement user authentication",
      "status": "pending",
      "assignedTo": null
    }
  ],
  "locks": []
}
```

## Workflow Example

1. **Agent 1** pulls latest changes
2. **Agent 1** picks task-1, updates state
3. **Agent 1** works on task-1, commits changes
4. **Agent 2** pulls, sees Agent 1 is working
5. **Agent 2** picks task-2 from queue
6. Both agents work in parallel
7. Changes sync automatically via git

## Conflict Resolution

- File-level locking prevents simultaneous edits
- State updates use last-write-wins with timestamps
- Agents retry on merge conflicts
- Manual intervention required for complex conflicts
