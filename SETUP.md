# Setup Guide for Sync-Work-Claude

This guide will walk you through setting up two Claude agents to collaborate on projects across different computers.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Git** installed and configured
3. **GitHub/GitLab account** for hosting the shared repository
4. **Two computers** (or two separate working directories for testing)

## Initial Setup

### Step 1: Create Shared Repository

1. Create a new repository on GitHub/GitLab (can be private)
2. Note the repository URL (e.g., `https://github.com/yourusername/your-project.git`)

### Step 2: Setup on Computer 1

```bash
# Navigate to your projects directory
cd F:\CodeProjects

# Clone or copy sync-work-claude
# If testing locally, you can use the existing directory

# Navigate to the project
cd sync-work-claude

# Install dependencies
npm install

# Initialize as git repository (if not already)
git init

# Add remote repository
git remote add origin https://github.com/yourusername/your-project.git

# Create .env file for agent-1
echo AGENT_ID=agent-1 > .env

# Initial commit
git add .
git commit -m "Initial setup"
git push -u origin main
```

### Step 3: Setup on Computer 2

```bash
# Clone the repository
git clone https://github.com/yourusername/your-project.git
cd your-project

# Install dependencies
npm install

# Create .env file for agent-2
echo AGENT_ID=agent-2 > .env
```

## Configuration

### Environment Variables

Create a `.env` file in the project root on each computer:

**Computer 1:**
```
AGENT_ID=agent-1
SYNC_INTERVAL=30000
HEARTBEAT_INTERVAL=10000
```

**Computer 2:**
```
AGENT_ID=agent-2
SYNC_INTERVAL=30000
HEARTBEAT_INTERVAL=10000
```

## Usage

### Starting the Agents

On both computers, start the agent:

```bash
npm start
```

Or use the CLI directly:

```bash
node src/index.js start
```

### Adding Tasks

From either computer:

```bash
node src/index.js add-task "Implement user authentication"
```

Or programmatically:

```javascript
import SyncWorkClaude from './src/index.js';

const sync = new SyncWorkClaude();
await sync.initialize();
await sync.addTask('Implement user authentication');
```

### Checking Status

```bash
node src/index.js status
```

### Listing Tasks

```bash
node src/index.js list-tasks
```

## Integration with Claude Code

### Using in Claude Code Sessions

1. **Start the sync system** on both computers
2. **In your Claude Code session**, import and use the library:

```javascript
import SyncWorkClaude from './sync-work-claude/src/index.js';

const sync = new SyncWorkClaude({
  projectRoot: '/path/to/your/shared/project',
  agentId: 'agent-1'
});

await sync.initialize();
await sync.start();

// Add a task
await sync.addTask('Refactor database queries');

// Get next task
const task = await sync.processNextTask();

// Do work...

// Complete task
await sync.completeTask({
  filesModified: ['src/db.js'],
  linesChanged: 45
});
```

### Using File Locks

When multiple agents might edit the same file:

```javascript
await sync.withFileLock('src/critical-file.js', async () => {
  // Edit the file here
  // Lock is automatically released when done
});
```

## Workflow Examples

### Example 1: Parallel Feature Development

**Agent 1's Instructions:**
```
You are agent-1. Work on implementing the user authentication system.
Use sync-work-claude to coordinate with agent-2.
```

**Agent 2's Instructions:**
```
You are agent-2. Work on implementing the payment processing system.
Use sync-work-claude to coordinate with agent-1.
```

### Example 2: Sequential Task Processing

1. Add multiple tasks to the queue:
```bash
node src/index.js add-task "Write unit tests for auth module"
node src/index.js add-task "Write unit tests for payment module"
node src/index.js add-task "Update documentation"
```

2. Both agents automatically pick up tasks from the queue
3. Each agent processes tasks independently
4. Changes are synchronized via git

## Troubleshooting

### Merge Conflicts

If you encounter merge conflicts:

1. The system will detect the conflict
2. Manually resolve conflicts in the affected files
3. Commit the resolution
4. The system will continue automatically

### Stale Locks

If an agent crashes and leaves locks:

- Locks older than 5 minutes are automatically considered stale
- They will be removed when another agent tries to acquire them

### Agent Not Syncing

Check:
1. Git remote is configured: `git remote -v`
2. Agent has network access to the remote repository
3. No merge conflicts are blocking pulls
4. Check logs for error messages

## Advanced Configuration

### Custom Sync Intervals

Modify in your code:

```javascript
const sync = new SyncWorkClaude({
  syncInterval: 60000,      // Sync every 60 seconds
  heartbeatInterval: 15000  // Heartbeat every 15 seconds
});
```

### Custom Task Handlers

```javascript
const sync = new SyncWorkClaude();
await sync.initialize();

// Custom task processing
while (true) {
  const task = await sync.processNextTask();

  if (task) {
    // Your custom logic here
    console.log(`Working on: ${task.description}`);

    // Complete with custom result
    await sync.completeTask({
      success: true,
      output: 'Task completed successfully'
    });
  }

  await new Promise(resolve => setTimeout(resolve, 5000));
}
```

## Security Considerations

1. **Private Repositories**: Use private git repositories for sensitive projects
2. **SSH Keys**: Use SSH authentication instead of HTTPS for better security
3. **Access Control**: Limit repository access to authorized agents only
4. **Credentials**: Never commit `.env` files or credentials

## Best Practices

1. **Clear Task Descriptions**: Write descriptive task descriptions
2. **Atomic Commits**: Keep commits small and focused
3. **Regular Syncs**: Don't disable the auto-sync mechanism
4. **Lock Files**: Always use locks when editing shared files
5. **Error Handling**: Monitor agent logs for errors
6. **State Monitoring**: Regularly check agent status

## Next Steps

- Test the system with simple tasks
- Configure your actual project structure
- Set up continuous integration if needed
- Monitor agent collaboration patterns
- Adjust sync intervals based on your needs
