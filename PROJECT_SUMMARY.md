# Sync-Work-Claude - Project Summary

## Overview

**sync-work-claude** is a collaboration system that enables two Claude agents running on different computers to work together on shared projects. It uses git as the synchronization backbone with state-based coordination to prevent conflicts.

## Project Status

✅ **Complete and Ready to Use**

- All core functionality implemented
- Comprehensive documentation written
- Example code provided
- Tests passing (10/10)
- Git repository initialized

## Key Features

### 1. **State Management**
- Tracks which agent is working on what
- Heartbeat system to detect active/inactive agents
- Shared state file (`.sync-state.json`) for coordination

### 2. **Task Queue System**
- Add tasks to a shared queue
- Agents automatically pick up available tasks
- Track task status (pending, in-progress, completed)

### 3. **File Locking**
- Prevent multiple agents from editing the same file
- Automatic stale lock cleanup (5-minute timeout)
- Safe lock acquisition/release with retry logic

### 4. **Git Integration**
- Automatic pull/push synchronization
- Conflict detection and reporting
- Commit history tracking
- Works with GitHub, GitLab, or any git remote

### 5. **Agent Coordination**
- Unique agent IDs (agent-1, agent-2)
- Real-time status tracking
- Configurable sync intervals
- Automatic state recovery

## Project Structure

```
sync-work-claude/
├── src/                          # Source code
│   ├── index.js                  # Main entry point & CLI
│   ├── state-manager.js          # Agent state coordination
│   ├── lock-manager.js           # File locking system
│   ├── sync.js                   # Git sync engine
│   └── task-queue.js             # Task distribution
│
├── examples/                     # Example code
│   ├── basic-usage.js            # Basic usage example
│   └── claude-integration.md     # Claude Code integration guide
│
├── workspace/                    # Shared workspace (created on first run)
│
├── README.md                     # Project overview
├── SETUP.md                      # Detailed setup guide
├── QUICKSTART.md                 # Quick start guide
├── PROJECT_SUMMARY.md            # This file
├── test-setup.js                 # Test script
├── package.json                  # Dependencies
├── .env.example                  # Environment variables template
└── .gitignore                    # Git ignore rules
```

## File Descriptions

| File | Purpose |
|------|---------|
| `src/index.js` | Main class and CLI interface |
| `src/state-manager.js` | Manages agent state and task coordination |
| `src/lock-manager.js` | File-level locking to prevent conflicts |
| `src/sync.js` | Git operations (pull, push, status) |
| `src/task-queue.js` | Task queue operations |
| `test-setup.js` | Verification script |
| `examples/basic-usage.js` | Complete working example |
| `examples/claude-integration.md` | Integration patterns for Claude Code |

## How It Works

### Workflow

1. **Initialization**
   - Each agent has unique ID (agent-1, agent-2)
   - System initializes git repo and state file
   - Agents start heartbeat and sync loops

2. **Task Management**
   - Tasks added to shared queue in `.sync-state.json`
   - Agents automatically pick up pending tasks
   - State updates prevent duplicate work

3. **Synchronization**
   - Agents pull changes every 30 seconds (configurable)
   - Push completed work automatically
   - Handle merge conflicts gracefully

4. **File Locking**
   - Lock acquired before editing shared files
   - Lock automatically released after edit
   - Stale locks cleaned up automatically

### State File Format

```json
{
  "agents": {
    "agent-1": {
      "status": "working",
      "currentTask": "task-123",
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
      "id": "task-123",
      "description": "Implement feature X",
      "status": "in-progress",
      "assignedTo": "agent-1"
    }
  ],
  "locks": [],
  "version": 5
}
```

## Getting Started

### Quick Start (Local Testing)

```bash
# 1. Navigate to project
cd F:\CodeProjects\sync-work-claude

# 2. Install dependencies
npm install

# 3. Run tests
node test-setup.js

# 4. Add tasks
node src/index.js add-task "Implement feature X"
node src/index.js add-task "Write tests"

# 5. Start agents (in separate terminals)
AGENT_ID=agent-1 node src/index.js start
AGENT_ID=agent-2 node src/index.js start
```

### Production Setup (Two Computers)

1. **Create shared git repository** on GitHub/GitLab
2. **Clone on both computers**
3. **Set AGENT_ID** in `.env` file (agent-1 on computer 1, agent-2 on computer 2)
4. **Run `npm install`** on both
5. **Start agents** on both: `npm start`

See [QUICKSTART.md](QUICKSTART.md) for detailed steps.

## Usage with Claude Code

### Integration Example

```javascript
import SyncWorkClaude from './sync-work-claude/src/index.js';

const sync = new SyncWorkClaude({
  projectRoot: '/path/to/project',
  agentId: 'agent-1'
});

await sync.initialize();
await sync.start();

// Add work
await sync.addTask('Implement authentication');

// Process work
const task = await sync.processNextTask();
// ... do the work ...
await sync.completeTask({ success: true });
```

See [examples/claude-integration.md](examples/claude-integration.md) for detailed patterns.

## CLI Commands

```bash
# Start the sync agent
node src/index.js start
npm start

# Check current status
node src/index.js status

# Add a new task
node src/index.js add-task "Task description"

# List all tasks
node src/index.js list-tasks
```

## Configuration

### Environment Variables (.env)

```bash
AGENT_ID=agent-1                    # agent-1 or agent-2
SYNC_INTERVAL=30000                 # Sync every 30 seconds
HEARTBEAT_INTERVAL=10000            # Heartbeat every 10 seconds
```

### Programmatic Configuration

```javascript
const sync = new SyncWorkClaude({
  projectRoot: '/path/to/project',
  agentId: 'agent-1',
  syncInterval: 30000,
  heartbeatInterval: 10000
});
```

## Testing

Run the test suite:

```bash
node test-setup.js
```

Expected output:
```
✓ All tests passed! System is ready to use.
Tests passed: 10
Tests failed: 0
```

## Use Cases

### 1. Parallel Feature Development
- Agent 1: Frontend components
- Agent 2: Backend APIs
- Coordinate via shared state

### 2. Sequential Task Processing
- Add multiple tasks to queue
- Both agents process independently
- No conflicts due to task assignment

### 3. Test-Driven Development
- Agent 1: Writes tests
- Agent 2: Implements features
- Coordinate via git commits

### 4. Code Review Workflow
- Agent 1: Implements features
- Agent 2: Reviews and approves
- Track via task status

## Technical Details

### Dependencies

- **simple-git** (^3.22.0) - Git operations
- **chokidar** (^3.5.3) - File watching (optional)
- **Node.js** (v18+) - Runtime

### Architecture

- **Event-driven**: Heartbeat and sync loops run independently
- **State-based**: All coordination through shared state file
- **Git-backed**: All changes tracked in git history
- **Lock-based**: File locks prevent concurrent edits

### Conflict Resolution

1. **State conflicts**: Last-write-wins with version numbers
2. **File conflicts**: Git merge conflict detection
3. **Lock conflicts**: Timeout and retry mechanism
4. **Task conflicts**: Atomic task assignment

## Limitations & Considerations

1. **Two agents only**: Designed for exactly 2 agents
2. **Git required**: Must have git and a remote repository
3. **Network dependency**: Both agents need network access to remote
4. **Manual conflict resolution**: Complex merge conflicts need human intervention
5. **Lock timeout**: 5-minute timeout may need adjustment for long edits

## Future Enhancements

Possible improvements:
- Support for 3+ agents
- Real-time sync via WebSockets
- Web UI for monitoring
- Automated conflict resolution
- Task priority system
- Agent communication channel
- Performance metrics

## Security Notes

- Use private repositories for sensitive projects
- Use SSH authentication instead of HTTPS
- Never commit `.env` files
- Limit repository access appropriately
- Review all code changes before deploying

## Troubleshooting

### Agents not syncing
- Check git remote: `git remote -v`
- Verify network connectivity
- Check agent status: `node src/index.js status`

### Merge conflicts
- Resolve manually in files
- Commit the resolution
- System continues automatically

### Stale locks
- Automatically cleaned after 5 minutes
- Manual cleanup: `rm .sync-lock-*`

### Agent appears offline
- Check heartbeat in state file
- Restart the agent
- Verify system time is correct

## Resources

- [README.md](README.md) - Project overview
- [SETUP.md](SETUP.md) - Detailed setup instructions
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [examples/claude-integration.md](examples/claude-integration.md) - Claude Code patterns
- [examples/basic-usage.js](examples/basic-usage.js) - Working example

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the documentation
3. Run test suite to verify setup
4. Check git and node versions

## License

MIT License - Free to use and modify

## Author

Created for collaborative Claude Code sessions across multiple computers.

---

**Status**: Ready for production use
**Version**: 1.0.0
**Last Updated**: 2025-10-17
